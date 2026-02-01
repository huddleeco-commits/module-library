/**
 * Industry-Specific Layout Configurations
 *
 * Maps each industry to:
 * 1. Available layout variants (3 per industry)
 * 2. Style configurations for each variant
 * 3. Section emphasis and ordering
 * 4. Color palette recommendations
 *
 * This enables: SAME fixture data → DIFFERENT visual experiences
 * Zero AI cost for layout switching
 */

const INDUSTRY_LAYOUTS = {
  // ===============================================
  // HEALTHCARE & MEDICAL
  // ===============================================
  healthcare: {
    layouts: {
      'patient-focused': {
        name: 'Patient Focused',
        description: 'Warm, welcoming design emphasizing easy booking and comfort',
        style: {
          heroStyle: 'centered',
          cardStyle: 'rounded',
          borderRadius: '16px',
          shadows: 'soft',
          spacing: 'comfortable'
        },
        emphasis: ['booking', 'testimonials', 'comfort', 'accessibility'],
        sectionOrder: {
          home: ['hero', 'quick-actions', 'services-preview', 'testimonials', 'stats', 'insurance', 'cta'],
          services: ['hero', 'category-tabs', 'service-grid', 'process', 'cta'],
          about: ['hero', 'mission', 'values', 'team', 'certifications', 'cta']
        }
      },
      'medical-professional': {
        name: 'Medical Professional',
        description: 'Clean, clinical design emphasizing credentials and expertise',
        style: {
          heroStyle: 'split',
          cardStyle: 'bordered',
          borderRadius: '8px',
          shadows: 'minimal',
          spacing: 'structured'
        },
        emphasis: ['credentials', 'expertise', 'statistics', 'technology'],
        sectionOrder: {
          home: ['hero', 'stats', 'services-preview', 'providers-preview', 'certifications', 'insurance', 'cta'],
          services: ['hero', 'service-list', 'credentials', 'technology', 'cta'],
          about: ['hero', 'story', 'certifications', 'team', 'stats', 'cta']
        }
      },
      'clinical-dashboard': {
        name: 'Clinical Dashboard',
        description: 'Data-focused design with quick access to patient tools',
        style: {
          heroStyle: 'minimal',
          cardStyle: 'flat',
          borderRadius: '4px',
          shadows: 'none',
          spacing: 'compact'
        },
        emphasis: ['efficiency', 'data', 'quick-access', 'portal'],
        sectionOrder: {
          home: ['hero-compact', 'portal-actions', 'quick-stats', 'services-grid', 'contact-bar'],
          services: ['search-filter', 'service-table', 'booking-sidebar'],
          about: ['hero-minimal', 'facts', 'team-list', 'contact']
        }
      }
    },
    defaultLayout: 'patient-focused',
    colorPalettes: {
      'patient-focused': { primary: '#059669', secondary: '#10B981', accent: '#34D399' },
      'medical-professional': { primary: '#0284C7', secondary: '#0EA5E9', accent: '#38BDF8' },
      'clinical-dashboard': { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA' }
    }
  },

  dental: {
    layouts: {
      'family-friendly': {
        name: 'Family Friendly',
        description: 'Approachable design for all ages, emphasizing comfort',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '20px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['family', 'comfort', 'gentle-care', 'kids'],
        sectionOrder: { home: ['hero', 'services-preview', 'team', 'testimonials', 'insurance', 'cta'] }
      },
      'modern-cosmetic': {
        name: 'Modern Cosmetic',
        description: 'Sleek design highlighting cosmetic and aesthetic services',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['cosmetic', 'technology', 'before-after', 'results'],
        sectionOrder: { home: ['hero', 'before-after', 'services', 'technology', 'testimonials', 'cta'] }
      },
      'clinical-efficient': {
        name: 'Clinical Efficient',
        description: 'Professional design focused on appointments and procedures',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['efficiency', 'procedures', 'booking', 'insurance'],
        sectionOrder: { home: ['hero-compact', 'booking-widget', 'services-list', 'insurance', 'contact'] }
      }
    },
    defaultLayout: 'family-friendly',
    colorPalettes: {
      'family-friendly': { primary: '#0D9488', secondary: '#14B8A6', accent: '#5EEAD4' },
      'modern-cosmetic': { primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD' },
      'clinical-efficient': { primary: '#6366F1', secondary: '#818CF8', accent: '#A5B4FC' }
    }
  },

  // ===============================================
  // FOOD & BEVERAGE
  // ===============================================
  'pizza-restaurant': {
    layouts: {
      'family-fun': {
        name: 'Family Fun',
        description: 'Playful design with bold colors and easy ordering',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '20px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['menu', 'ordering', 'specials', 'family'],
        sectionOrder: { home: ['hero', 'specials', 'menu-preview', 'reviews', 'location', 'cta'] }
      },
      'artisan-craft': {
        name: 'Artisan Craft',
        description: 'Sophisticated design highlighting quality ingredients',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['ingredients', 'craft', 'story', 'quality'],
        sectionOrder: { home: ['hero', 'story', 'ingredients', 'menu', 'reviews', 'cta'] }
      },
      'quick-order': {
        name: 'Quick Order',
        description: 'Efficient design optimized for online ordering',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['ordering', 'speed', 'deals', 'delivery'],
        sectionOrder: { home: ['hero-compact', 'order-widget', 'deals', 'menu-grid', 'delivery-info'] }
      }
    },
    defaultLayout: 'family-fun',
    colorPalettes: {
      'family-fun': { primary: '#DC2626', secondary: '#F97316', accent: '#FBBF24' },
      'artisan-craft': { primary: '#92400E', secondary: '#B45309', accent: '#D97706' },
      'quick-order': { primary: '#E11D48', secondary: '#F43F5E', accent: '#FB7185' }
    }
  },

  steakhouse: {
    layouts: {
      'luxury-dining': {
        name: 'Luxury Dining',
        description: 'Elegant dark theme showcasing premium cuts',
        style: { heroStyle: 'fullscreen', cardStyle: 'bordered', borderRadius: '4px', shadows: 'dramatic', spacing: 'spacious' },
        emphasis: ['ambiance', 'cuts', 'wine', 'experience'],
        sectionOrder: { home: ['hero-fullscreen', 'signature-dishes', 'wine-list', 'private-dining', 'reviews', 'cta'] }
      },
      'rustic-grill': {
        name: 'Rustic Grill',
        description: 'Warm wood tones emphasizing tradition and quality',
        style: { heroStyle: 'split', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['tradition', 'quality', 'cuts', 'atmosphere'],
        sectionOrder: { home: ['hero', 'our-story', 'menu-highlights', 'butcher-cuts', 'reviews', 'reservations'] }
      },
      'modern-chophouse': {
        name: 'Modern Chophouse',
        description: 'Contemporary design with clean lines',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '0', shadows: 'none', spacing: 'structured' },
        emphasis: ['modern', 'menu', 'chef', 'reservations'],
        sectionOrder: { home: ['hero-minimal', 'featured', 'menu', 'chef-section', 'reservations'] }
      }
    },
    defaultLayout: 'luxury-dining',
    colorPalettes: {
      'luxury-dining': { primary: '#1F1F1F', secondary: '#991B1B', accent: '#B91C1C' },
      'rustic-grill': { primary: '#78350F', secondary: '#92400E', accent: '#B45309' },
      'modern-chophouse': { primary: '#18181B', secondary: '#27272A', accent: '#71717A' }
    }
  },

  'coffee-cafe': {
    layouts: {
      'cozy-warmth': {
        name: 'Cozy Warmth',
        description: 'Warm, inviting design with earthy tones',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '16px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['atmosphere', 'menu', 'community', 'warmth'],
        sectionOrder: { home: ['hero', 'featured-drinks', 'menu-preview', 'story', 'hours-location', 'cta'] }
      },
      'modern-minimal': {
        name: 'Modern Minimal',
        description: 'Clean Scandinavian-inspired design',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['coffee', 'sourcing', 'quality', 'craft'],
        sectionOrder: { home: ['hero', 'coffee-sourcing', 'menu', 'brewing-methods', 'location'] }
      },
      'quick-grab': {
        name: 'Quick Grab',
        description: 'Efficient design for mobile ordering',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['ordering', 'loyalty', 'speed', 'pickup'],
        sectionOrder: { home: ['hero-compact', 'order-now', 'rewards', 'menu-grid', 'locations'] }
      }
    },
    defaultLayout: 'cozy-warmth',
    colorPalettes: {
      'cozy-warmth': { primary: '#78350F', secondary: '#92400E', accent: '#F59E0B' },
      'modern-minimal': { primary: '#1F2937', secondary: '#374151', accent: '#9CA3AF' },
      'quick-grab': { primary: '#047857', secondary: '#059669', accent: '#34D399' }
    }
  },

  restaurant: {
    layouts: {
      'farm-fresh': {
        name: 'Farm Fresh',
        description: 'Organic feel highlighting local ingredients',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['farm', 'local', 'seasonal', 'fresh'],
        sectionOrder: { home: ['hero', 'farm-partners', 'seasonal-menu', 'chef', 'reviews', 'reservations'] }
      },
      'elegant-dining': {
        name: 'Elegant Dining',
        description: 'Sophisticated design for upscale experience',
        style: { heroStyle: 'fullscreen', cardStyle: 'bordered', borderRadius: '4px', shadows: 'minimal', spacing: 'spacious' },
        emphasis: ['experience', 'tasting-menu', 'wine', 'ambiance'],
        sectionOrder: { home: ['hero-fullscreen', 'philosophy', 'tasting-menu', 'wine-pairings', 'reviews', 'cta'] }
      },
      'neighborhood-bistro': {
        name: 'Neighborhood Bistro',
        description: 'Friendly approachable design',
        style: { heroStyle: 'split', cardStyle: 'rounded', borderRadius: '16px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['community', 'daily-specials', 'atmosphere', 'family'],
        sectionOrder: { home: ['hero', 'daily-specials', 'menu', 'events', 'location', 'cta'] }
      }
    },
    defaultLayout: 'farm-fresh',
    colorPalettes: {
      'farm-fresh': { primary: '#166534', secondary: '#15803D', accent: '#22C55E' },
      'elegant-dining': { primary: '#1E1B18', secondary: '#44403C', accent: '#A8A29E' },
      'neighborhood-bistro': { primary: '#0369A1', secondary: '#0284C7', accent: '#38BDF8' }
    }
  },

  bakery: {
    layouts: {
      'artisan-charm': {
        name: 'Artisan Charm',
        description: 'Rustic warmth highlighting handcrafted goods',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '20px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['handmade', 'tradition', 'fresh-daily', 'craft'],
        sectionOrder: { home: ['hero', 'fresh-today', 'signature-items', 'story', 'custom-orders', 'cta'] }
      },
      'modern-patisserie': {
        name: 'Modern Patisserie',
        description: 'Elegant French-inspired design',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['elegance', 'technique', 'seasonal', 'custom'],
        sectionOrder: { home: ['hero', 'collections', 'seasonal-specials', 'custom-cakes', 'reviews'] }
      },
      'sweet-simple': {
        name: 'Sweet & Simple',
        description: 'Clean design for quick ordering',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['ordering', 'menu', 'catering', 'pickup'],
        sectionOrder: { home: ['hero-compact', 'order-widget', 'menu-grid', 'catering', 'locations'] }
      }
    },
    defaultLayout: 'artisan-charm',
    colorPalettes: {
      'artisan-charm': { primary: '#92400E', secondary: '#B45309', accent: '#FBBF24' },
      'modern-patisserie': { primary: '#831843', secondary: '#9D174D', accent: '#DB2777' },
      'sweet-simple': { primary: '#DC2626', secondary: '#EF4444', accent: '#FCA5A5' }
    }
  },

  // ===============================================
  // BEAUTY & WELLNESS
  // ===============================================
  'salon-spa': {
    layouts: {
      'luxury-retreat': {
        name: 'Luxury Retreat',
        description: 'Elegant spa-like design emphasizing relaxation',
        style: { heroStyle: 'fullscreen', cardStyle: 'rounded', borderRadius: '16px', shadows: 'soft', spacing: 'spacious' },
        emphasis: ['relaxation', 'services', 'experience', 'booking'],
        sectionOrder: { home: ['hero-fullscreen', 'featured-services', 'packages', 'team', 'testimonials', 'cta'] }
      },
      'modern-beauty': {
        name: 'Modern Beauty',
        description: 'Trendy design highlighting services and team',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['services', 'team', 'portfolio', 'booking'],
        sectionOrder: { home: ['hero', 'services', 'team-preview', 'gallery', 'reviews', 'booking'] }
      },
      'quick-book': {
        name: 'Quick Book',
        description: 'Efficient design optimized for appointments',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['booking', 'services', 'prices', 'availability'],
        sectionOrder: { home: ['hero-compact', 'booking-widget', 'services-list', 'prices', 'contact'] }
      }
    },
    defaultLayout: 'luxury-retreat',
    colorPalettes: {
      'luxury-retreat': { primary: '#831843', secondary: '#9D174D', accent: '#F9A8D4' },
      'modern-beauty': { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#C4B5FD' },
      'quick-book': { primary: '#0D9488', secondary: '#14B8A6', accent: '#5EEAD4' }
    }
  },

  'fitness-gym': {
    layouts: {
      'bold-energy': {
        name: 'Bold Energy',
        description: 'High-energy design with bold colors and dynamic elements',
        style: { heroStyle: 'fullscreen', cardStyle: 'angular', borderRadius: '4px', shadows: 'dramatic', spacing: 'structured' },
        emphasis: ['motivation', 'classes', 'results', 'community'],
        sectionOrder: { home: ['hero-fullscreen', 'classes', 'trainers', 'transformation', 'membership', 'cta'] }
      },
      'modern-wellness': {
        name: 'Modern Wellness',
        description: 'Balanced design emphasizing overall wellness',
        style: { heroStyle: 'split', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['wellness', 'programs', 'nutrition', 'balance'],
        sectionOrder: { home: ['hero', 'programs', 'wellness-approach', 'trainers', 'testimonials', 'membership'] }
      },
      'functional-focused': {
        name: 'Functional Focused',
        description: 'Clean design highlighting equipment and facilities',
        style: { heroStyle: 'minimal', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'compact' },
        emphasis: ['facilities', 'equipment', 'hours', 'membership'],
        sectionOrder: { home: ['hero-compact', 'facilities', 'class-schedule', 'membership-tiers', 'contact'] }
      }
    },
    defaultLayout: 'bold-energy',
    colorPalettes: {
      'bold-energy': { primary: '#DC2626', secondary: '#EF4444', accent: '#FCA5A5' },
      'modern-wellness': { primary: '#059669', secondary: '#10B981', accent: '#6EE7B7' },
      'functional-focused': { primary: '#1F2937', secondary: '#374151', accent: '#6B7280' }
    }
  },

  yoga: {
    layouts: {
      'serene-zen': {
        name: 'Serene Zen',
        description: 'Peaceful design with natural elements',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '24px', shadows: 'soft', spacing: 'spacious' },
        emphasis: ['peace', 'classes', 'teachers', 'community'],
        sectionOrder: { home: ['hero', 'philosophy', 'classes', 'teachers', 'schedule', 'cta'] }
      },
      'modern-flow': {
        name: 'Modern Flow',
        description: 'Contemporary design balancing tradition and modernity',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['styles', 'schedule', 'workshops', 'community'],
        sectionOrder: { home: ['hero', 'styles', 'schedule', 'workshops', 'testimonials', 'membership'] }
      },
      'active-practice': {
        name: 'Active Practice',
        description: 'Dynamic design for fitness-focused yoga',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['classes', 'schedule', 'pricing', 'booking'],
        sectionOrder: { home: ['hero-compact', 'class-types', 'schedule-widget', 'pricing', 'contact'] }
      }
    },
    defaultLayout: 'serene-zen',
    colorPalettes: {
      'serene-zen': { primary: '#0D9488', secondary: '#14B8A6', accent: '#99F6E4' },
      'modern-flow': { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#C4B5FD' },
      'active-practice': { primary: '#EA580C', secondary: '#F97316', accent: '#FDBA74' }
    }
  },

  barbershop: {
    layouts: {
      'classic-heritage': {
        name: 'Classic Heritage',
        description: 'Traditional barbershop aesthetic with vintage charm',
        style: { heroStyle: 'centered', cardStyle: 'bordered', borderRadius: '8px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['tradition', 'services', 'barbers', 'experience'],
        sectionOrder: { home: ['hero', 'services', 'barbers', 'gallery', 'testimonials', 'booking'] }
      },
      'modern-grooming': {
        name: 'Modern Grooming',
        description: 'Contemporary design for the modern gentleman',
        style: { heroStyle: 'split', cardStyle: 'rounded', borderRadius: '12px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['grooming', 'products', 'team', 'booking'],
        sectionOrder: { home: ['hero', 'services', 'products', 'team', 'reviews', 'cta'] }
      },
      'quick-cuts': {
        name: 'Quick Cuts',
        description: 'Efficient design focused on easy booking',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['booking', 'services', 'prices', 'location'],
        sectionOrder: { home: ['hero-compact', 'booking-widget', 'services-prices', 'location', 'hours'] }
      }
    },
    defaultLayout: 'classic-heritage',
    colorPalettes: {
      'classic-heritage': { primary: '#1F2937', secondary: '#374151', accent: '#B91C1C' },
      'modern-grooming': { primary: '#0F172A', secondary: '#1E293B', accent: '#0EA5E9' },
      'quick-cuts': { primary: '#18181B', secondary: '#27272A', accent: '#22C55E' }
    }
  },

  // ===============================================
  // PROFESSIONAL SERVICES
  // ===============================================
  'law-firm': {
    layouts: {
      'trust-authority': {
        name: 'Trust & Authority',
        description: 'Traditional design emphasizing experience and results',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '4px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['expertise', 'results', 'team', 'testimonials'],
        sectionOrder: { home: ['hero', 'practice-areas', 'results', 'attorneys', 'testimonials', 'contact'] }
      },
      'modern-practice': {
        name: 'Modern Practice',
        description: 'Contemporary design for approachable legal services',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['accessibility', 'areas', 'process', 'consultation'],
        sectionOrder: { home: ['hero', 'how-we-help', 'practice-areas', 'team', 'process', 'cta'] }
      },
      'results-focused': {
        name: 'Results Focused',
        description: 'Data-driven design highlighting case outcomes',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '0', shadows: 'none', spacing: 'compact' },
        emphasis: ['results', 'stats', 'cases', 'consultation'],
        sectionOrder: { home: ['hero-compact', 'stats', 'practice-areas', 'case-results', 'contact-form'] }
      }
    },
    defaultLayout: 'trust-authority',
    colorPalettes: {
      'trust-authority': { primary: '#1E3A5F', secondary: '#2563EB', accent: '#3B82F6' },
      'modern-practice': { primary: '#0F766E', secondary: '#14B8A6', accent: '#2DD4BF' },
      'results-focused': { primary: '#18181B', secondary: '#27272A', accent: '#A1A1AA' }
    }
  },

  'real-estate': {
    layouts: {
      'luxury-properties': {
        name: 'Luxury Properties',
        description: 'High-end design showcasing premium listings',
        style: { heroStyle: 'fullscreen', cardStyle: 'bordered', borderRadius: '4px', shadows: 'dramatic', spacing: 'spacious' },
        emphasis: ['listings', 'luxury', 'agent', 'experience'],
        sectionOrder: { home: ['hero-fullscreen', 'featured-listings', 'neighborhoods', 'agent', 'testimonials', 'contact'] }
      },
      'modern-search': {
        name: 'Modern Search',
        description: 'Search-focused design for easy property discovery',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['search', 'listings', 'tools', 'resources'],
        sectionOrder: { home: ['hero-search', 'featured', 'neighborhoods', 'tools', 'testimonials', 'cta'] }
      },
      'local-expert': {
        name: 'Local Expert',
        description: 'Community-focused design highlighting local expertise',
        style: { heroStyle: 'split', cardStyle: 'rounded', borderRadius: '16px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['community', 'expertise', 'listings', 'guides'],
        sectionOrder: { home: ['hero', 'featured', 'area-guides', 'about-agent', 'reviews', 'contact'] }
      }
    },
    defaultLayout: 'luxury-properties',
    colorPalettes: {
      'luxury-properties': { primary: '#1F2937', secondary: '#B8860B', accent: '#D4AF37' },
      'modern-search': { primary: '#0369A1', secondary: '#0284C7', accent: '#38BDF8' },
      'local-expert': { primary: '#166534', secondary: '#15803D', accent: '#22C55E' }
    }
  },

  plumber: {
    layouts: {
      'trust-service': {
        name: 'Trust & Service',
        description: 'Reliable design emphasizing trust and availability',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['emergency', 'services', 'trust', 'testimonials'],
        sectionOrder: { home: ['hero', 'emergency-banner', 'services', 'why-choose-us', 'testimonials', 'contact'] }
      },
      'professional-clean': {
        name: 'Professional Clean',
        description: 'Clean design highlighting expertise and licensing',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['licensing', 'services', 'process', 'pricing'],
        sectionOrder: { home: ['hero', 'credentials', 'services', 'process', 'pricing', 'contact'] }
      },
      'quick-call': {
        name: 'Quick Call',
        description: 'Action-focused design for immediate service',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['call-now', 'emergency', 'services', 'areas'],
        sectionOrder: { home: ['hero-emergency', 'call-widget', 'services-list', 'service-areas', 'hours'] }
      }
    },
    defaultLayout: 'trust-service',
    colorPalettes: {
      'trust-service': { primary: '#0369A1', secondary: '#0284C7', accent: '#38BDF8' },
      'professional-clean': { primary: '#1E3A5F', secondary: '#2563EB', accent: '#60A5FA' },
      'quick-call': { primary: '#DC2626', secondary: '#EF4444', accent: '#FCA5A5' }
    }
  },

  cleaning: {
    layouts: {
      'fresh-clean': {
        name: 'Fresh & Clean',
        description: 'Bright design emphasizing cleanliness and trust',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '16px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['cleanliness', 'services', 'trust', 'booking'],
        sectionOrder: { home: ['hero', 'services', 'why-choose-us', 'process', 'testimonials', 'booking'] }
      },
      'eco-friendly': {
        name: 'Eco-Friendly',
        description: 'Natural design highlighting green cleaning',
        style: { heroStyle: 'split', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['eco', 'products', 'health', 'sustainability'],
        sectionOrder: { home: ['hero', 'eco-commitment', 'services', 'products', 'testimonials', 'cta'] }
      },
      'quick-quote': {
        name: 'Quick Quote',
        description: 'Conversion-focused design for instant quotes',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['quote', 'pricing', 'services', 'booking'],
        sectionOrder: { home: ['hero-compact', 'quote-calculator', 'services', 'pricing', 'contact'] }
      }
    },
    defaultLayout: 'fresh-clean',
    colorPalettes: {
      'fresh-clean': { primary: '#0891B2', secondary: '#06B6D4', accent: '#67E8F9' },
      'eco-friendly': { primary: '#166534', secondary: '#15803D', accent: '#4ADE80' },
      'quick-quote': { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA' }
    }
  },

  'auto-shop': {
    layouts: {
      'trusted-mechanic': {
        name: 'Trusted Mechanic',
        description: 'Reliable design emphasizing expertise and honesty',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['trust', 'certifications', 'services', 'reviews'],
        sectionOrder: { home: ['hero', 'certifications', 'services', 'why-choose-us', 'testimonials', 'contact'] }
      },
      'modern-auto': {
        name: 'Modern Auto',
        description: 'Contemporary design for tech-savvy customers',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'structured' },
        emphasis: ['technology', 'services', 'booking', 'transparency'],
        sectionOrder: { home: ['hero', 'services', 'technology', 'pricing', 'reviews', 'booking'] }
      },
      'quick-service': {
        name: 'Quick Service',
        description: 'Efficient design for fast appointments',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['booking', 'services', 'pricing', 'location'],
        sectionOrder: { home: ['hero-compact', 'booking-widget', 'services-prices', 'hours', 'location'] }
      }
    },
    defaultLayout: 'trusted-mechanic',
    colorPalettes: {
      'trusted-mechanic': { primary: '#1E40AF', secondary: '#2563EB', accent: '#60A5FA' },
      'modern-auto': { primary: '#DC2626', secondary: '#EF4444', accent: '#FCA5A5' },
      'quick-service': { primary: '#16A34A', secondary: '#22C55E', accent: '#86EFAC' }
    }
  },

  // ===============================================
  // TECH & EDUCATION
  // ===============================================
  saas: {
    layouts: {
      'enterprise-trust': {
        name: 'Enterprise Trust',
        description: 'Professional design for B2B SaaS products',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['features', 'integrations', 'security', 'enterprise'],
        sectionOrder: { home: ['hero', 'logos', 'features', 'integrations', 'security', 'pricing', 'cta'] }
      },
      'modern-startup': {
        name: 'Modern Startup',
        description: 'Bold design for innovative products',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '16px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['innovation', 'demo', 'features', 'testimonials'],
        sectionOrder: { home: ['hero', 'demo-video', 'features', 'how-it-works', 'testimonials', 'pricing'] }
      },
      'conversion-focused': {
        name: 'Conversion Focused',
        description: 'Optimized design for signups and trials',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['signup', 'trial', 'features', 'pricing'],
        sectionOrder: { home: ['hero-signup', 'features-grid', 'comparison', 'pricing', 'faq'] }
      }
    },
    defaultLayout: 'modern-startup',
    colorPalettes: {
      'enterprise-trust': { primary: '#1E40AF', secondary: '#3B82F6', accent: '#60A5FA' },
      'modern-startup': { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA' },
      'conversion-focused': { primary: '#059669', secondary: '#10B981', accent: '#34D399' }
    }
  },

  ecommerce: {
    layouts: {
      'boutique-luxury': {
        name: 'Boutique Luxury',
        description: 'High-end design for premium products',
        style: { heroStyle: 'fullscreen', cardStyle: 'bordered', borderRadius: '0', shadows: 'minimal', spacing: 'spacious' },
        emphasis: ['products', 'story', 'quality', 'experience'],
        sectionOrder: { home: ['hero-fullscreen', 'featured-collection', 'story', 'categories', 'instagram', 'newsletter'] }
      },
      'modern-shop': {
        name: 'Modern Shop',
        description: 'Clean design optimized for browsing',
        style: { heroStyle: 'split', cardStyle: 'rounded', borderRadius: '12px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['products', 'categories', 'deals', 'reviews'],
        sectionOrder: { home: ['hero', 'categories', 'featured', 'deals', 'reviews', 'newsletter'] }
      },
      'fast-checkout': {
        name: 'Fast Checkout',
        description: 'Conversion-optimized design',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['deals', 'products', 'cart', 'checkout'],
        sectionOrder: { home: ['hero-deals', 'trending', 'categories-grid', 'deals', 'recently-viewed'] }
      }
    },
    defaultLayout: 'modern-shop',
    colorPalettes: {
      'boutique-luxury': { primary: '#1F1F1F', secondary: '#44403C', accent: '#D4AF37' },
      'modern-shop': { primary: '#0369A1', secondary: '#0284C7', accent: '#38BDF8' },
      'fast-checkout': { primary: '#DC2626', secondary: '#EF4444', accent: '#FCA5A5' }
    }
  },

  school: {
    layouts: {
      'academic-excellence': {
        name: 'Academic Excellence',
        description: 'Traditional design emphasizing achievements',
        style: { heroStyle: 'split', cardStyle: 'bordered', borderRadius: '8px', shadows: 'minimal', spacing: 'structured' },
        emphasis: ['academics', 'achievements', 'faculty', 'programs'],
        sectionOrder: { home: ['hero', 'stats', 'programs', 'faculty', 'achievements', 'apply'] }
      },
      'vibrant-community': {
        name: 'Vibrant Community',
        description: 'Energetic design highlighting student life',
        style: { heroStyle: 'centered', cardStyle: 'rounded', borderRadius: '16px', shadows: 'soft', spacing: 'comfortable' },
        emphasis: ['community', 'activities', 'events', 'culture'],
        sectionOrder: { home: ['hero', 'upcoming-events', 'programs', 'student-life', 'testimonials', 'apply'] }
      },
      'info-focused': {
        name: 'Info Focused',
        description: 'Practical design for easy navigation',
        style: { heroStyle: 'minimal', cardStyle: 'flat', borderRadius: '4px', shadows: 'none', spacing: 'compact' },
        emphasis: ['admissions', 'programs', 'calendar', 'portal'],
        sectionOrder: { home: ['hero-compact', 'quick-links', 'announcements', 'programs', 'calendar', 'contact'] }
      }
    },
    defaultLayout: 'vibrant-community',
    colorPalettes: {
      'academic-excellence': { primary: '#1E3A5F', secondary: '#1E40AF', accent: '#3B82F6' },
      'vibrant-community': { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#C4B5FD' },
      'info-focused': { primary: '#0F766E', secondary: '#14B8A6', accent: '#2DD4BF' }
    }
  }
};

/**
 * Get layouts for a specific industry
 */
function getIndustryLayouts(industry) {
  const normalized = normalizeIndustry(industry);
  return INDUSTRY_LAYOUTS[normalized] || INDUSTRY_LAYOUTS.healthcare;
}

/**
 * Get a specific layout for an industry
 */
function getIndustryLayout(industry, layoutId) {
  const industryConfig = getIndustryLayouts(industry);
  return industryConfig.layouts[layoutId] || industryConfig.layouts[industryConfig.defaultLayout];
}

/**
 * Get all available layout variants for an industry
 */
function getAvailableIndustryLayouts(industry) {
  const industryConfig = getIndustryLayouts(industry);
  return Object.entries(industryConfig.layouts).map(([id, layout]) => ({
    id,
    ...layout,
    isDefault: id === industryConfig.defaultLayout
  }));
}

/**
 * Get recommended layout for an industry
 */
function getRecommendedLayout(industry) {
  const industryConfig = getIndustryLayouts(industry);
  return industryConfig.defaultLayout;
}

/**
 * Normalize industry name for lookup
 */
function normalizeIndustry(industry) {
  if (!industry) return 'healthcare';

  const normalized = industry.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Handle common variations
  const aliases = {
    'medical': 'healthcare',
    'clinic': 'healthcare',
    'hospital': 'healthcare',
    'doctor': 'healthcare',
    'dentist': 'dental',
    'pizzeria': 'pizza-restaurant',
    'pizza': 'pizza-restaurant',
    'cafe': 'coffee-cafe',
    'coffee': 'coffee-cafe',
    'coffeeshop': 'coffee-cafe',
    'spa': 'salon-spa',
    'salon': 'salon-spa',
    'beauty': 'salon-spa',
    'gym': 'fitness-gym',
    'fitness': 'fitness-gym',
    'barber': 'barbershop',
    'lawyer': 'law-firm',
    'attorney': 'law-firm',
    'legal': 'law-firm',
    'realtor': 'real-estate',
    'realestate': 'real-estate',
    'plumbing': 'plumber',
    'mechanic': 'auto-shop',
    'automotive': 'auto-shop',
    'auto': 'auto-shop',
    'software': 'saas',
    'tech': 'saas',
    'shop': 'ecommerce',
    'store': 'ecommerce',
    'retail': 'ecommerce',
    'academy': 'school',
    'education': 'school'
  };

  return aliases[normalized] || normalized;
}

module.exports = {
  INDUSTRY_LAYOUTS,
  getIndustryLayouts,
  getIndustryLayout,
  getAvailableIndustryLayouts,
  getRecommendedLayout,
  normalizeIndustry
};
