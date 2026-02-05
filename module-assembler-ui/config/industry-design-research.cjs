/**
 * Industry Design Research Configuration
 *
 * Converts research from industry-website-design-references.md into
 * structured configs that drive STRUCTURAL layout differences.
 *
 * Each industry has 3 layout variants (A, B, C) with:
 * - Different hero types (video, story-split, gallery, etc.)
 * - Different section orders
 * - Different section types
 * - Different features/emphasis
 *
 * This is NOT just color/font changes - these are fundamentally
 * different page structures.
 */

// ============================================
// HERO TYPES - Determines which hero component is used
// ============================================
const HERO_TYPES = {
  'video': 'VideoHero',
  'story-split': 'StorySplitHero',
  'gallery-fullbleed': 'GalleryHero',
  'minimal-text': 'MinimalHero',
  'dark-luxury': 'DarkLuxuryHero',
  'split-animated': 'SplitAnimatedHero',
  'image-overlay': 'ImageOverlayHero',
  'centered-cta': 'CenteredCtaHero'
};

// ============================================
// MENU STYLES - Determines which menu page style is used
// ============================================
const MENU_STYLES = {
  'photo-grid': {
    name: 'Photo Grid',
    layout: 'grid',
    description: 'Order-focused modern grid with photo cards',
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    imageSize: '250px',
    features: ['floating-cart-pill', 'quick-add-on-tap', 'category-hero-images'],
    typography: 'modern-sans',
    bestFor: ['pizza-restaurant', 'bakery', 'coffee-cafe', 'restaurant']
  },
  'elegant-list': {
    name: 'Elegant List',
    layout: 'list',
    description: 'Fine dining text-focused with luxurious spacing',
    maxWidth: '700px',
    imageSize: '50px', // Small thumbnails optional
    features: ['dotted-leader-lines', 'ornamental-dividers', 'luxurious-spacing'],
    typography: 'elegant-serif',
    fonts: ['Playfair Display', 'Cormorant'],
    bestFor: ['steakhouse', 'restaurant']
  },
  'compact-table': {
    name: 'Compact Table',
    layout: 'table',
    description: 'Efficient dense layout for large menus',
    imageSize: '40px', // Small thumbnails
    features: ['accordion-categories', 'inline-filters', 'sortable-columns', 'alternating-rows'],
    typography: 'efficient-sans',
    bestFor: ['restaurant', 'coffee-cafe'] // Delis, diners, large menus
  },
  'storytelling-cards': {
    name: 'Storytelling Cards',
    layout: 'cards',
    description: 'Experience-focused large feature cards',
    imageHeight: '400px',
    cardHeight: '500px+',
    features: ['chef-notes', 'origin-stories', 'horizontal-category-preview', 'pairs-with-suggestions'],
    typography: 'editorial-magazine',
    bestFor: ['coffee-cafe', 'bakery', 'restaurant'] // Farm-to-table, craft, artisan
  }
};

// ============================================
// INDUSTRY → MENU STYLE MAPPING
// Maps each industry's A/B/C layout variant to a menu style
// ============================================
const INDUSTRY_MENU_STYLES = {
  'pizza-restaurant': { A: 'photo-grid', B: 'storytelling-cards', C: 'photo-grid' },
  'coffee-cafe': { A: 'photo-grid', B: 'storytelling-cards', C: 'photo-grid' },
  'restaurant': { A: 'elegant-list', B: 'storytelling-cards', C: 'elegant-list' },
  'steakhouse': { A: 'elegant-list', B: 'elegant-list', C: 'compact-table' },
  'bakery': { A: 'photo-grid', B: 'storytelling-cards', C: 'photo-grid' },
  'salon-spa': { A: 'photo-grid', B: 'compact-table', C: 'elegant-list' },
  'fitness-gym': { A: 'photo-grid', B: 'compact-table', C: 'photo-grid' },
  'dental': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
  'healthcare': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
  'yoga': { A: 'storytelling-cards', B: 'photo-grid', C: 'compact-table' },
  'barbershop': { A: 'photo-grid', B: 'elegant-list', C: 'compact-table' },
  'law-firm': { A: 'elegant-list', B: 'compact-table', C: 'elegant-list' },
  'real-estate': { A: 'photo-grid', B: 'storytelling-cards', C: 'compact-table' },
  'plumber': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
  'cleaning': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
  'auto-shop': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
  'saas': { A: 'photo-grid', B: 'compact-table', C: 'storytelling-cards' },
  'ecommerce': { A: 'photo-grid', B: 'storytelling-cards', C: 'photo-grid' },
  'school': { A: 'compact-table', B: 'photo-grid', C: 'storytelling-cards' }
};

// ============================================
// SECTION TYPES - Available section components
// ============================================
const SECTION_TYPES = {
  // Menu/Products
  'menu-scroll-reveal': 'MenuScrollReveal',
  'menu-visual-cards': 'MenuVisualCards',
  'menu-integrated-ordering': 'MenuIntegratedOrdering',
  'menu-tabs': 'MenuTabs',
  'menu-categories': 'MenuCategories',

  // Story/About
  'origin-timeline': 'OriginTimeline',
  'origin-story': 'OriginStory',
  'about-chef': 'AboutChef',
  'about-team-grid': 'AboutTeamGrid',
  'about-values': 'AboutValues',
  'philosophy-section': 'PhilosophySection',

  // Visual/Gallery
  'gallery-hover-zoom': 'GalleryHoverZoom',
  'gallery-masonry': 'GalleryMasonry',
  'gallery-carousel': 'GalleryCarousel',
  'before-after-slider': 'BeforeAfterSlider',
  'instagram-feed': 'InstagramFeed',
  'video-showcase': 'VideoShowcase',

  // Location/Contact
  'locations-map': 'LocationsMap',
  'locations-showcase': 'LocationsShowcase',
  'multi-location-cards': 'MultiLocationCards',
  'contact-split': 'ContactSplit',
  'contact-minimal': 'ContactMinimal',

  // Trust/Social Proof
  'reviews-carousel': 'ReviewsCarousel',
  'reviews-grid': 'ReviewsGrid',
  'testimonials-featured': 'TestimonialsFeatured',
  'press-mentions': 'PressMentions',
  'awards-badges': 'AwardsBadges',
  'trust-strip': 'TrustStrip',

  // CTA/Conversion
  'cta-order-online': 'CtaOrderOnline',
  'cta-book-appointment': 'CtaBookAppointment',
  'cta-contact-form': 'CtaContactForm',
  'cta-newsletter': 'CtaNewsletter',

  // Ecommerce
  'merchandise-shop': 'MerchandiseShop',
  'gift-cards-prominent': 'GiftCardsProminent',
  'product-grid': 'ProductGrid',

  // Services
  'services-grid': 'ServicesGrid',
  'services-list-pricing': 'ServicesListPricing',
  'services-bento': 'ServicesBento',
  'services-tabs': 'ServicesTabs',

  // Booking
  'booking-widget': 'BookingWidget',
  'class-schedule': 'ClassSchedule',
  'appointment-calendar': 'AppointmentCalendar',

  // Special
  'wine-pairing': 'WinePairing',
  'private-events': 'PrivateEvents',
  'catering-info': 'CateringInfo',
  'membership-teaser': 'MembershipTeaser',
  'pricing-tiers': 'PricingTiers',
  'faq-accordion': 'FaqAccordion',
  'stats-animated': 'StatsAnimated',
  'features-grid': 'FeaturesGrid',

  // Research-backed Homepage Sections
  'highlights-strip': 'HighlightsStrip',      // Quick action tiles (Order, Find Us, Gift Cards)
  'social-proof-strip': 'SocialProofStrip',   // Trust badges above fold
  'coffee-program': 'CoffeeProgramSection',   // Bean sourcing/roasting story
  'seasonal-featured': 'SeasonalFeatured',    // Limited time offers/urgency

  // Salon-Spa Specific Sections
  'salon-spa-program': 'SalonSpaProgram',     // Philosophy / how we approach beauty
  'new-client-guide': 'NewClientGuide',       // First visit guide (reduces anxiety)
  'membership-comparison': 'MembershipComparison', // Plan comparison grid
  'transformation-stories': 'TransformationStories', // Before/after + testimonials

  // Fitness-Gym Specific Sections
  'fitness-program': 'FitnessProgram',        // Training philosophy / methodology
  'class-schedule-preview': 'ClassSchedulePreview', // Upcoming classes teaser
  'free-trial-cta': 'FreeTrialCta',           // Prominent trial signup
  'trainer-spotlight': 'TrainerSpotlight'     // Featured trainer profiles
};

// ============================================
// INDUSTRY DESIGN RESEARCH CONFIGS
// ============================================

const INDUSTRY_DESIGN_RESEARCH = {
  // ═══════════════════════════════════════════
  // 1. PIZZA / PIZZERIA
  // ═══════════════════════════════════════════
  'pizza-restaurant': {
    name: 'Pizza / Pizzeria',
    styleNote: 'Friendly, Appetizing Visual',
    layoutVariants: {
      A: {
        name: 'Video-First',
        reference: 'Pasquale Jones style',
        description: 'Dynamic video creates immediate appetite appeal. Full-screen video hero with kitchen action.',
        heroType: 'video',
        heroConfig: {
          autoplay: true,
          content: 'kitchen-action',
          overlay: 'gradient-bottom',
          textPosition: 'center'
        },
        sections: [
          { type: 'menu-scroll-reveal', config: { animated: true, revealOnScroll: true } },
          { type: 'services-grid', config: { columns: 3, showIcons: true } },
          { type: 'gallery-hover-zoom', config: { columns: 3 } },
          { type: 'reviews-carousel', config: { autoplay: true } },
          { type: 'about-team-grid', config: { showBio: true } },
          { type: 'stats-bar', config: { animated: true } },
          { type: 'locations-map', config: { showHours: true } },
          { type: 'faq-accordion', config: { expandFirst: true } },
          { type: 'cta-order-online', config: { prominent: true } }
        ],
        features: ['animated-menu', 'video-background', 'scroll-animations'],
        mood: 'dynamic-energetic'
      },
      B: {
        name: 'Storytelling',
        reference: 'Serafina style',
        description: 'Blends emotion with revenue-driving features. Origin story prominently featured.',
        heroType: 'story-split',
        heroConfig: {
          narrative: 'origin',
          imagePosition: 'right',
          overlayText: true
        },
        sections: [
          { type: 'origin-timeline', config: { style: 'visual' } },
          { type: 'locations-showcase', config: { multiLocation: true } },
          { type: 'menu-integrated-ordering', config: { showPrices: true } },
          { type: 'gift-cards-prominent', config: { featured: true } },
          { type: 'cta-order-online', config: {} }
        ],
        features: ['origin-story', 'multi-location', 'gift-cards', 'integrated-ordering'],
        mood: 'emotional-storytelling'
      },
      C: {
        name: 'Photography-Heavy',
        reference: 'Rubirosa style',
        description: 'Brand loyalty extends beyond food to lifestyle. Beautiful pizza photography throughout.',
        heroType: 'gallery-fullbleed',
        heroConfig: {
          parallax: true,
          slideshow: true,
          transitionStyle: 'fade'
        },
        sections: [
          { type: 'gallery-hover-zoom', config: { columns: 3 } },
          { type: 'menu-visual-cards', config: { showImages: true } },
          { type: 'merchandise-shop', config: { featured: true } },
          { type: 'reviews-grid', config: { showPhotos: true } },
          { type: 'instagram-feed', config: { columns: 4 } }
        ],
        features: ['merchandise-shop', 'instagram-integration', 'photo-gallery'],
        mood: 'visual-lifestyle'
      }
    },
    winningElements: [
      'online-ordering',
      'loyalty-program',
      'location-hours',
      'menu-pricing',
      'mobile-optimized',
      'mouthwatering-photography'
    ],
    colorGuidance: {
      warm: ['#DC2626', '#F59E0B', '#78350F'],
      accent: ['#FCD34D', '#FBBF24']
    }
  },

  // ═══════════════════════════════════════════
  // 2. STEAKHOUSE / FINE DINING
  // ═══════════════════════════════════════════
  'steakhouse': {
    name: 'Steakhouse / Fine Dining',
    styleNote: 'Luxury, Sophisticated',
    layoutVariants: {
      A: {
        name: 'Dark & Luxurious',
        reference: 'Eleven Madison Park style',
        description: 'Digital sophistication matches culinary excellence. Minimalistic, elegant design.',
        heroType: 'dark-luxury',
        heroConfig: {
          background: 'dark',
          imagery: 'steak-hero',
          goldAccents: true,
          subtleAnimations: true
        },
        sections: [
          { type: 'wine-pairing', config: { elegant: true } },
          { type: 'menu-visual-cards', config: { luxuryStyle: true } },
          { type: 'about-chef', config: { credentials: true } },
          { type: 'private-events', config: { featured: true } },
          { type: 'reviews-carousel', config: { quotes: true } }
        ],
        features: ['wine-list', 'private-dining', 'reservation-system', 'dark-theme'],
        mood: 'dark-luxurious'
      },
      B: {
        name: 'Modern Minimalist',
        reference: 'Smith & Wollensky style',
        description: 'Builds credibility with awards and reviews. Clean white spaces, high-contrast imagery.',
        heroType: 'minimal-text',
        heroConfig: {
          contrast: 'high',
          typography: 'elegant',
          whitespace: 'generous'
        },
        sections: [
          { type: 'awards-badges', config: { prominent: true } },
          { type: 'press-mentions', config: { logos: true } },
          { type: 'menu-preview-cards', config: { clean: true } },
          { type: 'testimonials-featured', config: { vip: true } },
          { type: 'cta-book-appointment', config: { reservations: true } }
        ],
        features: ['awards-display', 'press-section', 'simple-reservations'],
        mood: 'modern-minimalist'
      },
      C: {
        name: 'Bold & Energetic',
        reference: 'Loro Asian Steakhouse style',
        description: 'Modern approach to traditional steakhouse. Vibrant colors, dynamic illustrations.',
        heroType: 'split-animated',
        heroConfig: {
          animations: 'dynamic',
          typography: 'unique',
          personality: true
        },
        sections: [
          { type: 'menu-visual-cards', config: { bold: true } },
          { type: 'about-values', config: { personality: true } },
          { type: 'gallery-carousel', config: { vibrant: true } },
          { type: 'instagram-feed', config: { columns: 4 } },
          { type: 'cta-order-online', config: {} }
        ],
        features: ['unique-typography', 'animations', 'social-integration'],
        mood: 'bold-energetic'
      }
    },
    winningElements: [
      'reservation-system',
      'wine-list',
      'awards-press',
      'private-dining',
      'dress-code-info',
      'valet-parking'
    ],
    colorGuidance: {
      dark: ['#1A1A1A', '#2D2D2D', '#1E1E1E'],
      accent: ['#D4A574', '#C9A962', '#B8860B']
    }
  },

  // ═══════════════════════════════════════════
  // 3. COFFEE SHOP / CAFE
  // ═══════════════════════════════════════════
  'coffee-cafe': {
    name: 'Coffee Shop / Cafe',
    styleNote: 'Friendly, Cozy, Inviting',
    layoutVariants: {
      A: {
        name: 'Warm & Cozy',
        reference: 'Cafecito / Trailhead style',
        description: 'Balance of beauty and functionality. Soothing color palette with excellent food photography.',
        heroType: 'image-overlay',
        heroConfig: {
          warmth: true,
          steamEffect: true,
          cozyVibes: true
        },
        sections: [
          { type: 'highlights-strip', config: {} },            // Quick actions below hero
          { type: 'social-proof-strip', config: {} },          // Trust signals
          { type: 'seasonal-featured', config: {} },           // Limited time offers
          { type: 'menu-preview-cards', config: { maxItems: 4 } },
          { type: 'coffee-program', config: {} },              // Our coffee story
          { type: 'gallery-masonry', config: { cozy: true } },
          { type: 'reviews-carousel', config: {} },
          { type: 'locations-map', config: { showHours: true } }
        ],
        features: ['community-events', 'local-artist-features', 'cozy-atmosphere'],
        mood: 'warm-cozy'
      },
      B: {
        name: 'Modern Minimal',
        reference: 'Blue Bottle style',
        description: 'Educates while selling. Minimalist design with coffee origin stories.',
        heroType: 'centered-cta',
        heroConfig: {
          clean: true,
          productFocus: true,
          whitespace: 'generous',
          minimalOverlay: true
        },
        sections: [
          { type: 'social-proof-strip', config: {} },          // Trust signals
          { type: 'coffee-program', config: {} },              // Origin story emphasis
          { type: 'seasonal-featured', config: {} },           // Limited time
          { type: 'menu-preview-cards', config: { maxItems: 4 } },
          { type: 'product-grid', config: { subscription: true } },
          { type: 'philosophy-section', config: { brewing: true } },
          { type: 'cta-newsletter', config: { subscription: true } }
        ],
        features: ['subscription-model', 'brewing-guides', 'coffee-education'],
        mood: 'modern-minimal'
      },
      C: {
        name: 'Urban Industrial',
        reference: 'Intelligentsia style',
        description: 'Premium positioning through education. Bold imagery, direct trade emphasis.',
        heroType: 'video',
        heroConfig: {
          industrial: true,
          urbanVibes: true,
          brickTextures: true
        },
        sections: [
          { type: 'highlights-strip', config: {} },            // Quick actions
          { type: 'social-proof-strip', config: {} },          // Trust signals
          { type: 'coffee-program', config: { directTrade: true } }, // Origin focus
          { type: 'menu-preview-cards', config: { maxItems: 4 } },
          { type: 'seasonal-featured', config: {} },           // Limited time
          { type: 'locations-showcase', config: { multiple: true } },
          { type: 'instagram-feed', config: { hip: true } },
          { type: 'merchandise-shop', config: { equipment: true } }
        ],
        features: ['training-education', 'multiple-locations', 'instagram-integration'],
        mood: 'urban-industrial'
      }
    },
    winningElements: [
      'mobile-ordering',
      'loyalty-program',
      'seasonal-drinks',
      'wifi-messaging',
      'hours-prominent',
      'merchandise-shop'
    ],
    colorGuidance: {
      warm: ['#78350F', '#92400E', '#B45309'],
      neutral: ['#F5F5F4', '#E7E5E4', '#D6D3D1']
    }
  },

  // ═══════════════════════════════════════════
  // 4. RESTAURANT / FARM-TO-TABLE
  // ═══════════════════════════════════════════
  'restaurant': {
    name: 'Restaurant / Farm-to-Table',
    styleNote: 'Natural, Fresh, Authentic',
    layoutVariants: {
      A: {
        name: 'Farm Story',
        reference: 'Farmacy style',
        description: 'Visual storytelling connects food to source. Farm-to-dining room photo journey.',
        heroType: 'gallery-fullbleed',
        heroConfig: {
          farmImagery: true,
          naturalColors: true,
          seasonal: true
        },
        sections: [
          { type: 'origin-timeline', config: { farmPartners: true } },
          { type: 'menu-visual-cards', config: { seasonal: true } },
          { type: 'about-values', config: { sourcing: true } },
          { type: 'gallery-masonry', config: { farm: true } },
          { type: 'cta-book-appointment', config: { reservations: true } }
        ],
        features: ['producer-profiles', 'seasonal-calendar', 'sourcing-transparency'],
        mood: 'farm-authentic'
      },
      B: {
        name: 'Chef-Driven',
        reference: "Roman's Brooklyn style",
        description: 'Authenticity through design restraint. Italian-influenced, local producers highlighted.',
        heroType: 'minimal-text',
        heroConfig: {
          chefFocus: true,
          unpretentious: true,
          subtle: true
        },
        sections: [
          { type: 'about-chef', config: { philosophy: true } },
          { type: 'menu-preview-cards', config: { techniques: true } },
          { type: 'wine-pairing', config: { notes: true } },
          { type: 'gallery-carousel', config: { kitchen: true } },
          { type: 'press-mentions', config: {} }
        ],
        features: ['chef-bio', 'technique-highlights', 'wine-pairing'],
        mood: 'chef-driven'
      },
      C: {
        name: 'Community Focus',
        reference: 'The Original Denver style',
        description: 'Playful while professional. Quirky illustrations, neighborhood eatery vibe.',
        heroType: 'split-animated',
        heroConfig: {
          illustrations: true,
          playful: true,
          neighborhood: true
        },
        sections: [
          { type: 'about-values', config: { community: true } },
          { type: 'menu-visual-cards', config: { quirky: true } },
          { type: 'private-events', config: {} },
          { type: 'gallery-masonry', config: { neighborhood: true } },
          { type: 'reviews-grid', config: { local: true } }
        ],
        features: ['local-partnerships', 'events-calendar', 'private-dining'],
        mood: 'community-playful'
      }
    },
    winningElements: [
      'seasonal-menu',
      'local-sourcing',
      'chef-personality',
      'sustainability',
      'private-events',
      'community-involvement'
    ],
    colorGuidance: {
      natural: ['#365314', '#3F6212', '#4D7C0F'],
      earth: ['#78716C', '#57534E', '#44403C']
    }
  },

  // ═══════════════════════════════════════════
  // 5. BAKERY
  // ═══════════════════════════════════════════
  'bakery': {
    name: 'Bakery',
    styleNote: 'Warm, Artisan, Inviting',
    layoutVariants: {
      A: {
        name: 'Minimalist Artisan',
        reference: 'Lost Larson style',
        description: 'Old-world meets modern with illustrated charm. Clean white backgrounds, illustrated accents.',
        heroType: 'minimal-text',
        heroConfig: {
          illustrations: true,
          clean: true,
          artisan: true
        },
        sections: [
          { type: 'menu-visual-cards', config: { productFocus: true } },
          { type: 'about-values', config: { traditional: true } },
          { type: 'gallery-hover-zoom', config: { closeup: true } },
          { type: 'locations-showcase', config: {} },
          { type: 'cta-order-online', config: {} }
        ],
        features: ['illustrated-accents', 'traditional-methods', 'product-focus'],
        mood: 'minimalist-artisan'
      },
      B: {
        name: 'Rustic Community',
        reference: 'Little Tart Bakeshop style',
        description: 'Authentic growth story builds trust. Farmers market aesthetic, community-focused.',
        heroType: 'image-overlay',
        heroConfig: {
          rustic: true,
          farmersMarket: true,
          warmTones: true
        },
        sections: [
          { type: 'origin-timeline', config: { growth: true } },
          { type: 'about-team-grid', config: { community: true } },
          { type: 'menu-preview-cards', config: { maxItems: 4 } },
          { type: 'gallery-masonry', config: { behindScenes: true } },
          { type: 'reviews-carousel', config: { local: true } }
        ],
        features: ['behind-scenes', 'community-focus', 'local-ingredients'],
        mood: 'rustic-community'
      },
      C: {
        name: 'Warm & Inviting',
        reference: 'Fox in the Snow style',
        description: 'Photography creates immediate appetite appeal. High-resolution warm photography.',
        heroType: 'gallery-fullbleed',
        heroConfig: {
          warmPhotography: true,
          cozy: true,
          multiLocation: true
        },
        sections: [
          { type: 'gallery-carousel', config: { highRes: true } },
          { type: 'menu-visual-cards', config: { warm: true } },
          { type: 'gift-cards-prominent', config: { multiLocation: true } },
          { type: 'locations-showcase', config: { cozy: true } },
          { type: 'instagram-feed', config: {} }
        ],
        features: ['gift-cards', 'multi-location', 'coffee-integration'],
        mood: 'warm-inviting'
      }
    },
    winningElements: [
      'product-photography',
      'online-ordering',
      'custom-cake-forms',
      'pickup-scheduling',
      'catering-menu',
      'gift-cards',
      'instagram-integration'
    ],
    colorGuidance: {
      warm: ['#D97706', '#B45309', '#92400E'],
      cream: ['#FFFBEB', '#FEF3C7', '#FDE68A']
    }
  },

  // ═══════════════════════════════════════════
  // 6. SALON / SPA
  // ═══════════════════════════════════════════
  'salon-spa': {
    name: 'Salon / Spa',
    styleNote: 'Luxury, Serene, Peaceful',
    layoutVariants: {
      A: {
        name: 'Luxe & Serene',
        reference: 'The Refuge Spa / luxury med-spa style',
        description: 'Calm, premium sanctuary feel. Full-bleed hero with soft overlays, generous white space.',
        heroType: 'dark-luxury',
        heroConfig: {
          softOverlay: true,
          serenity: true,
          luxuryFeel: true
        },
        sections: [
          { type: 'highlights-strip', config: { items: ['Book Now', 'Services', 'Gift Cards', 'Locations'] } },
          { type: 'social-proof-strip', config: { style: 'elegant' } },
          { type: 'services-grid', config: { groupByOutcome: true } },  // Relax, Restore, Glow
          { type: 'salon-spa-program', config: {} },                    // Philosophy / how we work
          { type: 'membership-comparison', config: {} },                // NEW: membership plans
          { type: 'gallery-masonry', config: { elegant: true } },
          { type: 'reviews-carousel', config: {} },
          { type: 'new-client-guide', config: {} },                     // NEW: reduce anxiety
          { type: 'faq-accordion', config: { policies: true } },
          { type: 'locations-map', config: { showHours: true } },
          { type: 'cta-book-appointment', config: { prominent: true } }
        ],
        features: ['before-after-gallery', 'membership-packages', 'sticky-booking', 'new-client-guide'],
        mood: 'serene-luxury'
      },
      B: {
        name: 'Everyday Glow',
        reference: 'Membership-driven spas with clear packages and offers',
        description: 'Friendly, accessible, value-oriented. Split hero with booking widget and offer panel.',
        heroType: 'split-animated',
        heroConfig: {
          offerPanel: true,
          bookingWidget: true,
          friendly: true
        },
        sections: [
          { type: 'highlights-strip', config: { items: ['Intro Offer', 'Book', 'Memberships', 'Gift Cards'] } },
          { type: 'seasonal-featured', config: { packages: true } },    // Summer Glow, Holiday Reset
          { type: 'services-grid', config: { byCategory: true } },      // Facials, Massage, Body
          { type: 'membership-comparison', config: {} },                // Clear plan comparison
          { type: 'social-proof-strip', config: {} },
          { type: 'salon-spa-program', config: { results: true } },
          { type: 'stats-animated', config: {} },
          { type: 'reviews-carousel', config: {} },
          { type: 'faq-accordion', config: {} },
          { type: 'cta-book-appointment', config: {} }
        ],
        features: ['intro-offers', 'membership-comparison', 'seasonal-packages'],
        mood: 'friendly-accessible'
      },
      C: {
        name: 'Social & Trendy',
        reference: 'Boutique beauty studios, Instagram-driven salons',
        description: 'Bold, modern, social, Insta-ready. Gallery hero showing vibe, staff, and results.',
        heroType: 'gallery-fullbleed',
        heroConfig: {
          slideshow: true,
          vibeShots: true,
          socialFirst: true
        },
        sections: [
          { type: 'highlights-strip', config: { items: ['Book', 'Services', 'Instagram', 'Gift Cards'] } },
          { type: 'instagram-feed', config: { prominent: true } },
          { type: 'seasonal-featured', config: { flash: true } },       // Flash promos, events
          { type: 'services-grid', config: { trendy: true } },          // Cuts, color, brows, lashes
          { type: 'transformation-stories', config: {} },               // NEW: before/after + testimonials
          { type: 'about-team-grid', config: { stylists: true } },
          { type: 'reviews-carousel', config: {} },
          { type: 'salon-spa-program', config: { trend: true } },
          { type: 'booking-widget', config: {} },
          { type: 'faq-accordion', config: {} }
        ],
        features: ['instagram-integration', 'transformation-gallery', 'flash-promos', 'stylist-booking'],
        mood: 'social-trendy'
      }
    },
    winningElements: [
      'online-booking',
      'service-pricing',
      'stylist-profiles',
      'before-after-gallery',
      'membership-programs',
      'new-client-guide',
      'product-shop',
      'mobile-booking'
    ],
    colorGuidance: {
      spa: ['#E6D5F5', '#D4E5D4', '#E6B8A2'],
      warm: ['#9D8189', '#D4AF37', '#F5F5F5']
    }
  },

  // ═══════════════════════════════════════════
  // 7. FITNESS / GYM
  // ═══════════════════════════════════════════
  'fitness-gym': {
    name: 'Fitness / Gym',
    styleNote: 'Bold, Energetic, Motivating',
    layoutVariants: {
      A: {
        name: 'Conversion Machine',
        reference: 'Orangetheory / F45 style - trial-focused conversion',
        description: 'Optimized for free trial signups. Split hero with offer panel, prominent trial CTA, clear membership tiers.',
        heroType: 'split-animated',
        heroConfig: {
          offerPanel: true,
          trialOffer: true,
          energetic: true
        },
        sections: [
          { type: 'highlights-strip', config: { items: ['Free Trial', 'Classes', 'Memberships', 'Trainers'] } },
          { type: 'social-proof-strip', config: { style: 'energetic' } },
          { type: 'free-trial-cta', config: { prominent: true } },       // NEW: Trial signup hero
          { type: 'membership-comparison', config: {} },                 // Clear plan comparison
          { type: 'class-schedule-preview', config: {} },                // NEW: Upcoming classes
          { type: 'fitness-program', config: {} },                       // NEW: Training methodology
          { type: 'transformation-stories', config: {} },                // Before/after results
          { type: 'about-team-grid', config: { trainers: true } },
          { type: 'faq-accordion', config: { trial: true } },
          { type: 'locations-map', config: { showHours: true } },
          { type: 'cta-book-appointment', config: { freeTrial: true } }
        ],
        features: ['free-trial-prominent', 'membership-comparison', 'class-schedule', 'transformation-gallery'],
        mood: 'conversion-focused'
      },
      B: {
        name: 'Community & Culture',
        reference: "Barry's Bootcamp / CrossFit style - community-driven",
        description: 'Class-focused with strong community vibe. Video hero, class schedule prominent, member spotlights.',
        heroType: 'video',
        heroConfig: {
          highEnergy: true,
          workoutAction: true,
          communityVibes: true
        },
        sections: [
          { type: 'highlights-strip', config: { items: ['Book Class', 'Schedule', 'Community', 'Shop'] } },
          { type: 'class-schedule-preview', config: { prominent: true } },  // Classes front and center
          { type: 'services-grid', config: { workouts: true } },           // Workout types
          { type: 'fitness-program', config: { community: true } },         // Our training philosophy
          { type: 'social-proof-strip', config: {} },
          { type: 'about-team-grid', config: { instructors: true } },
          { type: 'instagram-feed', config: { community: true } },          // Member content
          { type: 'transformation-stories', config: {} },
          { type: 'merchandise-shop', config: { apparel: true } },
          { type: 'reviews-carousel', config: {} },
          { type: 'booking-widget', config: { classes: true } }
        ],
        features: ['class-booking', 'community-feed', 'instructor-profiles', 'merchandise'],
        mood: 'community-energy'
      },
      C: {
        name: 'Coaching & Results',
        reference: 'Equinox / Personal Training style - results-driven',
        description: 'Premium positioning, results-focused. Dark luxury hero, trainer credentials, success stories prominent.',
        heroType: 'dark-luxury',
        heroConfig: {
          sophisticated: true,
          premium: true,
          transformationFocus: true
        },
        sections: [
          { type: 'highlights-strip', config: { items: ['Book Training', 'Programs', 'Results', 'Contact'] } },
          { type: 'transformation-stories', config: { prominent: true } },  // Results upfront
          { type: 'trainer-spotlight', config: {} },                        // NEW: Featured trainers
          { type: 'fitness-program', config: { methodology: true } },       // Training approach
          { type: 'services-grid', config: { programs: true } },            // Training programs
          { type: 'membership-comparison', config: {} },
          { type: 'social-proof-strip', config: { style: 'elegant' } },
          { type: 'gallery-carousel', config: { facility: true } },
          { type: 'stats-animated', config: { results: true } },
          { type: 'reviews-carousel', config: {} },
          { type: 'faq-accordion', config: {} },
          { type: 'cta-book-appointment', config: { consultation: true } }
        ],
        features: ['trainer-credentials', 'transformation-gallery', 'premium-positioning', 'consultation-booking'],
        mood: 'premium-results'
      }
    },
    winningElements: [
      'free-trial-cta',
      'class-schedule',
      'online-booking',
      'membership-tiers',
      'trainer-profiles',
      'transformation-gallery',
      'success-stories',
      'mobile-first',
      'community-feed'
    ],
    colorGuidance: {
      bold: ['#DC2626', '#EF4444', '#F59E0B'],
      dark: ['#1A1A1A', '#0F172A', '#18181B'],
      energetic: ['#00B4D8', '#0077B6', '#023E8A']
    }
  },

  // ═══════════════════════════════════════════
  // 8. DENTAL PRACTICE
  // ═══════════════════════════════════════════
  'dental': {
    name: 'Dental Practice',
    styleNote: 'Friendly, Trust, Clean',
    layoutVariants: {
      A: {
        name: 'Spa-Like Luxury',
        reference: 'Beehive Dental style',
        description: 'Unique branding reduces anxiety through comfort positioning. Themed experience.',
        heroType: 'video',
        heroConfig: {
          calming: true,
          facilityTour: true,
          comfortFocus: true
        },
        sections: [
          { type: 'services-bento', config: { amenities: true } },
          { type: 'features-grid', config: { comfort: true } },
          { type: 'about-team-grid', config: { friendly: true } },
          { type: 'gallery-carousel', config: { virtualTour: true } },
          { type: 'testimonials-featured', config: { anxiety: true } },
          { type: 'booking-widget', config: { prominent: true } }
        ],
        features: ['comfort-amenities', 'video-tours', 'themed-branding'],
        mood: 'spa-like-luxury'
      },
      B: {
        name: 'Modern Minimalist',
        reference: 'Tend style',
        description: 'Reimagines dental experience through design. Fun, energetic, minimal.',
        heroType: 'video',
        heroConfig: {
          fun: true,
          energetic: true,
          modern: true
        },
        sections: [
          { type: 'services-grid', config: { clean: true } },
          { type: 'booking-widget', config: { multiple: true } },
          { type: 'locations-showcase', config: {} },
          { type: 'about-values', config: { modern: true } },
          { type: 'faq-accordion', config: {} }
        ],
        features: ['multiple-booking-ctas', 'easy-navigation', 'modern-aesthetic'],
        mood: 'modern-minimalist'
      },
      C: {
        name: 'Trust & Credibility',
        reference: 'Grand Street Dental style',
        description: 'Credibility through reviews and results. Before/after gallery, social proof.',
        heroType: 'image-overlay',
        heroConfig: {
          professional: true,
          smiles: true,
          trustSignals: true
        },
        sections: [
          { type: 'awards-badges', config: { prominent: true } },
          { type: 'before-after-slider', config: { smiles: true } },
          { type: 'reviews-grid', config: { featured: true } },
          { type: 'about-team-grid', config: { credentials: true } },
          { type: 'services-list-pricing', config: {} },
          { type: 'cta-book-appointment', config: {} }
        ],
        features: ['before-after-gallery', 'review-badges', 'credentials-display'],
        mood: 'trust-credibility'
      }
    },
    winningElements: [
      'online-booking',
      'services-pricing',
      'insurance-accepted',
      'before-after-gallery',
      'patient-testimonials',
      'team-bios',
      'virtual-tour',
      'emergency-contact'
    ],
    colorGuidance: {
      clinical: ['#1565C0', '#1976D2', '#42A5F5'],
      calming: ['#00897B', '#26A69A', '#80CBC4']
    }
  },

  // ═══════════════════════════════════════════
  // 9. HEALTHCARE / MEDICAL
  // ═══════════════════════════════════════════
  'healthcare': {
    name: 'Healthcare / Medical',
    styleNote: 'Professional, Clinical, Trustworthy',
    layoutVariants: {
      A: {
        name: 'Clean Minimalist',
        reference: 'Mayo Clinic style',
        description: 'Accessible design assists recovery journey. Comprehensive search, plain language.',
        heroType: 'minimal-text',
        heroConfig: {
          clean: true,
          whitespace: 'dominant',
          accessible: true
        },
        sections: [
          { type: 'services-tabs', config: { search: true } },
          { type: 'features-grid', config: { resources: true } },
          { type: 'about-team-grid', config: { providers: true } },
          { type: 'faq-accordion', config: { plainLanguage: true } },
          { type: 'contact-split', config: { patientPortal: true } }
        ],
        features: ['comprehensive-search', 'plain-language', 'feedback-mechanism'],
        mood: 'clean-minimalist'
      },
      B: {
        name: 'Professional Bold',
        reference: 'Northwestern Medicine style',
        description: 'Simple practices executed perfectly. Strong visual hierarchy, brand accents.',
        heroType: 'centered-cta',
        heroConfig: {
          pathBased: true,
          brandAccents: true,
          professional: true
        },
        sections: [
          { type: 'services-grid', config: { pathways: true } },
          { type: 'booking-widget', config: { prominent: true } },
          { type: 'features-grid', config: { research: true } },
          { type: 'about-team-grid', config: { searchable: true } },
          { type: 'reviews-carousel', config: { patient: true } }
        ],
        features: ['path-navigation', 'research-centers', 'performance-focused'],
        mood: 'professional-bold'
      },
      C: {
        name: 'Warm & Accessible',
        reference: 'Halcyon Health style',
        description: 'Simplicity answers patient pain points. Calming, reviews prominent.',
        heroType: 'image-overlay',
        heroConfig: {
          calming: true,
          welcoming: true,
          transparent: true
        },
        sections: [
          { type: 'services-list-pricing', config: { transparent: true } },
          { type: 'reviews-grid', config: { prominent: true } },
          { type: 'locations-map', config: { google: true } },
          { type: 'about-values', config: { patientFirst: true } },
          { type: 'cta-contact-form', config: { clickToCall: true } }
        ],
        features: ['transparent-pricing', 'reviews-prominent', 'click-to-call'],
        mood: 'warm-accessible'
      }
    },
    winningElements: [
      'online-booking',
      'patient-portal',
      'provider-bios',
      'insurance-list',
      'telehealth-options',
      'conditions-treated',
      'plain-language',
      'accessibility'
    ],
    colorGuidance: {
      professional: ['#1565C0', '#1976D2', '#0EA5E9'],
      warm: ['#059669', '#10B981', '#34D399']
    }
  },

  // ═══════════════════════════════════════════
  // 10. YOGA STUDIO
  // ═══════════════════════════════════════════
  'yoga': {
    name: 'Yoga Studio',
    styleNote: 'Calm, Centered, Welcoming',
    layoutVariants: {
      A: {
        name: 'Modern Energy',
        reference: 'CorePower Yoga style',
        description: 'Modern energy attracts diverse audience. Vibrant branding, high-res media.',
        heroType: 'video',
        heroConfig: {
          vibrant: true,
          contemporary: true,
          energetic: true
        },
        sections: [
          { type: 'class-schedule', config: { prominent: true } },
          { type: 'services-tabs', config: { classTypes: true } },
          { type: 'about-team-grid', config: { teachers: true } },
          { type: 'merchandise-shop', config: { branded: true } },
          { type: 'locations-showcase', config: { multiple: true } },
          { type: 'features-grid', config: { app: true } }
        ],
        features: ['virtual-classes', 'mobile-app', 'teacher-training', 'merchandise'],
        mood: 'modern-energy'
      },
      B: {
        name: 'Serene Minimalist',
        reference: 'Roots & Sunrise style',
        description: 'Balances beauty with practicality. Clean, inviting, soothing.',
        heroType: 'minimal-text',
        heroConfig: {
          serene: true,
          soothing: true,
          professional: true
        },
        sections: [
          { type: 'class-schedule', config: { simple: true } },
          { type: 'booking-widget', config: { prominent: true } },
          { type: 'about-values', config: { philosophy: true } },
          { type: 'reviews-carousel', config: { ratings: true } },
          { type: 'instagram-feed', config: {} },
          { type: 'contact-minimal', config: {} }
        ],
        features: ['simple-booking', 'reviews-ratings', 'instagram-link'],
        mood: 'serene-minimalist'
      },
      C: {
        name: 'Digital Platform',
        reference: 'Glo style',
        description: 'Online platform done right. Video library, subscription model.',
        heroType: 'video',
        heroConfig: {
          onDemand: true,
          library: true,
          subscription: true
        },
        sections: [
          { type: 'services-tabs', config: { styles: true } },
          { type: 'features-grid', config: { classCount: true } },
          { type: 'about-team-grid', config: { instructors: true } },
          { type: 'pricing-tiers', config: { subscription: true } },
          { type: 'testimonials-featured', config: { progress: true } }
        ],
        features: ['video-library', 'subscription-model', 'progress-tracking'],
        mood: 'digital-platform'
      }
    },
    winningElements: [
      'class-schedule',
      'online-booking',
      'teacher-profiles',
      'pricing-packages',
      'first-timer-info',
      'philosophy-explained',
      'workshop-calendar',
      'online-classes'
    ],
    colorGuidance: {
      calm: ['#10B981', '#34D399', '#6EE7B7'],
      warm: ['#F59E0B', '#FBBF24', '#FCD34D']
    }
  },

  // ═══════════════════════════════════════════
  // 11. BARBERSHOP
  // ═══════════════════════════════════════════
  'barbershop': {
    name: 'Barbershop',
    styleNote: 'Classic, Masculine, Traditional',
    layoutVariants: {
      A: {
        name: 'Modern Sleek',
        reference: 'Wayward Barbershop style',
        description: 'Video powerfully showcases brand. Modern, aesthetically pleasing.',
        heroType: 'video',
        heroConfig: {
          modern: true,
          brandShowcase: true,
          sleek: true
        },
        sections: [
          { type: 'services-list-pricing', config: { clear: true } },
          { type: 'about-team-grid', config: { barbers: true } },
          { type: 'gallery-carousel', config: { cuts: true } },
          { type: 'booking-widget', config: { seamless: true } },
          { type: 'merchandise-shop', config: { products: true } }
        ],
        features: ['video-hero', 'seamless-booking', 'product-shop'],
        mood: 'modern-sleek'
      },
      B: {
        name: 'Classic Vintage',
        reference: 'Assembly Barbershop style',
        description: 'History meets modern simplicity. Traditional inspiration, timeless design.',
        heroType: 'dark-luxury',
        heroConfig: {
          vintage: true,
          heritage: true,
          timeless: true
        },
        sections: [
          { type: 'origin-timeline', config: { history: true } },
          { type: 'services-list-pricing', config: { traditional: true } },
          { type: 'about-values', config: { culture: true } },
          { type: 'gallery-hover-zoom', config: { classic: true } },
          { type: 'booking-widget', config: {} }
        ],
        features: ['heritage-storytelling', 'classic-aesthetic', 'traditional-values'],
        mood: 'classic-vintage'
      },
      C: {
        name: 'Urban Bold',
        reference: 'Huckle The Barber style',
        description: 'Established reputation with modern tech. Bold colors, shop integration.',
        heroType: 'split-animated',
        heroConfig: {
          bold: true,
          urban: true,
          independent: true
        },
        sections: [
          { type: 'services-grid', config: { bold: true } },
          { type: 'product-grid', config: { shop: true } },
          { type: 'about-team-grid', config: { profiles: true } },
          { type: 'locations-showcase', config: { multiple: true } },
          { type: 'about-values', config: { community: true } },
          { type: 'booking-widget', config: { perBarber: true } }
        ],
        features: ['product-sales', 'multiple-locations', 'community-focus'],
        mood: 'urban-bold'
      }
    },
    winningElements: [
      'online-booking',
      'services-pricing',
      'barber-profiles',
      'before-after-gallery',
      'walk-in-info',
      'grooming-products',
      'dark-themes',
      'loyalty-programs'
    ],
    colorGuidance: {
      dark: ['#1A1A1A', '#2C1810', '#1E293B'],
      accent: ['#D4A574', '#C9A962', '#DC2626']
    }
  },

  // ═══════════════════════════════════════════
  // 12. LAW FIRM
  // ═══════════════════════════════════════════
  'law-firm': {
    name: 'Law Firm',
    styleNote: 'Professional, Trustworthy, Authority',
    layoutVariants: {
      A: {
        name: 'Creative Bold',
        reference: 'Bick Law style',
        description: 'Creative design sets them apart. Unexpected imagery, bold colors.',
        heroType: 'split-animated',
        heroConfig: {
          creative: true,
          metaphorical: true,
          awardWinning: true
        },
        sections: [
          { type: 'about-values', config: { unique: true } },
          { type: 'services-grid', config: { practiceAreas: true } },
          { type: 'awards-badges', config: { webby: true } },
          { type: 'testimonials-featured', config: { cases: true } },
          { type: 'cta-contact-form', config: { consultation: true } }
        ],
        features: ['creative-imagery', 'animations', 'cause-focused'],
        mood: 'creative-bold'
      },
      B: {
        name: 'Professional Clean',
        reference: 'YLaw style',
        description: 'Professional branding shows expertise clearly. Unique imagery, blog prominent.',
        heroType: 'image-overlay',
        heroConfig: {
          professional: true,
          unique: true,
          approachable: true
        },
        sections: [
          { type: 'services-tabs', config: { categories: true } },
          { type: 'about-team-grid', config: { attorneys: true } },
          { type: 'features-grid', config: { resources: true } },
          { type: 'reviews-carousel', config: { client: true } },
          { type: 'cta-contact-form', config: { payment: true } }
        ],
        features: ['blog-resources', 'payment-portal', 'practice-categories'],
        mood: 'professional-clean'
      },
      C: {
        name: 'Identity-Driven',
        reference: 'Big Fire Law style',
        description: 'Identity and values immediately clear. Community representation, mission-focused.',
        heroType: 'image-overlay',
        heroConfig: {
          identity: true,
          values: true,
          community: true
        },
        sections: [
          { type: 'about-values', config: { mission: true } },
          { type: 'services-grid', config: { practiceAreas: true } },
          { type: 'about-team-grid', config: { diverse: true } },
          { type: 'testimonials-featured', config: { community: true } },
          { type: 'contact-split', config: { clear: true } }
        ],
        features: ['heritage-values', 'community-representation', 'mission-messaging'],
        mood: 'identity-driven'
      }
    },
    winningElements: [
      'practice-areas',
      'attorney-bios',
      'case-results',
      'client-testimonials',
      'free-consultation',
      'contact-form',
      'awards-recognition',
      'blog-resources'
    ],
    colorGuidance: {
      professional: ['#1E3A5F', '#1E3A8A', '#1F2937'],
      accent: ['#C9A962', '#DC2626', '#059669']
    }
  },

  // ═══════════════════════════════════════════
  // 13. REAL ESTATE AGENCY
  // ═══════════════════════════════════════════
  'real-estate': {
    name: 'Real Estate Agency',
    styleNote: 'Professional, Modern, Trustworthy',
    layoutVariants: {
      A: {
        name: 'Luxury Minimalist',
        reference: 'Ginger Martin style',
        description: 'Minimalism communicates luxury. Stunning minimal design, subtle branding.',
        heroType: 'gallery-fullbleed',
        heroConfig: {
          luxury: true,
          highRes: true,
          minimal: true
        },
        sections: [
          { type: 'product-grid', config: { properties: true } },
          { type: 'features-grid', config: { search: true } },
          { type: 'stats-animated', config: { sales: true } },
          { type: 'about-team-grid', config: { agents: true } },
          { type: 'testimonials-featured', config: { buyers: true } }
        ],
        features: ['property-photos', 'subtle-branding', 'premium-positioning'],
        mood: 'luxury-minimalist'
      },
      B: {
        name: 'Warm & Video-Rich',
        reference: 'Kumara Wilcoxon style',
        description: 'Luxury without intimidation. Video content, warm palette, inviting.',
        heroType: 'video',
        heroConfig: {
          warm: true,
          inviting: true,
          videoTours: true
        },
        sections: [
          { type: 'video-showcase', config: { properties: true } },
          { type: 'product-grid', config: { featured: true } },
          { type: 'features-grid', config: { search: true } },
          { type: 'about-values', config: { community: true } },
          { type: 'testimonials-featured', config: { personal: true } }
        ],
        features: ['video-content', 'warm-colors', 'community-focus'],
        mood: 'warm-video'
      },
      C: {
        name: 'Authority-Driven',
        reference: 'Jade Mills style',
        description: 'Success + design = authority. Accolades prominent, SEO-optimized.',
        heroType: 'image-overlay',
        heroConfig: {
          authority: true,
          accolades: true,
          professional: true
        },
        sections: [
          { type: 'awards-badges', config: { prominent: true } },
          { type: 'stats-animated', config: { billionSales: true } },
          { type: 'product-grid', config: { listings: true } },
          { type: 'about-team-grid', config: { topAgent: true } },
          { type: 'testimonials-featured', config: { vip: true } },
          { type: 'cta-contact-form', config: { valuation: true } }
        ],
        features: ['accolades-display', 'sales-metrics', 'expert-positioning'],
        mood: 'authority-driven'
      }
    },
    winningElements: [
      'property-search',
      'property-photos',
      'virtual-tours',
      'agent-bios',
      'market-stats',
      'testimonials',
      'contact-forms',
      'mobile-responsive'
    ],
    colorGuidance: {
      professional: ['#1976D2', '#1E3A5F', '#37474F'],
      accent: ['#C9A962', '#059669', '#DC2626']
    }
  },

  // ═══════════════════════════════════════════
  // 14. PLUMBER
  // ═══════════════════════════════════════════
  'plumber': {
    name: 'Plumber',
    styleNote: 'Trustworthy, Reliable, Professional',
    layoutVariants: {
      A: {
        name: 'Family Trust',
        reference: 'Edwards Plumbing style',
        description: 'Everything done right. Family photos, compelling copy, visual hierarchy.',
        heroType: 'image-overlay',
        heroConfig: {
          family: true,
          branded: true,
          trustworthy: true
        },
        sections: [
          { type: 'trust-strip', config: { badges: true } },
          { type: 'services-grid', config: { clear: true } },
          { type: 'about-team-grid', config: { family: true } },
          { type: 'reviews-carousel', config: { local: true } },
          { type: 'gallery-carousel', config: { work: true } },
          { type: 'cta-contact-form', config: { emergency: true } }
        ],
        features: ['family-photos', 'branding-visible', 'visual-hierarchy'],
        mood: 'family-trust'
      },
      B: {
        name: 'Brand Authority',
        reference: 'Benjamin Franklin Plumbing style',
        description: 'Brand + functionality + trust. Strong slogan, branch locator.',
        heroType: 'centered-cta',
        heroConfig: {
          branded: true,
          trustIntegrity: true,
          strategic: true
        },
        sections: [
          { type: 'trust-strip', config: { forbes: true } },
          { type: 'locations-showcase', config: { finder: true } },
          { type: 'services-tabs', config: { organized: true } },
          { type: 'stats-animated', config: { trust: true } },
          { type: 'reviews-grid', config: { verified: true } },
          { type: 'booking-widget', config: { prominent: true } }
        ],
        features: ['strong-slogan', 'branch-locator', '24-7-availability'],
        mood: 'brand-authority'
      },
      C: {
        name: 'Resource Hub',
        reference: 'Roto-Rooter style',
        description: 'Simplicity + video education. Minimalist, fun typography, videos.',
        heroType: 'minimal-text',
        heroConfig: {
          minimalist: true,
          funTypography: true,
          resourceFocus: true
        },
        sections: [
          { type: 'locations-showcase', config: { finder: true } },
          { type: 'video-showcase', config: { educational: true } },
          { type: 'services-grid', config: { simple: true } },
          { type: 'faq-accordion', config: { diy: true } },
          { type: 'booking-widget', config: {} }
        ],
        features: ['video-library', 'educational-content', 'easy-booking'],
        mood: 'resource-hub'
      }
    },
    winningElements: [
      'emergency-contact',
      'services-list',
      'service-area',
      'testimonials',
      'licensed-insured',
      'before-after-photos',
      'online-booking',
      'click-to-call'
    ],
    colorGuidance: {
      trust: ['#2563EB', '#1D4ED8', '#1E40AF'],
      accent: ['#DC2626', '#059669', '#F59E0B']
    }
  },

  // ═══════════════════════════════════════════
  // 15. CLEANING SERVICE
  // ═══════════════════════════════════════════
  'cleaning': {
    name: 'Cleaning Service',
    styleNote: 'Fresh, Clean, Trustworthy',
    layoutVariants: {
      A: {
        name: 'Benefit-Focused',
        reference: 'Two Maids & A Mop style',
        description: 'Emotional benefit-driven marketing. Family photos, quality time messaging.',
        heroType: 'image-overlay',
        heroConfig: {
          lifestyle: true,
          family: true,
          benefits: true
        },
        sections: [
          { type: 'features-grid', config: { benefits: true } },
          { type: 'services-grid', config: { packages: true } },
          { type: 'locations-showcase', config: { landing: true } },
          { type: 'testimonials-featured', config: { lifestyle: true } },
          { type: 'cta-contact-form', config: { quote: true } }
        ],
        features: ['benefit-messaging', 'family-imagery', 'location-pages'],
        mood: 'benefit-focused'
      },
      B: {
        name: 'Tech-Enabled',
        reference: 'Molly Maid style',
        description: 'Technology meets convenience. AI chatbot, sticky booking button.',
        heroType: 'centered-cta',
        heroConfig: {
          tech: true,
          interactive: true,
          convenient: true
        },
        sections: [
          { type: 'booking-widget', config: { chatbot: true } },
          { type: 'locations-showcase', config: { franchise: true } },
          { type: 'services-tabs', config: { packages: true } },
          { type: 'features-grid', config: { tech: true } },
          { type: 'reviews-carousel', config: { automated: true } }
        ],
        features: ['ai-chatbot', 'online-booking', 'automated-lead-capture'],
        mood: 'tech-enabled'
      },
      C: {
        name: 'Health-Conscious',
        reference: 'Maid Brigade style',
        description: 'Health-conscious differentiation. Eco-friendly, safety certifications.',
        heroType: 'image-overlay',
        heroConfig: {
          healthy: true,
          ecoFriendly: true,
          safe: true
        },
        sections: [
          { type: 'about-values', config: { method: true } },
          { type: 'features-grid', config: { certifications: true } },
          { type: 'services-grid', config: { ecoFriendly: true } },
          { type: 'locations-showcase', config: { zipCode: true } },
          { type: 'testimonials-featured', config: { health: true } }
        ],
        features: ['eco-friendly', 'safety-certifications', 'zip-code-checker'],
        mood: 'health-conscious'
      }
    },
    winningElements: [
      'online-booking',
      'zip-code-finder',
      'free-quote-cta',
      'service-packages',
      'recurring-discounts',
      'satisfaction-guarantee',
      'trust-badges',
      'live-chat'
    ],
    colorGuidance: {
      fresh: ['#14B8A6', '#10B981', '#22C55E'],
      clean: ['#FFFFFF', '#F8FAFC', '#F1F5F9']
    }
  },

  // ═══════════════════════════════════════════
  // 16. AUTO SHOP / MECHANIC
  // ═══════════════════════════════════════════
  'auto-shop': {
    name: 'Auto Shop / Mechanic',
    styleNote: 'Professional, Reliable, Trustworthy',
    layoutVariants: {
      A: {
        name: 'Franchise Professional',
        reference: 'Christian Brothers style',
        description: 'Trust through consistency + green branding. Multi-location, resource library.',
        heroType: 'image-overlay',
        heroConfig: {
          corporate: true,
          green: true,
          organized: true
        },
        sections: [
          { type: 'locations-showcase', config: { finder: true } },
          { type: 'services-tabs', config: { organized: true } },
          { type: 'features-grid', config: { resources: true } },
          { type: 'trust-strip', config: { certifications: true } },
          { type: 'reviews-carousel', config: { verified: true } }
        ],
        features: ['location-finder', 'resource-library', 'trust-colors'],
        mood: 'franchise-professional'
      },
      B: {
        name: 'Modern Tech-Forward',
        reference: "Nelson's Auto Repair style",
        description: 'Energy + accessibility + modern tech. Bold colors, live chat.',
        heroType: 'split-animated',
        heroConfig: {
          dynamic: true,
          bold: true,
          modern: true
        },
        sections: [
          { type: 'services-grid', config: { dynamic: true } },
          { type: 'booking-widget', config: { liveChat: true } },
          { type: 'gallery-carousel', config: { animations: true } },
          { type: 'stats-animated', config: { expertise: true } },
          { type: 'testimonials-featured', config: {} }
        ],
        features: ['live-chat', 'dynamic-graphics', 'instant-communication'],
        mood: 'modern-tech'
      },
      C: {
        name: 'Niche Specialist',
        reference: 'Adrenaline Diesel style',
        description: 'Crystal-clear niche positioning. Specific vehicle types, manufacturer lists.',
        heroType: 'image-overlay',
        heroConfig: {
          niche: true,
          specific: true,
          professional: true
        },
        sections: [
          { type: 'services-list-pricing', config: { specialized: true } },
          { type: 'features-grid', config: { manufacturers: true } },
          { type: 'about-values', config: { expertise: true } },
          { type: 'gallery-carousel', config: { fleet: true } },
          { type: 'cta-contact-form', config: { fleet: true } }
        ],
        features: ['niche-messaging', 'manufacturer-list', 'fleet-focus'],
        mood: 'niche-specialist'
      }
    },
    winningElements: [
      'services-list',
      'online-scheduling',
      'click-to-call',
      'price-estimates',
      'ase-certifications',
      'warranty-info',
      'testimonials',
      'shuttle-service'
    ],
    colorGuidance: {
      trust: ['#059669', '#10B981', '#22C55E'],
      bold: ['#DC2626', '#1A1A1A', '#F59E0B']
    }
  },

  // ═══════════════════════════════════════════
  // 17. SAAS / SOFTWARE
  // ═══════════════════════════════════════════
  'saas': {
    name: 'SaaS / Software',
    styleNote: 'Modern, Tech, Clean',
    layoutVariants: {
      A: {
        name: 'Playful Energy',
        reference: 'Slack style',
        description: 'Joy + clarity + energy. Vibrant colors, playful illustrations.',
        heroType: 'split-animated',
        heroConfig: {
          vibrant: true,
          playful: true,
          illustrations: true
        },
        sections: [
          { type: 'features-grid', config: { animated: true } },
          { type: 'services-bento', config: { features: true } },
          { type: 'testimonials-featured', config: { logos: true } },
          { type: 'pricing-tiers', config: { comparison: true } },
          { type: 'cta-contact-form', config: { demo: true } }
        ],
        features: ['playful-illustrations', 'animations', 'intuitive-layout'],
        mood: 'playful-energy'
      },
      B: {
        name: 'Conversion Machine',
        reference: 'HubSpot style',
        description: 'Conversion-optimized at every level. Sticky CTAs, free trial prominent.',
        heroType: 'centered-cta',
        heroConfig: {
          conversion: true,
          stickyCta: true,
          services: true
        },
        sections: [
          { type: 'features-grid', config: { popular: true } },
          { type: 'services-tabs', config: { products: true } },
          { type: 'testimonials-featured', config: { caseStudies: true } },
          { type: 'pricing-tiers', config: { freeTrial: true } },
          { type: 'cta-contact-form', config: { demo: true } },
          { type: 'faq-accordion', config: {} }
        ],
        features: ['sticky-ctas', 'free-trial', 'seo-optimized'],
        mood: 'conversion-machine'
      },
      C: {
        name: 'Clarity-First',
        reference: 'Databox style',
        description: 'Clarity + proof + UX excellence. Clear message, social proof.',
        heroType: 'minimal-text',
        heroConfig: {
          clarity: true,
          message: true,
          proof: true
        },
        sections: [
          { type: 'trust-strip', config: { logos: true } },
          { type: 'features-grid', config: { clear: true } },
          { type: 'video-showcase', config: { demo: true } },
          { type: 'testimonials-featured', config: { quotes: true } },
          { type: 'cta-contact-form', config: { signup: true } }
        ],
        features: ['clear-messaging', 'social-proof', 'exceptional-ux'],
        mood: 'clarity-first'
      }
    },
    winningElements: [
      'product-demo',
      'pricing-tiers',
      'feature-comparison',
      'case-studies',
      'api-documentation',
      'free-trial-cta',
      'integrations',
      'customer-logos'
    ],
    colorGuidance: {
      vibrant: ['#8B5CF6', '#6366F1', '#3B82F6'],
      modern: ['#0EA5E9', '#06B6D4', '#14B8A6']
    }
  },

  // ═══════════════════════════════════════════
  // 18. E-COMMERCE / RETAIL
  // ═══════════════════════════════════════════
  'ecommerce': {
    name: 'E-Commerce / Retail',
    styleNote: 'Clean, Product-Focused, Easy Navigation',
    layoutVariants: {
      A: {
        name: 'Luxury Minimal',
        reference: 'Chanel style',
        description: 'Luxury through minimalism. Streamlined interface, high-quality photos.',
        heroType: 'gallery-fullbleed',
        heroConfig: {
          luxury: true,
          minimal: true,
          highRes: true
        },
        sections: [
          { type: 'product-grid', config: { featured: true } },
          { type: 'gallery-carousel', config: { collections: true } },
          { type: 'about-values', config: { brand: true } },
          { type: 'testimonials-featured', config: { press: true } },
          { type: 'cta-newsletter', config: { exclusive: true } }
        ],
        features: ['minimal-interface', 'exclusivity', 'seamless-navigation'],
        mood: 'luxury-minimal'
      },
      B: {
        name: 'Social Proof',
        reference: 'Brooklinen style',
        description: 'Social proof + quality imagery. Endorsements, reviews displayed.',
        heroType: 'image-overlay',
        heroConfig: {
          endorsements: true,
          reviews: true,
          quality: true
        },
        sections: [
          { type: 'trust-strip', config: { press: true } },
          { type: 'product-grid', config: { bestsellers: true } },
          { type: 'reviews-grid', config: { count: true } },
          { type: 'gallery-hover-zoom', config: { details: true } },
          { type: 'cta-newsletter', config: { discount: true } }
        ],
        features: ['press-endorsements', 'review-count', 'fabric-details'],
        mood: 'social-proof'
      },
      C: {
        name: 'Community Lifestyle',
        reference: 'Gymshark style',
        description: 'Community + lifestyle branding. Bold visuals, social integration.',
        heroType: 'video',
        heroConfig: {
          community: true,
          lifestyle: true,
          energetic: true
        },
        sections: [
          { type: 'product-grid', config: { lifestyle: true } },
          { type: 'gallery-masonry', config: { ugc: true } },
          { type: 'features-grid', config: { sizeGuides: true } },
          { type: 'instagram-feed', config: { community: true } },
          { type: 'testimonials-featured', config: { athletes: true } }
        ],
        features: ['community-features', 'social-integration', 'user-generated-content'],
        mood: 'community-lifestyle'
      }
    },
    winningElements: [
      'product-catalog',
      'shopping-cart',
      'customer-reviews',
      'size-guides',
      'return-policy',
      'shipping-info',
      'wishlist',
      'product-zoom'
    ],
    colorGuidance: {
      luxury: ['#1A1A1A', '#2D2D2D', '#1E1E1E'],
      accent: ['#C9A962', '#B76E79', '#DC2626']
    }
  },

  // ═══════════════════════════════════════════
  // 19. SCHOOL / ACADEMY
  // ═══════════════════════════════════════════
  'school': {
    name: 'School / Academy',
    styleNote: 'Educational, Welcoming, Professional',
    layoutVariants: {
      A: {
        name: 'Warm Storytelling',
        reference: 'Canterbury School style',
        description: 'Emotional connection through video. School life moments, values-driven.',
        heroType: 'video',
        heroConfig: {
          schoolLife: true,
          emotional: true,
          warmth: true
        },
        sections: [
          { type: 'about-values', config: { core: true } },
          { type: 'gallery-carousel', config: { campus: true } },
          { type: 'features-grid', config: { programs: true } },
          { type: 'about-team-grid', config: { faculty: true } },
          { type: 'testimonials-featured', config: { alumni: true } },
          { type: 'cta-contact-form', config: { inquiry: true } }
        ],
        features: ['video-hero', 'campus-imagery', 'values-messaging'],
        mood: 'warm-storytelling'
      },
      B: {
        name: 'Information-Focused',
        reference: 'George Washington Academy style',
        description: 'Clarity + easy information access. Straightforward, well-organized.',
        heroType: 'centered-cta',
        heroConfig: {
          informative: true,
          organized: true,
          accessible: true
        },
        sections: [
          { type: 'services-tabs', config: { programs: true } },
          { type: 'features-grid', config: { admissions: true } },
          { type: 'about-team-grid', config: { searchable: true } },
          { type: 'faq-accordion', config: { parents: true } },
          { type: 'contact-split', config: { portal: true } }
        ],
        features: ['all-info-homepage', 'organized-navigation', 'academic-focus'],
        mood: 'information-focused'
      },
      C: {
        name: 'Vibrant Community',
        reference: 'Ross School style',
        description: 'Vibrancy + social proof. Vivid imagery, social feeds, alumni achievements.',
        heroType: 'gallery-fullbleed',
        heroConfig: {
          vibrant: true,
          diverse: true,
          social: true
        },
        sections: [
          { type: 'gallery-masonry', config: { diverse: true } },
          { type: 'features-grid', config: { programs: true } },
          { type: 'instagram-feed', config: { embedded: true } },
          { type: 'testimonials-featured', config: { alumni: true } },
          { type: 'stats-animated', config: { achievements: true } }
        ],
        features: ['social-media-feed', 'alumni-achievements', 'diverse-programs'],
        mood: 'vibrant-community'
      }
    },
    winningElements: [
      'programs-offered',
      'admissions-info',
      'faculty-profiles',
      'campus-tour',
      'student-life',
      'calendar-events',
      'parent-portal',
      'news-blog'
    ],
    colorGuidance: {
      academic: ['#1E3A8A', '#1E40AF', '#3B82F6'],
      warm: ['#DC2626', '#F59E0B', '#10B981']
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all available industries
 */
function getAvailableIndustries() {
  return Object.keys(INDUSTRY_DESIGN_RESEARCH).map(id => ({
    id,
    name: INDUSTRY_DESIGN_RESEARCH[id].name,
    styleNote: INDUSTRY_DESIGN_RESEARCH[id].styleNote
  }));
}

/**
 * Get design research config for an industry
 */
function getIndustryResearch(industryId) {
  return INDUSTRY_DESIGN_RESEARCH[industryId] || null;
}

/**
 * Get layout variant config for an industry
 */
function getLayoutVariant(industryId, variant = 'A') {
  const industry = INDUSTRY_DESIGN_RESEARCH[industryId];
  if (!industry) return null;
  return industry.layoutVariants[variant] || null;
}

/**
 * Get all layout variants for an industry
 */
function getAllVariants(industryId) {
  const industry = INDUSTRY_DESIGN_RESEARCH[industryId];
  if (!industry) return null;
  return industry.layoutVariants;
}

/**
 * Get hero component name for a variant
 */
function getHeroComponent(heroType) {
  return HERO_TYPES[heroType] || 'ImageOverlayHero';
}

/**
 * Get section component name
 */
function getSectionComponent(sectionType) {
  return SECTION_TYPES[sectionType] || null;
}

/**
 * Get winning elements for an industry
 */
function getWinningElements(industryId) {
  const industry = INDUSTRY_DESIGN_RESEARCH[industryId];
  return industry?.winningElements || [];
}

/**
 * Get color guidance for an industry
 */
function getColorGuidance(industryId) {
  const industry = INDUSTRY_DESIGN_RESEARCH[industryId];
  return industry?.colorGuidance || {};
}

/**
 * Get menu style for an industry and variant
 * @param {string} industryId - Industry identifier
 * @param {string} variant - Layout variant (A, B, or C)
 * @returns {object} Menu style config or null
 */
function getMenuStyle(industryId, variant = 'A') {
  const industryMapping = INDUSTRY_MENU_STYLES[industryId];
  if (!industryMapping) {
    // Default to photo-grid for unknown industries
    return MENU_STYLES['photo-grid'];
  }
  const styleId = industryMapping[variant] || industryMapping['A'] || 'photo-grid';
  return { ...MENU_STYLES[styleId], id: styleId };
}

/**
 * Get menu style ID for an industry and variant
 * @param {string} industryId - Industry identifier
 * @param {string} variant - Layout variant (A, B, or C)
 * @returns {string} Menu style ID
 */
function getMenuStyleId(industryId, variant = 'A') {
  const industryMapping = INDUSTRY_MENU_STYLES[industryId];
  if (!industryMapping) return 'photo-grid';
  return industryMapping[variant] || industryMapping['A'] || 'photo-grid';
}

/**
 * Get all available menu styles
 * @returns {object} All menu style configs
 */
function getAllMenuStyles() {
  return MENU_STYLES;
}

/**
 * Get menu style config by ID
 * @param {string} styleId - Menu style identifier
 * @returns {object} Menu style config or null
 */
function getMenuStyleById(styleId) {
  return MENU_STYLES[styleId] ? { ...MENU_STYLES[styleId], id: styleId } : null;
}

/**
 * Build structural page config from variant
 * This returns a complete config that can be passed to the structural generator
 */
function buildStructuralConfig(industryId, variant = 'A', businessData = {}) {
  const industry = INDUSTRY_DESIGN_RESEARCH[industryId];
  if (!industry) {
    console.warn(`Unknown industry: ${industryId}, using pizza-restaurant as fallback`);
    return buildStructuralConfig('pizza-restaurant', variant, businessData);
  }

  const variantConfig = industry.layoutVariants[variant];
  if (!variantConfig) {
    console.warn(`Unknown variant: ${variant}, using A`);
    return buildStructuralConfig(industryId, 'A', businessData);
  }

  return {
    industry: {
      id: industryId,
      name: industry.name,
      styleNote: industry.styleNote
    },
    variant: {
      key: variant,
      name: variantConfig.name,
      reference: variantConfig.reference,
      description: variantConfig.description,
      mood: variantConfig.mood
    },
    hero: {
      type: variantConfig.heroType,
      component: getHeroComponent(variantConfig.heroType),
      config: variantConfig.heroConfig || {}
    },
    sections: variantConfig.sections.map(s => ({
      type: s.type,
      component: getSectionComponent(s.type),
      config: s.config || {}
    })),
    features: variantConfig.features || [],
    winningElements: industry.winningElements || [],
    colorGuidance: industry.colorGuidance || {},
    businessData
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  INDUSTRY_DESIGN_RESEARCH,
  HERO_TYPES,
  SECTION_TYPES,
  MENU_STYLES,
  INDUSTRY_MENU_STYLES,
  getAvailableIndustries,
  getIndustryResearch,
  getLayoutVariant,
  getAllVariants,
  getHeroComponent,
  getSectionComponent,
  getWinningElements,
  getColorGuidance,
  getMenuStyle,
  getMenuStyleId,
  getAllMenuStyles,
  getMenuStyleById,
  buildStructuralConfig
};
