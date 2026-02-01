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
  // Food & Beverage
  { id: 'pizza-restaurant', name: 'Pizza / Pizzeria', icon: '🍕', file: 'pizza-restaurant.json' },
  { id: 'steakhouse', name: 'Steakhouse / Fine Dining', icon: '🥩', file: 'steakhouse.json' },
  { id: 'coffee-cafe', name: 'Coffee Shop / Cafe', icon: '☕', file: 'coffee-cafe.json' },
  { id: 'restaurant', name: 'Restaurant / Farm-to-Table', icon: '🍽️', file: 'restaurant.json' },
  { id: 'bakery', name: 'Bakery', icon: '🥐', file: 'bakery.json' },

  // Health & Wellness
  { id: 'salon-spa', name: 'Salon / Spa', icon: '💆', file: 'salon-spa.json' },
  { id: 'fitness-gym', name: 'Fitness / Gym', icon: '💪', file: 'fitness-gym.json' },
  { id: 'dental', name: 'Dental Practice', icon: '🦷', file: 'dental.json' },
  { id: 'healthcare', name: 'Healthcare / Medical', icon: '🏥', file: 'healthcare.json' },
  { id: 'yoga', name: 'Yoga Studio', icon: '🧘', file: 'yoga.json' },
  { id: 'barbershop', name: 'Barbershop', icon: '💈', file: 'barbershop.json' },

  // Professional Services
  { id: 'law-firm', name: 'Law Firm', icon: '⚖️', file: 'law-firm.json' },
  { id: 'real-estate', name: 'Real Estate Agency', icon: '🏠', file: 'real-estate.json' },
  { id: 'plumber', name: 'Plumber', icon: '🔧', file: 'plumber.json' },
  { id: 'cleaning', name: 'Cleaning Service', icon: '🧹', file: 'cleaning.json' },
  { id: 'auto-shop', name: 'Auto Shop / Mechanic', icon: '🚗', file: 'auto-shop.json' },

  // Tech & Education
  { id: 'saas', name: 'SaaS / Software', icon: '💻', file: 'saas.json' },
  { id: 'ecommerce', name: 'E-commerce / Retail', icon: '🛍️', file: 'ecommerce.json' },
  { id: 'school', name: 'School / Academy', icon: '🏫', file: 'school.json' }
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
 * Supports research data from Scout/Yelp enrichment
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
  if (customizations.phone) {
    result.business.phone = customizations.phone;
  }
  if (customizations.email) {
    result.business.email = customizations.email;
  }
  if (customizations.address) {
    result.business.address = customizations.address;
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

  // ================================================================
  // RESEARCH DATA FROM SCOUT/YELP ENRICHMENT
  // ================================================================

  // Initialize research object on business
  if (!result.business.research) {
    result.business.research = {};
  }

  // Rating & Reviews (from Yelp or Google)
  if (customizations.rating !== undefined) {
    result.business.rating = customizations.rating;
    result.business.research.rating = customizations.rating;
  }
  if (customizations.reviewCount !== undefined) {
    result.business.reviewCount = customizations.reviewCount;
    result.business.research.reviewCount = customizations.reviewCount;
  }
  if (customizations.reviewHighlights) {
    result.business.research.reviewHighlights = customizations.reviewHighlights;
  }

  // Price Level (from Yelp: $, $$, $$$, $$$$)
  if (customizations.priceLevel) {
    result.business.priceLevel = customizations.priceLevel;
    result.business.research.priceLevel = customizations.priceLevel;
    // Map price level to price range description
    const priceLevelMap = {
      '$': 'Budget-friendly',
      '$$': 'Moderate',
      '$$$': 'Upscale',
      '$$$$': 'Fine Dining / Premium'
    };
    if (!customizations.priceRange) {
      result.business.priceRange = priceLevelMap[customizations.priceLevel] || 'Moderate';
    }
  }

  // Categories/Services (from Yelp)
  if (customizations.categories && customizations.categories.length > 0) {
    result.business.categories = customizations.categories;
    result.business.research.categories = customizations.categories;
    // Use first category as primary service type
    if (!result.business.serviceType) {
      result.business.serviceType = customizations.categories[0];
    }
  }

  // Business Hours (from Yelp)
  if (customizations.hours) {
    result.business.hours = customizations.hours;
    result.business.research.hours = customizations.hours;
  }

  // Photos (from Yelp/Google)
  if (customizations.photos && customizations.photos.length > 0) {
    result.business.photos = customizations.photos;
    result.business.research.photos = customizations.photos;
    // Use first photo as hero image if no hero image set
    if (!result.business.heroImage) {
      result.business.heroImage = customizations.photos[0];
    }
  }

  // External Links
  if (customizations.yelpUrl) {
    result.business.yelpUrl = customizations.yelpUrl;
    result.business.research.yelpUrl = customizations.yelpUrl;
  }
  if (customizations.googleMapsUrl) {
    result.business.googleMapsUrl = customizations.googleMapsUrl;
  }

  // Opportunity Score (from Scout scoring algorithm)
  if (customizations.opportunityScore !== undefined) {
    result.business.research.opportunityScore = customizations.opportunityScore;
  }
  if (customizations.scoreBreakdown) {
    result.business.research.scoreBreakdown = customizations.scoreBreakdown;
  }

  // Source attribution
  if (customizations.researchSource) {
    result.business.research.source = customizations.researchSource;
    result.business.research.enrichedAt = customizations.enrichedAt || new Date().toISOString();
  }

  // Update hero section with customized business info
  if (result.pages?.home?.hero) {
    if (customizations.businessName) {
      // Update hero headline to use custom business name
      result.pages.home.hero.headline = customizations.businessName;
    }
    if (customizations.tagline) {
      // Update hero subheadline to use custom tagline
      result.pages.home.hero.subheadline = customizations.tagline;
    }
    // Add rating badge to hero if we have rating data
    if (customizations.rating && customizations.reviewCount) {
      result.pages.home.hero.ratingBadge = {
        rating: customizations.rating,
        reviewCount: customizations.reviewCount,
        source: customizations.researchSource || 'Verified'
      };
    }
    // Use research photo for hero background
    if (customizations.photos && customizations.photos.length > 0 && !result.pages.home.hero.backgroundImage) {
      result.pages.home.hero.backgroundImage = customizations.photos[0];
    }
  }

  // Apply theme overrides
  if (customizations.primaryColor) {
    result.theme.colors.primary = customizations.primaryColor;
  }
  if (customizations.secondaryColor) {
    result.theme.colors.secondary = customizations.secondaryColor;
  }
  if (customizations.accentColor) {
    result.theme.colors.accent = customizations.accentColor;
  }
  if (customizations.backgroundColor) {
    result.theme.colors.background = customizations.backgroundColor;
  }
  if (customizations.textColor) {
    result.theme.colors.text = customizations.textColor;
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
