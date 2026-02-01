/**
 * Configuration Routes
 * Extracted from server.cjs
 *
 * Handles: bundles, industries, layouts, effects, sections, modules, projects
 * Also includes Style Preview endpoint for zero-cost visual testing
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

// Import prompt builders for preview generation
const {
  buildFallbackPage,
  buildLayoutAwarePreview,
  getSliderStyles,
  buildPrompt: buildPromptConfig,
  getLayoutCategory,
  buildDetailedLayoutContext,
  getAvailableLayouts,
  getLayoutConfigFull,
  INDUSTRY_LAYOUTS
} = require('../prompt-builders/index.cjs');

const { toComponentName } = require('../utils/page-names.cjs');

// Import fixtures and mock API for sandbox mode
const { getIndustryFixture, getIndustryImages } = require('../fixtures/industry-fixtures.cjs');
const { generateMockApiScript, generateSandboxStyles, generateSandboxBanner, generateToastHelper } = require('../fixtures/mock-api.cjs');

/**
 * Generate responsive header HTML with portal dropdown
 * @param {Object} config - Header configuration
 * @returns {Object} { html, styles, scripts }
 */
function generateResponsiveHeader(config) {
  const {
    businessName = 'Business',
    industry = 'default',
    pages = ['home', 'about', 'services', 'contact'],
    colors = {},
    hasPortal = false,
    hasLoyalty = false
  } = config;

  const primaryColor = colors.primary || '#6366f1';
  const textColor = colors.text || '#1a1a2e';
  const bgColor = colors.background || '#ffffff';

  // Industry icons
  const industryIcons = {
    'restaurant': '🍽️', 'pizzeria': '🍕', 'pizza': '🍕', 'cafe': '☕', 'coffee': '☕',
    'dental': '🦷', 'healthcare': '🏥', 'medical': '🏥',
    'salon': '💆', 'spa': '💆', 'fitness': '💪', 'gym': '💪',
    'real-estate': '🏠', 'law-firm': '⚖️', 'accounting': '📊',
    'insurance': '🛡️', 'construction': '🏗️', 'automotive': '🚗',
    'pet-services': '🐕', 'consulting': '💼', 'default': '🏢'
  };
  const icon = industryIcons[industry] || industryIcons['default'];

  // Portal type based on industry
  const portalTypes = {
    'restaurant': 'Account', 'pizzeria': 'Account', 'cafe': 'Account',
    'dental': 'Patient', 'healthcare': 'Patient', 'medical': 'Patient',
    'law-firm': 'Client', 'accounting': 'Client', 'insurance': 'Policy',
    'real-estate': 'Client', 'fitness': 'Member', 'salon': 'Client',
    'construction': 'Project', 'automotive': 'Service', 'pet-services': 'Pet',
    'default': 'Account'
  };
  const portalType = portalTypes[industry] || portalTypes['default'];

  // Filter out portal/auth pages from main nav
  const mainNavPages = pages.filter(p => !['login', 'register', 'profile', 'portal', 'dashboard'].includes(p.toLowerCase()));

  // Generate nav links
  const navLinksHtml = mainNavPages.map(page => {
    const label = page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<a href="#${page}" class="rh-nav-link">${label}</a>`;
  }).join('');

  // Portal dropdown items
  const portalItems = getPortalItems(industry, hasLoyalty);
  const portalDropdownHtml = portalItems.map(item =>
    `<a href="#${item.href}" class="rh-portal-item">${item.icon} ${item.label}</a>`
  ).join('');

  const styles = `
    /* Responsive Header Styles */
    .rh-header {
      background: ${bgColor};
      border-bottom: 1px solid rgba(0,0,0,0.08);
      padding: 0 16px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    @media (min-width: 769px) {
      .rh-header { padding: 0 24px; height: 70px; }
    }
    .rh-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: ${textColor};
    }
    .rh-brand-icon { font-size: 26px; }
    .rh-brand-name {
      font-size: 18px;
      font-weight: 700;
      color: ${primaryColor};
      white-space: nowrap;
    }
    @media (max-width: 400px) {
      .rh-brand-name { font-size: 15px; max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
    }
    .rh-nav {
      display: none;
      align-items: center;
      gap: 4px;
    }
    @media (min-width: 769px) { .rh-nav { display: flex; } }
    .rh-nav-link {
      padding: 8px 14px;
      color: ${textColor};
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      opacity: 0.75;
      transition: all 0.2s;
    }
    .rh-nav-link:hover { opacity: 1; background: rgba(0,0,0,0.05); }
    .rh-right {
      display: none;
      align-items: center;
      gap: 12px;
    }
    @media (min-width: 769px) { .rh-right { display: flex; } }
    .rh-portal {
      position: relative;
    }
    .rh-portal-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px 6px 6px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 100px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }
    .rh-portal-btn:hover { background: #e5e7eb; }
    .rh-avatar {
      width: 28px;
      height: 28px;
      background: ${primaryColor};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }
    .rh-portal-arrow {
      font-size: 10px;
      color: #6b7280;
      transition: transform 0.2s;
    }
    .rh-portal:hover .rh-portal-arrow { transform: rotate(180deg); }
    .rh-portal-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 220px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 0.2s;
      z-index: 150;
      overflow: hidden;
    }
    .rh-portal:hover .rh-portal-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .rh-portal-header {
      padding: 12px 16px;
      background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
      color: white;
    }
    .rh-portal-title { font-size: 14px; font-weight: 600; }
    .rh-portal-sub { font-size: 11px; opacity: 0.85; }
    .rh-portal-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      color: #374151;
      font-size: 13px;
    }
    .rh-portal-item:hover { background: #f9fafb; }
    .rh-cta {
      padding: 8px 18px;
      background: ${primaryColor};
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      border: none;
      cursor: pointer;
    }
    .rh-cta:hover { filter: brightness(1.1); }
    .rh-mobile-btn {
      display: flex;
      flex-direction: column;
      gap: 5px;
      width: 40px;
      height: 40px;
      padding: 10px;
      background: none;
      border: none;
      cursor: pointer;
    }
    @media (min-width: 769px) { .rh-mobile-btn { display: none; } }
    .rh-hamburger {
      width: 20px;
      height: 2px;
      background: #374151;
      border-radius: 2px;
    }
    .rh-mobile-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 200;
    }
    .rh-mobile-overlay.active { display: block; }
    .rh-mobile-menu {
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      max-width: 85vw;
      height: 100%;
      background: white;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
    }
    .rh-mobile-overlay.active .rh-mobile-menu { transform: translateX(0); }
    .rh-mobile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .rh-mobile-close {
      width: 32px;
      height: 32px;
      background: #f3f4f6;
      border: none;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
    }
    .rh-mobile-section {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .rh-mobile-section.portal { background: #f9fafb; }
    .rh-mobile-label {
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .rh-mobile-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #374151;
      font-size: 15px;
      font-weight: 500;
    }
    .rh-mobile-link:hover { background: #f3f4f6; }
    .rh-mobile-footer {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
    }
    .rh-mobile-cta {
      width: 100%;
      padding: 12px;
      background: ${hasPortal ? '#f3f4f6' : primaryColor};
      color: ${hasPortal ? '#6b7280' : 'white'};
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
  `;

  const html = `
    <header class="rh-header">
      <a href="#home" class="rh-brand">
        <span class="rh-brand-icon">${icon}</span>
        <span class="rh-brand-name">${businessName}</span>
      </a>
      <nav class="rh-nav">${navLinksHtml}</nav>
      <div class="rh-right">
        ${hasPortal ? `
        <div class="rh-portal">
          <button class="rh-portal-btn">
            <span class="rh-avatar">JD</span>
            <span>My ${portalType}</span>
            <span class="rh-portal-arrow">▼</span>
          </button>
          <div class="rh-portal-menu">
            <div class="rh-portal-header">
              <div class="rh-portal-title">John Demo</div>
              <div class="rh-portal-sub">${portalType} Portal</div>
            </div>
            ${portalDropdownHtml}
            <a href="#logout" class="rh-portal-item" style="border-top: 1px solid #e5e7eb; color: #6b7280;">🚪 Sign Out</a>
          </div>
        </div>
        ` : `<a href="#contact" class="rh-cta">Contact Us</a>`}
      </div>
      <button class="rh-mobile-btn" onclick="document.getElementById('rhMobileMenu').classList.add('active')">
        <span class="rh-hamburger"></span>
        <span class="rh-hamburger"></span>
        <span class="rh-hamburger"></span>
      </button>
    </header>
    <div id="rhMobileMenu" class="rh-mobile-overlay" onclick="if(event.target===this)this.classList.remove('active')">
      <div class="rh-mobile-menu">
        <div class="rh-mobile-header">
          <a href="#home" class="rh-brand" style="font-size: 16px;">
            <span class="rh-brand-icon">${icon}</span>
            <span class="rh-brand-name">${businessName}</span>
          </a>
          <button class="rh-mobile-close" onclick="document.getElementById('rhMobileMenu').classList.remove('active')">✕</button>
        </div>
        <div class="rh-mobile-section">
          <div class="rh-mobile-label">Menu</div>
          ${mainNavPages.map(page => {
            const label = page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `<a href="#${page}" class="rh-mobile-link" onclick="document.getElementById('rhMobileMenu').classList.remove('active')">${label}</a>`;
          }).join('')}
        </div>
        ${hasPortal ? `
        <div class="rh-mobile-section portal">
          <div class="rh-mobile-label">My ${portalType}</div>
          ${portalItems.map(item =>
            `<a href="#${item.href}" class="rh-mobile-link" onclick="document.getElementById('rhMobileMenu').classList.remove('active')">${item.icon} ${item.label}</a>`
          ).join('')}
        </div>
        ` : ''}
        <div class="rh-mobile-footer">
          <button class="rh-mobile-cta">${hasPortal ? 'Sign Out' : 'Sign In'}</button>
        </div>
      </div>
    </div>
  `;

  return { html, styles, scripts: '' };
}

/**
 * Get portal dropdown items based on industry
 */
function getPortalItems(industry, hasLoyalty = false) {
  const base = [{ icon: '👤', label: 'My Profile', href: 'profile' }];

  const industryItems = {
    'restaurant': [
      { icon: '📦', label: 'My Orders', href: 'orders' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: 'rewards' }] : []),
      { icon: '❤️', label: 'Favorites', href: 'favorites' }
    ],
    'pizzeria': [
      { icon: '📦', label: 'Order History', href: 'orders' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: 'rewards' }] : []),
      { icon: '📍', label: 'Addresses', href: 'addresses' }
    ],
    'dental': [
      { icon: '📅', label: 'Appointments', href: 'appointments' },
      { icon: '🦷', label: 'Treatment History', href: 'treatments' },
      { icon: '📄', label: 'Forms', href: 'forms' },
      { icon: '💳', label: 'Billing', href: 'billing' }
    ],
    'healthcare': [
      { icon: '📅', label: 'Appointments', href: 'appointments' },
      { icon: '📋', label: 'Records', href: 'records' },
      { icon: '💊', label: 'Prescriptions', href: 'prescriptions' },
      { icon: '💳', label: 'Billing', href: 'billing' }
    ],
    'law-firm': [
      { icon: '📁', label: 'My Cases', href: 'cases' },
      { icon: '📄', label: 'Documents', href: 'documents' },
      { icon: '💬', label: 'Messages', href: 'messages' },
      { icon: '💳', label: 'Billing', href: 'billing' }
    ],
    'real-estate': [
      { icon: '❤️', label: 'Saved Homes', href: 'saved' },
      { icon: '🔔', label: 'Alerts', href: 'alerts' },
      { icon: '📅', label: 'Showings', href: 'showings' },
      { icon: '📄', label: 'Documents', href: 'documents' }
    ],
    'fitness': [
      { icon: '📅', label: 'Schedule', href: 'schedule' },
      { icon: '💳', label: 'Membership', href: 'membership' },
      ...(hasLoyalty ? [{ icon: '🏆', label: 'Rewards', href: 'rewards' }] : [])
    ],
    'salon': [
      { icon: '📅', label: 'Appointments', href: 'appointments' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: 'rewards' }] : [])
    ]
  };

  const specific = industryItems[industry] || [
    { icon: '📦', label: 'Orders', href: 'orders' },
    { icon: '💬', label: 'Messages', href: 'messages' }
  ];

  return [...base, ...specific, { icon: '⚙️', label: 'Settings', href: 'settings' }];
}

/**
 * Create config routes
 * @param {Object} deps - Dependencies
 * @param {Object} deps.BUNDLES - Bundle configurations
 * @param {Object} deps.INDUSTRIES - Industry configurations
 * @param {Object} deps.LAYOUTS - Layout configurations
 * @param {Object} deps.EFFECTS - Effects configurations
 * @param {Object} deps.SECTIONS - Sections configurations
 * @param {Object} deps.INDUSTRY_PRESETS - Industry presets
 * @param {Function} deps.buildPrompt - Prompt builder function
 * @param {string} deps.GENERATED_PROJECTS - Path to generated projects
 */
function createConfigRoutes(deps) {
  const router = express.Router();
  const {
    BUNDLES,
    INDUSTRIES,
    LAYOUTS,
    EFFECTS,
    SECTIONS,
    INDUSTRY_PRESETS,
    buildPrompt,
    GENERATED_PROJECTS
  } = deps;

  // Get bundles
  router.get('/bundles', (req, res) => {
    res.json({ success: true, bundles: BUNDLES });
  });

  // Get industries (from prompts config)
  router.get('/industries', (req, res) => {
    const industryList = {};
    for (const [key, value] of Object.entries(INDUSTRIES)) {
      industryList[key] = {
        name: value.name,
        icon: value.icon,
        category: value.category,
        layouts: value.layouts,
        defaultLayout: value.defaultLayout,
        vibe: value.vibe
      };
    }
    res.json({ success: true, industries: industryList });
  });

  // Get full industry config for assembly
  router.get('/industry/:key', (req, res) => {
    const { key } = req.params;
    const industry = INDUSTRIES[key];
    if (!industry) {
      return res.status(404).json({ success: false, error: 'Industry not found' });
    }
    res.json({ success: true, industry });
  });

  // Get layouts
  router.get('/layouts', (req, res) => {
    res.json({ success: true, layouts: LAYOUTS });
  });

  // Get effects
  router.get('/effects', (req, res) => {
    res.json({ success: true, effects: EFFECTS });
  });

  // Get sections
  router.get('/sections', (req, res) => {
    res.json({ success: true, sections: SECTIONS });
  });

  // Build prompt for specific configuration
  router.post('/build-prompt', (req, res) => {
    const { industryKey, layoutKey, effects } = req.body;
    const prompt = buildPrompt(industryKey, layoutKey, effects);
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Invalid industry' });
    }
    res.json({ success: true, prompt });
  });

  // Get modules for an industry
  router.get('/modules/industry/:industryKey', (req, res) => {
    const { industryKey } = req.params;
    const industry = INDUSTRY_PRESETS[industryKey];

    if (!industry) {
      return res.status(404).json({ success: false, error: 'Industry not found' });
    }

    const backend = new Set();
    const frontend = new Set();

    for (const bundleKey of industry.bundles) {
      const bundle = BUNDLES[bundleKey];
      if (bundle) {
        bundle.backend.forEach(m => backend.add(m));
        bundle.frontend.forEach(m => frontend.add(m));
      }
    }

    industry.additionalBackend?.forEach(m => backend.add(m));
    industry.additionalFrontend?.forEach(m => frontend.add(m));

    res.json({
      success: true,
      modules: {
        backend: Array.from(backend),
        frontend: Array.from(frontend)
      }
    });
  });

  // Get modules for bundles
  router.post('/modules/bundles', (req, res) => {
    const { bundles } = req.body;

    if (!bundles || !Array.isArray(bundles)) {
      return res.status(400).json({ success: false, error: 'Bundles array required' });
    }

    const backend = new Set();
    const frontend = new Set();

    for (const bundleKey of bundles) {
      const bundle = BUNDLES[bundleKey];
      if (bundle) {
        bundle.backend.forEach(m => backend.add(m));
        bundle.frontend.forEach(m => frontend.add(m));
      }
    }

    res.json({
      success: true,
      modules: {
        backend: Array.from(backend),
        frontend: Array.from(frontend)
      }
    });
  });

  // List generated projects
  router.get('/projects', (req, res) => {
    try {
      if (!fs.existsSync(GENERATED_PROJECTS)) {
        return res.json({ success: true, projects: [] });
      }

      const dirs = fs.readdirSync(GENERATED_PROJECTS, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
          const projectPath = path.join(GENERATED_PROJECTS, d.name);
          const manifestPath = path.join(projectPath, 'project-manifest.json');

          let manifest = null;
          if (fs.existsSync(manifestPath)) {
            try {
              manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            } catch (e) {
              console.warn(`   ⚠️ Failed to parse manifest for ${d.name}:`, e.message);
            }
          }

          return {
            name: d.name,
            path: projectPath,
            manifest: manifest
          };
        });

      res.json({ success: true, projects: dirs });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // =====================================================
  // LAYOUT INTELLIGENCE - Industry-specific layouts
  // Zero-cost layout recommendations and previews
  // =====================================================

  // Get all layout categories
  router.get('/layout-categories', (req, res) => {
    try {
      const categories = Object.entries(INDUSTRY_LAYOUTS).map(([key, category]) => ({
        key,
        name: category.name,
        keywords: category.keywords,
        style: category.style,
        layoutCount: Object.keys(category.layouts).length,
        layouts: Object.entries(category.layouts).map(([layoutKey, layout]) => ({
          key: layoutKey,
          name: layout.name,
          description: layout.description,
          emphasis: layout.emphasis
        }))
      }));

      res.json({ success: true, categories });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get layouts for a specific industry
  router.get('/layouts-for-industry/:industryKey', (req, res) => {
    try {
      const { industryKey } = req.params;
      const layouts = getAvailableLayouts(industryKey);

      if (!layouts || layouts.length === 0) {
        return res.json({
          success: true,
          industryKey,
          category: null,
          layouts: [],
          message: 'No specific layouts found for this industry. Generic layout will be used.'
        });
      }

      res.json({
        success: true,
        industryKey,
        category: layouts[0]?.categoryName,
        categoryKey: layouts[0]?.category,
        layouts
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get detailed layout context for AI prompt
  // Handler function for both routes
  const handleLayoutContext = (req, res) => {
    try {
      const { industryKey, layoutKey } = req.params;
      const config = getLayoutConfigFull(industryKey, layoutKey || null);

      if (!config) {
        return res.json({
          success: true,
          industryKey,
          layoutKey: layoutKey || null,
          context: null,
          message: 'No layout intelligence available for this industry.'
        });
      }

      res.json({
        success: true,
        industryKey,
        categoryKey: config.categoryKey,
        categoryName: config.category?.name,
        layoutKey: config.layoutKey,
        layoutName: config.layout?.name,
        layoutDescription: config.layout?.description,
        sectionOrder: config.layout?.sectionOrder,
        emphasis: config.layout?.emphasis,
        style: config.category?.style,
        detailedContext: config.detailedContext
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  // Two routes: with and without layoutKey (path-to-regexp v8 doesn't support ? optional params)
  router.get('/layout-context/:industryKey', handleLayoutContext);
  router.get('/layout-context/:industryKey/:layoutKey', handleLayoutContext);

  // Preview what the AI prompt would look like with layout intelligence
  router.post('/preview-prompt', (req, res) => {
    try {
      const { industryKey, layoutKey, businessName, pageId } = req.body;

      if (!industryKey) {
        return res.status(400).json({ success: false, error: 'industryKey is required' });
      }

      const config = getLayoutConfigFull(industryKey, layoutKey || null);
      const detailedContext = config?.detailedContext || buildDetailedLayoutContext(industryKey, layoutKey);

      // Build a sample prompt to show what AI would receive
      const samplePrompt = `You are an expert React developer creating a ${(pageId || 'home').toUpperCase()} page for "${businessName || 'Sample Business'}".

BUSINESS CONTEXT:
- Business Name: ${businessName || 'Sample Business'}
- Industry: ${config?.category?.name || industryKey}
- Layout: ${config?.layout?.name || 'Default'}

PAGE REQUIREMENTS:
Follow the LAYOUT INTELLIGENCE section order below EXACTLY.
${detailedContext}
OTHER PAGES IN THIS SITE: about, services, contact

[... rest of standard prompt ...]`;

      res.json({
        success: true,
        industryKey,
        layoutKey: config?.layoutKey,
        hasLayoutIntelligence: !!detailedContext,
        samplePrompt,
        sectionOrder: config?.layout?.sectionOrder || [],
        emphasis: config?.layout?.emphasis || []
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // =====================================================
  // STYLE PREVIEW - Zero-cost visual testing
  // Uses fallback page generation (no AI API calls)
  // Now with Layout Intelligence support!
  // =====================================================
  router.post('/preview-style', async (req, res) => {
    try {
      const { industry, businessName, pages, moodSliders, preset, layoutKey, sandboxMode, features = [] } = req.body;

      if (!industry) {
        return res.status(400).json({ success: false, error: 'Industry is required' });
      }

      const pagesToGenerate = pages || ['home', 'about', 'services', 'contact'];

      // Check for portal/auth features
      const hasPortal = features.includes('portal') || features.includes('auth');
      const hasLoyalty = features.includes('loyalty');

      // Get industry config
      const industryConfig = INDUSTRIES[industry];
      if (!industryConfig) {
        return res.status(404).json({ success: false, error: `Industry "${industry}" not found` });
      }

      // Get fixture data for sandbox mode
      const fixture = sandboxMode ? getIndustryFixture(industry) : null;
      const actualBusinessName = businessName || (fixture ? fixture.business.name : `${industryConfig.name} Demo`);

      // Get layout intelligence (Phase 3: layout-aware previews)
      const layoutConfig = getLayoutConfigFull(industry, layoutKey || null);
      const hasLayoutIntelligence = layoutConfig && layoutConfig.detailedContext;

      // Build prompt config (colors, typography from industry)
      const promptConfig = buildPromptConfig ? buildPromptConfig(industry, null, null) : {
        colors: industryConfig.colors || {},
        typography: industryConfig.typography || {}
      };

      // Add layout info to promptConfig for preview generation
      if (hasLayoutIntelligence) {
        promptConfig.layoutConfig = layoutConfig;
      }

      // Generate fallback pages for each requested page
      const generatedPages = {};
      const sliderStyles = getSliderStyles(moodSliders, promptConfig?.colors);

      // Sandbox mode scripts (injected into all pages)
      const sandboxScripts = sandboxMode ? `
${generateSandboxStyles()}
${generateMockApiScript(industry, actualBusinessName)}
${generateToastHelper()}
` : '';

      const sandboxBanner = sandboxMode ? generateSandboxBanner(actualBusinessName) : '';
      const sandboxBodyClass = sandboxMode ? 'class="sandbox-mode"' : '';

      for (const pageId of pagesToGenerate) {
        const componentName = toComponentName(pageId);

        let pageContent;

        // ALWAYS use layout-aware preview for ALL pages
        // This generates different structures per industry for each page type
        // buildLayoutAwarePreview uses PAGE_LAYOUTS to get industry-specific section orders
        pageContent = buildLayoutAwarePreview(
          pageId,           // Page type (home, about, services, etc.)
          actualBusinessName,     // Business name for content
          industry,         // Industry key for page-specific layouts
          layoutConfig,     // Layout variant config (for home page override)
          promptConfig,     // Colors, typography, etc.
          moodSliders       // Mood slider values
        );

        // Generate header HTML with portal dropdown if features enabled
        const headerHtml = generateResponsiveHeader({
          businessName: actualBusinessName,
          industry,
          pages: pagesToGenerate,
          colors: sliderStyles.colors,
          hasPortal,
          hasLoyalty
        });

        // Wrap content in a full HTML document for iframe preview
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${actualBusinessName} - ${pageId}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&family=Merriweather:wght@400;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${sandboxScripts}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ${sliderStyles.fontBody};
      background: ${sliderStyles.colors.background};
      color: ${sliderStyles.colors.text};
      line-height: 1.6;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    a:hover {
      opacity: 0.9;
    }
    ${headerHtml.styles}
  </style>
</head>
<body ${sandboxBodyClass}>
  ${sandboxBanner}
  ${headerHtml.html}
  <div id="root">
    ${pageContent}
  </div>
  ${headerHtml.scripts}
</body>
</html>`;

        generatedPages[pageId] = fullHtml;
      }

      res.json({
        success: true,
        industry: industry,
        businessName: actualBusinessName,
        pages: generatedPages,
        pagesGenerated: Object.keys(generatedPages).length,
        sliderStyles: getSliderStyles(moodSliders, promptConfig?.colors),
        apiCost: 0, // Always zero for previews
        sandboxMode: !!sandboxMode,
        fixture: sandboxMode ? { business: fixture.business, menuCategories: (fixture.menu || fixture.services || []).length } : null,
        // Layout Intelligence info
        layout: hasLayoutIntelligence ? {
          categoryKey: layoutConfig.categoryKey,
          categoryName: layoutConfig.category?.name,
          layoutKey: layoutConfig.layoutKey,
          layoutName: layoutConfig.layout?.name,
          sectionOrder: layoutConfig.layout?.sectionOrder || [],
          emphasis: layoutConfig.layout?.emphasis || []
        } : null
      });

    } catch (err) {
      console.error('Preview generation error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // =====================================================
  // COMPANION APP PREVIEW - Zero-cost visual testing
  // Generates companion app HTML previews with theme toggle
  // Now with SANDBOX MODE for full system simulation!
  // =====================================================
  router.post('/preview-companion', async (req, res) => {
    try {
      const { industry, businessName, moodSliders, preset, sandboxMode } = req.body;

      if (!industry) {
        return res.status(400).json({ success: false, error: 'Industry is required' });
      }

      // Get industry config
      const industryConfig = INDUSTRIES[industry];
      if (!industryConfig) {
        return res.status(404).json({ success: false, error: `Industry "${industry}" not found` });
      }

      // Get fixture data for sandbox mode
      const fixture = sandboxMode ? getIndustryFixture(industry) : null;
      const actualBusinessName = businessName || (fixture ? fixture.business.name : `${industryConfig.name} Demo`);

      // Import companion preview generator
      const { generateCompanionPreviewSandbox } = require('../generators/companion-generator.cjs');

      // Generate preview screens (sandbox mode includes Mock API and fixture data)
      const screens = generateCompanionPreviewSandbox({
        industry,
        businessName: actualBusinessName,
        moodSliders,
        colors: industryConfig.colors || {},
        sandboxMode: !!sandboxMode,
        fixture
      });

      res.json({
        success: true,
        industry,
        businessName: actualBusinessName,
        screens,
        screensGenerated: Object.keys(screens).length,
        apiCost: 0,
        sandboxMode: !!sandboxMode,
        fixture: sandboxMode ? { business: fixture.business, menuCategories: (fixture.menu || fixture.services || []).length } : null
      });

    } catch (err) {
      console.error('Companion preview error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  return router;
}

/**
 * Convert JSX-style string to renderable HTML for preview
 * This is a simplified converter - just extracts the structure
 */
function convertJsxToHtml(jsxCode, businessName, sliderStyles) {
  // Extract the return statement content
  const returnMatch = jsxCode.match(/return\s*\(\s*([\s\S]*)\s*\);\s*};/);
  if (!returnMatch) {
    return '<div style="padding: 40px; text-align: center;">Preview generation failed</div>';
  }

  let html = returnMatch[1];

  // Replace JSX patterns with HTML
  html = html
    // Replace style objects with inline styles
    .replace(/style=\{\{([^}]+)\}\}/g, (match, styles) => {
      const cssStyles = styles
        .replace(/,\s*\n/g, ';')
        .replace(/,\s*$/g, '')
        .replace(/'/g, '')
        .replace(/"/g, '')
        .replace(/(\w+):/g, (m, prop) => {
          // Convert camelCase to kebab-case
          return prop.replace(/([A-Z])/g, '-$1').toLowerCase() + ':';
        })
        .replace(/\n/g, ' ')
        .trim();
      return `style="${cssStyles}"`;
    })
    // Replace className with class
    .replace(/className=/g, 'class=')
    // Replace self-closing tags
    .replace(/<(\w+)([^>]*)\s*\/>/g, '<$1$2></$1>')
    // Replace {businessName} placeholder
    .replace(/\{businessName\}/g, businessName || 'Your Business')
    // Replace Link components with anchor tags
    .replace(/<Link\s+to="([^"]+)"/g, '<a href="$1"')
    .replace(/<\/Link>/g, '</a>')
    // Remove map functions - simplified static version
    .replace(/\{.*?\.map\([^)]+\)\s*=>\s*\(/g, '')
    .replace(/\)\)\}/g, '')
    // Remove JS expressions in braces
    .replace(/\{[^}]*idx[^}]*\}/g, '')
    .replace(/key=\{[^}]+\}/g, '');

  // Add some static feature cards for home page
  if (html.includes('Why Choose Us')) {
    const features = sliderStyles.copyTone.valueWords.slice(0, 3);
    const featureHtml = features.map((f, i) => `
      <div style="padding: ${sliderStyles.cardPadding}; background: ${sliderStyles.isDark ? 'rgba(255,255,255,0.05)' : sliderStyles.colors.surface}; border-radius: ${sliderStyles.borderRadius}; text-align: center; ${sliderStyles.isDark ? 'border: 1px solid rgba(255,255,255,0.1);' : ''}">
        <h3 style="font-size: 20px; color: ${sliderStyles.colors.primary}; margin-bottom: 12px; text-transform: capitalize;">${f}</h3>
        <p style="color: ${sliderStyles.colors.textMuted}; line-height: 1.6;">We pride ourselves on delivering exceptional ${f.toLowerCase()} in everything we do.</p>
      </div>
    `).join('');

    html = html.replace(
      /\{.*?'Quality'.*?Trust'.*?\]/g,
      ''
    );

    // Insert feature cards
    const gridMatch = html.match(/<div style="[^"]*display:\s*grid[^"]*">/);
    if (gridMatch) {
      html = html.replace(gridMatch[0], gridMatch[0] + featureHtml);
    }
  }

  return html;
}

module.exports = { createConfigRoutes };
