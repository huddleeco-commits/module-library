/**
 * Input Generator Service
 *
 * Auto-generates configuration inputs for site generation based on:
 * - Research data (Yelp ratings, reviews, price level, categories)
 * - Industry intelligence (best layouts, archetypes, color schemes)
 * - Input level (minimal, moderate, extreme)
 *
 * Used for admin testing - auto-fills all fields at each level.
 * Later: User-facing mode will pre-populate but allow editing.
 */

// Industry to preset mapping based on typical business vibes
const INDUSTRY_PRESETS = {
  // Grooming
  'barbershop': { default: 'bold', luxury: 'luxury', budget: 'friendly' },
  'salon-spa': { default: 'luxury', luxury: 'luxury', budget: 'clean' },
  'nail-salon': { default: 'vibrant', luxury: 'luxury', budget: 'friendly' },

  // Food & Beverage
  'restaurant': { default: 'bold', luxury: 'luxury', budget: 'friendly' },
  'pizza-restaurant': { default: 'vibrant', luxury: 'bold', budget: 'friendly' },
  'coffee-cafe': { default: 'clean', luxury: 'luxury', budget: 'friendly' },
  'bakery': { default: 'friendly', luxury: 'luxury', budget: 'friendly' },

  // Health & Wellness
  'dental': { default: 'clean', luxury: 'luxury', budget: 'clean' },
  'healthcare': { default: 'clean', luxury: 'luxury', budget: 'clean' },
  'fitness-gym': { default: 'bold', luxury: 'luxury', budget: 'vibrant' },
  'yoga': { default: 'minimal', luxury: 'luxury', budget: 'clean' },

  // Professional
  'law-firm': { default: 'luxury', luxury: 'luxury', budget: 'clean' },
  'real-estate': { default: 'luxury', luxury: 'luxury', budget: 'bold' },
  'accounting': { default: 'clean', luxury: 'luxury', budget: 'clean' },

  // Home Services
  'plumber': { default: 'bold', luxury: 'clean', budget: 'friendly' },
  'electrician': { default: 'bold', luxury: 'clean', budget: 'friendly' },
  'cleaning': { default: 'clean', luxury: 'clean', budget: 'friendly' },
  'auto-shop': { default: 'bold', luxury: 'bold', budget: 'friendly' },

  // Default
  'default': { default: 'clean', luxury: 'luxury', budget: 'friendly' }
};

// Industry to theme mapping (light/medium/dark)
const INDUSTRY_THEMES = {
  'barbershop': 'dark',
  'salon-spa': 'light',
  'nail-salon': 'light',
  'restaurant': 'medium',
  'pizza-restaurant': 'medium',
  'coffee-cafe': 'light',
  'bakery': 'light',
  'dental': 'light',
  'healthcare': 'light',
  'fitness-gym': 'dark',
  'yoga': 'light',
  'law-firm': 'dark',
  'real-estate': 'light',
  'accounting': 'light',
  'plumber': 'light',
  'electrician': 'light',
  'cleaning': 'light',
  'auto-shop': 'dark',
  'default': 'light'
};

// Industry to archetype mapping
const INDUSTRY_ARCHETYPES = {
  'barbershop': 'vintage-classic',
  'salon-spa': 'modern-sleek',
  'restaurant': 'local',
  'pizza-restaurant': 'local',
  'coffee-cafe': 'local',
  'bakery': 'local',
  'dental': 'trust-authority',
  'healthcare': 'trust-authority',
  'fitness-gym': 'high-energy',
  'yoga': 'calm-wellness',
  'law-firm': 'trust-authority',
  'real-estate': 'trust-authority',
  'plumber': 'reliable-local',
  'cleaning': 'reliable-local',
  'auto-shop': 'reliable-local',
  'default': 'local'
};

// Page packages by tier
const PAGE_PACKAGES = {
  basic: ['home', 'services', 'contact', 'about'],
  standard: ['home', 'services', 'contact', 'about', 'gallery', 'testimonials'],
  premium: ['home', 'services', 'contact', 'about', 'gallery', 'testimonials', 'team', 'faq', 'blog']
};

// Industry-specific page recommendations
const INDUSTRY_PAGES = {
  'barbershop': ['home', 'services', 'contact', 'about', 'gallery', 'book'],
  'salon-spa': ['home', 'services', 'contact', 'about', 'gallery', 'book', 'team'],
  'restaurant': ['home', 'menu', 'contact', 'about', 'gallery', 'reservations'],
  'pizza-restaurant': ['home', 'menu', 'contact', 'about', 'order'],
  'coffee-cafe': ['home', 'menu', 'contact', 'about', 'gallery'],
  'bakery': ['home', 'menu', 'contact', 'about', 'gallery', 'order'],
  'dental': ['home', 'services', 'contact', 'about', 'team', 'faq', 'book'],
  'healthcare': ['home', 'services', 'contact', 'about', 'team', 'faq', 'book'],
  'fitness-gym': ['home', 'services', 'contact', 'about', 'schedule', 'pricing', 'team'],
  'yoga': ['home', 'services', 'contact', 'about', 'schedule', 'pricing'],
  'law-firm': ['home', 'services', 'contact', 'about', 'team', 'faq', 'testimonials'],
  'real-estate': ['home', 'services', 'contact', 'about', 'listings', 'team'],
  'plumber': ['home', 'services', 'contact', 'about', 'testimonials', 'faq'],
  'cleaning': ['home', 'services', 'contact', 'about', 'pricing', 'testimonials'],
  'auto-shop': ['home', 'services', 'contact', 'about', 'gallery', 'testimonials']
};

// Mood slider defaults by archetype
const ARCHETYPE_MOOD_SLIDERS = {
  'vintage-classic': { vibe: 0.2, energy: 0.3, era: 0.1, density: 0.5, price: 0.6 },
  'modern-sleek': { vibe: 0.8, energy: 0.5, era: 0.9, density: 0.4, price: 0.7 },
  'local': { vibe: 0.5, energy: 0.5, era: 0.5, density: 0.5, price: 0.4 },
  'luxury': { vibe: 0.7, energy: 0.3, era: 0.7, density: 0.3, price: 0.9 },
  'trust-authority': { vibe: 0.6, energy: 0.3, era: 0.6, density: 0.4, price: 0.7 },
  'high-energy': { vibe: 0.9, energy: 0.9, era: 0.8, density: 0.7, price: 0.5 },
  'calm-wellness': { vibe: 0.4, energy: 0.2, era: 0.6, density: 0.3, price: 0.6 },
  'reliable-local': { vibe: 0.5, energy: 0.5, era: 0.5, density: 0.6, price: 0.4 },
  'neighborhood-friendly': { vibe: 0.4, energy: 0.6, era: 0.4, density: 0.6, price: 0.3 }
};

// Layout recommendations by industry
const INDUSTRY_LAYOUTS = {
  'barbershop': 'vintage-masculine',
  'salon-spa': 'elegant-minimal',
  'restaurant': 'appetizing-visual',
  'pizza-restaurant': 'menu-focused',
  'coffee-cafe': 'cozy-warm',
  'bakery': 'artisan-craft',
  'dental': 'trust-clean',
  'healthcare': 'trust-clean',
  'fitness-gym': 'bold-dynamic',
  'yoga': 'calm-minimal',
  'law-firm': 'professional-authority',
  'real-estate': 'listing-showcase',
  'plumber': 'service-focused',
  'cleaning': 'fresh-clean',
  'auto-shop': 'industrial-bold'
};

class InputGenerator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' }[type] || 'ℹ️';
      console.log(`${prefix} [InputGenerator] ${message}`);
    }
  }

  /**
   * Generate inputs for a prospect at the specified level
   * @param {object} prospect - Prospect data with research
   * @param {string} level - 'minimal' | 'moderate' | 'extreme'
   * @returns {object} Generated configuration inputs
   */
  generateInputs(prospect, level = 'moderate') {
    this.log(`Generating ${level} inputs for: ${prospect.name}`);

    const research = prospect.research || {};
    const industry = prospect.fixtureId || prospect.category || 'default';

    // Base inputs (always included)
    const base = this.generateBaseInputs(prospect, industry, research);

    switch (level) {
      case 'minimal':
        return this.generateMinimalInputs(base, industry, research);
      case 'moderate':
        return this.generateModerateInputs(base, industry, research, prospect);
      case 'extreme':
        return this.generateExtremeInputs(base, industry, research, prospect);
      default:
        return this.generateModerateInputs(base, industry, research, prospect);
    }
  }

  /**
   * Generate base inputs (common to all levels)
   */
  generateBaseInputs(prospect, industry, research) {
    return {
      // Identity
      businessName: prospect.name,
      industry: industry,

      // Location
      address: prospect.address,
      city: prospect.city || this.extractCity(prospect.address),
      phone: prospect.phone,

      // Research data passthrough
      rating: research.rating || prospect.rating,
      reviewCount: research.reviewCount || prospect.reviewCount,
      priceLevel: research.priceLevel,
      categories: research.categories || [],
      hours: research.hours,
      photos: research.photos || prospect.photos || [],
      yelpUrl: research.yelpUrl,
      googleMapsUrl: prospect.googleMapsUrl,
      reviewHighlights: research.reviewHighlights || [],

      // Metadata
      inputLevel: 'base',
      generatedAt: new Date().toISOString(),
      prospectId: prospect.id
    };
  }

  /**
   * Minimal inputs - just enough to generate
   * System picks all style/layout decisions
   */
  generateMinimalInputs(base, industry, research) {
    return {
      ...base,
      inputLevel: 'minimal',

      // Auto selections
      preset: 'auto',
      theme: 'auto',
      pageTier: 'standard',
      layout: 'auto',
      archetype: 'auto',

      // Pages - must be at top level for scout.cjs to use (not just in _resolved)
      pages: PAGE_PACKAGES.standard,

      // Resolved values (what 'auto' will become)
      _resolved: {
        preset: this.derivePreset(industry, research.priceLevel),
        theme: INDUSTRY_THEMES[industry] || INDUSTRY_THEMES.default,
        pages: PAGE_PACKAGES.standard,
        layout: INDUSTRY_LAYOUTS[industry] || 'default',
        archetype: INDUSTRY_ARCHETYPES[industry] || 'local'
      }
    };
  }

  /**
   * Moderate inputs - preset + theme + tier selections
   * Good balance of customization and automation
   */
  generateModerateInputs(base, industry, research, prospect) {
    const priceLevel = research.priceLevel || '$$';
    const preset = this.derivePreset(industry, priceLevel);
    const theme = this.deriveTheme(industry, prospect);
    const archetype = this.deriveArchetype(industry, prospect);
    const pageTier = this.deriveTier(prospect.opportunityScore);

    return {
      ...base,
      inputLevel: 'moderate',

      // Derived selections
      preset: preset,
      theme: theme,
      pageTier: pageTier,
      pages: PAGE_PACKAGES[pageTier],
      archetype: archetype,
      layout: INDUSTRY_LAYOUTS[industry] || 'default',

      // Generated content
      tagline: this.generateTagline(prospect, industry, research)
    };
  }

  /**
   * Extreme inputs - full customization
   * All options filled with intelligent defaults
   */
  generateExtremeInputs(base, industry, research, prospect) {
    const moderate = this.generateModerateInputs(base, industry, research, prospect);
    const archetype = moderate.archetype;
    const moodSliders = this.deriveMoodSliders(archetype, research, prospect);
    const colors = this.deriveColors(industry, archetype, research);

    return {
      ...moderate,
      inputLevel: 'extreme',

      // Full page selection
      pages: INDUSTRY_PAGES[industry] || PAGE_PACKAGES.premium,

      // Mood sliders
      moodSliders: moodSliders,

      // Colors
      colors: colors,

      // Typography (derived from preset)
      typography: this.deriveTypography(moderate.preset),

      // Generated content
      tagline: this.generateTagline(prospect, industry, research),
      heroHeadline: this.generateHeadline(prospect, industry),
      heroSubheadline: this.generateSubheadline(prospect, industry, research),
      aboutText: this.generateAboutText(prospect, industry, research),

      // Features
      features: this.deriveFeatures(industry),

      // Layout specifics
      heroStyle: this.deriveHeroStyle(archetype),
      cardStyle: this.deriveCardStyle(archetype),
      sectionSpacing: this.deriveSectionSpacing(moodSliders.density)
    };
  }

  /**
   * Generate all three levels for comparison testing
   */
  generateAllLevels(prospect) {
    return {
      minimal: this.generateInputs(prospect, 'minimal'),
      moderate: this.generateInputs(prospect, 'moderate'),
      extreme: this.generateInputs(prospect, 'extreme')
    };
  }

  // ============================================
  // DERIVATION HELPERS
  // ============================================

  derivePreset(industry, priceLevel) {
    const presets = INDUSTRY_PRESETS[industry] || INDUSTRY_PRESETS.default;

    if (priceLevel === '$$$$' || priceLevel === '$$$') {
      return presets.luxury || presets.default;
    } else if (priceLevel === '$') {
      return presets.budget || presets.default;
    }
    return presets.default;
  }

  deriveTheme(industry, prospect) {
    // Check for keywords in name that might indicate dark theme
    const name = (prospect.name || '').toLowerCase();
    if (name.includes('night') || name.includes('dark') || name.includes('black')) {
      return 'dark';
    }
    return INDUSTRY_THEMES[industry] || INDUSTRY_THEMES.default;
  }

  deriveArchetype(industry, prospect) {
    const name = (prospect.name || '').toLowerCase();
    const research = prospect.research || {};

    // Keyword detection for archetype
    if (name.includes('classic') || name.includes('traditional') || name.includes('vintage')) {
      return 'vintage-classic';
    }
    if (name.includes('modern') || name.includes('studio') || name.includes('boutique')) {
      return 'modern-sleek';
    }
    if (name.includes('luxury') || name.includes('premium') || name.includes('elite')) {
      return 'luxury';
    }

    // Price level influence
    if (research.priceLevel === '$$$$') {
      return 'luxury';
    }

    return INDUSTRY_ARCHETYPES[industry] || 'local';
  }

  deriveTier(score) {
    if (score >= 75) return 'premium';
    if (score >= 50) return 'standard';
    return 'basic';
  }

  deriveMoodSliders(archetype, research, prospect) {
    const base = ARCHETYPE_MOOD_SLIDERS[archetype] || ARCHETYPE_MOOD_SLIDERS.local;

    // Adjust based on research
    const adjusted = { ...base };

    // Price level affects price slider
    if (research.priceLevel === '$$$$') adjusted.price = 0.95;
    else if (research.priceLevel === '$$$') adjusted.price = 0.75;
    else if (research.priceLevel === '$$') adjusted.price = 0.5;
    else if (research.priceLevel === '$') adjusted.price = 0.25;

    // High ratings = more confident/bold
    if (research.rating >= 4.5) {
      adjusted.energy = Math.min(adjusted.energy + 0.1, 1);
    }

    return adjusted;
  }

  deriveColors(industry, archetype, research) {
    // Base color schemes by archetype
    const colorSchemes = {
      'vintage-classic': { primary: '#1A1A2E', secondary: '#C9A227', accent: '#E43F5A' },
      'modern-sleek': { primary: '#18181B', secondary: '#A855F7', accent: '#F472B6' },
      'local': { primary: '#1E3A5F', secondary: '#3B82F6', accent: '#10B981' },
      'luxury': { primary: '#0F172A', secondary: '#D4AF37', accent: '#9333EA' },
      'trust-authority': { primary: '#1E3A8A', secondary: '#3B82F6', accent: '#10B981' },
      'high-energy': { primary: '#DC2626', secondary: '#F59E0B', accent: '#FBBF24' },
      'calm-wellness': { primary: '#065F46', secondary: '#10B981', accent: '#6EE7B7' },
      'reliable-local': { primary: '#1E40AF', secondary: '#3B82F6', accent: '#F59E0B' },
      'neighborhood-friendly': { primary: '#059669', secondary: '#34D399', accent: '#FCD34D' }
    };

    return colorSchemes[archetype] || colorSchemes.local;
  }

  deriveTypography(preset) {
    const typography = {
      'luxury': { heading: "'Playfair Display', serif", body: "'Inter', sans-serif" },
      'bold': { heading: "'Bebas Neue', sans-serif", body: "'Inter', sans-serif" },
      'clean': { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
      'friendly': { heading: "'Poppins', sans-serif", body: "'Open Sans', sans-serif" },
      'vibrant': { heading: "'Montserrat', sans-serif", body: "'Roboto', sans-serif" },
      'minimal': { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" }
    };

    return typography[preset] || typography.clean;
  }

  deriveFeatures(industry) {
    const features = {
      'restaurant': ['online-ordering', 'reservations', 'menu-display'],
      'barbershop': ['online-booking', 'service-menu', 'gallery'],
      'salon-spa': ['online-booking', 'service-menu', 'gallery', 'team'],
      'dental': ['online-booking', 'patient-portal', 'insurance-info'],
      'fitness-gym': ['class-schedule', 'membership-signup', 'trainer-profiles'],
      'law-firm': ['consultation-booking', 'case-results', 'team-bios'],
      'plumber': ['emergency-contact', 'service-areas', 'instant-quote'],
      'default': ['contact-form', 'service-list', 'about']
    };

    return features[industry] || features.default;
  }

  deriveHeroStyle(archetype) {
    const styles = {
      'vintage-classic': 'centered-overlay',
      'modern-sleek': 'split-image',
      'luxury': 'fullscreen-video',
      'local': 'image-left',
      'high-energy': 'dynamic-carousel',
      'calm-wellness': 'soft-gradient',
      'trust-authority': 'professional-banner'
    };

    return styles[archetype] || 'centered-overlay';
  }

  deriveCardStyle(archetype) {
    const styles = {
      'vintage-classic': { borderRadius: '4px', shadow: 'subtle', border: true },
      'modern-sleek': { borderRadius: '16px', shadow: 'medium', border: false },
      'luxury': { borderRadius: '8px', shadow: 'elegant', border: false },
      'local': { borderRadius: '12px', shadow: 'soft', border: false }
    };

    return styles[archetype] || styles.local;
  }

  deriveSectionSpacing(density) {
    if (density > 0.7) return 'compact';
    if (density < 0.3) return 'spacious';
    return 'balanced';
  }

  // ============================================
  // CONTENT GENERATION
  // ============================================

  generateTagline(prospect, industry, research) {
    const name = prospect.name || 'Business';
    const city = prospect.city || this.extractCity(prospect.address) || 'your area';
    const category = (research.categories && research.categories[0]) || industry;

    const templates = {
      'barbershop': [
        `Where style meets tradition`,
        `Premium cuts, classic experience`,
        `Your neighborhood barbershop in ${city}`
      ],
      'salon-spa': [
        `Elevate your beauty`,
        `Where relaxation meets transformation`,
        `Premium salon services in ${city}`
      ],
      'restaurant': [
        `Fresh flavors, memorable moments`,
        `Taste the difference`,
        `Fine dining in ${city}`
      ],
      'dental': [
        `Your smile, our priority`,
        `Gentle care, beautiful smiles`,
        `Trusted dental care in ${city}`
      ],
      'default': [
        `Quality service you can trust`,
        `Excellence in every detail`,
        `Serving ${city} with pride`
      ]
    };

    const industryTemplates = templates[industry] || templates.default;
    return industryTemplates[Math.floor(Math.random() * industryTemplates.length)];
  }

  generateHeadline(prospect, industry) {
    const name = prospect.name || 'Welcome';

    const templates = {
      'barbershop': `${name}`,
      'salon-spa': `${name}`,
      'restaurant': `${name}`,
      'dental': `${name}`,
      'default': `${name}`
    };

    return templates[industry] || templates.default;
  }

  generateSubheadline(prospect, industry, research) {
    const rating = research.rating;
    const reviewCount = research.reviewCount;

    if (rating && reviewCount) {
      return `Rated ${rating}★ by ${reviewCount} happy customers`;
    }

    const templates = {
      'barbershop': 'Premium cuts & classic grooming',
      'salon-spa': 'Beauty, wellness & relaxation',
      'restaurant': 'Exceptional food, unforgettable experience',
      'dental': 'Modern dentistry, compassionate care',
      'default': 'Quality service you can count on'
    };

    return templates[industry] || templates.default;
  }

  generateAboutText(prospect, industry, research) {
    const name = prospect.name || 'We';
    const city = prospect.city || 'the community';

    return `${name} has been proudly serving ${city} with exceptional ${industry.replace('-', ' ')} services. Our team is dedicated to providing the highest quality experience for every customer who walks through our doors.`;
  }

  extractCity(address) {
    if (!address) return null;
    // Simple extraction - look for city before state abbreviation
    const match = address.match(/([A-Za-z\s]+),\s*[A-Z]{2}/);
    return match ? match[1].trim() : null;
  }
}

module.exports = { InputGenerator };
