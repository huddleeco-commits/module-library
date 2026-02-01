/**
 * Template Engine Core
 *
 * Central engine for template processing in BLINK:
 * - Template loading, validation, and caching
 * - Content interpolation with variable substitution
 * - Mood slider to CSS variable mapping
 * - Section assembly and page building
 * - Industry-aware terminology resolution
 * - Tier-based feature gating
 *
 * @module template-engine
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & DEFAULTS
// ═══════════════════════════════════════════════════════════════

/** Default mood slider values (all centered at 50) */
const DEFAULT_MOOD_SLIDERS = {
  vibe: 50,      // Professional (0) to Playful (100)
  energy: 50,    // Calm (0) to Energetic (100)
  era: 50,       // Classic (0) to Modern (100)
  density: 50,   // Minimalist (0) to Dense (100)
  price: 50      // Budget (0) to Premium (100)
};

/** Default color palette */
const DEFAULT_COLORS = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  accent: '#8b5cf6',
  background: '#ffffff',
  backgroundAlt: '#f8fafc',
  surface: '#ffffff',
  text: '#1a1a2e',
  textMuted: '#64748b',
  textOnPrimary: '#ffffff',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  border: '#e2e8f0',
  divider: '#f1f5f9'
};

/** Default typography */
const DEFAULT_TYPOGRAPHY = {
  headingFont: "'Inter', system-ui, sans-serif",
  bodyFont: "'Inter', system-ui, sans-serif",
  weights: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
  sizes: {
    xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
    xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
    '5xl': '3rem', '6xl': '3.75rem'
  },
  lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' }
};

/** Default spacing tokens */
const DEFAULT_SPACING = {
  unit: '4px',
  scale: {
    0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem',
    5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem',
    16: '4rem', 20: '5rem', 24: '6rem'
  },
  sectionPadding: { mobile: '3rem', tablet: '4rem', desktop: '6rem' },
  containerMaxWidth: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
  borderRadius: { none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' }
};

/** Industry terminology defaults */
const DEFAULT_TERMINOLOGY = {
  services: 'Services',
  service: 'Service',
  team: 'Our Team',
  teamMember: 'Team Member',
  booking: 'Book Now',
  customer: 'Customer',
  location: 'Location'
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE ENGINE CLASS
// ═══════════════════════════════════════════════════════════════

/**
 * Core template engine for BLINK
 */
class TemplateEngine {
  constructor(options = {}) {
    this.templateCache = new Map();
    this.configPath = options.configPath || path.join(__dirname, '../config');
    this.templatesPath = options.templatesPath || path.join(this.configPath, 'templates');
    this.cacheEnabled = options.cacheEnabled !== false;
  }

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE LOADING & VALIDATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Load a template configuration by ID
   * @param {string} templateId - Template identifier
   * @returns {Object} Template configuration
   */
  loadTemplate(templateId) {
    // Check cache first
    if (this.cacheEnabled && this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId);
    }

    const templatePath = path.join(this.templatesPath, `${templateId}.json`);

    if (!fs.existsSync(templatePath)) {
      throw new TemplateError(`Template not found: ${templateId}`, 'TEMPLATE_NOT_FOUND');
    }

    try {
      const raw = fs.readFileSync(templatePath, 'utf-8');
      const template = JSON.parse(raw);

      // Validate and normalize
      const validated = this.validateTemplate(template);

      // Cache if enabled
      if (this.cacheEnabled) {
        this.templateCache.set(templateId, validated);
      }

      return validated;
    } catch (error) {
      if (error instanceof TemplateError) throw error;
      throw new TemplateError(`Failed to load template: ${error.message}`, 'TEMPLATE_LOAD_ERROR');
    }
  }

  /**
   * Validate a template configuration against the schema
   * @param {Object} template - Raw template configuration
   * @returns {Object} Validated and normalized template
   */
  validateTemplate(template) {
    const errors = [];

    // Required fields
    if (!template.meta) {
      errors.push('Missing required field: meta');
    } else {
      if (!template.meta.id) errors.push('Missing required field: meta.id');
      if (!template.meta.name) errors.push('Missing required field: meta.name');
      if (!template.meta.category) errors.push('Missing required field: meta.category');
    }

    if (!template.style) errors.push('Missing required field: style');
    if (!template.header) errors.push('Missing required field: header');
    if (!template.footer) errors.push('Missing required field: footer');
    if (!template.pages || !Array.isArray(template.pages)) {
      errors.push('Missing or invalid required field: pages');
    }
    if (!template.tiers || !Array.isArray(template.tiers)) {
      errors.push('Missing or invalid required field: tiers');
    }

    if (errors.length > 0) {
      throw new TemplateError(`Template validation failed:\n${errors.join('\n')}`, 'VALIDATION_ERROR');
    }

    // Normalize with defaults
    return this.normalizeTemplate(template);
  }

  /**
   * Normalize template with default values
   * @param {Object} template - Template configuration
   * @returns {Object} Normalized template
   */
  normalizeTemplate(template) {
    return {
      ...template,
      meta: {
        version: '1.0.0',
        industries: ['universal'],
        ...template.meta
      },
      style: {
        colors: { ...DEFAULT_COLORS, ...template.style?.colors },
        typography: { ...DEFAULT_TYPOGRAPHY, ...template.style?.typography },
        spacing: { ...DEFAULT_SPACING, ...template.style?.spacing },
        effects: {
          shadows: {
            none: 'none',
            sm: '0 1px 2px rgba(0,0,0,0.05)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
            lg: '0 10px 15px rgba(0,0,0,0.1)',
            xl: '0 20px 25px rgba(0,0,0,0.15)'
          },
          transitions: { fast: '150ms', normal: '250ms', slow: '400ms' },
          ...template.style?.effects
        },
        ...template.style
      },
      defaultMoodSliders: { ...DEFAULT_MOOD_SLIDERS, ...template.defaultMoodSliders },
      terminology: { ...DEFAULT_TERMINOLOGY, ...template.terminology }
    };
  }

  /**
   * Clear the template cache
   */
  clearCache() {
    this.templateCache.clear();
  }

  // ─────────────────────────────────────────────────────────────
  // CONTENT INTERPOLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Interpolate variables in a string
   * Supports {{variable}} and {{variable.nested}} syntax
   *
   * @param {string} text - Text with variable placeholders
   * @param {Object} context - Context object with values
   * @returns {string} Interpolated text
   */
  interpolate(text, context) {
    if (typeof text !== 'string') return text;

    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.resolvePath(path.trim(), context);
      return value !== undefined ? value : match;
    });
  }

  /**
   * Interpolate all string values in an object recursively
   * @param {Object} obj - Object to interpolate
   * @param {Object} context - Context with values
   * @returns {Object} Interpolated object
   */
  interpolateObject(obj, context) {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return this.interpolate(obj, context);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, context));
    }

    if (typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value, context);
      }
      return result;
    }

    return obj;
  }

  /**
   * Resolve a dot-notation path in an object
   * @param {string} path - Dot-notation path (e.g., 'business.name')
   * @param {Object} obj - Object to resolve against
   * @returns {*} Resolved value or undefined
   */
  resolvePath(path, obj) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // ─────────────────────────────────────────────────────────────
  // MOOD SLIDER SYSTEM
  // ─────────────────────────────────────────────────────────────

  /**
   * Convert mood slider values to CSS variables
   * @param {Object} sliders - Mood slider values (0-100)
   * @returns {Object} CSS variables and style values
   */
  moodToCSS(sliders = {}) {
    const mood = { ...DEFAULT_MOOD_SLIDERS, ...sliders };
    const { vibe, energy, era, density, price } = mood;

    // Border radius: professional = sharp, playful = rounded
    const borderRadius = this.interpolateValue(vibe, '4px', '24px');
    const buttonRadius = vibe > 70 ? '9999px' : this.interpolateValue(vibe, '4px', '16px');

    // Spacing: dense = tight, minimal = airy
    const sectionPaddingY = this.interpolateValue(density, '2.5rem', '7rem', true);
    const cardPadding = this.interpolateValue(density, '1rem', '2.5rem');
    const gap = this.interpolateValue(density, '1rem', '2rem');

    // Typography: era affects font choice
    const headingFont = era < 40
      ? "'Playfair Display', Georgia, serif"
      : era > 60
        ? "'Inter', system-ui, sans-serif"
        : "'Poppins', sans-serif";
    const headingWeight = era < 40 ? 700 : 600;
    const letterSpacing = price > 60 ? '0.05em' : 'normal';

    // Shadows: energy affects intensity
    const shadowBase = this.interpolateValue(energy, 0.03, 0.12);
    const shadowSm = `0 1px 2px rgba(0,0,0,${shadowBase})`;
    const shadowMd = `0 4px 6px rgba(0,0,0,${shadowBase * 1.5})`;
    const shadowLg = `0 10px 15px rgba(0,0,0,${shadowBase * 2})`;

    // Transitions: energy affects speed
    const transitionFast = this.interpolateValue(energy, 200, 100, true) + 'ms';
    const transitionNormal = this.interpolateValue(energy, 350, 200, true) + 'ms';

    // Hover effects: energy affects intensity
    const hoverScale = this.interpolateValue(energy, 1.01, 1.05);
    const hoverLift = this.interpolateValue(energy, '-2px', '-8px');

    // Premium feel: affects overlays and accents
    const heroOverlayOpacity = this.interpolateValue(price, 0.3, 0.5);
    const accentOpacity = this.interpolateValue(price, 0.8, 1);

    return {
      // CSS Custom Properties (for direct injection)
      cssVariables: {
        '--border-radius': borderRadius,
        '--button-radius': buttonRadius,
        '--section-padding-y': sectionPaddingY,
        '--card-padding': cardPadding,
        '--gap': gap,
        '--heading-font': headingFont,
        '--heading-weight': headingWeight,
        '--letter-spacing': letterSpacing,
        '--shadow-sm': shadowSm,
        '--shadow-md': shadowMd,
        '--shadow-lg': shadowLg,
        '--transition-fast': transitionFast,
        '--transition-normal': transitionNormal,
        '--hover-scale': hoverScale,
        '--hover-lift': hoverLift,
        '--hero-overlay-opacity': heroOverlayOpacity,
        '--accent-opacity': accentOpacity
      },
      // Structured values for programmatic use
      values: {
        borderRadius,
        buttonRadius,
        sectionPaddingY,
        cardPadding,
        gap,
        headingFont,
        headingWeight,
        letterSpacing,
        shadows: { sm: shadowSm, md: shadowMd, lg: shadowLg },
        transitions: { fast: transitionFast, normal: transitionNormal },
        hover: { scale: hoverScale, lift: hoverLift },
        overlays: { hero: heroOverlayOpacity, accent: accentOpacity }
      },
      // Raw slider values
      raw: mood
    };
  }

  /**
   * Interpret mood sliders for AI prompts
   * @param {Object} sliders - Mood slider values
   * @returns {Object} Human-readable interpretations
   */
  interpretMood(sliders = {}) {
    const mood = { ...DEFAULT_MOOD_SLIDERS, ...sliders };

    return {
      tone: mood.vibe < 40 ? 'professional and formal'
          : mood.vibe > 60 ? 'friendly and warm'
          : 'balanced and approachable',
      energy: mood.energy < 40 ? 'calm and serene'
            : mood.energy > 60 ? 'energetic and bold'
            : 'moderate and steady',
      style: mood.era < 40 ? 'classic and timeless'
           : mood.era > 60 ? 'modern and trendy'
           : 'contemporary and clean',
      layout: mood.density < 40 ? 'minimal and spacious'
            : mood.density > 60 ? 'rich and detailed'
            : 'balanced and readable',
      market: mood.price < 40 ? 'value-focused and accessible'
            : mood.price > 60 ? 'premium and exclusive'
            : 'quality-focused and fair',
      // Combined summary for AI prompts
      summary: this.generateMoodSummary(mood)
    };
  }

  /**
   * Generate a combined mood summary
   */
  generateMoodSummary(mood) {
    const traits = [];

    if (mood.vibe < 40) traits.push('professional');
    else if (mood.vibe > 60) traits.push('friendly');

    if (mood.energy > 60) traits.push('energetic');
    else if (mood.energy < 40) traits.push('calm');

    if (mood.era > 60) traits.push('modern');
    else if (mood.era < 40) traits.push('classic');

    if (mood.price > 60) traits.push('premium');
    else if (mood.price < 40) traits.push('value-oriented');

    return traits.length > 0 ? traits.join(', ') : 'balanced and versatile';
  }

  /**
   * Linear interpolation between two values based on slider (0-100)
   */
  interpolateValue(slider, min, max, inverse = false) {
    const t = (inverse ? 100 - slider : slider) / 100;

    // Handle string values with units
    if (typeof min === 'string' && typeof max === 'string') {
      const minNum = parseFloat(min);
      const maxNum = parseFloat(max);
      const unit = min.replace(/[\d.-]/g, '');
      return (minNum + (maxNum - minNum) * t).toFixed(2).replace(/\.?0+$/, '') + unit;
    }

    return min + (max - min) * t;
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION RESOLUTION
  // ─────────────────────────────────────────────────────────────

  /**
   * Resolve sections for a page based on configuration
   * @param {Object} pageConfig - Page configuration
   * @param {Object} context - Resolution context
   * @returns {Array} Resolved sections
   */
  resolveSections(pageConfig, context = {}) {
    if (!pageConfig.sections || !Array.isArray(pageConfig.sections)) {
      return [];
    }

    const { tier, features = [], roles = [] } = context;

    return pageConfig.sections
      .filter(section => this.shouldIncludeSection(section, { tier, features, roles }))
      .map((section, index) => ({
        ...section,
        id: section.id || `${pageConfig.type}-section-${index}`,
        resolvedContent: this.resolveContent(section.content, context)
      }));
  }

  /**
   * Check if a section should be included based on conditions
   */
  shouldIncludeSection(section, context) {
    const { conditions } = section;
    if (!conditions) return true;

    const { tier, features, roles } = context;

    // Tier check
    if (conditions.tiers && conditions.tiers.length > 0) {
      if (!conditions.tiers.includes(tier)) return false;
    }

    // Feature flag check
    if (conditions.featureFlag) {
      if (!features.includes(conditions.featureFlag)) return false;
    }

    // Role check
    if (conditions.roles && conditions.roles.length > 0) {
      if (!conditions.roles.some(r => roles.includes(r))) return false;
    }

    return true;
  }

  /**
   * Resolve content schema with defaults
   */
  resolveContent(contentSchema, context) {
    if (!contentSchema) return {};

    const { fields = [], defaults = {} } = contentSchema;
    const resolved = { ...defaults };

    for (const field of fields) {
      if (resolved[field.key] === undefined && field.defaultValue !== undefined) {
        resolved[field.key] = field.defaultValue;
      }
    }

    // Interpolate with context
    return this.interpolateObject(resolved, context);
  }

  // ─────────────────────────────────────────────────────────────
  // PAGE BUILDING
  // ─────────────────────────────────────────────────────────────

  /**
   * Build pages for a tier
   * @param {Object} template - Template configuration
   * @param {string} tier - Selected tier (essential, recommended, premium)
   * @param {Object} context - Build context
   * @returns {Array} Built pages
   */
  buildPages(template, tier, context = {}) {
    const tierConfig = template.tiers.find(t => t.id === tier);
    if (!tierConfig) {
      throw new TemplateError(`Invalid tier: ${tier}`, 'INVALID_TIER');
    }

    const allowedPages = new Set(tierConfig.pages);
    const fullContext = { ...context, tier, terminology: template.terminology };

    return template.pages
      .filter(page => allowedPages.has(page.type))
      .map(page => this.buildPage(page, fullContext));
  }

  /**
   * Build a single page
   */
  buildPage(pageConfig, context) {
    return {
      ...pageConfig,
      title: this.interpolate(pageConfig.title, context),
      description: pageConfig.description ? this.interpolate(pageConfig.description, context) : undefined,
      sections: this.resolveSections(pageConfig, context)
    };
  }

  // ─────────────────────────────────────────────────────────────
  // TERMINOLOGY RESOLUTION
  // ─────────────────────────────────────────────────────────────

  /**
   * Get resolved terminology for an industry
   * @param {Object} template - Template configuration
   * @param {string} variantId - Optional variant ID
   * @returns {Object} Merged terminology
   */
  getTerminology(template, variantId = null) {
    let terminology = { ...DEFAULT_TERMINOLOGY, ...template.terminology };

    // Apply variant overrides if specified
    if (variantId && template.variants && template.variants[variantId]) {
      terminology = { ...terminology, ...template.variants[variantId].terminology };
    }

    return terminology;
  }

  /**
   * Apply terminology to text
   * @param {string} text - Text with terminology placeholders
   * @param {Object} terminology - Terminology mappings
   * @returns {string} Text with terminology applied
   */
  applyTerminology(text, terminology) {
    if (typeof text !== 'string') return text;

    // Replace ${term} placeholders
    return text.replace(/\$\{(\w+)\}/g, (match, term) => {
      return terminology[term] || match;
    });
  }

  // ─────────────────────────────────────────────────────────────
  // TIER MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  /**
   * Get available tiers for a template
   */
  getTiers(template) {
    return template.tiers.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      pageCount: t.pages.length,
      features: t.features
    }));
  }

  /**
   * Get features enabled for a tier
   */
  getTierFeatures(template, tier) {
    const tierConfig = template.tiers.find(t => t.id === tier);
    return tierConfig ? tierConfig.features : [];
  }

  /**
   * Check if a feature is enabled for a tier
   */
  hasFeature(template, tier, feature) {
    const features = this.getTierFeatures(template, tier);
    return features.includes(feature);
  }

  // ─────────────────────────────────────────────────────────────
  // STYLE GENERATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Generate complete style configuration
   * @param {Object} template - Template configuration
   * @param {Object} overrides - Style overrides
   * @param {Object} moodSliders - Mood slider values
   * @returns {Object} Complete style configuration
   */
  generateStyles(template, overrides = {}, moodSliders = {}) {
    const baseStyle = template.style;
    const moodCSS = this.moodToCSS(moodSliders);

    return {
      colors: { ...baseStyle.colors, ...overrides.colors },
      typography: {
        ...baseStyle.typography,
        headingFont: moodCSS.values.headingFont,
        ...overrides.typography
      },
      spacing: {
        ...baseStyle.spacing,
        borderRadius: {
          ...baseStyle.spacing.borderRadius,
          md: moodCSS.values.borderRadius,
          button: moodCSS.values.buttonRadius
        },
        ...overrides.spacing
      },
      effects: {
        ...baseStyle.effects,
        shadows: moodCSS.values.shadows,
        transitions: {
          fast: moodCSS.values.transitions.fast,
          normal: moodCSS.values.transitions.normal,
          slow: baseStyle.effects.transitions.slow
        },
        ...overrides.effects
      },
      cssVariables: {
        ...baseStyle.cssVariables,
        ...moodCSS.cssVariables,
        ...overrides.cssVariables
      },
      moodInterpretation: this.interpretMood(moodSliders)
    };
  }

  /**
   * Generate CSS custom properties string
   */
  generateCSSVariables(style) {
    const vars = [];

    // Colors
    for (const [key, value] of Object.entries(style.colors || {})) {
      vars.push(`--color-${this.kebabCase(key)}: ${value};`);
    }

    // Typography
    if (style.typography) {
      vars.push(`--font-heading: ${style.typography.headingFont};`);
      vars.push(`--font-body: ${style.typography.bodyFont};`);
    }

    // Additional CSS variables
    for (const [key, value] of Object.entries(style.cssVariables || {})) {
      if (!key.startsWith('--')) {
        vars.push(`--${this.kebabCase(key)}: ${value};`);
      } else {
        vars.push(`${key}: ${value};`);
      }
    }

    return `:root {\n  ${vars.join('\n  ')}\n}`;
  }

  /**
   * Convert camelCase to kebab-case
   */
  kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // ─────────────────────────────────────────────────────────────
  // FULL TEMPLATE PROCESSING
  // ─────────────────────────────────────────────────────────────

  /**
   * Process a complete template with all options
   * @param {string|Object} templateInput - Template ID or configuration
   * @param {Object} options - Processing options
   * @returns {Object} Fully processed template
   */
  process(templateInput, options = {}) {
    const {
      tier = 'recommended',
      variant = null,
      businessInfo = {},
      colors = {},
      moodSliders = {},
      features = [],
      includePortal = false,
      portalTier = 'basic'
    } = options;

    // Load template if string ID provided
    const template = typeof templateInput === 'string'
      ? this.loadTemplate(templateInput)
      : this.normalizeTemplate(templateInput);

    // Build context
    const context = {
      business: businessInfo,
      tier,
      features: [...features, ...this.getTierFeatures(template, tier)],
      terminology: this.getTerminology(template, variant)
    };

    // Generate styles
    const styles = this.generateStyles(template, { colors }, moodSliders);

    // Build pages
    const pages = this.buildPages(template, tier, context);

    // Add portal pages if requested
    let portalPages = [];
    if (includePortal) {
      const tierConfig = template.tiers.find(t => t.id === tier);
      if (tierConfig?.portalPages) {
        portalPages = template.pages
          .filter(p => tierConfig.portalPages.includes(p.type))
          .map(p => this.buildPage(p, context));
      }
    }

    return {
      meta: template.meta,
      tier: { id: tier, ...template.tiers.find(t => t.id === tier) },
      variant,
      business: businessInfo,
      styles,
      terminology: context.terminology,
      moodInterpretation: styles.moodInterpretation,
      cssVariables: this.generateCSSVariables(styles),
      header: this.interpolateObject(template.header, context),
      footer: this.interpolateObject(template.footer, context),
      pages,
      portalPages,
      features: context.features,
      // Database/API config for SaaS templates
      database: template.database,
      api: template.api,
      integrations: template.integrations,
      deployment: template.deployment
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE ERROR CLASS
// ═══════════════════════════════════════════════════════════════

class TemplateError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'TemplateError';
    this.code = code;
  }
}

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/** Singleton instance */
let engineInstance = null;

/**
 * Get or create the template engine instance
 */
function getEngine(options = {}) {
  if (!engineInstance || Object.keys(options).length > 0) {
    engineInstance = new TemplateEngine(options);
  }
  return engineInstance;
}

/**
 * Quick template processing
 */
function processTemplate(templateInput, options = {}) {
  return getEngine().process(templateInput, options);
}

/**
 * Quick mood to CSS conversion
 */
function moodToCSS(sliders) {
  return getEngine().moodToCSS(sliders);
}

/**
 * Quick mood interpretation
 */
function interpretMood(sliders) {
  return getEngine().interpretMood(sliders);
}

/**
 * Quick content interpolation
 */
function interpolate(text, context) {
  return getEngine().interpolate(text, context);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Main class
  TemplateEngine,
  TemplateError,

  // Singleton and convenience functions
  getEngine,
  processTemplate,
  moodToCSS,
  interpretMood,
  interpolate,

  // Defaults for external use
  DEFAULT_MOOD_SLIDERS,
  DEFAULT_COLORS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_TERMINOLOGY
};
