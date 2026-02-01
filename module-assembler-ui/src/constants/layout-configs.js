/**
 * Layout Configurations by Industry
 * Each layout defines visual style and section arrangement
 */

export const LAYOUT_CONFIGS = {
  fitness: {
    'athlete-focused': {
      id: 'athlete-focused',
      name: 'Athlete Focused',
      description: 'Bold, high-energy design for performance gyms and CrossFit boxes',
      preview: {
        heroStyle: 'fullscreen',
        colorIntensity: 'high',
        typography: 'bold',
        spacing: 'compact'
      },
      sections: {
        home: ['hero-fullscreen', 'stats-bar', 'classes-grid', 'trainers-carousel', 'testimonials', 'cta-bold'],
        classes: ['hero-banner', 'filter-tabs', 'classes-grid', 'cta-join'],
        membership: ['hero-banner', 'pricing-cards', 'features-compare', 'faq', 'cta']
      }
    },
    'wellness-centered': {
      id: 'wellness-centered',
      name: 'Wellness Centered',
      description: 'Calm, balanced design for yoga studios and wellness centers',
      preview: {
        heroStyle: 'split',
        colorIntensity: 'soft',
        typography: 'elegant',
        spacing: 'spacious'
      },
      sections: {
        home: ['hero-split', 'philosophy', 'classes-cards', 'instructors', 'testimonials-minimal', 'cta-soft'],
        classes: ['hero-minimal', 'class-categories', 'schedule-weekly', 'cta-book'],
        membership: ['hero-minimal', 'pricing-simple', 'benefits-list', 'faq', 'cta-soft']
      }
    },
    'community-driven': {
      id: 'community-driven',
      name: 'Community Driven',
      description: 'Social proof heavy, member stories and community focus',
      preview: {
        heroStyle: 'video',
        colorIntensity: 'medium',
        typography: 'friendly',
        spacing: 'balanced'
      },
      sections: {
        home: ['hero-video', 'member-stories', 'stats-impact', 'classes-featured', 'community-gallery', 'join-cta'],
        classes: ['hero-community', 'class-schedule', 'trainer-spotlights', 'member-reviews'],
        membership: ['hero-community', 'membership-tiers', 'member-benefits', 'success-stories', 'cta']
      }
    }
  },

  restaurant: {
    'classic-elegant': {
      id: 'classic-elegant',
      name: 'Classic Elegant',
      description: 'Sophisticated design for fine dining and upscale restaurants',
      preview: {
        heroStyle: 'fullscreen-image',
        colorIntensity: 'muted',
        typography: 'serif',
        spacing: 'luxurious'
      },
      sections: {
        home: ['hero-fullscreen', 'intro-story', 'menu-highlights', 'ambiance-gallery', 'reservations-cta'],
        menu: ['hero-minimal', 'menu-categories', 'wine-list', 'chefs-specials'],
        about: ['story-timeline', 'chef-profile', 'awards', 'press']
      }
    },
    'modern-casual': {
      id: 'modern-casual',
      name: 'Modern Casual',
      description: 'Fresh, approachable design for cafes and casual dining',
      preview: {
        heroStyle: 'split',
        colorIntensity: 'vibrant',
        typography: 'sans-serif',
        spacing: 'balanced'
      },
      sections: {
        home: ['hero-split', 'specials-carousel', 'menu-preview', 'instagram-feed', 'location-hours'],
        menu: ['menu-visual-grid', 'dietary-filters', 'order-online-cta'],
        about: ['story-casual', 'team-grid', 'values', 'community']
      }
    },
    'fast-fresh': {
      id: 'fast-fresh',
      name: 'Fast & Fresh',
      description: 'Quick-service focused with online ordering emphasis',
      preview: {
        heroStyle: 'action',
        colorIntensity: 'high',
        typography: 'bold',
        spacing: 'compact'
      },
      sections: {
        home: ['hero-order-cta', 'menu-quick-view', 'specials', 'locations', 'app-download'],
        menu: ['menu-order-grid', 'combos', 'nutrition-info'],
        about: ['brand-story', 'ingredients', 'sustainability']
      }
    }
  },

  salon: {
    'luxury-spa': {
      id: 'luxury-spa',
      name: 'Luxury Spa',
      description: 'Premium, serene design for high-end salons and spas',
      preview: {
        heroStyle: 'ambient',
        colorIntensity: 'soft',
        typography: 'elegant',
        spacing: 'luxurious'
      },
      sections: {
        home: ['hero-ambient', 'services-elegant', 'experience', 'team-portraits', 'testimonials', 'book-cta'],
        services: ['service-categories', 'pricing-elegant', 'add-ons'],
        team: ['stylist-profiles', 'specialties', 'booking-individual']
      }
    },
    'trendy-modern': {
      id: 'trendy-modern',
      name: 'Trendy Modern',
      description: 'Fashion-forward design for contemporary salons',
      preview: {
        heroStyle: 'bold',
        colorIntensity: 'medium',
        typography: 'modern',
        spacing: 'dynamic'
      },
      sections: {
        home: ['hero-bold', 'services-grid', 'portfolio-masonry', 'stylists', 'social-proof', 'book-now'],
        services: ['services-visual', 'trending', 'pricing-transparent'],
        gallery: ['portfolio-filterable', 'before-after', 'instagram']
      }
    },
    'neighborhood-friendly': {
      id: 'neighborhood-friendly',
      name: 'Neighborhood Friendly',
      description: 'Warm, welcoming design for local salons and barbershops',
      preview: {
        heroStyle: 'welcoming',
        colorIntensity: 'warm',
        typography: 'friendly',
        spacing: 'comfortable'
      },
      sections: {
        home: ['hero-welcoming', 'services-simple', 'meet-team', 'reviews-local', 'location-prominent'],
        services: ['services-list', 'pricing-clear', 'walk-ins-welcome'],
        about: ['our-story', 'community', 'reviews']
      }
    }
  },

  professional: {
    'corporate-trust': {
      id: 'corporate-trust',
      name: 'Corporate Trust',
      description: 'Professional, authoritative design for law firms and consultancies',
      preview: {
        heroStyle: 'professional',
        colorIntensity: 'muted',
        typography: 'classic',
        spacing: 'structured'
      },
      sections: {
        home: ['hero-professional', 'practice-areas', 'why-us', 'team-leadership', 'results', 'contact-cta'],
        services: ['services-detailed', 'process', 'case-results'],
        team: ['attorney-profiles', 'credentials', 'contact-individual']
      }
    },
    'approachable-expert': {
      id: 'approachable-expert',
      name: 'Approachable Expert',
      description: 'Friendly yet professional for real estate and local services',
      preview: {
        heroStyle: 'friendly',
        colorIntensity: 'medium',
        typography: 'modern',
        spacing: 'open'
      },
      sections: {
        home: ['hero-friendly', 'services-cards', 'about-preview', 'testimonials-prominent', 'contact-easy'],
        services: ['services-visual', 'pricing-transparent', 'faq'],
        testimonials: ['reviews-featured', 'case-studies', 'ratings']
      }
    },
    'local-service': {
      id: 'local-service',
      name: 'Local Service',
      description: 'Trust-building design for plumbers, cleaners, auto shops',
      preview: {
        heroStyle: 'action',
        colorIntensity: 'bold',
        typography: 'clear',
        spacing: 'efficient'
      },
      sections: {
        home: ['hero-action', 'services-quick', 'trust-badges', 'reviews', 'service-area', 'call-now'],
        services: ['services-pricing', 'emergency-callout', 'guarantees'],
        about: ['family-owned', 'certifications', 'service-area-map']
      }
    }
  },

  tech: {
    'saas-modern': {
      id: 'saas-modern',
      name: 'SaaS Modern',
      description: 'Clean, conversion-focused design for software products',
      preview: {
        heroStyle: 'product',
        colorIntensity: 'gradient',
        typography: 'clean',
        spacing: 'generous'
      },
      sections: {
        home: ['hero-product', 'logos-trust', 'features-grid', 'how-it-works', 'testimonials', 'pricing-preview', 'cta'],
        features: ['features-detailed', 'comparison', 'integrations'],
        pricing: ['pricing-toggle', 'feature-matrix', 'faq', 'enterprise-cta']
      }
    },
    'startup-bold': {
      id: 'startup-bold',
      name: 'Startup Bold',
      description: 'Eye-catching design for early-stage startups',
      preview: {
        heroStyle: 'bold-gradient',
        colorIntensity: 'high',
        typography: 'bold',
        spacing: 'dynamic'
      },
      sections: {
        home: ['hero-bold', 'problem-solution', 'features-animated', 'social-proof', 'team-preview', 'waitlist'],
        about: ['mission', 'team-full', 'investors', 'press'],
        demo: ['demo-video', 'features-tour', 'signup-form']
      }
    },
    'enterprise-solid': {
      id: 'enterprise-solid',
      name: 'Enterprise Solid',
      description: 'Trustworthy design for B2B and enterprise software',
      preview: {
        heroStyle: 'professional',
        colorIntensity: 'conservative',
        typography: 'professional',
        spacing: 'structured'
      },
      sections: {
        home: ['hero-enterprise', 'client-logos', 'solutions', 'case-studies', 'security', 'contact-sales'],
        features: ['capabilities', 'security-compliance', 'integrations', 'support'],
        pricing: ['plans-enterprise', 'custom-quote', 'contact-sales']
      }
    }
  },

  education: {
    'academic-traditional': {
      id: 'academic-traditional',
      name: 'Academic Traditional',
      description: 'Classic, prestigious design for universities and colleges',
      preview: {
        heroStyle: 'majestic',
        colorIntensity: 'classic',
        typography: 'serif',
        spacing: 'formal'
      },
      sections: {
        home: ['hero-campus', 'stats-prestigious', 'programs-featured', 'news', 'events', 'apply-cta'],
        programs: ['program-catalog', 'degrees', 'research'],
        admissions: ['requirements', 'deadlines', 'financial-aid', 'visit']
      }
    },
    'modern-learning': {
      id: 'modern-learning',
      name: 'Modern Learning',
      description: 'Fresh design for online courses and modern institutions',
      preview: {
        heroStyle: 'engaging',
        colorIntensity: 'vibrant',
        typography: 'modern',
        spacing: 'open'
      },
      sections: {
        home: ['hero-engaging', 'courses-featured', 'outcomes', 'instructors', 'student-success', 'enroll-cta'],
        programs: ['course-grid', 'learning-paths', 'certificates'],
        about: ['mission', 'methodology', 'team', 'partners']
      }
    },
    'community-focused': {
      id: 'community-focused',
      name: 'Community Focused',
      description: 'Welcoming design for community colleges and local schools',
      preview: {
        heroStyle: 'welcoming',
        colorIntensity: 'friendly',
        typography: 'approachable',
        spacing: 'comfortable'
      },
      sections: {
        home: ['hero-welcoming', 'programs-accessible', 'student-life', 'support-services', 'apply-easy'],
        campus: ['facilities', 'student-orgs', 'athletics', 'dining'],
        admissions: ['steps-simple', 'tuition', 'aid', 'visit-schedule']
      }
    }
  },

  healthcare: {
    'patient-first': {
      id: 'patient-first',
      name: 'Patient First',
      description: 'Warm, reassuring design focused on patient comfort',
      preview: {
        heroStyle: 'caring',
        colorIntensity: 'soft',
        typography: 'friendly',
        spacing: 'comfortable'
      },
      sections: {
        home: ['hero-caring', 'services-accessible', 'providers-friendly', 'patient-resources', 'locations', 'book-cta'],
        services: ['services-explained', 'conditions-treated', 'what-to-expect'],
        providers: ['provider-cards', 'specialties', 'book-with-provider']
      }
    },
    'clinical-professional': {
      id: 'clinical-professional',
      name: 'Clinical Professional',
      description: 'Clean, trustworthy design for medical practices',
      preview: {
        heroStyle: 'professional',
        colorIntensity: 'clean',
        typography: 'clear',
        spacing: 'organized'
      },
      sections: {
        home: ['hero-professional', 'specialties', 'providers', 'insurance', 'appointments', 'contact'],
        services: ['services-clinical', 'procedures', 'technology'],
        about: ['credentials', 'affiliations', 'research']
      }
    },
    'modern-health': {
      id: 'modern-health',
      name: 'Modern Health',
      description: 'Contemporary design for innovative health practices',
      preview: {
        heroStyle: 'modern',
        colorIntensity: 'fresh',
        typography: 'modern',
        spacing: 'airy'
      },
      sections: {
        home: ['hero-modern', 'approach', 'services-visual', 'team', 'testimonials', 'book-online'],
        services: ['services-modern', 'technology', 'outcomes'],
        about: ['philosophy', 'team-full', 'facility-tour']
      }
    }
  }
};

export const INDUSTRY_LABELS = {
  fitness: 'Fitness & Gym',
  restaurant: 'Restaurant & Cafe',
  salon: 'Salon & Spa',
  professional: 'Professional Services',
  tech: 'Tech & SaaS',
  education: 'Education',
  healthcare: 'Healthcare'
};

export default LAYOUT_CONFIGS;
