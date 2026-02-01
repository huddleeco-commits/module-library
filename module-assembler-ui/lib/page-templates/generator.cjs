/**
 * Page Template Generator
 *
 * Integrates industry-specific page templates with test-mode generation.
 * Produces complete, styled pages from fixture data - zero AI cost.
 *
 * For AI Visual Freedom: Each section is modular and can be customized
 * by AI to create unique layouts while keeping the business logic intact.
 */

const healthcareTemplates = require('./healthcare/index.cjs');

// Industry to template mapping
const INDUSTRY_TEMPLATES = {
  'healthcare': healthcareTemplates,
  'medical': healthcareTemplates,
  'dental': healthcareTemplates, // Can use healthcare base, customize later
  'clinic': healthcareTemplates
  // Add more industries as templates are built:
  // 'restaurant': restaurantTemplates,
  // 'salon': salonTemplates,
  // etc.
};

// Default pages for industries without specialized templates
const DEFAULT_PAGES = ['home', 'services', 'about', 'contact'];

// Healthcare-specific pages
const HEALTHCARE_PAGES = ['home', 'services', 'providers', 'patient-portal', 'appointments', 'insurance', 'about', 'contact'];

/**
 * Get the appropriate page list for an industry
 */
function getIndustryPages(industry) {
  const normalizedIndustry = industry?.toLowerCase() || '';

  if (['healthcare', 'medical', 'dental', 'clinic'].includes(normalizedIndustry)) {
    return HEALTHCARE_PAGES;
  }

  // Default pages for other industries
  return DEFAULT_PAGES;
}

/**
 * Check if an industry has specialized templates
 */
function hasSpecializedTemplates(industry) {
  const normalizedIndustry = industry?.toLowerCase() || '';
  return !!INDUSTRY_TEMPLATES[normalizedIndustry];
}

/**
 * Generate all pages for a fixture using industry-specific templates
 */
function generatePagesFromFixture(fixture, options = {}) {
  const industry = fixture.type || fixture.business?.industry || fixture.industry || 'general';
  const normalizedIndustry = industry.toLowerCase();

  // Check for specialized templates
  const templates = INDUSTRY_TEMPLATES[normalizedIndustry];

  if (templates && templates.generateHealthcarePages) {
    // Use specialized templates
    console.log(`📋 Using specialized templates for: ${industry}`);
    return templates.generateHealthcarePages(fixture, options);
  }

  // Fall back to generic generation (existing behavior)
  console.log(`📋 Using generic templates for: ${industry}`);
  return null; // Signal to use existing generic generator
}

/**
 * Generate a single page for a fixture
 */
function generateSinglePage(fixture, pageName, options = {}) {
  const industry = fixture.type || fixture.business?.industry || fixture.industry || 'general';
  const normalizedIndustry = industry.toLowerCase();

  const templates = INDUSTRY_TEMPLATES[normalizedIndustry];

  if (!templates) {
    return null; // Use existing generator
  }

  // Map page name to generator
  const generatorMap = {
    'home': templates.generateHomePage,
    'services': templates.generateServicesPage,
    'providers': templates.generateProvidersPage,
    'patient-portal': templates.generatePatientPortalPage,
    'appointments': templates.generateAppointmentsPage,
    'insurance': templates.generateInsurancePage,
    'about': templates.generateAboutPage,
    'contact': templates.generateContactPage
  };

  const generator = generatorMap[pageName];
  if (generator) {
    return generator(fixture, options);
  }

  return null; // Use existing generator for unmapped pages
}

/**
 * Get list of available templates by industry
 */
function getAvailableTemplates() {
  return {
    healthcare: {
      name: 'Healthcare / Medical',
      pages: HEALTHCARE_PAGES,
      description: 'Complete medical practice with patient portal, appointments, insurance, and provider profiles'
    }
    // Add more as templates are built
  };
}

module.exports = {
  INDUSTRY_TEMPLATES,
  getIndustryPages,
  hasSpecializedTemplates,
  generatePagesFromFixture,
  generateSinglePage,
  getAvailableTemplates
};
