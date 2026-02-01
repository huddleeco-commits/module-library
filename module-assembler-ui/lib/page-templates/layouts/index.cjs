/**
 * Layout System
 *
 * Each layout defines:
 * 1. Visual style (rounded vs sharp, spacing, shadows)
 * 2. Section arrangement (which sections, what order)
 * 3. Component variants (hero style, card style, etc.)
 * 4. Industry-specific adaptations
 *
 * The SAME fixture data can render completely differently
 * based on which layout is selected.
 */

// Available layouts with their characteristics
const LAYOUTS = {
  'patient-focused': {
    id: 'patient-focused',
    name: 'Patient Focused',
    description: 'Warm, welcoming design that emphasizes easy booking and patient comfort',
    style: {
      borderRadius: '16px',
      shadows: 'soft',
      spacing: 'comfortable',
      heroStyle: 'centered',
      cardStyle: 'rounded'
    },
    sectionOrder: {
      home: ['hero', 'quick-actions', 'services-preview', 'testimonials', 'stats', 'insurance', 'cta'],
      services: ['hero', 'category-tabs', 'service-grid', 'process', 'cta'],
      about: ['hero', 'mission', 'values', 'team', 'certifications', 'cta']
    },
    emphasis: ['booking', 'testimonials', 'comfort']
  },

  'medical-professional': {
    id: 'medical-professional',
    name: 'Medical Professional',
    description: 'Clean, clinical design that emphasizes credentials and expertise',
    style: {
      borderRadius: '8px',
      shadows: 'minimal',
      spacing: 'structured',
      heroStyle: 'split',
      cardStyle: 'bordered'
    },
    sectionOrder: {
      home: ['hero', 'stats', 'services-preview', 'providers-preview', 'certifications', 'insurance', 'cta'],
      services: ['hero', 'service-list', 'credentials', 'process', 'cta'],
      about: ['hero', 'story', 'certifications', 'team', 'stats', 'cta']
    },
    emphasis: ['credentials', 'expertise', 'statistics']
  },

  'clinical-dashboard': {
    id: 'clinical-dashboard',
    name: 'Clinical Dashboard',
    description: 'Data-focused design with quick access to patient tools and metrics',
    style: {
      borderRadius: '4px',
      shadows: 'none',
      spacing: 'compact',
      heroStyle: 'minimal',
      cardStyle: 'flat'
    },
    sectionOrder: {
      home: ['hero-compact', 'portal-actions', 'quick-stats', 'services-grid', 'contact-bar'],
      services: ['search-filter', 'service-table', 'booking-sidebar'],
      about: ['hero-minimal', 'facts', 'team-list', 'contact']
    },
    emphasis: ['efficiency', 'data', 'quick-access']
  }
};

// Industry-specific layout recommendations
const INDUSTRY_LAYOUT_DEFAULTS = {
  healthcare: 'patient-focused',
  dental: 'patient-focused',
  clinic: 'medical-professional',
  hospital: 'clinical-dashboard',
  restaurant: 'warm-inviting',
  cafe: 'cozy-modern',
  salon: 'elegant-relaxed',
  fitness: 'bold-energetic',
  law: 'professional-trust',
  realestate: 'luxury-modern'
};

/**
 * Get layout configuration
 */
function getLayout(layoutId) {
  return LAYOUTS[layoutId] || LAYOUTS['patient-focused'];
}

/**
 * Get all available layouts
 */
function getAvailableLayouts() {
  return Object.values(LAYOUTS);
}

/**
 * Get recommended layout for an industry
 */
function getRecommendedLayout(industry) {
  const normalized = industry?.toLowerCase().replace(/[^a-z]/g, '') || 'generic';
  return INDUSTRY_LAYOUT_DEFAULTS[normalized] || 'patient-focused';
}

/**
 * Generate CSS variables for a layout
 */
function getLayoutCSS(layout) {
  const config = typeof layout === 'string' ? getLayout(layout) : layout;

  return `
    :root {
      --layout-border-radius: ${config.style.borderRadius};
      --layout-shadow: ${config.style.shadows === 'soft' ? '0 4px 20px rgba(0,0,0,0.08)' :
                        config.style.shadows === 'minimal' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'};
      --layout-spacing: ${config.style.spacing === 'comfortable' ? '24px' :
                         config.style.spacing === 'structured' ? '20px' : '16px'};
      --layout-card-radius: ${config.style.cardStyle === 'rounded' ? '16px' :
                             config.style.cardStyle === 'bordered' ? '8px' : '4px'};
    }
  `;
}

module.exports = {
  LAYOUTS,
  INDUSTRY_LAYOUT_DEFAULTS,
  getLayout,
  getAvailableLayouts,
  getRecommendedLayout,
  getLayoutCSS
};
