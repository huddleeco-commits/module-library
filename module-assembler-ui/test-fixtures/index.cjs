/**
 * Test Fixtures Index
 *
 * Provides mock data for Test Mode - allows testing full pipeline without AI API costs
 */

const fs = require('fs');
const path = require('path');

const FIXTURES_DIR = __dirname;

// Available test fixtures
const AVAILABLE_FIXTURES = [
  { id: 'pizza-restaurant', name: 'Pizza / Pizzeria', icon: '🍕', file: 'pizza-restaurant.json' },
  { id: 'steakhouse', name: 'Steakhouse / Fine Dining', icon: '🥩', file: 'steakhouse.json' },
  { id: 'salon-spa', name: 'Salon / Spa', icon: '💆', file: 'salon-spa.json' },
  { id: 'fitness-gym', name: 'Fitness / Gym', icon: '💪', file: 'fitness-gym.json' },
  { id: 'coffee-cafe', name: 'Coffee Shop / Cafe', icon: '☕', file: 'coffee-cafe.json' },
  { id: 'dental', name: 'Dental Practice', icon: '🦷', file: 'dental.json' },
  { id: 'auto-shop', name: 'Auto Shop / Mechanic', icon: '🔧', file: 'auto-shop.json' },
  { id: 'saas', name: 'SaaS / Software', icon: '💻', file: 'saas.json' },
  { id: 'ecommerce', name: 'E-commerce / Retail', icon: '🛍️', file: 'ecommerce.json' }
];

/**
 * Get list of available fixtures
 */
function getAvailableFixtures() {
  return AVAILABLE_FIXTURES.map(f => {
    const filePath = path.join(FIXTURES_DIR, f.file);
    const exists = fs.existsSync(filePath);
    return {
      ...f,
      available: exists
    };
  });
}

/**
 * Load a specific fixture by ID
 */
function loadFixture(fixtureId) {
  const fixture = AVAILABLE_FIXTURES.find(f => f.id === fixtureId);
  if (!fixture) {
    throw new Error(`Fixture not found: ${fixtureId}`);
  }

  const filePath = path.join(FIXTURES_DIR, fixture.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fixture file not found: ${fixture.file}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Apply customizations to a fixture
 */
function applyCustomizations(fixture, customizations = {}) {
  const result = JSON.parse(JSON.stringify(fixture)); // Deep clone

  // Apply business overrides
  if (customizations.businessName) {
    result.business.name = customizations.businessName;
  }
  if (customizations.location) {
    result.business.location = customizations.location;
  }
  if (customizations.tagline) {
    result.business.tagline = customizations.tagline;
  }
  if (customizations.teamSize) {
    result.business.teamSize = customizations.teamSize;
  }
  if (customizations.priceRange) {
    result.business.priceRange = customizations.priceRange;
  }
  if (customizations.established) {
    result.business.established = customizations.established;
  }

  // Apply theme overrides
  if (customizations.primaryColor) {
    result.theme.colors.primary = customizations.primaryColor;
  }
  if (customizations.secondaryColor) {
    result.theme.colors.secondary = customizations.secondaryColor;
  }

  // Filter pages if specified
  if (customizations.websitePages && Array.isArray(customizations.websitePages)) {
    const filteredPages = {};
    for (const pageName of customizations.websitePages) {
      if (result.pages[pageName]) {
        filteredPages[pageName] = result.pages[pageName];
      }
    }
    result.pages = filteredPages;
  }

  return result;
}

/**
 * Generate mock page content for a specific page
 * Returns JSX-ready content that mirrors what AI would generate
 */
function generateMockPageContent(fixture, pageName) {
  const page = fixture.pages[pageName];
  if (!page) {
    return null;
  }

  const businessName = fixture.business.name;
  const colors = fixture.theme.colors;

  // Return structured content that can be templated into JSX
  return {
    pageName,
    businessName,
    colors,
    content: page,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate mock App.jsx routes based on fixture
 */
function generateMockAppRoutes(fixture) {
  const pageNames = Object.keys(fixture.pages);
  return pageNames.map(name => ({
    path: name === 'home' ? '/' : `/${name}`,
    component: `${name.charAt(0).toUpperCase() + name.slice(1)}Page`
  }));
}

/**
 * Save a custom fixture
 */
function saveCustomFixture(fixtureId, data) {
  const filePath = path.join(FIXTURES_DIR, 'custom', `${fixtureId}.json`);
  const customDir = path.join(FIXTURES_DIR, 'custom');

  if (!fs.existsSync(customDir)) {
    fs.mkdirSync(customDir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

module.exports = {
  AVAILABLE_FIXTURES,
  getAvailableFixtures,
  loadFixture,
  applyCustomizations,
  generateMockPageContent,
  generateMockAppRoutes,
  saveCustomFixture
};
