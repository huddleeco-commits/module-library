/**
 * Layout Archetypes for Bakery & Artisan Food Businesses
 *
 * Based on analysis of top-performing bakery websites:
 * Sprinkles, Levain, Lady M, Porto's, Carlo's, Milk Bar, Tartine
 *
 * These patterns apply to:
 * - Bakeries & Cake Shops
 * - Coffee Shops & Cafes
 * - Ice Cream & Gelato Shops
 * - Chocolatiers & Confectioneries
 * - Specialty Food Stores
 * - Delis & Sandwich Shops
 * - Pizzerias (artisan)
 * - Juice Bars & Smoothie Shops
 * - Patisseries & Pastry Shops
 */

const LAYOUT_ARCHETYPES = {
  // ============================================
  // ARCHETYPE A: E-Commerce Focus
  // ============================================
  'ecommerce': {
    id: 'ecommerce',
    name: 'E-Commerce Focus',
    description: 'Modern, conversion-focused, product-forward. Best for online ordering & shipping.',
    bestFor: ['online ordering', 'nationwide shipping', 'gift-focused', 'high-volume'],
    realExamples: ['Sprinkles', 'Levain', "Carlo's Bakery", 'Milk Bar'],

    // Visual Style
    style: {
      vibe: 'modern, conversion-focused, product-forward',
      colors: {
        primary: '#E91E63',      // Brand pink/coral
        secondary: '#1a1a1a',    // Dark for contrast
        accent: '#D4AF37',       // Gold accent
        background: '#ffffff',
        backgroundAlt: '#FFF8F5', // Light cream sections
        text: '#1a1a1a',
        textMuted: '#666666'
      },
      typography: {
        headingFont: "'DM Sans', 'Montserrat', sans-serif",
        bodyFont: "'Inter', 'Open Sans', sans-serif",
        headingWeight: '700',
        headingStyle: 'uppercase',
        letterSpacing: '0.02em'
      },
      borderRadius: '8px',
      shadows: true,
      animations: 'snappy'
    },

    // Header Pattern
    header: {
      layout: 'logo-center-nav-split',
      hasAnnouncementBar: true,
      announcementExamples: ['Free shipping on orders $50+', '20% off first order with code SWEET20'],
      elements: ['search', 'account', 'cart'],
      navStyle: 'mega-menu',
      ctaButton: { text: 'Order Now', style: 'primary' }
    },

    // Page Sections
    pages: {
      home: {
        sections: [
          {
            type: 'hero',
            layout: 'split',
            height: '70vh',
            content: {
              imagePosition: 'left',
              headline: 'benefit-focused',
              headlineExamples: ['Spreading Joy in Every Bite', 'Happiness, Delivered Fresh'],
              subhead: true,
              ctas: [
                { text: 'Order Pickup', style: 'primary' },
                { text: 'Ship Nationwide', style: 'secondary' }
              ]
            }
          },
          {
            type: 'trust-strip',
            layout: 'scrolling-marquee',
            content: ['Baked Fresh Daily', 'Free Shipping $50+', 'Family Owned Since {YEAR}', '100% Satisfaction Guaranteed']
          },
          {
            type: 'featured-products',
            layout: 'grid-4',
            title: 'Fan Favorites',
            titleAlt: 'Best Sellers',
            showBadges: true,
            badges: ['Best Seller', 'New', 'Seasonal', 'Limited Edition'],
            showPrices: true,
            showAddToCart: true
          },
          {
            type: 'promo',
            layout: 'split',
            content: {
              textPosition: 'left',
              imagePosition: 'right',
              seasonal: true
            }
          },
          {
            type: 'categories',
            layout: 'grid-3',
            style: 'image-cards',
            showOverlay: true
          },
          {
            type: 'newsletter',
            layout: 'centered',
            incentive: 'Get 10% off your first order'
          }
        ]
      },
      menu: {
        layout: 'filterable-grid',
        hasFilters: true,
        filterStyle: 'horizontal-tabs',
        productCard: {
          showImage: true,
          showDescription: true,
          showPrice: true,
          showBadges: true,
          showAddButton: true,
          imageRatio: '1:1'
        }
      },
      about: {
        sections: ['hero', 'story', 'values-3col', 'team-grid', 'cta']
      },
      contact: {
        layout: 'two-column',
        hasMap: true,
        hasForm: true
      },
      gallery: {
        layout: 'filterable-masonry',
        filters: ['All', 'Products', 'Behind the Scenes', 'Events']
      }
    },

    // Footer
    footer: {
      style: 'full',
      sections: ['newsletter', 'links', 'locations', 'social', 'legal']
    }
  },

  // ============================================
  // ARCHETYPE B: Brand Story / Luxury
  // ============================================
  'luxury': {
    id: 'luxury',
    name: 'Brand Story / Luxury',
    description: 'Elegant, editorial, lots of whitespace. Best for upscale/premium positioning.',
    bestFor: ['upscale', 'boutique', 'artisan', 'patisserie', 'specialty', 'signature products'],
    realExamples: ['Lady M', 'Tartine', 'Ladurée', 'Dominique Ansel'],

    style: {
      vibe: 'elegant, editorial, sophisticated, premium',
      colors: {
        primary: '#1a365d',           // Deep navy
        secondary: '#D4AF37',         // Champagne gold
        accent: '#8B4513',            // Warm brown accent
        background: '#FDFCFB',        // Off-white
        backgroundAlt: '#F5F3F0',     // Light gray
        text: '#2d2d2d',              // Charcoal (not pure black)
        textMuted: '#6b6b6b',
        // Enhanced luxury colors
        gold: '#D4AF37',
        goldLight: '#F4E4BC',
        goldGradient: 'linear-gradient(135deg, #D4AF37 0%, #F4E4BC 50%, #D4AF37 100%)',
        navyGradient: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
        heroOverlay: 'linear-gradient(180deg, rgba(26,54,93,0.4) 0%, rgba(26,54,93,0.7) 100%)'
      },
      typography: {
        headingFont: "'Playfair Display', 'Cormorant Garamond', serif",
        bodyFont: "'Lato', 'Source Sans Pro', sans-serif",
        headingWeight: '500',
        headingStyle: 'normal',
        letterSpacing: '0.08em',    // Increased for luxury feel
        headingSizeMultiplier: 1.2, // 20% larger headings
        lineHeight: 1.8             // More breathing room
      },
      borderRadius: '0px',           // Sharp corners for elegance
      shadows: false,                // Clean, no shadows
      animations: 'smooth',
      // Enhanced luxury-specific styling
      decorativeElements: {
        dividers: 'elegant-gold-line',       // Thin gold lines between sections
        sectionPadding: '120px',             // Extra generous padding
        imageAspectRatio: '3:4',             // Portrait ratio for elegance
        hoverEffects: 'subtle-zoom',         // 1.02 scale on hover
        buttonStyle: 'gold-bordered',        // Gold border, transparent bg
        overlayStyle: 'frosted-glass'        // Premium frosted glass effect
      },
      // CSS variables for luxury theme
      cssVariables: {
        '--luxury-gold': '#D4AF37',
        '--luxury-gold-light': '#F4E4BC',
        '--luxury-gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F4E4BC 50%, #D4AF37 100%)',
        '--luxury-navy': '#1a365d',
        '--luxury-spacing': '120px',
        '--luxury-transition': 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '--luxury-letter-spacing': '0.08em'
      }
    },

    header: {
      layout: 'logo-center-nav-split',
      hasAnnouncementBar: false,
      elements: ['cart'],
      navStyle: 'minimal-uppercase',
      navItems: ['Shop', 'Collections', 'About', 'Locations', 'Contact'],
      navLetterSpacing: '0.12em',
      navFontWeight: '400'
    },

    pages: {
      home: {
        sections: [
          {
            type: 'hero',
            layout: 'fullscreen-carousel',
            height: '100vh',
            slides: 3,
            overlayOpacity: 0.4,
            content: {
              textOverlay: 'centered',
              overlayStyle: 'frosted-glass',   // Premium frosted glass
              typography: 'display',            // Extra large display typography
              singleCta: true,
              ctaText: 'Explore Collection',
              ctaStyle: 'gold-bordered'         // Gold border button
            }
          },
          {
            type: 'brand-statement',
            layout: 'centered',
            padding: 'generous',
            decorativeDivider: true,            // Gold line above/below
            content: {
              headline: 'Welcome to {BUSINESS_NAME}',
              philosophy: true,
              singleCta: { text: 'Discover', style: 'minimal-gold' }
            }
          },
          {
            type: 'signature-products',
            layout: 'grid-3',
            style: 'large-images-portrait',     // Portrait orientation
            imageAspectRatio: '3:4',
            showOnHover: ['price', 'view-button'],
            minimalText: true,
            hoverEffect: 'subtle-zoom'          // 1.02 scale
          },
          {
            type: 'story-teaser',
            layout: 'split',
            content: {
              imageStyle: 'atmospheric',
              textLength: 'short',
              cta: 'Our Story',
              ctaStyle: 'gold-underline'        // Gold underline on hover
            }
          },
          {
            type: 'craftsmanship',
            layout: 'editorial',
            content: {
              headline: 'The Art of Fine Baking',
              images: ['process', 'ingredients', 'detail'],
              style: 'elegant-grid'
            }
          },
          {
            type: 'visit-us',
            layout: 'location-cards',
            style: 'elegant-minimal'
          }
        ]
      },
      menu: {
        layout: 'elegant-grid',
        hasFilters: false,
        productCard: {
          showImage: true,
          imageSize: 'large',
          imageRatio: '3:4',                   // Portrait
          showDescription: false,
          showPriceOnHover: true,
          hoverEffect: 'subtle-zoom',
          priceStyle: 'gold-accent'
        },
        categoryDividers: 'elegant-gold-line',
        categoryTypography: 'display-serif'
      },
      about: {
        sections: ['hero-editorial', 'story-long', 'craftsmanship', 'heritage-timeline', 'cta-elegant']
      },
      contact: {
        layout: 'minimal',
        hasMap: true,
        hasForm: true,
        style: 'elegant',
        buttonStyle: 'gold-bordered'
      },
      gallery: {
        layout: 'editorial-slideshow',
        style: 'full-width',
        captions: true,
        captionStyle: 'elegant-serif'
      }
    },

    footer: {
      style: 'minimal-elegant',
      sections: ['logo', 'social', 'newsletter'],
      socialStyle: 'gold-icons',
      backgroundColor: '#1a365d',
      textColor: '#F5F3F0'
    },

    // Luxury-specific CSS to inject into generated frontends
    customCSS: `
      /* Luxury Theme Enhancements */
      .luxury h1, .luxury h2, .luxury h3 {
        font-family: 'Playfair Display', serif;
        letter-spacing: 0.08em;
        font-weight: 500;
      }

      .luxury-divider {
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, #D4AF37, transparent);
        margin: 40px auto;
      }

      .luxury .btn-primary {
        background: transparent;
        border: 1px solid #D4AF37;
        color: #D4AF37;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 16px 40px;
        font-size: 12px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .luxury .btn-primary:hover {
        background: #D4AF37;
        color: #fff;
      }

      .luxury img {
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .luxury img:hover {
        transform: scale(1.02);
      }

      .luxury-hero-overlay {
        background: linear-gradient(180deg, rgba(26,54,93,0.3) 0%, rgba(26,54,93,0.6) 100%);
        backdrop-filter: blur(2px);
      }

      .luxury-section {
        padding: 120px 24px;
      }

      .luxury-gold-text {
        color: #D4AF37;
      }

      .luxury-gold-border {
        border: 1px solid #D4AF37;
      }
    `
  },

  // ============================================
  // ARCHETYPE C: Local / Community-Focused
  // ============================================
  'local': {
    id: 'local',
    name: 'Local / Community-Focused',
    description: 'Warm, welcoming, emphasizes location/hours. Best for neighborhood businesses.',
    bestFor: ['neighborhood', 'local', 'family-owned', 'walk-in focused', 'community'],
    realExamples: ["Porto's", "Cristy's Cake Shop"],

    style: {
      vibe: 'warm, welcoming, authentic',
      colors: {
        primary: '#8B4513',      // Warm brown
        secondary: '#D2691E',    // Chocolate
        accent: '#F4A460',       // Sandy brown / terracotta
        background: '#FFFAF5',   // Warm white
        backgroundAlt: '#FFF8F0', // Light cream
        text: '#3E2723',         // Dark brown
        textMuted: '#6D4C41'
      },
      typography: {
        headingFont: "'Lora', 'Nunito', serif",
        bodyFont: "'Open Sans', 'Roboto', sans-serif",
        headingWeight: '600',
        headingStyle: 'normal',
        letterSpacing: '0'
      },
      borderRadius: '12px',
      shadows: true,
      animations: 'gentle'
    },

    header: {
      layout: 'logo-left-nav-center',
      hasAnnouncementBar: false,
      elements: ['phone-prominent'],
      navStyle: 'simple',
      navItems: ['Home', 'Menu', 'About', 'Gallery', 'Contact', 'Catering'],
      ctaButton: { text: 'Order Pickup', style: 'warm' },
      showPhone: true
    },

    pages: {
      home: {
        sections: [
          {
            type: 'hero',
            layout: 'fullwidth-image',
            height: '80vh',
            content: {
              imageStyle: 'storefront-or-interior',
              textPosition: 'left',
              headline: 'Welcome to {BUSINESS_NAME}',
              tagline: 'Your neighborhood bakery since {YEAR}',
              showAddress: true,
              ctas: [
                { text: 'View Menu', style: 'primary' },
                { text: 'Get Directions', style: 'secondary' }
              ]
            }
          },
          {
            type: 'why-choose-us',
            layout: 'grid-3',
            style: 'icon-cards',
            items: [
              { icon: 'Award', title: 'Quality Ingredients', description: 'Only the finest, locally-sourced ingredients' },
              { icon: 'Clock', title: 'Baked Fresh Daily', description: 'Everything made from scratch each morning' },
              { icon: 'Heart', title: 'Family Recipes', description: 'Passed down through generations' }
            ]
          },
          {
            type: 'specials',
            layout: 'featured-row',
            title: "Today's Specials",
            count: 3
          },
          {
            type: 'about-snippet',
            layout: 'split',
            content: {
              imageStyle: 'owner-photo',
              storyLength: 'brief',
              cta: 'Meet the Team'
            }
          },
          {
            type: 'location-hours',
            layout: 'map-with-info',
            showMap: true,
            showHours: true,
            showPhone: true,
            showAddress: true
          },
          {
            type: 'reviews',
            layout: 'carousel',
            count: 3,
            showStars: true
          }
        ]
      },
      menu: {
        layout: 'category-list',
        hasFilters: true,
        filterStyle: 'tabs',
        productDisplay: 'list-with-prices',
        priceAlignment: 'right',
        showDescriptions: true,
        categoryHeaders: {
          style: 'with-icon',
          decorative: true
        },
        dietaryLabels: ['GF', 'V', 'DF'],
        showSpecialsCallout: true
      },
      about: {
        sections: ['hero', 'story', 'values-3col', 'owner-feature', 'community', 'cta']
      },
      contact: {
        layout: 'two-column',
        hasMap: true,
        hasForm: true,
        prominent: ['phone', 'address', 'hours']
      },
      gallery: {
        layout: 'simple-grid',
        columns: 3,
        style: 'warm-authentic',
        categories: ['Products', 'Interior', 'Team', 'Community']
      }
    },

    footer: {
      style: 'full-warm',
      sections: ['contact-info', 'hours', 'social', 'tagline'],
      tagline: 'Proudly serving {CITY} since {YEAR}'
    }
  }
};

// ============================================
// AUTO-DETECTION LOGIC
// ============================================

/**
 * Detect the best archetype based on business data
 */
function detectArchetype(businessData) {
  const name = (businessData.name || '').toLowerCase();
  const description = (businessData.description || '').toLowerCase();
  const features = businessData.features || {};
  const tags = (businessData.tags || []).map(t => t.toLowerCase());
  const combined = `${name} ${description} ${tags.join(' ')}`;

  // Score each archetype
  const scores = {
    ecommerce: 0,
    luxury: 0,
    local: 0
  };

  // E-Commerce signals
  const ecommerceKeywords = ['order online', 'shipping', 'nationwide', 'delivery', 'gift', 'shop now', 'cart', 'checkout'];
  ecommerceKeywords.forEach(kw => {
    if (combined.includes(kw)) scores.ecommerce += 2;
  });
  if (features.onlineOrdering) scores.ecommerce += 3;
  if (features.shipping) scores.ecommerce += 3;
  if (features.giftCards) scores.ecommerce += 2;

  // Luxury signals
  const luxuryKeywords = ['artisan', 'boutique', 'patisserie', 'specialty', 'handcrafted', 'premium', 'luxury', 'elegant', 'fine', 'gourmet', 'exclusive'];
  luxuryKeywords.forEach(kw => {
    if (combined.includes(kw)) scores.luxury += 2;
  });

  // Local signals
  const localKeywords = ['neighborhood', 'local', 'family', 'community', 'since 19', 'since 20', 'hometown', 'friendly', 'cozy', 'welcoming'];
  localKeywords.forEach(kw => {
    if (combined.includes(kw)) scores.local += 2;
  });
  if (!features.onlineOrdering && !features.shipping) scores.local += 2;

  // Find highest score
  const maxScore = Math.max(scores.ecommerce, scores.luxury, scores.local);

  // Default to 'local' for neighborhood businesses (most common case)
  if (maxScore === 0) return 'local';

  if (scores.ecommerce === maxScore) return 'ecommerce';
  if (scores.luxury === maxScore) return 'luxury';
  return 'local';
}

/**
 * Get archetype config by ID
 */
function getArchetype(id) {
  return LAYOUT_ARCHETYPES[id] || LAYOUT_ARCHETYPES.local;
}

/**
 * Get all archetypes
 */
function getAllArchetypes() {
  return Object.values(LAYOUT_ARCHETYPES);
}

/**
 * Get archetype style variables for CSS
 */
function getArchetypeStyles(archetypeId) {
  const archetype = getArchetype(archetypeId);
  const { colors, typography, borderRadius } = archetype.style;

  return {
    // Colors
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-background': colors.background,
    '--color-background-alt': colors.backgroundAlt,
    '--color-text': colors.text,
    '--color-text-muted': colors.textMuted,

    // Typography
    '--font-heading': typography.headingFont,
    '--font-body': typography.bodyFont,
    '--font-weight-heading': typography.headingWeight,
    '--heading-style': typography.headingStyle,
    '--letter-spacing': typography.letterSpacing,

    // Other
    '--border-radius': borderRadius
  };
}

// ============================================
// INDUSTRY MAPPING
// ============================================

/**
 * Industries that can use these archetypes
 */
const ARTISAN_FOOD_INDUSTRIES = [
  'bakery',
  'cake-shop',
  'patisserie',
  'coffee-cafe',
  'cafe',
  'coffee-shop',
  'ice-cream',
  'gelato',
  'chocolatier',
  'confectionery',
  'specialty-food',
  'deli',
  'sandwich-shop',
  'pizza-restaurant',
  'pizzeria',
  'juice-bar',
  'smoothie-shop'
];

/**
 * Check if an industry should use artisan food archetypes
 */
function isArtisanFoodIndustry(industry) {
  const normalized = (industry || '').toLowerCase().replace(/[^a-z]/g, '-');
  return ARTISAN_FOOD_INDUSTRIES.some(ind => normalized.includes(ind) || ind.includes(normalized));
}

// ============================================
// HOME SERVICES ARCHETYPES
// For: Plumbers, Electricians, HVAC, Roofers, Contractors,
// Landscapers, Cleaning, Pest Control, Handyman, etc.
// ============================================

const HOME_SERVICES_ARCHETYPES = {
  // ============================================
  // ARCHETYPE: Emergency/Urgent
  // Best for: Plumbers, HVAC, Locksmiths - 24/7 services
  // ============================================
  'emergency': {
    id: 'emergency',
    name: 'Emergency Response',
    description: 'Urgent, action-focused with prominent contact. Best for 24/7 emergency services.',
    bestFor: ['plumber', 'hvac', 'locksmith', 'water damage', 'emergency repair'],
    realExamples: ['Roto-Rooter', 'Mr. Rooter', 'One Hour Heating'],

    style: {
      vibe: 'urgent, trustworthy, action-focused',
      colors: {
        primary: '#DC2626',      // Urgent red
        secondary: '#1E40AF',    // Trust blue
        accent: '#F59E0B',       // Warning yellow
        background: '#ffffff',
        backgroundAlt: '#F8FAFC',
        text: '#1e293b',
        textMuted: '#64748b'
      },
      typography: {
        headingFont: "'Inter', 'Roboto', sans-serif",
        bodyFont: "'Inter', system-ui, sans-serif",
        headingWeight: '800',
        headingStyle: 'uppercase',
        letterSpacing: '0.01em'
      },
      borderRadius: '8px',
      shadows: true,
      animations: 'snappy'
    }
  },

  // ============================================
  // ARCHETYPE: Professional/Corporate
  // Best for: Contractors, Commercial services, Established companies
  // ============================================
  'professional': {
    id: 'professional',
    name: 'Professional Trust',
    description: 'Clean, corporate with credentials focus. Best for commercial and established businesses.',
    bestFor: ['contractor', 'construction', 'commercial', 'roofing', 'electrical'],
    realExamples: ['ServiceMaster', 'Stanley Steemer', 'Terminix'],

    style: {
      vibe: 'professional, trustworthy, established',
      colors: {
        primary: '#1E40AF',      // Professional blue
        secondary: '#047857',    // Success green
        accent: '#D97706',       // Accent orange
        background: '#ffffff',
        backgroundAlt: '#F1F5F9',
        text: '#1e293b',
        textMuted: '#64748b'
      },
      typography: {
        headingFont: "'Inter', 'Roboto', sans-serif",
        bodyFont: "'Inter', system-ui, sans-serif",
        headingWeight: '700',
        headingStyle: 'none',
        letterSpacing: '0'
      },
      borderRadius: '12px',
      shadows: true,
      animations: 'smooth'
    }
  },

  // ============================================
  // ARCHETYPE: Neighborhood/Local
  // Best for: Landscaping, Cleaning, Handyman - family-owned
  // ============================================
  'neighborhood': {
    id: 'neighborhood',
    name: 'Neighborhood Friendly',
    description: 'Warm, community-focused, family-owned feel. Best for residential local services.',
    bestFor: ['landscaping', 'cleaning', 'handyman', 'painting', 'pool'],
    realExamples: ['Local family businesses', 'Neighborhood services'],

    style: {
      vibe: 'friendly, local, trustworthy',
      colors: {
        primary: '#059669',      // Friendly green
        secondary: '#0284C7',    // Sky blue
        accent: '#EA580C',       // Warm orange
        background: '#ffffff',
        backgroundAlt: '#F0FDF4',
        text: '#1e293b',
        textMuted: '#64748b'
      },
      typography: {
        headingFont: "'DM Sans', 'Inter', sans-serif",
        bodyFont: "'Inter', system-ui, sans-serif",
        headingWeight: '700',
        headingStyle: 'none',
        letterSpacing: '0'
      },
      borderRadius: '16px',
      shadows: true,
      animations: 'gentle'
    }
  }
};

// Industries that should use home services archetypes
const HOME_SERVICES_INDUSTRIES = [
  'plumber',
  'plumbing',
  'electrician',
  'electrical',
  'hvac',
  'heating',
  'cooling',
  'air-conditioning',
  'roofing',
  'roofer',
  'contractor',
  'construction',
  'remodeling',
  'renovation',
  'landscaping',
  'landscaper',
  'lawn',
  'lawn-care',
  'cleaning',
  'cleaning-service',
  'maid',
  'house-cleaning',
  'pest-control',
  'exterminator',
  'moving',
  'movers',
  'handyman',
  'home-repair',
  'painter',
  'painting',
  'pool',
  'pool-service',
  'garage-door',
  'locksmith',
  'window',
  'gutter',
  'pressure-washing',
  'carpet-cleaning',
  'appliance-repair',
  'fence',
  'concrete',
  'flooring',
  'tree-service',
  'septic',
  'drain'
];

/**
 * Check if an industry should use home services archetypes
 */
function isHomeServicesIndustry(industry) {
  const normalized = (industry || '').toLowerCase().replace(/[^a-z]/g, '-');
  return HOME_SERVICES_INDUSTRIES.some(ind => normalized.includes(ind) || ind.includes(normalized));
}

/**
 * Detect best archetype for home services based on business data
 */
function detectHomeServicesArchetype(businessData = {}) {
  const industry = (businessData.industry || '').toLowerCase();
  const name = (businessData.name || '').toLowerCase();
  const description = (businessData.description || '').toLowerCase();
  const combined = `${industry} ${name} ${description}`;

  // Emergency services indicators
  if (combined.includes('emergency') || combined.includes('24/7') || combined.includes('24-hour') ||
      combined.includes('plumb') || combined.includes('hvac') || combined.includes('locksmith') ||
      combined.includes('water damage') || combined.includes('flood') || combined.includes('drain')) {
    return HOME_SERVICES_ARCHETYPES['emergency'];
  }

  // Professional/commercial indicators
  if (combined.includes('commercial') || combined.includes('contractor') || combined.includes('construction') ||
      combined.includes('roofing') || combined.includes('industrial') || combined.includes('llc') ||
      combined.includes('inc') || combined.includes('corp')) {
    return HOME_SERVICES_ARCHETYPES['professional'];
  }

  // Default to neighborhood for residential services
  return HOME_SERVICES_ARCHETYPES['neighborhood'];
}

/**
 * Get home services archetype by ID
 */
function getHomeServicesArchetype(id) {
  return HOME_SERVICES_ARCHETYPES[id] || HOME_SERVICES_ARCHETYPES['neighborhood'];
}

module.exports = {
  LAYOUT_ARCHETYPES,
  detectArchetype,
  getArchetype,
  getAllArchetypes,
  getArchetypeStyles,
  ARTISAN_FOOD_INDUSTRIES,
  isArtisanFoodIndustry,
  // Home Services exports
  HOME_SERVICES_ARCHETYPES,
  HOME_SERVICES_INDUSTRIES,
  isHomeServicesIndustry,
  detectHomeServicesArchetype,
  getHomeServicesArchetype
};
