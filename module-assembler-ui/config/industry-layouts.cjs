/**
 * BLINK Industry Layout System (CJS version for server)
 *
 * This is a CommonJS export of the industry layouts for use in server.cjs
 */

// ============================================
// INDUSTRY DEFINITIONS
// ============================================

const INDUSTRY_LAYOUTS = {
  'professional-services': {
    name: 'Professional Services',
    keywords: ['consulting', 'legal', 'accounting', 'franchise', 'advisor', 'coach', 'strategy'],
    style: {
      typography: 'traditional',
      colorMood: 'sophisticated',
      imageStyle: 'professional headshots, office environments, handshakes, meetings, cityscapes',
      spacing: 'generous',
      corners: 'subtle',
    },
    ctaTypes: ['Schedule Consultation', 'Get Free Quote', 'Book a Call', 'Request Proposal'],
    trustSignals: ['certifications', 'years-in-business', 'clients-served', 'case-studies', 'awards'],
    layouts: {
      'trust-builder': {
        name: 'Trust Builder',
        description: 'Testimonials prominent, credentials front-and-center',
        sectionOrder: ['hero-split', 'trust-logos', 'stats-animated', 'services-grid', 'testimonials-featured', 'about-split', 'faq-accordion', 'cta-simple'],
        emphasis: ['credibility', 'experience', 'results'],
      },
      'lead-generator': {
        name: 'Lead Generator',
        description: 'Form in hero, multiple CTAs throughout',
        sectionOrder: ['hero-with-form', 'trust-badges', 'services-cards', 'stats-bar', 'testimonials-grid', 'cta-with-form', 'faq-accordion'],
        emphasis: ['conversion', 'urgency', 'value-proposition'],
      },
      'corporate-clean': {
        name: 'Corporate Clean',
        description: 'Minimal design, lots of whitespace',
        sectionOrder: ['hero-minimal', 'about-values', 'services-list', 'stats-large', 'testimonials-quotes', 'cta-simple'],
        emphasis: ['elegance', 'simplicity', 'authority'],
      }
    }
  },

  'restaurants-food': {
    name: 'Restaurants & Food',
    keywords: ['restaurant', 'cafe', 'bistro', 'bar', 'food', 'dining', 'catering', 'bakery', 'coffee'],
    style: {
      typography: 'mixed',
      colorMood: 'warm',
      imageStyle: 'appetizing food photography, interior ambiance, chef at work, ingredients, plated dishes',
      spacing: 'normal',
      corners: 'rounded',
    },
    ctaTypes: ['View Menu', 'Make Reservation', 'Order Online', 'Book a Table'],
    trustSignals: ['reviews', 'awards', 'press-mentions', 'chef-credentials', 'local-sourcing'],
    layouts: {
      'appetizing-visual': {
        name: 'Appetizing Visual',
        description: 'Food photography takes center stage',
        sectionOrder: ['hero-image-first', 'gallery-masonry', 'about-split', 'services-grid', 'testimonials-carousel', 'contact-with-map'],
        emphasis: ['visual-appeal', 'ambiance', 'experience'],
      },
      'menu-focused': {
        name: 'Menu Focused',
        description: 'Menu prominently displayed',
        sectionOrder: ['hero-centered', 'services-tabs', 'gallery-grid', 'about-team', 'testimonials-grid', 'cta-split'],
        emphasis: ['menu', 'ordering', 'convenience'],
      },
      'story-driven': {
        name: 'Story Driven',
        description: 'Tell your restaurant story',
        sectionOrder: ['hero-with-video', 'about-timeline', 'gallery-featured', 'services-list', 'testimonials-featured', 'contact-split'],
        emphasis: ['story', 'authenticity', 'passion'],
      }
    }
  },

  'healthcare-medical': {
    name: 'Healthcare & Medical',
    keywords: ['medical', 'healthcare', 'clinic', 'doctor', 'therapy', 'hospital', 'physician', 'primary-care'],
    style: {
      typography: 'modern',
      colorMood: 'calm',
      imageStyle: 'clean medical environments, caring professionals, happy patients, modern equipment, clinical settings',
      spacing: 'generous',
      corners: 'subtle', // Medical = more clinical, less rounded
    },
    palettes: [
      { name: 'Medical Blue', primary: '#1565c0', secondary: '#1976d2', accent: '#42a5f5', text: '#1a1a2e' },
      { name: 'Clinical Teal', primary: '#00695c', secondary: '#00796b', accent: '#4db6ac', text: '#1a1a2e' },
      { name: 'Professional Navy', primary: '#1a237e', secondary: '#303f9f', accent: '#5c6bc0', text: '#1a1a2e' },
    ],
    ctaTypes: ['Book Appointment', 'Schedule Visit', 'Patient Portal', 'Request Consultation'],
    trustSignals: ['certifications', 'insurance-accepted', 'patient-reviews', 'years-experience', 'credentials', 'hipaa-compliant'],
    layouts: {
      'clinical-dashboard': {
        name: 'Clinical Dashboard',
        description: 'Professional medical practice homepage with stats, services, providers, and quick actions. Based on proven healthcare UX.',
        sectionOrder: ['medical-hero', 'medical-stats', 'medical-services', 'quick-actions', 'provider-cards', 'testimonials-grid', 'newsletter-cta'],
        emphasis: ['professionalism', 'trust', 'accessibility', 'patient-care'],
      },
      'patient-focused': {
        name: 'Patient Focused',
        description: 'Warm, welcoming design focused on patient comfort and easy navigation. Great for family practices.',
        sectionOrder: ['hero-split', 'quick-actions', 'services-grid', 'about-team', 'testimonials-carousel', 'insurance-info', 'contact-with-map'],
        emphasis: ['warmth', 'accessibility', 'family-friendly', 'convenience'],
      },
      'booking-optimized': {
        name: 'Booking Optimized',
        description: 'Lead capture focused with prominent appointment scheduling. Ideal for new patient acquisition.',
        sectionOrder: ['hero-with-form', 'medical-stats', 'services-list', 'trust-badges', 'testimonials-featured', 'faq-accordion', 'contact-split'],
        emphasis: ['conversion', 'booking', 'urgency', 'trust'],
      }
    }
  },

  // ==========================================
  // DENTAL - Specialized Healthcare Variant
  // ==========================================
  'dental': {
    name: 'Dental Practice',
    keywords: ['dental', 'dentist', 'orthodontics', 'teeth', 'smile', 'oral', 'cosmetic-dentistry'],
    style: {
      typography: 'modern',
      colorMood: 'calm',
      imageStyle: 'bright smiles, modern dental equipment, friendly dentists, clean clinical spaces, before/after smile photos',
      spacing: 'generous',
      corners: 'subtle',
    },
    palettes: [
      { name: 'Dental Blue', primary: '#1565c0', secondary: '#1976d2', accent: '#42a5f5', text: '#1a1a2e' },
      { name: 'Fresh Mint', primary: '#00897b', secondary: '#26a69a', accent: '#80cbc4', text: '#1a1a2e' },
      { name: 'Clean White', primary: '#37474f', secondary: '#455a64', accent: '#00bcd4', text: '#1a1a2e' },
    ],
    ctaTypes: ['Book Cleaning', 'Schedule Consultation', 'View Smile Gallery', 'New Patient Special'],
    trustSignals: ['ada-member', 'years-experience', 'smile-gallery', 'patient-reviews', 'technology', 'family-friendly'],
    layouts: {
      'smile-showcase': {
        name: 'Smile Showcase',
        description: 'Visual-first design with smile gallery, before/after photos, and cosmetic services prominent.',
        sectionOrder: ['dental-hero', 'smile-gallery', 'dental-services', 'dental-stats', 'provider-cards', 'testimonials-carousel', 'insurance-info', 'cta-simple'],
        emphasis: ['visual-results', 'cosmetic', 'transformation', 'confidence'],
      },
      'family-dental': {
        name: 'Family Dental',
        description: 'Warm, welcoming design for family dental practices. Emphasizes comfort and care for all ages.',
        sectionOrder: ['hero-split', 'quick-actions', 'dental-services', 'about-team', 'testimonials-grid', 'faq-accordion', 'contact-with-map'],
        emphasis: ['family-friendly', 'comfort', 'all-ages', 'preventive-care'],
      },
      'clinical-excellence': {
        name: 'Clinical Excellence',
        description: 'Professional, credentials-focused design highlighting technology and expertise.',
        sectionOrder: ['dental-hero', 'trust-badges', 'dental-stats', 'dental-services', 'technology-showcase', 'provider-cards', 'testimonials-featured', 'cta-with-form'],
        emphasis: ['expertise', 'technology', 'precision', 'credentials'],
      }
    }
  },

  // ==========================================
  // MENTAL HEALTH - Specialized Healthcare Variant
  // ==========================================
  'mental-health': {
    name: 'Mental Health & Therapy',
    keywords: ['mental-health', 'therapy', 'counseling', 'psychiatry', 'psychologist', 'therapist', 'counselor', 'anxiety', 'depression'],
    style: {
      typography: 'modern',
      colorMood: 'calm',
      imageStyle: 'peaceful environments, nature scenes, calm colors, supportive imagery, mindfulness, serene spaces',
      spacing: 'generous',
      corners: 'rounded',
    },
    palettes: [
      { name: 'Calming Sage', primary: '#558b2f', secondary: '#7cb342', accent: '#aed581', text: '#1a1a2e' },
      { name: 'Peaceful Blue', primary: '#5c6bc0', secondary: '#7986cb', accent: '#9fa8da', text: '#1a1a2e' },
      { name: 'Warm Earth', primary: '#6d4c41', secondary: '#8d6e63', accent: '#bcaaa4', text: '#1a1a2e' },
    ],
    ctaTypes: ['Schedule Session', 'Book Consultation', 'Get Support', 'Start Your Journey'],
    trustSignals: ['licensed-therapist', 'confidential', 'insurance-accepted', 'telehealth', 'years-experience', 'specializations'],
    layouts: {
      'calming-supportive': {
        name: 'Calming & Supportive',
        description: 'Peaceful, non-clinical design that feels safe and welcoming. Reduces anxiety about seeking help.',
        sectionOrder: ['hero-minimal', 'approach-values', 'services-list', 'about-therapist', 'testimonials-quotes', 'faq-accordion', 'contact-minimal'],
        emphasis: ['calm', 'safety', 'understanding', 'hope'],
      },
      'professional-practice': {
        name: 'Professional Practice',
        description: 'Balanced professional design that builds credibility while remaining approachable.',
        sectionOrder: ['hero-split', 'services-grid', 'about-split', 'specializations', 'testimonials-featured', 'insurance-info', 'cta-with-form'],
        emphasis: ['expertise', 'specialization', 'credentials', 'accessibility'],
      },
      'telehealth-focused': {
        name: 'Telehealth Focused',
        description: 'Emphasizes online therapy options and virtual appointments. Great for remote practices.',
        sectionOrder: ['hero-with-form', 'telehealth-features', 'services-list', 'about-therapist', 'testimonials-grid', 'faq-accordion', 'contact-split'],
        emphasis: ['convenience', 'accessibility', 'privacy', 'flexibility'],
      }
    }
  },

  // ==========================================
  // CHIROPRACTIC - Specialized Healthcare Variant
  // ==========================================
  'chiropractic': {
    name: 'Chiropractic & Wellness',
    keywords: ['chiropractic', 'chiropractor', 'spine', 'back-pain', 'adjustment', 'wellness', 'posture'],
    style: {
      typography: 'modern',
      colorMood: 'energetic',
      imageStyle: 'active healthy people, spine/body diagrams, adjustment photos, wellness imagery, natural movement',
      spacing: 'normal',
      corners: 'subtle',
    },
    palettes: [
      { name: 'Health Green', primary: '#2e7d32', secondary: '#43a047', accent: '#66bb6a', text: '#1a1a2e' },
      { name: 'Active Blue', primary: '#1976d2', secondary: '#2196f3', accent: '#64b5f6', text: '#1a1a2e' },
      { name: 'Natural Tan', primary: '#5d4037', secondary: '#795548', accent: '#a1887f', text: '#1a1a2e' },
    ],
    ctaTypes: ['Book Adjustment', 'Free Consultation', 'Schedule Assessment', 'New Patient Special'],
    trustSignals: ['licensed', 'years-experience', 'patient-results', 'insurance-accepted', 'conditions-treated'],
    layouts: {
      'results-focused': {
        name: 'Results Focused',
        description: 'Highlights patient success stories and treatment outcomes. Great for building trust.',
        sectionOrder: ['hero-split', 'stats-animated', 'conditions-treated', 'services-grid', 'testimonials-carousel', 'about-team', 'cta-with-form'],
        emphasis: ['results', 'transformation', 'pain-relief', 'mobility'],
      },
      'educational': {
        name: 'Educational',
        description: 'Informative design that educates patients about chiropractic care and conditions.',
        sectionOrder: ['hero-centered', 'about-values', 'conditions-treated', 'services-list', 'faq-accordion', 'testimonials-grid', 'contact-with-map'],
        emphasis: ['education', 'understanding', 'conditions', 'solutions'],
      },
      'wellness-center': {
        name: 'Wellness Center',
        description: 'Holistic approach highlighting full wellness services beyond adjustments.',
        sectionOrder: ['hero-image-first', 'services-bento', 'about-split', 'stats-cards', 'testimonials-featured', 'pricing-cards', 'cta-simple'],
        emphasis: ['holistic', 'wellness', 'lifestyle', 'prevention'],
      }
    }
  },

  // ==========================================
  // VETERINARY - Specialized Healthcare Variant
  // ==========================================
  'veterinary': {
    name: 'Veterinary & Pet Care',
    keywords: ['veterinary', 'vet', 'animal', 'pet', 'dog', 'cat', 'clinic'],
    style: {
      typography: 'modern',
      colorMood: 'warm',
      imageStyle: 'happy pets, caring vets, clean clinic, pet portraits, animals with owners, playful imagery',
      spacing: 'normal',
      corners: 'rounded',
    },
    palettes: [
      { name: 'Pet Care Blue', primary: '#1976d2', secondary: '#42a5f5', accent: '#ff7043', text: '#1a1a2e' },
      { name: 'Natural Green', primary: '#388e3c', secondary: '#66bb6a', accent: '#ffb74d', text: '#1a1a2e' },
      { name: 'Warm Brown', primary: '#5d4037', secondary: '#8d6e63', accent: '#4fc3f7', text: '#1a1a2e' },
    ],
    ctaTypes: ['Book Appointment', 'Schedule Checkup', 'Emergency Care', 'New Pet Visit'],
    trustSignals: ['licensed', 'years-experience', 'pet-reviews', 'emergency-available', 'species-treated'],
    layouts: {
      'pet-friendly': {
        name: 'Pet Friendly',
        description: 'Warm, welcoming design that appeals to pet owners. Lots of pet imagery.',
        sectionOrder: ['hero-image-first', 'services-grid', 'about-team', 'gallery-grid', 'testimonials-carousel', 'emergency-cta', 'contact-with-map'],
        emphasis: ['warmth', 'care', 'trust', 'family'],
      },
      'clinical-professional': {
        name: 'Clinical Professional',
        description: 'Professional veterinary practice design emphasizing medical expertise.',
        sectionOrder: ['hero-split', 'services-list', 'stats-animated', 'about-split', 'testimonials-featured', 'faq-accordion', 'cta-with-form'],
        emphasis: ['expertise', 'medical', 'credentials', 'trust'],
      },
      'emergency-ready': {
        name: 'Emergency Ready',
        description: 'Emphasizes 24/7 emergency care and urgent services. Clear emergency information.',
        sectionOrder: ['emergency-hero', 'emergency-services', 'services-grid', 'about-team', 'contact-urgent', 'testimonials-grid', 'cta-simple'],
        emphasis: ['emergency', 'urgency', 'availability', 'care'],
      }
    }
  },

  'retail-ecommerce': {
    name: 'Retail & Ecommerce',
    keywords: ['shop', 'store', 'retail', 'ecommerce', 'boutique', 'products', 'merchandise'],
    style: {
      typography: 'modern',
      colorMood: 'energetic',
      imageStyle: 'product photography, lifestyle shots, unboxing, happy customers',
      spacing: 'normal',
      corners: 'subtle',
    },
    ctaTypes: ['Shop Now', 'Browse Collection', 'Get 20% Off', 'Start Shopping'],
    trustSignals: ['reviews', 'secure-checkout', 'free-shipping', 'money-back', 'customer-count'],
    layouts: {
      'product-showcase': {
        name: 'Product Showcase',
        description: 'Products front and center',
        sectionOrder: ['hero-image-first', 'gallery-grid', 'trust-guarantees', 'services-bento', 'testimonials-grid', 'cta-banner'],
        emphasis: ['visual', 'products', 'discovery'],
      },
      'conversion-focused': {
        name: 'Conversion Focused',
        description: 'Optimized for sales',
        sectionOrder: ['hero-centered', 'stats-bar', 'services-grid', 'trust-guarantees', 'testimonials-carousel', 'cta-simple', 'faq-accordion'],
        emphasis: ['conversion', 'trust', 'value'],
      },
      'brand-story': {
        name: 'Brand Story',
        description: 'Tell your brand story',
        sectionOrder: ['hero-with-video', 'about-values', 'gallery-masonry', 'services-cards', 'testimonials-featured', 'cta-split'],
        emphasis: ['story', 'brand', 'lifestyle'],
      }
    }
  },

  'home-services': {
    name: 'Home Services',
    keywords: ['plumber', 'electrician', 'contractor', 'cleaning', 'repair', 'hvac', 'landscaping', 'roofing', 'handyman'],
    style: {
      typography: 'modern',
      colorMood: 'bold',
      imageStyle: 'before/after shots, work in progress, uniformed workers, tools, completed projects',
      spacing: 'normal',
      corners: 'subtle',
    },
    ctaTypes: ['Get Free Estimate', 'Call Now', 'Schedule Service', 'Request Quote'],
    trustSignals: ['licensed-insured', 'reviews', 'years-experience', 'warranty', 'local-business'],
    layouts: {
      'trust-and-call': {
        name: 'Trust & Call',
        description: 'Build trust fast, make calling easy',
        sectionOrder: ['hero-split', 'trust-badges', 'stats-animated', 'services-grid', 'testimonials-carousel', 'gallery-grid', 'cta-simple'],
        emphasis: ['trust', 'urgency', 'reliability'],
      },
      'quote-generator': {
        name: 'Quote Generator',
        description: 'Easy quote requests',
        sectionOrder: ['hero-with-form', 'services-cards', 'trust-logos', 'gallery-featured', 'testimonials-grid', 'faq-accordion'],
        emphasis: ['leads', 'convenience', 'transparency'],
      },
      'portfolio-showcase': {
        name: 'Portfolio Showcase',
        description: 'Show off your best work',
        sectionOrder: ['hero-centered', 'gallery-masonry', 'services-list', 'stats-cards', 'testimonials-featured', 'cta-with-form'],
        emphasis: ['portfolio', 'quality', 'craftsmanship'],
      }
    }
  },

  'fitness-wellness': {
    name: 'Fitness & Wellness',
    keywords: ['gym', 'fitness', 'yoga', 'pilates', 'personal trainer', 'wellness', 'meditation'],
    style: {
      typography: 'modern',
      colorMood: 'energetic',
      imageStyle: 'action shots, fitness equipment, healthy people, studio spaces',
      spacing: 'normal',
      corners: 'rounded',
    },
    ctaTypes: ['Start Free Trial', 'Book a Class', 'Get Started', 'Join Now'],
    trustSignals: ['certified-trainers', 'member-results', 'reviews', 'equipment-quality', 'transformations'],
    layouts: {
      'motivation-driven': {
        name: 'Motivation Driven',
        description: 'Inspiring visuals and testimonials',
        sectionOrder: ['hero-with-video', 'stats-animated', 'services-bento', 'gallery-carousel', 'testimonials-featured', 'pricing-cards', 'cta-simple'],
        emphasis: ['motivation', 'results', 'community'],
      },
      'class-scheduler': {
        name: 'Class Scheduler',
        description: 'Class schedules and booking front and center',
        sectionOrder: ['hero-split', 'services-tabs', 'about-team', 'pricing-cards', 'testimonials-carousel', 'faq-accordion', 'contact-with-map'],
        emphasis: ['schedule', 'booking', 'instructors'],
      },
      'wellness-calm': {
        name: 'Wellness Calm',
        description: 'Peaceful, calming design',
        sectionOrder: ['hero-minimal', 'about-values', 'services-list', 'gallery-masonry', 'testimonials-quotes', 'cta-simple'],
        emphasis: ['calm', 'mindfulness', 'experience'],
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BEAUTY & GROOMING - Dedicated category for salons, spas, barbershops
  // Based on comprehensive industry research - 3 distinct layouts
  // ═══════════════════════════════════════════════════════════════════════════
  'beauty-grooming': {
    name: 'Beauty & Grooming',
    keywords: ['salon', 'spa', 'barbershop', 'hair', 'nails', 'beauty', 'barber', 'skincare', 'esthetics', 'med spa', 'waxing', 'lashes', 'brows'],
    style: {
      typography: 'elegant',
      colorMood: 'sophisticated',
      imageStyle: 'treatment photos, before/after transformations, stylists at work, elegant interiors, product shots',
      spacing: 'generous',
      corners: 'subtle',
    },
    palettes: [
      { name: 'Spa Serene', primary: '#E6D5F5', secondary: '#D4E5D4', accent: '#E6B8A2', text: '#2D2D2D' },
      { name: 'Modern Salon', primary: '#1A1A1A', secondary: '#FFFFFF', accent: '#4ECDC4', text: '#1A1A1A' },
      { name: 'Classic Barber', primary: '#2C1810', secondary: '#FDF8F3', accent: '#D4A574', text: '#1A1A1A' },
      { name: 'Rose Gold Luxe', primary: '#FAF5F3', secondary: '#2D2D2D', accent: '#B76E79', text: '#2D2D2D' },
    ],
    ctaTypes: ['Book Now', 'Reserve Your Spot', 'Book Your Escape', 'Schedule Appointment', 'Get Groomed'],
    trustSignals: ['licensed-stylists', 'years-experience', 'before-after-gallery', 'client-reviews', 'certifications', 'premium-products'],
    layouts: {
      'serene-luxury-spa': {
        name: 'Serene Luxury Spa',
        description: 'Elegant, calming design for high-end spas, med spas, and luxury salons. Soft pastels, generous white space, video hero.',
        sectionOrder: ['hero-fullscreen-video', 'services-elegant-grid', 'gallery-before-after', 'testimonials-slider', 'membership-teaser', 'team-showcase', 'booking-widget-sticky'],
        emphasis: ['luxury', 'relaxation', 'transformation', 'exclusivity'],
        designNotes: {
          colors: 'Soft pastels (lavender, sage, spa blue) + white + rose gold/gold accents',
          typography: 'Elegant serif headers (Playfair Display), clean sans-serif body (Lato)',
          whiteSpace: '60-70% for luxury feel',
          effects: 'Parallax scrolling, subtle fade-ins, soft shadows',
        }
      },
      'modern-minimal-salon': {
        name: 'Modern Minimal Salon',
        description: 'Bold, contemporary design for hair salons, nail salons, and modern beauty studios. Split-screen hero, Instagram-style gallery.',
        sectionOrder: ['hero-split-animated', 'services-card-grid', 'portfolio-instagram', 'team-spotlight', 'shop-integration', 'reviews-social', 'contact-multi-location'],
        emphasis: ['style', 'portfolio', 'social-proof', 'booking'],
        designNotes: {
          colors: 'Black + white base with bold accent (teal, coral, gold)',
          typography: 'Modern bold sans-serif (Montserrat, Poppins)',
          layout: 'Asymmetric, dynamic, grid-based',
          effects: 'Hover animations, smooth transitions, split-screen',
        }
      },
      'masculine-classic-barber': {
        name: 'Masculine Classic Barber',
        description: 'Traditional masculine aesthetic for barbershops and men\'s grooming. Dark backgrounds, gold accents, vintage or industrial feel.',
        sectionOrder: ['hero-dark-textured', 'services-bar-pricing', 'portfolio-grid-filtered', 'team-barber-profiles', 'shop-grooming-products', 'community-culture', 'booking-per-barber'],
        emphasis: ['tradition', 'craftsmanship', 'community', 'masculinity'],
        designNotes: {
          colors: 'Black + deep brown + gold/copper/red accents',
          typography: 'Bold vintage or industrial (Oswald, Bebas Neue)',
          textures: 'Leather, wood grain, metal finishes',
          effects: 'Parallax, split-screen, retro animations',
        }
      }
    }
  },

  'real-estate': {
    name: 'Real Estate',
    keywords: ['real estate', 'realtor', 'property', 'homes', 'apartments', 'broker', 'agent', 'residential'],
    style: {
      typography: 'modern',
      colorMood: 'sophisticated',
      imageStyle: 'property exteriors, interior shots, neighborhoods, agent headshots, aerial views, staged homes',
      spacing: 'generous',
      corners: 'subtle',
    },
    palettes: [
      { name: 'Professional Blue', primary: '#1976d2', secondary: '#2196f3', accent: '#ff5722', text: '#1a1a2e' },
      { name: 'Corporate Navy', primary: '#1e3a5f', secondary: '#2d5a87', accent: '#c9a962', text: '#1a1a2e' },
      { name: 'Modern Charcoal', primary: '#37474f', secondary: '#546e7a', accent: '#26a69a', text: '#1a1a2e' },
    ],
    ctaTypes: ['Search Properties', 'Get Home Valuation', 'Schedule Showing', 'Free Consultation'],
    trustSignals: ['sales-volume', 'reviews', 'years-experience', 'certifications', 'listings-sold', 'mls-member'],
    layouts: {
      'professional-realtor': {
        name: 'Professional Realtor',
        description: 'Standard professional layout with property search, listings, market data, and agent profiles. Ideal for established agencies.',
        sectionOrder: ['realestate-hero', 'property-search', 'featured-properties', 'market-stats', 'agent-profiles', 'testimonials-carousel', 'cta-with-form'],
        emphasis: ['search', 'listings', 'market-data', 'professionalism'],
      },
      'agent-brand': {
        name: 'Agent Personal Brand',
        description: 'Personal branding for individual agents. Hero features agent photo, expertise, and success metrics.',
        sectionOrder: ['agent-hero', 'agent-stats', 'featured-properties', 'about-agent', 'testimonials-featured', 'services-list', 'contact-split'],
        emphasis: ['personal-brand', 'trust', 'expertise', 'results'],
      },
      'property-showcase': {
        name: 'Property Showcase',
        description: 'Visually-driven layout that puts properties front and center. Gallery-style browsing with minimal distractions.',
        sectionOrder: ['hero-image-first', 'property-showcase', 'property-search', 'market-stats', 'agent-profiles', 'testimonials-grid', 'cta-simple'],
        emphasis: ['visual', 'properties', 'discovery', 'browsing'],
      }
    }
  },

  // ==========================================
  // LUXURY REAL ESTATE - Specialized Variant
  // ==========================================
  'luxury-real-estate': {
    name: 'Luxury Real Estate',
    keywords: ['luxury', 'estate', 'mansion', 'high-end', 'premium', 'million-dollar', 'waterfront', 'penthouse'],
    style: {
      typography: 'elegant',
      colorMood: 'sophisticated',
      imageStyle: 'stunning estate photography, aerial mansion views, luxury interiors, infinity pools, wine cellars, private gardens',
      spacing: 'generous',
      corners: 'subtle',
    },
    palettes: [
      { name: 'Platinum Gold', primary: '#1a1a2e', secondary: '#2d2d44', accent: '#d4af37', text: '#ffffff' },
      { name: 'Midnight Luxury', primary: '#0a0a14', secondary: '#1a1a2e', accent: '#c9a962', text: '#ffffff' },
      { name: 'Champagne Elite', primary: '#2c2c2c', secondary: '#3d3d3d', accent: '#b8860b', text: '#ffffff' },
    ],
    ctaTypes: ['View Luxury Collection', 'Private Viewing', 'Schedule Consultation', 'VIP Access'],
    trustSignals: ['exclusive-listings', 'celebrity-clients', 'sales-volume', 'luxury-certifications', 'private-network'],
    layouts: {
      'luxury-estate': {
        name: 'Luxury Estate',
        description: 'Premium layout with gold accents, exclusive badge, and VIP-focused messaging. Dark elegant design.',
        sectionOrder: ['luxury-hero', 'luxury-properties', 'exclusive-services', 'agent-profiles', 'testimonials-quotes', 'concierge-cta'],
        emphasis: ['exclusivity', 'prestige', 'white-glove-service', 'discretion'],
      },
      'private-collection': {
        name: 'Private Collection',
        description: 'Ultra-exclusive layout for off-market and private listings. Emphasizes discretion and exclusivity.',
        sectionOrder: ['luxury-hero', 'private-listings', 'about-values', 'agent-profiles', 'contact-minimal'],
        emphasis: ['privacy', 'exclusivity', 'discretion', 'curated'],
      },
      'waterfront-specialist': {
        name: 'Waterfront Specialist',
        description: 'Specialized layout for waterfront and oceanfront properties. Stunning visual focus on water views.',
        sectionOrder: ['hero-image-first', 'waterfront-properties', 'lifestyle-features', 'market-stats', 'agent-profiles', 'testimonials-featured', 'cta-split'],
        emphasis: ['waterfront', 'views', 'lifestyle', 'location'],
      }
    }
  },

  // ==========================================
  // COMMERCIAL REAL ESTATE - Specialized Variant
  // ==========================================
  'commercial-real-estate': {
    name: 'Commercial Real Estate',
    keywords: ['commercial', 'office', 'retail', 'industrial', 'warehouse', 'investment', 'cre', 'lease'],
    style: {
      typography: 'modern',
      colorMood: 'professional',
      imageStyle: 'office buildings, retail spaces, industrial facilities, aerial commercial views, conference rooms',
      spacing: 'normal',
      corners: 'subtle',
    },
    palettes: [
      { name: 'Corporate Blue', primary: '#1565c0', secondary: '#1976d2', accent: '#ff9800', text: '#1a1a2e' },
      { name: 'Business Gray', primary: '#455a64', secondary: '#607d8b', accent: '#4caf50', text: '#1a1a2e' },
      { name: 'Investment Green', primary: '#2e7d32', secondary: '#388e3c', accent: '#1976d2', text: '#1a1a2e' },
    ],
    ctaTypes: ['Search Properties', 'Investment Inquiry', 'Schedule Tour', 'Request Cap Rate'],
    trustSignals: ['transaction-volume', 'years-experience', 'certifications', 'client-roster', 'market-coverage'],
    layouts: {
      'investment-focused': {
        name: 'Investment Focused',
        description: 'Layout optimized for investors. Highlights cap rates, ROI, and investment metrics prominently.',
        sectionOrder: ['commercial-hero', 'investment-properties', 'market-analytics', 'services-grid', 'agent-profiles', 'testimonials-grid', 'cta-with-form'],
        emphasis: ['investment', 'returns', 'analytics', 'expertise'],
      },
      'lease-finder': {
        name: 'Lease Finder',
        description: 'Focused on businesses seeking space to lease. Property search with lease-specific filters.',
        sectionOrder: ['hero-with-form', 'property-search', 'featured-properties', 'services-list', 'testimonials-carousel', 'contact-split'],
        emphasis: ['search', 'leasing', 'business-needs', 'flexibility'],
      },
      'development-showcase': {
        name: 'Development Showcase',
        description: 'For developers showcasing new projects and developments. Timeline and project gallery focus.',
        sectionOrder: ['hero-image-first', 'development-projects', 'about-timeline', 'services-grid', 'testimonials-featured', 'contact-with-map'],
        emphasis: ['projects', 'development', 'vision', 'track-record'],
      }
    }
  },

  // ==========================================
  // PROPERTY MANAGEMENT - Specialized Variant
  // ==========================================
  'property-management': {
    name: 'Property Management',
    keywords: ['property-management', 'rental', 'landlord', 'tenant', 'leasing', 'hoa', 'apartments'],
    style: {
      typography: 'modern',
      colorMood: 'professional',
      imageStyle: 'apartment buildings, property maintenance, happy tenants, management offices, rental properties',
      spacing: 'normal',
      corners: 'subtle',
    },
    palettes: [
      { name: 'Trust Blue', primary: '#1976d2', secondary: '#2196f3', accent: '#4caf50', text: '#1a1a2e' },
      { name: 'Professional Teal', primary: '#00796b', secondary: '#009688', accent: '#ff5722', text: '#1a1a2e' },
    ],
    ctaTypes: ['Get Management Quote', 'List Your Property', 'Tenant Portal', 'Owner Portal'],
    trustSignals: ['properties-managed', 'years-experience', 'owner-satisfaction', 'tenant-retention', 'response-time'],
    layouts: {
      'owner-focused': {
        name: 'Owner Focused',
        description: 'Targets property owners looking for management services. Emphasizes ROI, hassle-free ownership.',
        sectionOrder: ['hero-split', 'services-grid', 'stats-animated', 'owner-benefits', 'testimonials-carousel', 'pricing-cards', 'cta-with-form'],
        emphasis: ['roi', 'hassle-free', 'expertise', 'trust'],
      },
      'tenant-portal': {
        name: 'Tenant Portal',
        description: 'Layout for tenant-facing websites. Easy rent payment, maintenance requests, and communication.',
        sectionOrder: ['hero-centered', 'quick-actions', 'available-rentals', 'tenant-resources', 'faq-accordion', 'contact-split'],
        emphasis: ['convenience', 'service', 'communication', 'resources'],
      },
      'dual-audience': {
        name: 'Dual Audience',
        description: 'Serves both owners and tenants with clear navigation paths for each audience.',
        sectionOrder: ['hero-split', 'audience-split', 'services-grid', 'stats-cards', 'testimonials-grid', 'cta-simple'],
        emphasis: ['owners', 'tenants', 'balance', 'professionalism'],
      }
    }
  },

  'education-coaching': {
    name: 'Education & Coaching',
    keywords: ['tutoring', 'coaching', 'courses', 'training', 'school', 'academy', 'learning', 'mentor'],
    style: {
      typography: 'modern',
      colorMood: 'energetic',
      imageStyle: 'learning environments, success stories, instructor headshots, students engaged',
      spacing: 'normal',
      corners: 'rounded',
    },
    ctaTypes: ['Enroll Now', 'Start Learning', 'Book Session', 'Get Free Lesson'],
    trustSignals: ['student-success', 'credentials', 'reviews', 'years-teaching', 'curriculum'],
    layouts: {
      'course-catalog': {
        name: 'Course Catalog',
        description: 'Browse courses and programs',
        sectionOrder: ['hero-centered', 'services-bento', 'stats-animated', 'about-team', 'testimonials-grid', 'pricing-cards', 'faq-accordion'],
        emphasis: ['courses', 'value', 'outcomes'],
      },
      'coach-personal': {
        name: 'Coach Personal Brand',
        description: 'Personal branding for coaches',
        sectionOrder: ['hero-split', 'about-split', 'stats-cards', 'services-list', 'testimonials-featured', 'cta-with-form'],
        emphasis: ['personal-brand', 'transformation', 'trust'],
      },
      'results-focused': {
        name: 'Results Focused',
        description: 'Highlight student success',
        sectionOrder: ['hero-with-video', 'stats-large', 'testimonials-carousel', 'services-cards', 'about-values', 'pricing-cards', 'cta-simple'],
        emphasis: ['results', 'transformations', 'proof'],
      }
    }
  },

  'creative-agency': {
    name: 'Creative & Agency',
    keywords: ['agency', 'design', 'marketing', 'creative', 'branding', 'photography', 'video', 'studio'],
    style: {
      typography: 'modern',
      colorMood: 'bold',
      imageStyle: 'portfolio work, creative process, team culture, workspaces',
      spacing: 'generous',
      corners: 'subtle',
    },
    ctaTypes: ['Start a Project', 'Get in Touch', 'View Our Work', 'Request Quote'],
    trustSignals: ['client-logos', 'awards', 'case-studies', 'press', 'team-expertise'],
    layouts: {
      'portfolio-first': {
        name: 'Portfolio First',
        description: 'Work speaks for itself',
        sectionOrder: ['hero-minimal', 'gallery-masonry', 'trust-logos', 'services-grid', 'about-team', 'cta-simple'],
        emphasis: ['portfolio', 'craft', 'creativity'],
      },
      'process-driven': {
        name: 'Process Driven',
        description: 'Show your process and methodology',
        sectionOrder: ['hero-centered', 'services-tabs', 'about-timeline', 'gallery-featured', 'testimonials-featured', 'trust-press', 'cta-with-form'],
        emphasis: ['process', 'methodology', 'results'],
      },
      'brand-bold': {
        name: 'Brand Bold',
        description: 'Make a statement',
        sectionOrder: ['hero-with-video', 'stats-large', 'gallery-grid', 'services-bento', 'testimonials-quotes', 'cta-split'],
        emphasis: ['brand', 'boldness', 'impact'],
      }
    }
  },

  'automotive': {
    name: 'Automotive',
    keywords: ['auto', 'car', 'automotive', 'dealership', 'mechanic', 'repair', 'detailing', 'body shop'],
    style: {
      typography: 'modern',
      colorMood: 'bold',
      imageStyle: 'vehicle shots, service bays, technicians at work, before/after',
      spacing: 'normal',
      corners: 'subtle',
    },
    ctaTypes: ['Get Quote', 'Schedule Service', 'Browse Inventory', 'Call Now'],
    trustSignals: ['certifications', 'warranty', 'reviews', 'years-experience', 'brands-serviced'],
    layouts: {
      'service-focused': {
        name: 'Service Focused',
        description: 'For repair shops and service centers',
        sectionOrder: ['hero-split', 'services-grid', 'trust-badges', 'stats-animated', 'testimonials-carousel', 'gallery-grid', 'cta-with-form'],
        emphasis: ['trust', 'expertise', 'convenience'],
      },
      'inventory-showcase': {
        name: 'Inventory Showcase',
        description: 'For dealerships with vehicle inventory',
        sectionOrder: ['hero-with-form', 'gallery-featured', 'services-tabs', 'trust-logos', 'testimonials-grid', 'about-split', 'contact-with-map'],
        emphasis: ['inventory', 'browsing', 'deals'],
      },
      'premium-detail': {
        name: 'Premium Detail',
        description: 'For detailing and customization',
        sectionOrder: ['hero-image-first', 'gallery-masonry', 'services-cards', 'pricing-cards', 'testimonials-featured', 'cta-simple'],
        emphasis: ['quality', 'results', 'premium'],
      }
    }
  }
};


/**
 * Build layout context for AI prompts
 */
function buildLayoutContext(industryKey, layoutKey) {
  const industry = INDUSTRY_LAYOUTS[industryKey];
  if (!industry) return '';

  const layout = layoutKey ? industry.layouts[layoutKey] : null;
  if (!layout) return '';

  return `
═══════════════════════════════════════════════════════════════
LAYOUT STRUCTURE: ${industry.name} - ${layout.name}
═══════════════════════════════════════════════════════════════

LAYOUT DESCRIPTION: ${layout.description}

DESIGN STYLE:
- Typography Style: ${industry.style.typography}
- Color Mood: ${industry.style.colorMood}
- Spacing: ${industry.style.spacing}
- Corner Style: ${industry.style.corners}

IMAGE GUIDANCE: ${industry.style.imageStyle}

RECOMMENDED CTA: ${industry.ctaTypes[0]}

TRUST SIGNALS TO INCLUDE: ${industry.trustSignals.join(', ')}

SECTION ORDER (follow this structure for HOME page):
${layout.sectionOrder.map((section, idx) => `${idx + 1}. ${section.replace(/-/g, ' ').toUpperCase()}`).join('\n')}

EMPHASIS POINTS: ${layout.emphasis.join(', ')}

IMPORTANT: This layout was specifically chosen for ${industry.name} businesses.
Follow the section order and emphasis points to create a cohesive design.
═══════════════════════════════════════════════════════════════
`;
}

/**
 * Get layout config for an industry
 */
function getLayoutConfig(industryKey, layoutKey) {
  const industry = INDUSTRY_LAYOUTS[industryKey];
  if (!industry) return null;

  const layout = layoutKey ? industry.layouts[layoutKey] : Object.values(industry.layouts)[0];

  return {
    industry,
    layout,
    context: buildLayoutContext(industryKey, layoutKey)
  };
}


/**
 * SECTION TEMPLATE DETAILS
 * Detailed instructions for each section type
 */
const SECTION_DETAILS = {
  // Hero Sections
  'hero-split': {
    name: 'Split Hero',
    structure: 'Two-column layout: text content on LEFT (60%), image/visual on RIGHT (40%)',
    elements: ['Large headline (48-64px)', 'Supporting subheadline', '1-2 CTA buttons', 'High-quality image on right'],
    spacing: 'Generous padding (80-120px vertical)',
    notes: 'Image should be relevant to industry, text should be compelling and action-oriented'
  },
  'hero-centered': {
    name: 'Centered Hero',
    structure: 'Single column, all content centered with background image or gradient',
    elements: ['Large centered headline', 'Centered subheadline', 'CTA button(s) centered below', 'Background image with overlay'],
    spacing: 'Tall section (min 80vh), content vertically centered',
    notes: 'Great for impactful statements, ensure text contrast with background'
  },
  'hero-with-form': {
    name: 'Hero with Lead Form',
    structure: 'Two-column: text content LEFT, lead capture form RIGHT',
    elements: ['Headline and value proposition', 'Form with 3-5 fields', 'Submit button', 'Privacy note'],
    spacing: 'Form should be prominent, white/light background for form area',
    notes: 'Form fields: Name, Email, Phone, Message/Service needed'
  },
  'hero-with-video': {
    name: 'Hero with Video',
    structure: 'Video background or embedded video player with overlay text',
    elements: ['Video player or background', 'Overlay text content', 'CTA button', 'Play button if embedded'],
    spacing: 'Full-width, 70-90vh height',
    notes: 'Video should autoplay muted if background, or show clear play button'
  },
  'hero-minimal': {
    name: 'Minimal Hero',
    structure: 'Maximum whitespace, just headline and minimal elements',
    elements: ['Large impactful headline only', 'Optional single-line subtext', 'Single CTA', 'No image or subtle background'],
    spacing: 'Very generous whitespace, let text breathe',
    notes: 'Typography is the star, use premium fonts'
  },
  'hero-image-first': {
    name: 'Image-First Hero',
    structure: 'Full-bleed hero image with text overlay',
    elements: ['Full-width background image', 'Dark overlay for text contrast', 'Headline and CTA overlaid', 'Scroll indicator'],
    spacing: '100vh full viewport height',
    notes: 'Image quality is critical, ensure text is readable'
  },

  // Services/Features Sections
  'services-grid': {
    name: 'Services Grid',
    structure: '3-4 column grid of service cards',
    elements: ['Icon or image for each service', 'Service title', 'Brief description (2-3 lines)', 'Optional "Learn More" link'],
    spacing: 'Equal gaps between cards, generous padding',
    notes: 'Keep descriptions concise, icons should be consistent style'
  },
  'services-list': {
    name: 'Services List',
    structure: 'Vertical list with alternating image positions',
    elements: ['Service image', 'Title and detailed description', 'Key benefits as bullet points', 'CTA for each service'],
    spacing: 'Generous vertical spacing between items',
    notes: 'Good for detailed service explanations'
  },
  'services-tabs': {
    name: 'Services Tabs',
    structure: 'Tabbed interface showing one service at a time',
    elements: ['Tab navigation bar', 'Content area with image + text', 'Details, pricing hints, CTA per tab'],
    spacing: 'Tab bar clearly separated from content',
    notes: 'Great for many services without overwhelming the page'
  },
  'services-cards': {
    name: 'Service Cards',
    structure: 'Cards with hover effects revealing more info',
    elements: ['Card front: icon + title', 'Card hover/flip: description + CTA', 'Consistent card sizing'],
    spacing: 'Grid layout, equal spacing',
    notes: 'Add subtle hover animations for engagement'
  },
  'services-bento': {
    name: 'Bento Grid',
    structure: 'Mixed-size cards in asymmetric bento box layout',
    elements: ['1 large featured card', '2-4 medium cards', 'Various content types (image, stats, text)'],
    spacing: 'Consistent gaps, varied card sizes',
    notes: 'Modern, visually interesting layout'
  },

  // Testimonials Sections
  'testimonials-carousel': {
    name: 'Testimonials Carousel',
    structure: 'Horizontal sliding carousel of testimonials',
    elements: ['Customer photo', 'Quote text', 'Name and title', 'Star rating', 'Navigation arrows/dots'],
    spacing: 'Cards visible at a time, smooth sliding',
    notes: 'Auto-rotate optional, ensure manual navigation works'
  },
  'testimonials-grid': {
    name: 'Testimonials Grid',
    structure: '2-3 column grid of testimonial cards',
    elements: ['Photo', 'Quote', 'Attribution', 'Optional rating'],
    spacing: 'Equal card sizes, consistent gaps',
    notes: 'Show 3-6 testimonials max'
  },
  'testimonials-featured': {
    name: 'Featured Testimonial',
    structure: 'Single large, prominent testimonial',
    elements: ['Large photo', 'Extended quote', 'Full attribution with company/role', 'Background styling'],
    spacing: 'Full-width section, generous padding',
    notes: 'Use your best testimonial here'
  },
  'testimonials-quotes': {
    name: 'Quote Wall',
    structure: 'Masonry layout of quote snippets',
    elements: ['Short quotes (1-2 lines each)', 'Name only attribution', 'Varied card sizes'],
    spacing: 'Masonry flow, minimal gaps',
    notes: 'Quantity shows social proof'
  },

  // Stats Sections
  'stats-bar': {
    name: 'Stats Bar',
    structure: 'Horizontal row of 3-4 key statistics',
    elements: ['Large number', 'Label below', 'Optional icon'],
    spacing: 'Full-width bar, equal spacing between stats',
    notes: 'Keep it simple, numbers should be impressive'
  },
  'stats-animated': {
    name: 'Animated Stats',
    structure: 'Numbers that count up when scrolled into view',
    elements: ['Large animated number', 'Descriptive label', 'Optional suffix (+, %, etc)'],
    spacing: 'Grid or row layout',
    notes: 'Use intersection observer for scroll trigger'
  },
  'stats-cards': {
    name: 'Stats Cards',
    structure: 'Individual cards for each statistic',
    elements: ['Icon', 'Number', 'Description', 'Card background'],
    spacing: 'Grid layout with gaps',
    notes: 'Cards can have subtle backgrounds or borders'
  },
  'stats-large': {
    name: 'Large Stats',
    structure: 'Big bold numbers with minimal styling',
    elements: ['Oversized number (72px+)', 'Short label', 'Minimal decoration'],
    spacing: 'Lots of whitespace around numbers',
    notes: 'Let the numbers speak for themselves'
  },

  // Trust/Social Proof Sections
  'trust-logos': {
    name: 'Trust Logos',
    structure: 'Row of client/partner logos',
    elements: ['Grayscale or color logos', '"As seen in" or "Trusted by" header', '4-8 logos'],
    spacing: 'Horizontal row, equal spacing',
    notes: 'Logos should be similar size, grayscale often looks cleaner'
  },
  'trust-badges': {
    name: 'Trust Badges',
    structure: 'Certification and credential badges',
    elements: ['Certification logos', 'Award badges', 'Industry memberships', 'Security seals'],
    spacing: 'Clustered or row layout',
    notes: 'Show relevant credentials for your industry'
  },
  'trust-guarantees': {
    name: 'Guarantees Section',
    structure: 'Money-back, satisfaction guarantees displayed',
    elements: ['Guarantee icon/badge', 'Guarantee text', 'Supporting details'],
    spacing: 'Prominent placement, clear messaging',
    notes: 'Build confidence with clear guarantees'
  },
  'trust-press': {
    name: 'Press Mentions',
    structure: 'Featured press coverage and mentions',
    elements: ['Publication logos', 'Quote snippets', 'Links to articles'],
    spacing: 'Logo bar or cards layout',
    notes: 'Social proof through media coverage'
  },

  // About Sections
  'about-split': {
    name: 'Split About',
    structure: 'Image on one side, story text on other',
    elements: ['Team/founder photo', 'Company story', 'Mission statement', 'Key values'],
    spacing: '50/50 split, generous padding',
    notes: 'Make it personal and authentic'
  },
  'about-timeline': {
    name: 'Timeline About',
    structure: 'Chronological company history timeline',
    elements: ['Year/date markers', 'Milestone descriptions', 'Optional images per milestone'],
    spacing: 'Vertical timeline with clear markers',
    notes: 'Great for established businesses with history'
  },
  'about-values': {
    name: 'Values About',
    structure: 'Core values highlighted with icons',
    elements: ['Value icons', 'Value titles', 'Brief descriptions', 'Overall mission'],
    spacing: 'Grid of value cards',
    notes: 'Keep values genuine and specific'
  },
  'about-team': {
    name: 'Team About',
    structure: 'Team member cards with photos',
    elements: ['Professional headshots', 'Names and roles', 'Short bios', 'Social links optional'],
    spacing: 'Grid layout, equal card sizes',
    notes: 'Humanizes your business'
  },

  // Gallery Sections
  'gallery-grid': {
    name: 'Gallery Grid',
    structure: 'Equal-size image grid',
    elements: ['Square or consistent aspect ratio images', 'Hover effects', 'Lightbox on click'],
    spacing: 'Minimal gaps, grid layout',
    notes: 'Ensure high-quality images'
  },
  'gallery-masonry': {
    name: 'Masonry Gallery',
    structure: 'Pinterest-style varied height images',
    elements: ['Mixed aspect ratio images', 'Flowing layout', 'Hover captions optional'],
    spacing: 'Consistent gaps, varied heights',
    notes: 'More dynamic visual layout'
  },
  'gallery-carousel': {
    name: 'Gallery Carousel',
    structure: 'Sliding image showcase',
    elements: ['Large images', 'Navigation arrows', 'Thumbnails optional', 'Captions'],
    spacing: 'Full-width carousel',
    notes: 'Good for showcasing best work'
  },
  'gallery-featured': {
    name: 'Featured Gallery',
    structure: 'One large image with smaller thumbnails',
    elements: ['Hero image', 'Thumbnail grid below', 'Category labels'],
    spacing: 'Featured image prominent',
    notes: 'Highlight your best work'
  },

  // CTA Sections
  'cta-simple': {
    name: 'Simple CTA',
    structure: 'Headline + single button, often with background color',
    elements: ['Compelling headline', 'Brief supporting text', 'Single prominent button'],
    spacing: 'Centered content, full-width background',
    notes: 'Keep it focused, one clear action'
  },
  'cta-with-form': {
    name: 'CTA with Form',
    structure: 'Call-to-action with inline form',
    elements: ['Headline', 'Short form (email or contact)', 'Submit button', 'Privacy note'],
    spacing: 'Form prominent, centered or split layout',
    notes: 'Reduce form friction, fewer fields = more conversions'
  },
  'cta-split': {
    name: 'Split CTA',
    structure: 'Two-column with image and CTA content',
    elements: ['Compelling image', 'Headline and text', 'CTA button', 'Optional secondary link'],
    spacing: '50/50 or 60/40 split',
    notes: 'Image should support the CTA message'
  },
  'cta-banner': {
    name: 'Banner CTA',
    structure: 'Full-width banner style call-to-action',
    elements: ['Bold headline', 'Button(s)', 'Background color or gradient'],
    spacing: 'Full-width, moderate height',
    notes: 'Stand out from other sections'
  },

  // Contact Sections
  'contact-split': {
    name: 'Split Contact',
    structure: 'Form on one side, contact info on other',
    elements: ['Contact form', 'Phone, email, address', 'Business hours', 'Social links'],
    spacing: '50/50 split layout',
    notes: 'Multiple ways to reach you'
  },
  'contact-with-map': {
    name: 'Contact with Map',
    structure: 'Contact info with embedded map',
    elements: ['Contact form', 'Embedded Google Map', 'Address and directions', 'Hours'],
    spacing: 'Map prominent, form alongside',
    notes: 'Great for physical locations'
  },
  'contact-minimal': {
    name: 'Minimal Contact',
    structure: 'Just the essentials, clean design',
    elements: ['Simple form', 'Key contact info', 'Minimal styling'],
    spacing: 'Lots of whitespace',
    notes: 'Clean and professional'
  },

  // FAQ Sections
  'faq-accordion': {
    name: 'FAQ Accordion',
    structure: 'Expandable question/answer pairs',
    elements: ['Question as clickable header', 'Answer revealed on click', 'Plus/minus toggle icon'],
    spacing: 'Clear separation between items',
    notes: 'Only one open at a time recommended'
  },
  'faq-grid': {
    name: 'FAQ Grid',
    structure: 'Cards with Q&A visible',
    elements: ['Question card header', 'Answer visible below', 'Grid of 4-6 FAQs'],
    spacing: 'Equal card sizes, grid layout',
    notes: 'Good for shorter answers'
  },

  // Pricing Sections
  'pricing-cards': {
    name: 'Pricing Cards',
    structure: 'Side-by-side pricing tier cards',
    elements: ['Tier name', 'Price', 'Feature list', 'CTA button', 'Popular badge optional'],
    spacing: '3 cards typical, middle one featured',
    notes: 'Highlight recommended tier'
  },

  // ============================================
  // HEALTHCARE-SPECIFIC SECTIONS
  // Based on HealthcareOS proven templates
  // ============================================

  'medical-hero': {
    name: 'Medical Hero Section',
    structure: 'Header bar with identity + hero content with emergency alert',
    elements: [
      'Practice name and tagline in header',
      'Hero headline: "Welcome to Quality Healthcare" or similar',
      'Hero subtitle describing comprehensive services',
      'Two CTA buttons: "Schedule Appointment" (primary) + "Patient Portal" (secondary)',
      'Emergency alert bar: "For emergencies, call 911 or visit our Emergency Department"'
    ],
    spacing: 'Header fixed, hero section 70-80vh with padding-top for header clearance',
    notes: 'Emergency alert is CRITICAL for medical sites. Use medical blue gradient for hero background. Include credentials badges (ADA Member, Board Certified, etc.)'
  },

  'medical-stats': {
    name: 'Medical Statistics Bar',
    structure: 'Horizontal row of 4 key healthcare metrics',
    elements: [
      'Patients Served (e.g., "5,000+")',
      'Medical Professionals (e.g., "25+")',
      'Years of Service (e.g., "15+")',
      'Patient Satisfaction (e.g., "4.9★" or "98%")'
    ],
    spacing: '4-column grid, each stat as a card with icon, number, and label',
    notes: 'Use medical icons (👥, 👨‍⚕️, 🏥, ⭐). Numbers should count up on scroll if energy slider is high.'
  },

  'medical-services': {
    name: 'Medical Services Grid',
    structure: '4-column grid of medical service cards',
    elements: [
      'Service icon (medical emoji or icon)',
      'Service title (Primary Care, Diagnostics, Specialist Care, Urgent Care)',
      'Brief description (2-3 lines)',
      'Learn More link'
    ],
    spacing: 'Grid with equal gaps, cards have subtle borders',
    notes: 'One card should be highlighted as "urgent" with different styling. Include services like: Primary Care, Diagnostic Services, Specialist Care, Urgent Care, Preventive Medicine, Women\'s Health'
  },

  'quick-actions': {
    name: 'Quick Actions Grid',
    structure: '6-item grid of common patient actions',
    elements: [
      'Schedule Appointment (📅)',
      'View Test Results (📋)',
      'Prescription Refills (💊)',
      'Pay Bill Online (💳)',
      'Patient Forms (📝)',
      'Contact Us (📞)'
    ],
    spacing: '3x2 or 2x3 grid of action cards',
    notes: 'Each action is a clickable card with icon, title, and short description. Links to appropriate pages.'
  },

  'provider-cards': {
    name: 'Healthcare Provider Cards',
    structure: 'Grid of provider/doctor cards',
    elements: [
      'Provider photo or avatar (👨‍⚕️/👩‍⚕️)',
      'Provider name with title (Dr. prefix)',
      'Specialty (Internal Medicine, Pediatrics, etc.)',
      'Years of experience',
      'View Profile link'
    ],
    spacing: '4-column grid for desktop, 2 for mobile',
    notes: 'Show 4-8 featured providers. Include credentials like "Board Certified", "Fellowship Trained".'
  },

  'insurance-info': {
    name: 'Insurance Information Section',
    structure: 'Insurance accepted logos + payment info',
    elements: [
      '"Insurance We Accept" header',
      'Grid of insurance logos (Blue Cross, Aetna, United, Cigna, etc.)',
      'Self-pay options mentioned',
      'Payment plans available note'
    ],
    spacing: 'Logo row centered, additional info below',
    notes: 'IMPORTANT for medical sites. Include note about verifying coverage.'
  },

  'newsletter-cta': {
    name: 'Health Newsletter CTA',
    structure: 'Full-width newsletter signup for health tips',
    elements: [
      '"Stay Informed About Your Health" headline',
      'Subtitle about health tips and updates',
      'Email input field',
      'Subscribe button'
    ],
    spacing: 'Full-width background, centered content',
    notes: 'Use gradient background. Emphasize value of health information.'
  },

  // ============================================
  // DENTAL-SPECIFIC SECTIONS
  // ============================================

  'dental-hero': {
    name: 'Dental Practice Hero',
    structure: 'Professional dental header with hero content',
    elements: [
      'Practice name with dental icon (🦷)',
      'Specialty tagline: "Comprehensive Dental Care"',
      'Credentials badges: "DDS Licensed", "ADA Member", "Family Friendly"',
      'Key metrics in header: Happy Smiles, Patient Rating, Years Serving',
      'Two CTAs: Book Appointment + Patient Portal'
    ],
    spacing: 'Prominent header with metrics, hero content below',
    notes: 'Dental sites should feel clean and bright. Use dental blue or fresh mint colors.'
  },

  'dental-services': {
    name: 'Dental Services Grid',
    structure: 'Grid of dental service cards with badges',
    elements: [
      'Preventive Care (🧼) - cleanings, exams',
      'Cosmetic Dentistry (✨) - whitening, veneers',
      'Restorative (🦷) - fillings, crowns',
      'Orthodontics (😁) - braces, aligners',
      'Emergency Care (🚨) - urgent dental',
      'Pediatric (👶) - children\'s dentistry'
    ],
    spacing: 'Card grid with service badges (Essential, Popular, etc.)',
    notes: 'Include pricing hints where appropriate. Highlight most popular services.'
  },

  'dental-stats': {
    name: 'Dental Practice Statistics',
    structure: 'KPI cards showing dental practice metrics',
    elements: [
      'Patient Satisfaction (98.5%)',
      'Procedures Completed (5,000+)',
      'Happy Smiles created',
      'Technology level (100% Digital)'
    ],
    spacing: '3-4 KPI cards with primary metric and secondary details',
    notes: 'Include specific numbers for cleanings, fillings, cosmetic procedures.'
  },

  'smile-gallery': {
    name: 'Smile Gallery / Before-After',
    structure: 'Visual gallery of smile transformations',
    elements: [
      'Before/After comparison images',
      'Treatment type label',
      'Patient testimonial snippet',
      'Category filters (Whitening, Veneers, Invisalign, etc.)'
    ],
    spacing: 'Masonry or grid layout, hover for details',
    notes: 'CRITICAL for cosmetic dental practices. Real results build trust.'
  },

  'technology-showcase': {
    name: 'Dental Technology Showcase',
    structure: 'Highlight modern dental technology',
    elements: [
      'Digital X-Rays (90% less radiation)',
      'CAD/CAM Same-Day Crowns',
      'Laser Dentistry (Pain-Free)',
      'Intraoral Cameras',
      '3D Imaging'
    ],
    spacing: 'Icon + title + benefit format',
    notes: 'Technology differentiates modern dental practices. Emphasize patient benefits.'
  },

  // ============================================
  // MENTAL HEALTH-SPECIFIC SECTIONS
  // ============================================

  'approach-values': {
    name: 'Therapeutic Approach & Values',
    structure: 'Calm, reassuring section about therapy approach',
    elements: [
      'Treatment philosophy headline',
      'Approach description (CBT, DBT, mindfulness, etc.)',
      'Core values (Compassion, Confidentiality, Growth)',
      'What to expect in first session'
    ],
    spacing: 'Generous whitespace, calm typography',
    notes: 'Reduce anxiety about seeking help. Use gentle, non-clinical language.'
  },

  'about-therapist': {
    name: 'About the Therapist',
    structure: 'Personal introduction to therapist/counselor',
    elements: [
      'Professional photo',
      'Personal message/philosophy',
      'Credentials and training',
      'Specializations',
      'Professional memberships'
    ],
    spacing: 'Two-column: photo left, bio right',
    notes: 'Personal connection is crucial for therapy. Show warmth and expertise.'
  },

  'specializations': {
    name: 'Treatment Specializations',
    structure: 'List of conditions and issues treated',
    elements: [
      'Anxiety & Depression',
      'Trauma & PTSD',
      'Relationship Issues',
      'Life Transitions',
      'Stress Management',
      'And more specific to practice'
    ],
    spacing: 'Clean list or card format',
    notes: 'Help visitors identify if the therapist can help them specifically.'
  },

  'telehealth-features': {
    name: 'Telehealth Features',
    structure: 'Highlight online therapy capabilities',
    elements: [
      'Secure video sessions',
      'Flexible scheduling',
      'No commute needed',
      'Same quality of care',
      'Platform information'
    ],
    spacing: 'Feature cards or icon list',
    notes: 'Emphasize privacy, convenience, and accessibility.'
  },

  // ============================================
  // EMERGENCY/URGENT CARE SECTIONS
  // ============================================

  'emergency-hero': {
    name: 'Emergency Care Hero',
    structure: 'Urgent, attention-grabbing hero for emergency services',
    elements: [
      'Large "24/7 Emergency Care" headline',
      'Phone number VERY prominent',
      'Address and directions link',
      'Current wait time if available',
      '"Come In Now" CTA'
    ],
    spacing: 'High contrast, large text, minimal distractions',
    notes: 'People in emergencies need info FAST. No fluff.'
  },

  'emergency-services': {
    name: 'Emergency Services List',
    structure: 'Clear list of emergency conditions treated',
    elements: [
      'Conditions treated (broken bones, cuts, fever, etc.)',
      'When to come to us vs ER',
      'What to bring',
      'Insurance/payment info'
    ],
    spacing: 'Scannable list format',
    notes: 'Help people quickly determine if you can help them.'
  },

  'contact-urgent': {
    name: 'Urgent Contact Section',
    structure: 'Contact info optimized for urgent needs',
    elements: [
      'Large phone number (click to call)',
      'Address with map',
      'Hours (emphasize 24/7 if applicable)',
      'Walk-in welcome message'
    ],
    spacing: 'Phone number is hero-sized',
    notes: 'Every second counts in emergencies. Make contact info unmissable.'
  },

  // ============================================
  // VETERINARY-SPECIFIC SECTIONS
  // ============================================

  'emergency-cta': {
    name: 'Pet Emergency CTA',
    structure: 'Emergency care call-to-action for pet emergencies',
    elements: [
      'Emergency headline',
      'Emergency phone number',
      'Common pet emergencies list',
      'Location/hours info'
    ],
    spacing: 'Prominent placement, high contrast',
    notes: 'Pet owners in crisis need fast info. Include after-hours contact.'
  },

  'conditions-treated': {
    name: 'Conditions Treated Section',
    structure: 'List of conditions/issues the practice addresses',
    elements: [
      'Common conditions (back pain, neck pain, headaches, etc.)',
      'Brief description of how they\'re treated',
      'Link to learn more about each'
    ],
    spacing: 'Card grid or accordion format',
    notes: 'Help visitors see themselves in the conditions listed.'
  },

  // ============================================
  // REAL ESTATE-SPECIFIC SECTIONS
  // Based on RealEstateOS proven templates
  // ============================================

  'realestate-hero': {
    name: 'Real Estate Hero Section',
    structure: 'Professional hero with headline, stats bar, and dual CTAs',
    elements: [
      'Compelling headline: "Find Your Dream Home" or similar',
      'Subtitle with value proposition',
      'Stats bar: Active Listings, Sold This Month, Avg Days on Market',
      'Two CTAs: "Search Properties" (primary) + "Free Market Analysis" (secondary)',
      'Optional: Featured property card preview'
    ],
    spacing: 'Hero 70-80vh, stats prominently displayed',
    notes: 'Stats build credibility immediately. Include property type badges if showing featured listing.'
  },

  'property-search': {
    name: 'Property Search Section',
    structure: 'Advanced search form with property filters',
    elements: [
      'Search headline: "Find Your Perfect Property"',
      'Location search (city, zip, neighborhood)',
      'Price range (min/max sliders or dropdowns)',
      'Beds/Baths selectors',
      'Property type filter (house, condo, townhouse, etc.)',
      'Search button (prominent)',
      'Optional: Advanced filters toggle'
    ],
    spacing: 'Full-width or card-style form, generous padding',
    notes: 'Search is THE primary action for real estate. Make it prominent and easy to use.'
  },

  'featured-properties': {
    name: 'Featured Properties Grid',
    structure: 'Grid of property listing cards',
    elements: [
      'Property image (high quality)',
      'Price (large, prominent)',
      'Address/location',
      'Key details: beds, baths, sqft',
      'Property type badge',
      'Status badge (For Sale, Pending, New)',
      'View Details link/button'
    ],
    spacing: '3-4 column grid, cards with consistent sizing',
    notes: 'Show 6-12 featured properties. Include "View All Listings" link.'
  },

  'market-stats': {
    name: 'Real Estate Market Statistics',
    structure: 'Key market metrics and trends',
    elements: [
      'Active Listings count',
      'Median Home Price',
      'Average Days on Market',
      'Sold This Month/Year',
      'Price trend indicator (up/down arrow)',
      'Optional: Neighborhood comparison'
    ],
    spacing: '4-column stat cards or horizontal bar',
    notes: 'Market data builds trust and shows expertise. Update regularly.'
  },

  'agent-profiles': {
    name: 'Real Estate Agent Profiles',
    structure: 'Grid of agent cards with contact info',
    elements: [
      'Professional headshot',
      'Agent name and title',
      'Specializations (Luxury, First-Time Buyers, etc.)',
      'Years of experience',
      'Sales volume or transactions',
      'Contact button',
      'View Profile link'
    ],
    spacing: '3-4 column grid, equal card sizes',
    notes: 'Agents are the face of the business. Show personality and expertise.'
  },

  'agent-hero': {
    name: 'Agent Personal Brand Hero',
    structure: 'Hero section featuring individual agent',
    elements: [
      'Large agent photo',
      'Agent name and credentials',
      'Personal tagline/mission',
      'Key stats: Homes Sold, Years Experience, Client Satisfaction',
      'Contact CTA',
      'Social media links'
    ],
    spacing: 'Split layout: agent photo on one side, content on other',
    notes: 'For individual agent websites. Make it personal and trustworthy.'
  },

  'agent-stats': {
    name: 'Agent Performance Statistics',
    structure: 'Individual agent achievement metrics',
    elements: [
      'Homes Sold (lifetime or year)',
      'Total Sales Volume ($)',
      'Average Days to Sell',
      'Client Satisfaction Rating',
      'Years of Experience',
      'Awards/Recognition'
    ],
    spacing: 'Horizontal stat bar or card grid',
    notes: 'Build credibility with real numbers. Include comparison to market average if favorable.'
  },

  'about-agent': {
    name: 'About the Agent Section',
    structure: 'Personal story and credentials for individual agents',
    elements: [
      'Personal biography',
      'Why real estate / passion statement',
      'Areas of expertise',
      'Neighborhoods served',
      'Certifications and designations',
      'Personal interests (humanizing)'
    ],
    spacing: 'Two-column: photo + bio content',
    notes: 'Make it personal. Clients choose agents they connect with.'
  },

  'property-showcase': {
    name: 'Property Visual Showcase',
    structure: 'Large visual gallery of featured properties',
    elements: [
      'Large hero property image',
      'Property details overlay',
      'Navigation to other featured properties',
      'Quick view details',
      'Virtual tour button if available'
    ],
    spacing: 'Full-width showcase with thumbnails or carousel',
    notes: 'Visual-first approach. Let the properties sell themselves.'
  },

  // ============================================
  // LUXURY REAL ESTATE SECTIONS
  // ============================================

  'luxury-hero': {
    name: 'Luxury Real Estate Hero',
    structure: 'Premium hero with gold accents and exclusive positioning',
    elements: [
      'Luxury intro badge: "Curated Collection"',
      'Premium headline: "Extraordinary Properties for Extraordinary Lives"',
      'Exclusive features: Exclusive Estates, White-Glove Service, Private Showings',
      'Two CTAs: "View Luxury Collection" + "Schedule Private Consultation"',
      'Featured estate card with price in millions',
      'VIP Hotline in header'
    ],
    spacing: 'Full-height hero, dark elegant background, gold accents',
    notes: 'Luxury requires premium feel. Dark mode, gold accents, exclusive language.'
  },

  'luxury-properties': {
    name: 'Luxury Property Showcase',
    structure: 'Premium property cards with exclusive badges',
    elements: [
      'Large property image with hover gallery',
      'Exclusive Listing badge',
      'Price displayed as "X.X Million"',
      'Property name/title',
      'Premium location (Beverly Hills, Malibu, etc.)',
      'Luxury amenities: bedrooms, bathrooms, sqft',
      'Feature tags: Ocean View, Wine Cellar, etc.'
    ],
    spacing: 'Large cards, generous whitespace, featured property larger',
    notes: 'Luxury listings deserve premium presentation. Highlight unique features.'
  },

  'exclusive-services': {
    name: 'Exclusive Services Section',
    structure: 'White-glove services offered',
    elements: [
      'Concierge Services',
      'Private Viewings',
      'Relocation Assistance',
      'Interior Design Consultation',
      'Legal & Financial Coordination',
      'Post-Purchase Support'
    ],
    spacing: 'Icon + title + description format, elegant styling',
    notes: 'Differentiate from standard real estate with premium services.'
  },

  'concierge-cta': {
    name: 'Concierge CTA Section',
    structure: 'Premium call-to-action for luxury clients',
    elements: [
      'Exclusive headline',
      'Concierge phone number',
      'Private consultation booking',
      'Discretion guarantee'
    ],
    spacing: 'Full-width, dark elegant background',
    notes: 'Luxury clients expect privacy and personal attention.'
  },

  // ============================================
  // COMMERCIAL REAL ESTATE SECTIONS
  // ============================================

  'commercial-hero': {
    name: 'Commercial Real Estate Hero',
    structure: 'Business-focused hero with investment metrics',
    elements: [
      'Professional headline for investors/businesses',
      'Property types: Office, Retail, Industrial, Mixed-Use',
      'Key metrics: Available Properties, Sq Ft Under Management',
      'Two CTAs: "Search Properties" + "Investment Inquiry"'
    ],
    spacing: 'Professional layout, clean typography',
    notes: 'Commercial clients are sophisticated. Lead with data and expertise.'
  },

  'investment-properties': {
    name: 'Investment Properties Grid',
    structure: 'Property cards with investment metrics',
    elements: [
      'Property image',
      'Price/Asking price',
      'Cap Rate',
      'NOI (Net Operating Income)',
      'Square footage',
      'Property type',
      'Occupancy rate',
      'Year built'
    ],
    spacing: 'Grid layout with detailed data cards',
    notes: 'Investors need numbers. Show cap rates, NOI, and returns prominently.'
  },

  'market-analytics': {
    name: 'Commercial Market Analytics',
    structure: 'Market trends and analysis section',
    elements: [
      'Market trend charts',
      'Vacancy rates by property type',
      'Rental rate trends',
      'Absorption rates',
      'Cap rate trends',
      'Downloadable market report CTA'
    ],
    spacing: 'Dashboard-style with charts and graphs',
    notes: 'Commercial investors make data-driven decisions. Provide insights.'
  },

  // ============================================
  // PROPERTY MANAGEMENT SECTIONS
  // ============================================

  'owner-benefits': {
    name: 'Property Owner Benefits Section',
    structure: 'Value proposition for property owners',
    elements: [
      'Hassle-free ownership messaging',
      'Services included: Tenant screening, Rent collection, Maintenance',
      'ROI focus: Maximize rental income',
      'Reporting and transparency',
      'Legal compliance handling'
    ],
    spacing: 'Icon cards or feature list',
    notes: 'Owners want peace of mind and returns. Address both.'
  },

  'available-rentals': {
    name: 'Available Rentals Grid',
    structure: 'Rental property listings for tenants',
    elements: [
      'Property photo',
      'Monthly rent',
      'Location',
      'Beds/Baths',
      'Available date',
      'Pet policy',
      'Apply Now button'
    ],
    spacing: 'Grid layout with filter options',
    notes: 'Tenants need quick info. Show availability and key details upfront.'
  },

  'tenant-resources': {
    name: 'Tenant Resources Section',
    structure: 'Quick links for tenant services',
    elements: [
      'Pay Rent Online',
      'Submit Maintenance Request',
      'View Lease Documents',
      'Contact Property Manager',
      'FAQs for Tenants'
    ],
    spacing: 'Quick action cards or button grid',
    notes: 'Make tenant self-service easy. Reduces management overhead.'
  },

  'audience-split': {
    name: 'Dual Audience Section',
    structure: 'Split section addressing owners and tenants',
    elements: [
      'Left side: For Property Owners (services, CTA)',
      'Right side: For Tenants (portal access, CTA)',
      'Clear visual separation',
      'Distinct CTAs for each audience'
    ],
    spacing: '50/50 split with contrasting backgrounds',
    notes: 'Property management serves two audiences. Address both clearly.'
  },

  // ============================================
  // UNIVERSAL PATTERNS
  // Extracted from Huddle - useful across many industries
  // ============================================

  'leaderboard-table': {
    name: 'Leaderboard / Rankings Table',
    structure: 'Ranked table showing top performers with stats',
    elements: [
      'Rank number (1st, 2nd, 3rd with badges/medals)',
      'Name/photo of person or entity',
      'Primary score or metric',
      'Secondary stats (win rate, streak, etc.)',
      'Trend indicator (up/down arrows)',
      'View Profile link'
    ],
    spacing: 'Table rows with alternating backgrounds, sticky header',
    notes: 'Great for gamification, competitions, top customers, employee recognition. Highlight top 3 with special styling.'
  },

  'activity-feed': {
    name: 'Activity Feed / Event Log',
    structure: 'Chronological feed of actions and events',
    elements: [
      'Timestamp (relative: "2 hours ago" or absolute)',
      'Actor avatar/icon',
      'Action description',
      'Related entity link',
      'Optional: reaction buttons, comments'
    ],
    spacing: 'Vertical list with clear separation between items',
    notes: 'Useful for community sites, dashboards, social features. Can filter by type. Real-time updates optional.'
  },

  'marketplace-grid': {
    name: 'Marketplace / Listings Grid',
    structure: 'Grid of items available for purchase, trade, or exchange',
    elements: [
      'Item image/thumbnail',
      'Title/name',
      'Price or value',
      'Seller/source info',
      'Status badge (Available, Sold, Pending)',
      'Key details (condition, category)',
      'Action button (Buy, Contact, View)'
    ],
    spacing: '3-4 column grid with filter sidebar or top filter bar',
    notes: 'For any exchange: products, services, jobs, rentals. Include sort and filter options.'
  },

  'financial-dashboard': {
    name: 'Financial / Membership Dashboard',
    structure: 'Overview of financial status, payments, or membership',
    elements: [
      'Current balance or status',
      'Payment history or transactions',
      'Upcoming payments/renewals',
      'Plan/tier information',
      'Upgrade CTA',
      'Payment method on file'
    ],
    spacing: 'Card-based layout with clear sections',
    notes: 'For memberships, subscriptions, account balances. Include quick actions for common tasks.'
  },

  'configuration-panel': {
    name: 'Configuration / Settings Panel',
    structure: 'Form-based panel for customizing options',
    elements: [
      'Section headers for grouped options',
      'Toggle switches for on/off settings',
      'Dropdown selects for choices',
      'Range sliders for values',
      'Text inputs for custom values',
      'Save/Reset buttons'
    ],
    spacing: 'Grouped sections with clear labels, generous spacing',
    notes: 'For SaaS products, customizable services, user preferences. Group related settings together.'
  },

  'time-navigator': {
    name: 'Time / Period Navigator',
    structure: 'Navigation for time-based content (weeks, months, seasons)',
    elements: [
      'Previous/Next arrows',
      'Current period display',
      'Dropdown for direct selection',
      'Today/Current button',
      'Optional: mini calendar'
    ],
    spacing: 'Compact horizontal bar, often sticky',
    notes: 'For scheduling, events, reports, historical data. Clear indication of current selection.'
  },

  'member-directory': {
    name: 'Member / Team Directory',
    structure: 'Grid or list of members with search/filter',
    elements: [
      'Member photo/avatar',
      'Name and role/title',
      'Contact info or links',
      'Status indicator (online, active)',
      'Search bar',
      'Filter by role/department'
    ],
    spacing: 'Grid for visual, list for detailed view. Toggle option.',
    notes: 'For teams, communities, organizations. Include invite/add member CTA if applicable.'
  },

  'progress-tracker': {
    name: 'Progress / Milestone Tracker',
    structure: 'Visual representation of progress toward a goal',
    elements: [
      'Progress bar or circular indicator',
      'Current value vs target',
      'Milestone markers',
      'Percentage complete',
      'Estimated completion or next milestone'
    ],
    spacing: 'Prominent placement, often in dashboard or header',
    notes: 'For goals, campaigns, projects, onboarding. Celebrate milestones with visual feedback.'
  },

  'notification-center': {
    name: 'Notification Center / Alerts',
    structure: 'Centralized view of notifications and alerts',
    elements: [
      'Notification list with icons by type',
      'Read/unread status',
      'Timestamp',
      'Action links',
      'Mark all as read',
      'Notification preferences link'
    ],
    spacing: 'Dropdown panel or dedicated page, grouped by date',
    notes: 'For any app with notifications. Group by type or time. Clear visual hierarchy for unread.'
  },

  'comparison-table': {
    name: 'Comparison / Feature Table',
    structure: 'Side-by-side comparison of options or plans',
    elements: [
      'Column headers for each option',
      'Row labels for features',
      'Check marks or values per cell',
      'Highlight recommended option',
      'CTA buttons per column'
    ],
    spacing: 'Full-width table, sticky first column on mobile',
    notes: 'For pricing tiers, product comparison, plan selection. Highlight differences clearly.'
  },

  'dashboard-stats': {
    name: 'Dashboard Statistics Overview',
    structure: 'Quick-glance metrics for dashboards',
    elements: [
      '4-6 key metric cards',
      'Metric value (large number)',
      'Metric label',
      'Trend indicator (% change, arrow)',
      'Sparkline or mini chart optional',
      'Click to drill down'
    ],
    spacing: 'Horizontal row or 2x3 grid at top of dashboard',
    notes: 'First thing users see on dashboard. Show most important metrics. Color-code positive/negative trends.'
  },

  'quick-actions-bar': {
    name: 'Quick Actions Bar',
    structure: 'Row of primary action buttons',
    elements: [
      'Icon + label buttons',
      '3-6 most common actions',
      'Consistent button styling',
      'Keyboard shortcuts hint optional'
    ],
    spacing: 'Horizontal bar, often below hero or in header',
    notes: 'Surface most-used features. Reduce clicks to common tasks. Can be contextual based on user state.'
  },

  // ============================================
  // UNIVERSAL PATTERNS FROM SLABTRACK
  // Advanced UI patterns for interactive applications
  // ============================================

  'time-bound-event': {
    name: 'Time-Bound Event Section',
    structure: 'Event card with countdown timer and live status',
    elements: [
      'Event title and description',
      'Countdown timer (days:hours:mins:secs)',
      'Current status badge (upcoming/live/ended)',
      'Primary action button (Join, Bid, Register)',
      'Participant count or viewer count',
      'Event image or preview'
    ],
    spacing: 'Prominent card placement, timer updates in real-time',
    notes: 'Use for flash sales, limited offers, live events, auctions, webinars. Creates urgency. Timer should be visually prominent.'
  },

  'preset-selector': {
    name: 'Preset Selection Grid',
    structure: 'Visual grid of preset options with preview thumbnails',
    elements: [
      'Preset thumbnail/preview image',
      'Preset name',
      'Brief description',
      'Selection indicator (checkbox/radio)',
      'Optional "Popular" or "New" badge'
    ],
    spacing: '3-4 column grid, cards with hover effects',
    notes: 'Let users quickly select from pre-configured options. Show visual preview of what they\'ll get. Good for styles, templates, packages.'
  },

  'multi-channel-share': {
    name: 'Multi-Channel Share/Export',
    structure: 'Platform selector with one-click sharing to multiple destinations',
    elements: [
      'Content preview thumbnail',
      'Platform icons (Instagram, Facebook, Twitter, etc.)',
      'Platform-specific format indicators',
      'Share/Export button for each',
      'Bulk share option',
      'Copy link button'
    ],
    spacing: 'Horizontal row of platform icons or vertical list with details',
    notes: 'Enable easy content distribution. Show which formats work best for each platform. Include direct share and download options.'
  },

  'contextual-ai-assistant': {
    name: 'Contextual AI Assistant Panel',
    structure: 'Floating or docked AI chat panel that adapts to current context',
    elements: [
      'AI avatar or icon',
      'Context indicator (what page/feature user is on)',
      'Suggested prompts based on context',
      'Chat input field',
      'Quick action buttons',
      'Minimize/expand toggle'
    ],
    spacing: 'Bottom-right corner floating, or side panel docked',
    notes: 'AI assistant should know what user is doing and offer relevant help. Provide suggested questions. Show context-aware quick actions.'
  },

  'b2b-partnership-dashboard': {
    name: 'B2B Partnership Dashboard',
    structure: 'Dashboard for managing business relationships and inventory',
    elements: [
      'Partner/vendor list with status',
      'Inventory summary by partner',
      'Commission/fee tracking',
      'Pending actions count',
      'Recent transactions table',
      'Add new partner button'
    ],
    spacing: 'Two-column layout: partner list on left, details on right',
    notes: 'For businesses managing consignment, wholesale, or partnership relationships. Show clear status of each relationship.'
  },

  'multi-image-analyzer': {
    name: 'Multi-Image Analysis Grid',
    structure: 'Grid of uploaded images with AI analysis results for each',
    elements: [
      'Image upload zone (drag & drop)',
      'Thumbnail grid of uploaded images',
      'Per-image analysis status (pending/processing/complete)',
      'Analysis results overlay or sidebar',
      'Batch action buttons',
      'Export results option'
    ],
    spacing: 'Upload zone at top, 3-4 column thumbnail grid below',
    notes: 'For batch image processing. Show progress on each image. Allow selecting multiple for bulk actions. Display AI results clearly.'
  },

  'tiered-feature-comparison': {
    name: 'Tiered Feature Comparison',
    structure: 'Visual comparison of service tiers with feature checkmarks',
    elements: [
      'Tier names (Free, Pro, Enterprise)',
      'Price per tier',
      'Feature list with checkmarks per tier',
      'Recommended tier highlight',
      'CTA button per tier',
      'Feature tooltips for explanation'
    ],
    spacing: 'Side-by-side columns, sticky header with tier names',
    notes: 'Help users understand value at each tier. Highlight recommended option. Make it easy to compare features visually.'
  }
};

/**
 * Map specific detected industries to layout categories
 */
const INDUSTRY_TO_LAYOUT_MAP = {
  // Professional Services
  'consulting': 'professional-services',
  'legal': 'professional-services',
  'law': 'professional-services',
  'lawyer': 'professional-services',
  'attorney': 'professional-services',
  'accounting': 'professional-services',
  'accountant': 'professional-services',
  'financial': 'professional-services',
  'advisor': 'professional-services',
  'coach': 'professional-services',
  'business': 'professional-services',
  'franchise': 'professional-services',
  'insurance': 'professional-services',

  // Restaurants & Food
  'restaurant': 'restaurants-food',
  'pizza': 'restaurants-food',
  'pizzeria': 'restaurants-food',
  'cafe': 'restaurants-food',
  'coffee': 'restaurants-food',
  'bakery': 'restaurants-food',
  'bar': 'restaurants-food',
  'bistro': 'restaurants-food',
  'steakhouse': 'restaurants-food',
  'seafood': 'restaurants-food',
  'sushi': 'restaurants-food',
  'mexican': 'restaurants-food',
  'italian': 'restaurants-food',
  'chinese': 'restaurants-food',
  'indian': 'restaurants-food',
  'thai': 'restaurants-food',
  'food-truck': 'restaurants-food',
  'catering': 'restaurants-food',
  'diner': 'restaurants-food',
  'brewery': 'restaurants-food',
  'winery': 'restaurants-food',

  // Healthcare & Medical - General
  'medical': 'healthcare-medical',
  'doctor': 'healthcare-medical',
  'clinic': 'healthcare-medical',
  'hospital': 'healthcare-medical',
  'healthcare': 'healthcare-medical',
  'physician': 'healthcare-medical',
  'primary-care': 'healthcare-medical',
  'urgent-care': 'healthcare-medical',
  'optometry': 'healthcare-medical',
  'pharmacy': 'healthcare-medical',
  'physical-therapy': 'healthcare-medical',
  'dermatology': 'healthcare-medical',
  'cardiology': 'healthcare-medical',
  'pediatric': 'healthcare-medical',

  // Dental - Specialized variant
  'dental': 'dental',
  'dentist': 'dental',
  'orthodontics': 'dental',
  'orthodontist': 'dental',
  'cosmetic-dentistry': 'dental',
  'oral-surgery': 'dental',

  // Mental Health - Specialized variant
  'mental-health': 'mental-health',
  'therapy': 'mental-health',
  'therapist': 'mental-health',
  'counseling': 'mental-health',
  'counselor': 'mental-health',
  'psychiatry': 'mental-health',
  'psychiatrist': 'mental-health',
  'psychologist': 'mental-health',
  'psychology': 'mental-health',

  // Chiropractic - Specialized variant
  'chiropractic': 'chiropractic',
  'chiropractor': 'chiropractic',
  'spine': 'chiropractic',
  'back-pain': 'chiropractic',

  // Veterinary - Specialized variant
  'veterinary': 'veterinary',
  'vet': 'veterinary',
  'animal': 'veterinary',
  'pet': 'veterinary',
  'animal-hospital': 'veterinary',

  // Retail & Ecommerce
  'retail': 'retail-ecommerce',
  'shop': 'retail-ecommerce',
  'store': 'retail-ecommerce',
  'boutique': 'retail-ecommerce',
  'ecommerce': 'retail-ecommerce',
  'jewelry': 'retail-ecommerce',
  'clothing': 'retail-ecommerce',
  'fashion': 'retail-ecommerce',
  'furniture': 'retail-ecommerce',
  'florist': 'retail-ecommerce',
  'flower': 'retail-ecommerce',
  'gift': 'retail-ecommerce',

  // Home Services
  'plumber': 'home-services',
  'plumbing': 'home-services',
  'electrician': 'home-services',
  'electrical': 'home-services',
  'hvac': 'home-services',
  'roofing': 'home-services',
  'roofer': 'home-services',
  'contractor': 'home-services',
  'construction': 'home-services',
  'landscaping': 'home-services',
  'lawn': 'home-services',
  'cleaning': 'home-services',
  'maid': 'home-services',
  'pest-control': 'home-services',
  'moving': 'home-services',
  'handyman': 'home-services',
  'painter': 'home-services',
  'painting': 'home-services',
  'pool': 'home-services',
  'garage-door': 'home-services',
  'locksmith': 'home-services',
  'window': 'home-services',

  // Fitness & Wellness
  'gym': 'fitness-wellness',
  'fitness': 'fitness-wellness',
  'yoga': 'fitness-wellness',
  'pilates': 'fitness-wellness',
  'crossfit': 'fitness-wellness',
  'personal-trainer': 'fitness-wellness',
  'trainer': 'fitness-wellness',
  'martial-arts': 'fitness-wellness',
  'boxing': 'fitness-wellness',
  'spa': 'fitness-wellness',
  'massage': 'fitness-wellness',
  'meditation': 'fitness-wellness',
  'wellness': 'fitness-wellness',
  'nutrition': 'fitness-wellness',

  // Beauty & Grooming - dedicated category with 3 specialized layouts
  'salon': 'beauty-grooming',
  'hair': 'beauty-grooming',
  'hair-salon': 'beauty-grooming',
  'barbershop': 'beauty-grooming',
  'barber': 'beauty-grooming',
  'nail': 'beauty-grooming',
  'nail-salon': 'beauty-grooming',
  'beauty': 'beauty-grooming',
  'beauty-salon': 'beauty-grooming',
  'spa': 'beauty-grooming',
  'med-spa': 'beauty-grooming',
  'day-spa': 'beauty-grooming',
  'tattoo': 'beauty-grooming',
  'piercing': 'beauty-grooming',
  'esthetics': 'beauty-grooming',
  'skincare': 'beauty-grooming',
  'waxing': 'beauty-grooming',
  'lashes': 'beauty-grooming',
  'brows': 'beauty-grooming',
  'makeup': 'beauty-grooming',
  'cosmetology': 'beauty-grooming',

  // Real Estate
  // Real Estate - General
  'real-estate': 'real-estate',
  'realtor': 'real-estate',
  'property': 'real-estate',
  'homes': 'real-estate',
  'residential': 'real-estate',
  'home-sales': 'real-estate',
  'buyer-agent': 'real-estate',
  'seller-agent': 'real-estate',

  // Luxury Real Estate
  'luxury-real-estate': 'luxury-real-estate',
  'luxury-homes': 'luxury-real-estate',
  'mansion': 'luxury-real-estate',
  'estate': 'luxury-real-estate',
  'waterfront': 'luxury-real-estate',
  'penthouse': 'luxury-real-estate',
  'high-end': 'luxury-real-estate',

  // Commercial Real Estate
  'commercial-real-estate': 'commercial-real-estate',
  'commercial': 'commercial-real-estate',
  'office-space': 'commercial-real-estate',
  'retail-space': 'commercial-real-estate',
  'industrial': 'commercial-real-estate',
  'warehouse': 'commercial-real-estate',
  'investment-property': 'commercial-real-estate',
  'cre': 'commercial-real-estate',

  // Property Management
  'property-management': 'property-management',
  'rental': 'property-management',
  'landlord': 'property-management',
  'tenant': 'property-management',
  'apartments': 'property-management',
  'leasing': 'property-management',
  'hoa': 'property-management',
  'broker': 'real-estate',

  // Education & Coaching
  'tutoring': 'education-coaching',
  'school': 'education-coaching',
  'academy': 'education-coaching',
  'courses': 'education-coaching',
  'training': 'education-coaching',
  'learning': 'education-coaching',
  'education': 'education-coaching',
  'driving-school': 'education-coaching',
  'music-lessons': 'education-coaching',
  'dance': 'education-coaching',

  // Creative & Agency
  'agency': 'creative-agency',
  'design': 'creative-agency',
  'marketing': 'creative-agency',
  'creative': 'creative-agency',
  'photography': 'creative-agency',
  'photographer': 'creative-agency',
  'videography': 'creative-agency',
  'video': 'creative-agency',
  'studio': 'creative-agency',
  'branding': 'creative-agency',
  'web-design': 'creative-agency',
  'digital': 'creative-agency',
  'media': 'creative-agency',
  'event': 'creative-agency',
  'wedding': 'creative-agency',

  // Automotive
  'auto': 'automotive',
  'automotive': 'automotive',
  'car': 'automotive',
  'mechanic': 'automotive',
  'auto-repair': 'automotive',
  'auto-shop': 'automotive',        // Fixture ID mapping
  'body-shop': 'automotive',
  'dealership': 'automotive',
  'detailing': 'automotive',
  'car-wash': 'automotive',
  'towing': 'automotive',
  'tire': 'automotive',
  'tire-shop': 'automotive',
  'transmission': 'automotive',
  'car-repair': 'automotive',
  'oil-change': 'automotive'
};

/**
 * Get layout category from detected industry keyword
 */
function getLayoutCategory(industryKey) {
  if (!industryKey) return null;

  const key = industryKey.toLowerCase().replace(/[^a-z-]/g, '');

  // Direct match
  if (INDUSTRY_TO_LAYOUT_MAP[key]) {
    return INDUSTRY_TO_LAYOUT_MAP[key];
  }

  // Partial match
  for (const [keyword, category] of Object.entries(INDUSTRY_TO_LAYOUT_MAP)) {
    if (key.includes(keyword) || keyword.includes(key)) {
      return category;
    }
  }

  // Check INDUSTRY_LAYOUTS keywords
  for (const [categoryKey, category] of Object.entries(INDUSTRY_LAYOUTS)) {
    if (category.keywords && category.keywords.some(kw => key.includes(kw) || kw.includes(key))) {
      return categoryKey;
    }
  }

  return null;
}

/**
 * Get default layout for a category (first one)
 */
function getDefaultLayout(categoryKey) {
  const category = INDUSTRY_LAYOUTS[categoryKey];
  if (!category || !category.layouts) return null;

  const layoutKeys = Object.keys(category.layouts);
  return layoutKeys[0] || null;
}

/**
 * Build DETAILED layout context for AI prompts
 * This is the enhanced version with specific section instructions
 */
function buildDetailedLayoutContext(industryKey, layoutKey) {
  // First map the industry to a category
  const categoryKey = getLayoutCategory(industryKey) || industryKey;
  const category = INDUSTRY_LAYOUTS[categoryKey];

  if (!category) {
    return ''; // No layout intelligence available, use generic prompt
  }

  // Get the layout (use provided or default to first)
  const actualLayoutKey = layoutKey || getDefaultLayout(categoryKey);
  const layout = actualLayoutKey ? category.layouts[actualLayoutKey] : null;

  if (!layout) {
    return ''; // No specific layout, use generic prompt
  }

  // Build detailed section instructions
  const sectionInstructions = layout.sectionOrder.map((sectionTemplate, idx) => {
    const details = SECTION_DETAILS[sectionTemplate];
    if (details) {
      return `
${idx + 1}. ${details.name.toUpperCase()} (${sectionTemplate})
   Structure: ${details.structure}
   Elements: ${details.elements.join(', ')}
   Spacing: ${details.spacing}
   Notes: ${details.notes}`;
    }
    return `${idx + 1}. ${sectionTemplate.replace(/-/g, ' ').toUpperCase()}`;
  }).join('\n');

  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║  LAYOUT INTELLIGENCE: ${category.name} - ${layout.name}
╚══════════════════════════════════════════════════════════════════════════════╝

LAYOUT STYLE: "${layout.name}"
DESCRIPTION: ${layout.description}

DESIGN SYSTEM:
• Typography: ${category.style.typography} (${category.style.typography === 'traditional' ? 'serif headings, professional feel' : category.style.typography === 'modern' ? 'clean sans-serif, contemporary' : 'mix of decorative and readable'})
• Color Mood: ${category.style.colorMood}
• Spacing: ${category.style.spacing} (${category.style.spacing === 'generous' ? '80-120px section padding' : category.style.spacing === 'tight' ? '40-60px section padding' : '60-80px section padding'})
• Corners: ${category.style.corners} (${category.style.corners === 'rounded' ? '12-20px border-radius' : category.style.corners === 'subtle' ? '4-8px border-radius' : '0px border-radius'})

IMAGE STYLE: ${category.style.imageStyle}

RECOMMENDED CTA: "${category.ctaTypes[0]}"
ALTERNATIVE CTAs: ${category.ctaTypes.slice(1).join(', ')}

TRUST SIGNALS TO INCLUDE: ${category.trustSignals.join(', ')}

════════════════════════════════════════════════════════════════════════════════
REQUIRED SECTION ORDER (Follow this EXACTLY for home/landing page):
════════════════════════════════════════════════════════════════════════════════
${sectionInstructions}

════════════════════════════════════════════════════════════════════════════════
EMPHASIS POINTS (What this layout prioritizes):
════════════════════════════════════════════════════════════════════════════════
${layout.emphasis.map(e => `• ${e.charAt(0).toUpperCase() + e.slice(1).replace(/-/g, ' ')}`).join('\n')}

CRITICAL INSTRUCTION:
You MUST follow the section order above. Each section should flow naturally into the next.
This layout was specifically designed for ${category.name} businesses to maximize conversions
and user engagement. Do NOT add extra sections or change the order.
════════════════════════════════════════════════════════════════════════════════
`;
}

/**
 * Get all available layouts for an industry
 */
function getAvailableLayouts(industryKey) {
  const categoryKey = getLayoutCategory(industryKey);
  if (!categoryKey) return [];

  const category = INDUSTRY_LAYOUTS[categoryKey];
  if (!category || !category.layouts) return [];

  return Object.entries(category.layouts).map(([key, layout]) => ({
    key,
    name: layout.name,
    description: layout.description,
    sectionOrder: layout.sectionOrder,
    emphasis: layout.emphasis,
    category: categoryKey,
    categoryName: category.name
  }));
}

/**
 * Get layout config with full details
 */
function getLayoutConfigFull(industryKey, layoutKey) {
  const categoryKey = getLayoutCategory(industryKey);
  if (!categoryKey) return null;

  const category = INDUSTRY_LAYOUTS[categoryKey];
  if (!category) return null;

  const actualLayoutKey = layoutKey || getDefaultLayout(categoryKey);
  const layout = actualLayoutKey ? category.layouts[actualLayoutKey] : null;

  return {
    categoryKey,
    category,
    layoutKey: actualLayoutKey,
    layout,
    sectionDetails: layout ? layout.sectionOrder.map(s => SECTION_DETAILS[s]).filter(Boolean) : [],
    detailedContext: buildDetailedLayoutContext(industryKey, layoutKey)
  };
}

// ============================================
// PAGE-SPECIFIC LAYOUTS BY INDUSTRY
// Defines section orders for each page type per industry category
// ============================================

const PAGE_LAYOUTS = {
  // Professional Services (consulting, legal, accounting)
  'professional-services': {
    home: ['hero-split', 'trust-logos', 'services-grid', 'stats-animated', 'testimonials-featured', 'cta-simple'],
    about: ['about-hero', 'about-split', 'about-values', 'about-team', 'stats-animated', 'testimonials-quotes'],
    services: ['services-hero', 'services-list', 'process-steps', 'pricing-cards', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-split', 'contact-with-map', 'office-hours', 'faq-accordion'],
    team: ['team-hero', 'about-team', 'provider-profiles', 'credentials-list', 'cta-simple'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'stats-animated', 'trust-logos', 'cta-simple'],
    faq: ['faq-hero', 'faq-accordion', 'contact-split', 'cta-simple'],
    pricing: ['pricing-hero', 'pricing-cards', 'comparison-table', 'faq-accordion', 'cta-with-form'],
    // Client Portal Pages
    login: ['auth-hero', 'login-form', 'social-login', 'forgot-password'],
    register: ['auth-hero', 'register-form', 'company-info', 'terms-checkbox'],
    dashboard: ['dashboard-header', 'active-matters', 'upcoming-deadlines', 'recent-documents', 'billing-summary', 'quick-actions', 'advisor-contact'],
    matters: ['matters-header', 'matters-list', 'matter-filters', 'matter-timeline', 'related-documents', 'team-assigned'],
    documents: ['documents-header', 'documents-grid', 'folder-tree', 'upload-zone', 'document-versions', 'sharing-permissions'],
    messages: ['messages-header', 'conversation-list', 'message-thread', 'compose-message', 'attachments', 'message-search'],
    appointments: ['appointments-header', 'upcoming-meetings', 'past-meetings', 'schedule-consultation', 'meeting-details', 'calendar-sync'],
    invoices: ['invoices-header', 'invoice-list', 'invoice-detail', 'payment-history', 'outstanding-balance', 'download-statements'],
    payments: ['payments-header', 'payment-methods', 'make-payment', 'auto-pay-setup', 'billing-address', 'payment-history']
  },

  // Restaurants & Food
  'restaurants-food': {
    home: ['hero-image-first', 'menu-tabs', 'gallery-masonry', 'about-split', 'testimonials-carousel', 'ordering-cta'],
    about: ['about-hero', 'about-timeline', 'chef-profile', 'gallery-featured', 'testimonials-quotes', 'cta-simple'],
    menu: ['menu-hero', 'menu-tabs', 'menu-specials', 'dietary-info', 'ordering-cta'],
    services: ['services-hero', 'catering-services', 'private-events', 'pricing-cards', 'gallery-grid', 'cta-with-form'],
    contact: ['contact-hero', 'contact-with-map', 'reservation-form', 'hours-section', 'social-links'],
    gallery: ['gallery-hero', 'gallery-masonry', 'chef-profile', 'testimonials-carousel', 'ordering-cta'],
    booking: ['booking-hero', 'reservation-form', 'private-events', 'faq-accordion', 'contact-split'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'press-mentions', 'gallery-featured', 'ordering-cta'],
    // Customer Portal Pages (Online Ordering & Loyalty)
    login: ['auth-hero', 'login-form', 'social-login', 'forgot-password', 'guest-checkout-option'],
    register: ['auth-hero', 'register-form', 'social-login', 'loyalty-signup', 'terms-checkbox'],
    dashboard: ['dashboard-header', 'quick-reorder', 'loyalty-status', 'upcoming-reservations', 'recent-orders', 'favorites-preview', 'special-offers'],
    'order-history': ['orders-header', 'orders-list', 'order-details', 'reorder-button', 'order-filters', 'receipt-download'],
    reservations: ['reservations-header', 'upcoming-reservations', 'past-reservations', 'make-reservation', 'reservation-policies', 'special-requests'],
    loyalty: ['loyalty-header', 'points-balance', 'tier-status', 'rewards-catalog', 'points-history', 'earn-more-points', 'birthday-reward'],
    favorites: ['favorites-header', 'favorite-items', 'favorite-orders', 'dietary-preferences', 'allergy-info', 'quick-reorder'],
    'payment-methods': ['payments-header', 'saved-cards', 'gift-cards', 'rewards-balance', 'billing-history', 'auto-reload']
  },

  // Healthcare & Medical
  'healthcare-medical': {
    home: ['medical-hero', 'quick-actions', 'medical-services-grid', 'provider-cards', 'testimonials-grid', 'insurance-info', 'contact-with-map'],
    about: ['about-hero', 'about-split', 'medical-stats', 'about-team', 'credentials-list', 'testimonials-quotes'],
    services: ['services-hero', 'medical-services-grid', 'conditions-treated', 'technology-showcase', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'quick-actions', 'contact-with-map', 'insurance-info', 'emergency-info'],
    team: ['team-hero', 'provider-cards', 'credentials-list', 'about-values', 'cta-simple'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'medical-stats', 'trust-badges', 'cta-simple'],
    faq: ['faq-hero', 'faq-accordion', 'quick-actions', 'insurance-info', 'contact-split'],
    booking: ['booking-hero', 'appointment-booking', 'quick-actions', 'insurance-info', 'faq-accordion'],
    // Patient Portal Pages (HIPAA-Compliant Design)
    login: ['auth-hero-secure', 'login-form-medical', 'mfa-verification', 'forgot-password', 'hipaa-notice'],
    register: ['auth-hero-secure', 'patient-registration', 'insurance-info-form', 'hipaa-consent', 'terms-checkbox'],
    dashboard: ['patient-dashboard-header', 'health-summary', 'upcoming-appointments', 'recent-messages', 'prescription-refills', 'test-results-alert', 'quick-actions-medical', 'care-team'],
    appointments: ['appointments-header', 'upcoming-appointments', 'past-visits', 'schedule-appointment', 'provider-availability', 'visit-prep', 'appointment-reminders'],
    records: ['records-header', 'health-summary', 'medical-history', 'allergies-medications', 'immunizations', 'vitals-chart', 'visit-summaries', 'download-records'],
    messaging: ['messaging-header', 'inbox-medical', 'compose-message', 'message-thread', 'provider-directory', 'urgent-notice', 'attachment-upload'],
    prescriptions: ['prescriptions-header', 'active-medications', 'refill-request', 'pharmacy-info', 'medication-history', 'drug-interactions', 'medication-reminders'],
    'test-results': ['results-header', 'recent-results', 'result-detail', 'historical-trends', 'normal-ranges', 'provider-notes', 'download-results'],
    billing: ['billing-header', 'account-balance', 'statements-list', 'payment-history', 'insurance-claims', 'make-payment', 'payment-plans', 'financial-assistance'],
    telehealth: ['telehealth-header', 'upcoming-video-visits', 'start-visit', 'tech-check', 'visit-preparation', 'past-telehealth', 'telehealth-faq']
  },

  // Dental Practice
  'dental': {
    home: ['dental-hero', 'quick-actions', 'dental-services', 'smile-gallery', 'dental-stats', 'provider-cards', 'insurance-info', 'cta-simple'],
    about: ['about-hero', 'about-split', 'dental-stats', 'about-team', 'technology-showcase', 'testimonials-quotes'],
    services: ['services-hero', 'dental-services', 'smile-gallery', 'technology-showcase', 'pricing-cards', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'quick-actions', 'contact-with-map', 'insurance-info', 'emergency-info'],
    team: ['team-hero', 'provider-cards', 'credentials-list', 'technology-showcase', 'cta-simple'],
    gallery: ['gallery-hero', 'smile-gallery', 'technology-showcase', 'testimonials-carousel', 'cta-simple'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'smile-gallery', 'dental-stats', 'cta-simple'],
    faq: ['faq-hero', 'faq-accordion', 'insurance-info', 'contact-split'],
    booking: ['booking-hero', 'appointment-booking', 'dental-services', 'insurance-info', 'faq-accordion'],
    // Patient Portal Pages (Dental-Specific)
    login: ['auth-hero-dental', 'login-form', 'forgot-password', 'new-patient-link'],
    register: ['auth-hero-dental', 'patient-registration', 'dental-history-form', 'insurance-info-form', 'terms-checkbox'],
    dashboard: ['patient-dashboard-dental', 'smile-health-score', 'next-cleaning', 'treatment-plan', 'recent-visits', 'quick-actions-dental', 'dental-tips'],
    appointments: ['appointments-header', 'upcoming-appointments', 'past-visits', 'schedule-cleaning', 'recall-reminders', 'appointment-prep', 'family-scheduling'],
    records: ['dental-records-header', 'dental-chart', 'treatment-history', 'x-rays-images', 'periodontal-chart', 'treatment-plan', 'download-records'],
    'treatment-plan': ['treatment-header', 'recommended-treatments', 'treatment-timeline', 'cost-estimates', 'insurance-coverage', 'payment-options', 'treatment-acceptance'],
    billing: ['billing-header', 'account-balance', 'insurance-benefits', 'treatment-costs', 'payment-history', 'make-payment', 'financing-options'],
    family: ['family-header', 'family-members', 'add-family-member', 'family-appointments', 'family-billing', 'family-reminders']
  },

  // Mental Health / Therapy
  'mental-health': {
    home: ['hero-minimal', 'approach-values', 'specializations', 'about-therapist', 'testimonials-quotes', 'faq-accordion', 'cta-simple'],
    about: ['about-hero', 'about-therapist', 'approach-values', 'credentials-list', 'testimonials-quotes'],
    services: ['services-hero', 'specializations', 'therapy-modalities', 'telehealth-features', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-minimal', 'telehealth-features', 'insurance-info', 'faq-accordion'],
    testimonials: ['testimonials-hero', 'testimonials-quotes', 'approach-values', 'cta-simple'],
    faq: ['faq-hero', 'faq-accordion', 'insurance-info', 'contact-minimal'],
    booking: ['booking-hero', 'appointment-booking', 'telehealth-features', 'insurance-info', 'faq-accordion'],
    // Client Portal Pages (Privacy-First Design)
    login: ['auth-hero-calm', 'login-form-secure', 'mfa-verification', 'forgot-password', 'privacy-assurance'],
    register: ['auth-hero-calm', 'client-intake', 'emergency-contact', 'consent-forms', 'privacy-notice', 'terms-checkbox'],
    dashboard: ['client-dashboard-calm', 'wellness-check-in', 'next-session', 'journal-preview', 'resources-recommended', 'crisis-resources', 'quick-actions-therapy'],
    sessions: ['sessions-header', 'upcoming-sessions', 'past-sessions', 'schedule-session', 'session-notes', 'session-goals', 'session-frequency'],
    journal: ['journal-header', 'journal-entries', 'new-entry', 'mood-tracker', 'journal-prompts', 'journal-insights', 'private-notes'],
    resources: ['resources-header', 'recommended-resources', 'worksheets', 'coping-tools', 'reading-list', 'crisis-resources', 'external-links'],
    messaging: ['messaging-header-secure', 'therapist-messages', 'compose-message', 'response-expectations', 'emergency-notice', 'session-requests'],
    billing: ['billing-header', 'superbill-download', 'session-receipts', 'payment-history', 'make-payment', 'sliding-scale-info'],
    forms: ['forms-header', 'intake-forms', 'consent-forms', 'assessments', 'progress-forms', 'form-history', 'submit-form']
  },

  // Chiropractic & Wellness
  'chiropractic': {
    home: ['hero-split', 'conditions-treated', 'services-grid', 'stats-animated', 'about-team', 'testimonials-carousel', 'cta-with-form'],
    about: ['about-hero', 'about-split', 'credentials-list', 'about-values', 'technology-showcase', 'testimonials-quotes'],
    services: ['services-hero', 'conditions-treated', 'services-list', 'treatment-approach', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-with-map', 'insurance-info', 'faq-accordion'],
    testimonials: ['testimonials-hero', 'testimonials-carousel', 'stats-animated', 'cta-simple'],
    faq: ['faq-hero', 'faq-accordion', 'conditions-treated', 'contact-split'],
    booking: ['booking-hero', 'appointment-booking', 'new-patient-offer', 'insurance-info', 'faq-accordion'],
    // Patient Portal Pages
    login: ['auth-hero', 'login-form', 'forgot-password', 'new-patient-link'],
    register: ['auth-hero', 'patient-registration', 'health-history-form', 'insurance-info-form', 'terms-checkbox'],
    dashboard: ['patient-dashboard-chiro', 'treatment-progress', 'next-appointment', 'exercise-plan', 'recent-visits', 'wellness-tips', 'quick-actions'],
    appointments: ['appointments-header', 'upcoming-appointments', 'past-visits', 'schedule-adjustment', 'recurring-care', 'appointment-reminders'],
    'treatment-plan': ['treatment-header', 'care-plan-overview', 'progress-tracker', 'recommended-visits', 'home-exercises', 'goals-milestones'],
    exercises: ['exercises-header', 'prescribed-exercises', 'video-instructions', 'exercise-log', 'progress-photos', 'pain-diary'],
    records: ['records-header', 'visit-summaries', 'x-rays-images', 'treatment-notes', 'progress-reports', 'download-records'],
    billing: ['billing-header', 'account-balance', 'insurance-claims', 'payment-history', 'make-payment', 'package-purchases']
  },

  // Veterinary & Pet Care
  'veterinary': {
    home: ['hero-image-first', 'services-grid', 'about-team', 'gallery-pets', 'testimonials-carousel', 'emergency-cta', 'contact-with-map'],
    about: ['about-hero', 'about-split', 'about-team', 'credentials-list', 'gallery-grid', 'testimonials-quotes'],
    services: ['services-hero', 'services-list', 'species-treated', 'emergency-services', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-with-map', 'emergency-cta', 'hours-section', 'faq-accordion'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'gallery-pets', 'stats-animated', 'cta-simple'],
    faq: ['faq-hero', 'faq-accordion', 'species-treated', 'contact-split'],
    emergency: ['emergency-hero', 'emergency-services', 'when-to-come', 'emergency-contact', 'after-hours-info'],
    // Pet Owner Portal Pages
    login: ['auth-hero-pet', 'login-form', 'forgot-password', 'new-client-link'],
    register: ['auth-hero-pet', 'owner-registration', 'pet-info-form', 'vet-history', 'terms-checkbox'],
    dashboard: ['pet-owner-dashboard', 'pets-overview', 'upcoming-appointments', 'vaccine-reminders', 'prescription-refills', 'recent-visits', 'quick-actions-vet'],
    pets: ['pets-header', 'my-pets', 'add-pet', 'pet-profile', 'medical-history', 'vaccination-records', 'weight-tracker'],
    appointments: ['appointments-header', 'upcoming-appointments', 'past-visits', 'schedule-appointment', 'appointment-type', 'drop-off-pickup'],
    records: ['records-header', 'visit-summaries', 'lab-results', 'vaccination-history', 'prescriptions', 'dietary-notes', 'download-records'],
    prescriptions: ['prescriptions-header', 'active-medications', 'request-refill', 'prescription-history', 'pharmacy-info', 'medication-instructions'],
    billing: ['billing-header', 'account-balance', 'invoices', 'payment-history', 'make-payment', 'wellness-plans', 'pet-insurance'],
    reminders: ['reminders-header', 'vaccine-schedule', 'checkup-reminders', 'medication-reminders', 'notification-preferences']
  },

  // Real Estate
  'real-estate': {
    home: ['realestate-hero', 'property-search', 'featured-properties', 'agent-profiles', 'testimonials-carousel', 'market-stats', 'cta-simple'],
    about: ['about-hero', 'about-split', 'agent-stats', 'agent-profiles', 'testimonials-quotes', 'trust-logos'],
    services: ['services-hero', 'services-list', 'buyer-seller-split', 'process-steps', 'testimonials-featured', 'cta-with-form'],
    contact: ['contact-hero', 'agent-profiles', 'contact-with-map', 'office-hours', 'cta-simple'],
    listings: ['listings-hero', 'property-search', 'featured-properties', 'market-stats', 'cta-simple'],
    team: ['team-hero', 'agent-profiles', 'agent-stats', 'testimonials-grid', 'cta-simple'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'agent-stats', 'trust-logos', 'cta-simple'],
    // Client Portal Pages (Buyer/Seller Journey)
    login: ['auth-hero', 'login-form', 'social-login', 'forgot-password'],
    register: ['auth-hero', 'register-form', 'buyer-seller-select', 'preferences-initial', 'terms-checkbox'],
    dashboard: ['client-dashboard-re', 'search-activity', 'saved-properties', 'upcoming-showings', 'transaction-status', 'agent-contact', 'market-updates'],
    'saved-properties': ['saved-header', 'saved-properties-grid', 'saved-searches', 'property-comparisons', 'price-change-alerts', 'notes-per-property'],
    'search-alerts': ['alerts-header', 'active-alerts', 'create-alert', 'alert-criteria', 'notification-frequency', 'recent-matches'],
    showings: ['showings-header', 'upcoming-showings', 'past-showings', 'request-showing', 'showing-feedback', 'favorite-after-tour'],
    offers: ['offers-header', 'active-offers', 'offer-history', 'create-offer', 'offer-status', 'counteroffer-review', 'offer-documents'],
    documents: ['documents-header', 'transaction-documents', 'disclosures', 'contract-drafts', 'upload-documents', 'e-signatures', 'document-status'],
    'mortgage-calculator': ['calculator-header', 'mortgage-calculator', 'affordability-estimate', 'pre-approval-status', 'lender-connections', 'payment-scenarios'],
    'transaction-timeline': ['timeline-header', 'transaction-steps', 'current-status', 'upcoming-milestones', 'task-checklist', 'closing-countdown', 'team-contacts']
  },

  // Home Services (plumber, electrician, HVAC, etc.)
  'home-services': {
    home: ['hero-split', 'trust-badges', 'services-grid', 'stats-animated', 'testimonials-carousel', 'service-areas', 'cta-with-form'],
    about: ['about-hero', 'about-split', 'stats-animated', 'about-team', 'trust-badges', 'testimonials-quotes'],
    services: ['services-hero', 'services-list', 'pricing-cards', 'service-areas', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-with-map', 'service-areas', 'emergency-cta', 'faq-accordion'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'stats-animated', 'trust-badges', 'cta-simple'],
    faq: ['faq-hero', 'faq-accordion', 'service-areas', 'contact-split'],
    pricing: ['pricing-hero', 'pricing-cards', 'services-list', 'faq-accordion', 'cta-with-form'],
    // Customer Portal Pages (Service Management)
    login: ['auth-hero', 'login-form', 'forgot-password', 'create-account-link'],
    register: ['auth-hero', 'register-form', 'property-info', 'service-preferences', 'terms-checkbox'],
    dashboard: ['customer-dashboard-hs', 'upcoming-appointments', 'active-quotes', 'service-history', 'maintenance-reminders', 'quick-actions-service', 'emergency-contact'],
    appointments: ['appointments-header', 'upcoming-appointments', 'past-appointments', 'schedule-service', 'appointment-details', 'reschedule-cancel', 'technician-info'],
    quotes: ['quotes-header', 'pending-quotes', 'quote-details', 'quote-comparison', 'approve-quote', 'quote-history', 'request-quote'],
    'service-history': ['history-header', 'service-timeline', 'service-details', 'equipment-serviced', 'warranty-info', 'service-reports', 'photos-documentation'],
    properties: ['properties-header', 'my-properties', 'add-property', 'property-details', 'equipment-inventory', 'service-history-per-property', 'maintenance-schedule'],
    'maintenance-plans': ['plans-header', 'current-plan', 'plan-benefits', 'upcoming-maintenance', 'plan-history', 'upgrade-plan', 'plan-pricing'],
    payments: ['payments-header', 'payment-methods', 'invoices', 'make-payment', 'payment-history', 'auto-pay-setup', 'financing-options'],
    referrals: ['referrals-header', 'referral-code', 'referral-rewards', 'share-options', 'referral-history', 'terms-conditions']
  },

  // Fitness & Wellness
  'fitness-wellness': {
    home: ['hero-with-video', 'services-bento', 'class-schedule', 'about-team', 'testimonials-carousel', 'pricing-cards', 'cta-simple'],
    about: ['about-hero', 'about-split', 'about-team', 'credentials-list', 'gallery-grid', 'testimonials-quotes'],
    services: ['services-hero', 'services-bento', 'class-schedule', 'pricing-cards', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-with-map', 'class-schedule', 'faq-accordion'],
    gallery: ['gallery-hero', 'gallery-masonry', 'testimonials-carousel', 'cta-simple'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'stats-animated', 'cta-simple'],
    pricing: ['pricing-hero', 'pricing-cards', 'comparison-table', 'faq-accordion', 'cta-with-form'],
    booking: ['booking-hero', 'class-schedule', 'appointment-booking', 'pricing-cards', 'faq-accordion'],
    // Member Portal Pages (Fitness Tracking & Class Booking)
    login: ['auth-hero-fitness', 'login-form', 'social-login', 'forgot-password', 'trial-signup'],
    register: ['auth-hero-fitness', 'register-form', 'fitness-goals', 'membership-select', 'waiver-sign', 'terms-checkbox'],
    dashboard: ['member-dashboard-fitness', 'workout-streak', 'upcoming-classes', 'progress-summary', 'goals-tracker', 'trainer-messages', 'class-recommendations'],
    classes: ['classes-header', 'class-schedule-full', 'book-class', 'my-reservations', 'class-history', 'favorite-classes', 'waitlist-status'],
    'personal-training': ['pt-header', 'my-trainer', 'upcoming-sessions', 'book-session', 'workout-plans', 'session-history', 'pt-packages'],
    progress: ['progress-header', 'fitness-metrics', 'body-measurements', 'workout-history', 'goal-progress', 'achievements', 'progress-photos'],
    membership: ['membership-header', 'current-plan', 'membership-benefits', 'usage-stats', 'freeze-membership', 'upgrade-options', 'billing-info'],
    profile: ['profile-header', 'personal-info', 'fitness-profile', 'health-info', 'emergency-contact', 'notification-settings', 'connected-apps'],
    shop: ['shop-header', 'supplements-products', 'member-discounts', 'order-history', 'cart', 'gift-cards'],
    challenges: ['challenges-header', 'active-challenges', 'challenge-leaderboard', 'my-challenge-progress', 'past-challenges', 'join-challenge']
  },

  // Beauty & Grooming (salons, spas, barbershops)
  // Based on comprehensive industry research - optimized for booking conversions
  'beauty-grooming': {
    home: ['hero-fullscreen-video', 'services-elegant-grid', 'gallery-before-after', 'team-showcase', 'testimonials-slider', 'membership-teaser', 'booking-widget-sticky', 'instagram-feed'],
    about: ['about-hero', 'about-story', 'about-team', 'credentials-certifications', 'gallery-workspace', 'testimonials-quotes', 'cta-book-consultation'],
    services: ['services-hero', 'services-categories', 'pricing-transparent', 'add-ons-upsell', 'faq-accordion', 'booking-cta-sticky'],
    team: ['team-hero', 'stylist-profiles', 'specialties-showcase', 'booking-per-stylist', 'testimonials-by-stylist'],
    gallery: ['gallery-hero', 'gallery-before-after', 'gallery-portfolio', 'instagram-integration', 'testimonials-carousel', 'cta-simple'],
    contact: ['contact-hero', 'contact-with-map', 'hours-detailed', 'parking-directions', 'social-links'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'before-after-slider', 'stats-animated', 'cta-simple'],
    pricing: ['pricing-hero', 'pricing-by-service', 'packages-bundles', 'membership-plans', 'faq-accordion', 'booking-cta'],
    booking: ['booking-hero', 'service-selector', 'stylist-selector', 'calendar-availability', 'booking-form', 'policies-cancellation'],
    // Customer Portal Pages (L3+)
    login: ['auth-hero', 'login-form', 'social-login', 'forgot-password'],
    register: ['auth-hero', 'register-form', 'social-login', 'terms-checkbox'],
    dashboard: ['dashboard-header', 'quick-actions', 'next-appointment', 'loyalty-widget', 'membership-status', 'recent-activity', 'recommendations'],
    profile: ['profile-header', 'personal-info', 'beauty-preferences', 'notification-settings', 'security-settings', 'connected-accounts'],
    rewards: ['rewards-header', 'points-balance', 'tier-progress', 'available-rewards', 'earn-more', 'points-history', 'tier-benefits'],
    membership: ['membership-header', 'current-plan', 'benefits-list', 'credits-tracker', 'usage-history', 'upgrade-options', 'member-perks'],
    appointments: ['appointments-header', 'upcoming-appointments', 'past-appointments', 'recurring-appointments', 'cancellation-policy'],
    referrals: ['referrals-header', 'referral-stats', 'share-link', 'referral-rewards', 'referral-history', 'how-it-works'],
    payments: ['payments-header', 'saved-cards', 'digital-wallets', 'gift-cards', 'billing-history', 'auto-pay-settings']
  },

  // Retail & E-commerce
  'retail-ecommerce': {
    home: ['hero-image-first', 'featured-products', 'category-grid', 'trust-guarantees', 'testimonials-carousel', 'newsletter-cta'],
    about: ['about-hero', 'about-story', 'about-values', 'team-showcase', 'sustainability', 'testimonials-quotes'],
    shop: ['shop-hero', 'product-grid', 'category-filters', 'sort-options', 'pagination', 'newsletter-cta'],
    product: ['product-images', 'product-details', 'add-to-cart', 'product-reviews', 'related-products', 'recently-viewed'],
    contact: ['contact-hero', 'contact-split', 'store-locations', 'faq-accordion'],
    faq: ['faq-hero', 'faq-accordion', 'shipping-info', 'returns-policy', 'contact-split'],
    // Customer Account Portal Pages
    login: ['auth-hero', 'login-form', 'social-login', 'forgot-password', 'guest-checkout'],
    register: ['auth-hero', 'register-form', 'social-login', 'newsletter-optin', 'terms-checkbox'],
    dashboard: ['customer-dashboard-ecom', 'recent-orders', 'wishlist-preview', 'rewards-summary', 'recommended-products', 'account-alerts'],
    orders: ['orders-header', 'orders-list', 'order-details', 'track-shipment', 'order-status', 'reorder-button', 'invoice-download'],
    wishlist: ['wishlist-header', 'wishlist-grid', 'move-to-cart', 'share-wishlist', 'price-alerts', 'wishlist-collections'],
    returns: ['returns-header', 'return-requests', 'start-return', 'return-status', 'return-label', 'refund-status', 'return-policy'],
    reviews: ['reviews-header', 'my-reviews', 'pending-reviews', 'write-review', 'photo-upload', 'review-rewards'],
    payments: ['payments-header', 'saved-cards', 'digital-wallets', 'gift-cards', 'store-credit', 'billing-address'],
    subscriptions: ['subscriptions-header', 'active-subscriptions', 'subscription-details', 'modify-subscription', 'pause-cancel', 'subscription-history'],
    addresses: ['addresses-header', 'saved-addresses', 'add-address', 'default-addresses', 'address-book'],
    rewards: ['rewards-header', 'points-balance', 'tier-status', 'earn-points', 'redeem-rewards', 'points-history', 'referral-program']
  },

  // Automotive (auto repair, dealerships, detailing)
  'automotive': {
    home: ['hero-split', 'services-grid', 'trust-badges', 'stats-animated', 'testimonials-carousel', 'gallery-grid', 'cta-with-form'],
    about: ['about-hero', 'about-split', 'stats-animated', 'about-team', 'certifications', 'testimonials-quotes'],
    services: ['services-hero', 'services-list', 'pricing-cards', 'brands-serviced', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-with-map', 'service-hours', 'emergency-service', 'faq-accordion'],
    gallery: ['gallery-hero', 'gallery-before-after', 'gallery-grid', 'testimonials-carousel', 'cta-simple'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'stats-animated', 'trust-badges', 'cta-simple'],
    // Customer Portal Pages (Vehicle Service Management)
    login: ['auth-hero', 'login-form', 'forgot-password', 'create-account-link'],
    register: ['auth-hero', 'register-form', 'vehicle-info-form', 'service-preferences', 'terms-checkbox'],
    dashboard: ['customer-dashboard-auto', 'vehicle-summary', 'upcoming-services', 'service-reminders', 'active-repairs', 'recent-services', 'quick-actions-auto'],
    vehicles: ['vehicles-header', 'my-vehicles', 'add-vehicle', 'vehicle-details', 'service-history-per-vehicle', 'maintenance-schedule', 'recall-alerts'],
    appointments: ['appointments-header', 'upcoming-appointments', 'past-appointments', 'schedule-service', 'service-advisor', 'shuttle-loaner'],
    'service-history': ['history-header', 'service-timeline', 'service-details', 'parts-used', 'warranty-info', 'service-documents', 'maintenance-records'],
    estimates: ['estimates-header', 'pending-estimates', 'estimate-details', 'approve-repairs', 'estimate-history', 'request-estimate'],
    payments: ['payments-header', 'invoices', 'payment-methods', 'make-payment', 'payment-history', 'financing-options'],
    rewards: ['rewards-header', 'loyalty-points', 'service-discounts', 'referral-rewards', 'member-benefits', 'points-history']
  },

  // Creative & Agency
  'creative-agency': {
    home: ['hero-centered', 'trust-logos', 'portfolio-grid', 'services-bento', 'testimonials-featured', 'cta-simple'],
    about: ['about-hero', 'about-timeline', 'about-team', 'about-values', 'trust-logos', 'testimonials-quotes'],
    services: ['services-hero', 'services-bento', 'process-steps', 'case-studies', 'pricing-cards', 'cta-with-form'],
    portfolio: ['portfolio-hero', 'portfolio-grid', 'case-studies', 'testimonials-carousel', 'cta-simple'],
    contact: ['contact-hero', 'contact-split', 'office-hours', 'faq-accordion'],
    team: ['team-hero', 'about-team', 'about-values', 'cta-simple'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'trust-logos', 'case-studies', 'cta-simple'],
    // Client Portal Pages (Project Management)
    login: ['auth-hero', 'login-form', 'forgot-password'],
    register: ['auth-hero', 'client-onboarding', 'company-info', 'terms-checkbox'],
    dashboard: ['client-dashboard-agency', 'active-projects', 'project-timeline', 'pending-approvals', 'recent-deliverables', 'team-contacts', 'upcoming-meetings'],
    projects: ['projects-header', 'projects-list', 'project-details', 'project-timeline', 'deliverables', 'project-team', 'project-files'],
    deliverables: ['deliverables-header', 'deliverables-grid', 'review-deliverable', 'approve-reject', 'revision-requests', 'version-history', 'download-assets'],
    feedback: ['feedback-header', 'pending-reviews', 'leave-feedback', 'annotation-tool', 'feedback-history', 'revision-tracker'],
    invoices: ['invoices-header', 'invoice-list', 'invoice-detail', 'make-payment', 'payment-history', 'retainer-status'],
    files: ['files-header', 'file-library', 'upload-files', 'brand-assets', 'project-files', 'shared-folders', 'download-all'],
    messages: ['messages-header', 'conversations', 'project-discussions', 'compose-message', 'file-attachments', 'team-directory']
  },

  // Education & Coaching
  'education-coaching': {
    home: ['hero-split', 'services-bento', 'stats-animated', 'about-team', 'testimonials-carousel', 'pricing-cards', 'cta-simple'],
    about: ['about-hero', 'about-split', 'credentials-list', 'about-values', 'testimonials-quotes'],
    services: ['services-hero', 'services-list', 'curriculum-overview', 'pricing-cards', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-split', 'faq-accordion'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'stats-animated', 'cta-simple'],
    pricing: ['pricing-hero', 'pricing-cards', 'comparison-table', 'faq-accordion', 'cta-with-form'],
    // Student/Client Portal Pages (Learning Management)
    login: ['auth-hero', 'login-form', 'social-login', 'forgot-password'],
    register: ['auth-hero', 'register-form', 'learning-goals', 'experience-level', 'terms-checkbox'],
    dashboard: ['student-dashboard', 'current-courses', 'learning-progress', 'upcoming-sessions', 'assignments-due', 'achievements', 'recommended-courses'],
    courses: ['courses-header', 'enrolled-courses', 'course-progress', 'course-materials', 'course-schedule', 'certificates'],
    lessons: ['lesson-header', 'video-player', 'lesson-materials', 'lesson-notes', 'quiz-section', 'next-lesson', 'discussion'],
    assignments: ['assignments-header', 'pending-assignments', 'submit-assignment', 'graded-assignments', 'feedback-received', 'assignment-history'],
    sessions: ['sessions-header', 'upcoming-sessions', 'past-sessions', 'book-session', 'session-recordings', 'session-notes'],
    progress: ['progress-header', 'learning-path', 'skill-progress', 'achievements', 'certificates-earned', 'time-spent', 'goals-tracker'],
    payments: ['payments-header', 'subscription-status', 'payment-history', 'update-payment', 'invoices', 'payment-plans'],
    community: ['community-header', 'discussion-forums', 'study-groups', 'peer-connections', 'mentor-access', 'community-events']
  },

  // Luxury Real Estate (specialized variant)
  'luxury-real-estate': {
    home: ['luxury-hero', 'luxury-properties', 'exclusive-services', 'agent-profiles', 'testimonials-quotes', 'concierge-cta'],
    about: ['about-hero', 'about-split', 'agent-profiles', 'luxury-credentials', 'testimonials-quotes'],
    services: ['services-hero', 'exclusive-services', 'concierge-offerings', 'testimonials-featured', 'cta-with-form'],
    listings: ['listings-hero', 'luxury-properties', 'property-filters', 'market-insights', 'cta-simple'],
    contact: ['contact-hero', 'private-consultation', 'agent-profiles', 'contact-minimal'],
    // VIP Client Portal Pages
    login: ['auth-hero-luxury', 'login-form', 'forgot-password', 'vip-access'],
    register: ['auth-hero-luxury', 'vip-registration', 'preferences-luxury', 'nda-agreement', 'terms-checkbox'],
    dashboard: ['vip-dashboard', 'exclusive-listings', 'saved-estates', 'private-showings', 'concierge-requests', 'agent-direct'],
    'saved-properties': ['saved-header-luxury', 'saved-estates', 'property-comparisons', 'off-market-alerts', 'notes-per-property'],
    showings: ['showings-header', 'private-showings', 'showing-requests', 'showing-history', 'property-feedback'],
    concierge: ['concierge-header', 'concierge-requests', 'lifestyle-services', 'relocation-assistance', 'request-history']
  },

  // Commercial Real Estate
  'commercial-real-estate': {
    home: ['commercial-hero', 'investment-properties', 'market-analytics', 'services-grid', 'testimonials-grid', 'cta-with-form'],
    about: ['about-hero', 'about-split', 'agent-profiles', 'transaction-history', 'testimonials-quotes'],
    services: ['services-hero', 'services-list', 'investment-advisory', 'tenant-rep', 'cta-with-form'],
    listings: ['listings-hero', 'property-search-commercial', 'investment-properties', 'market-analytics', 'cta-simple'],
    contact: ['contact-hero', 'agent-profiles', 'contact-with-map', 'office-hours'],
    // Investor/Client Portal Pages
    login: ['auth-hero', 'login-form', 'forgot-password'],
    register: ['auth-hero', 'investor-registration', 'investment-criteria', 'terms-checkbox'],
    dashboard: ['investor-dashboard', 'portfolio-overview', 'deal-pipeline', 'market-reports', 'saved-properties', 'advisor-contact'],
    portfolio: ['portfolio-header', 'owned-properties', 'property-performance', 'income-reports', 'expense-tracking', 'cap-rate-analysis'],
    'deal-flow': ['deals-header', 'active-deals', 'deal-details', 'investment-analysis', 'due-diligence', 'offer-submission'],
    documents: ['documents-header', 'transaction-documents', 'financial-reports', 'legal-documents', 'upload-files'],
    reports: ['reports-header', 'market-reports', 'property-reports', 'financial-analysis', 'custom-reports']
  },

  // Property Management
  'property-management': {
    home: ['hero-split', 'services-grid', 'stats-animated', 'owner-benefits', 'testimonials-carousel', 'pricing-cards', 'cta-with-form'],
    about: ['about-hero', 'about-split', 'about-team', 'trust-badges', 'testimonials-quotes'],
    services: ['services-hero', 'services-list', 'owner-services', 'tenant-services', 'faq-accordion', 'cta-with-form'],
    rentals: ['rentals-hero', 'available-rentals', 'rental-search', 'application-cta'],
    contact: ['contact-hero', 'contact-split', 'office-hours', 'emergency-contact'],
    // Owner Portal Pages
    'owner-login': ['auth-hero', 'login-form', 'forgot-password', 'owner-registration'],
    'owner-dashboard': ['owner-dashboard', 'property-overview', 'income-summary', 'maintenance-requests', 'tenant-status', 'documents', 'quick-actions-owner'],
    'owner-properties': ['properties-header', 'my-properties', 'property-details', 'tenant-info', 'lease-status', 'property-performance'],
    'owner-financials': ['financials-header', 'income-statements', 'expense-reports', 'tax-documents', 'payment-history', 'distribution-schedule'],
    'owner-maintenance': ['maintenance-header', 'maintenance-requests', 'work-orders', 'vendor-info', 'maintenance-history', 'approve-repairs'],
    // Tenant Portal Pages
    'tenant-login': ['auth-hero', 'login-form', 'forgot-password', 'apply-now'],
    'tenant-dashboard': ['tenant-dashboard', 'rent-status', 'maintenance-requests', 'lease-info', 'documents', 'announcements', 'quick-actions-tenant'],
    'tenant-payments': ['payments-header', 'pay-rent', 'payment-history', 'auto-pay-setup', 'payment-methods', 'ledger-balance'],
    'tenant-maintenance': ['maintenance-header', 'submit-request', 'request-status', 'maintenance-history', 'emergency-maintenance'],
    'tenant-documents': ['documents-header', 'lease-documents', 'move-in-checklist', 'community-rules', 'upload-documents']
  },

  // Default fallback for unknown industries
  'default': {
    home: ['hero-centered', 'services-grid', 'about-split', 'testimonials-carousel', 'stats-animated', 'cta-simple'],
    about: ['about-hero', 'about-split', 'about-values', 'about-team', 'testimonials-quotes'],
    services: ['services-hero', 'services-grid', 'pricing-cards', 'faq-accordion', 'cta-with-form'],
    contact: ['contact-hero', 'contact-with-map', 'faq-accordion'],
    team: ['team-hero', 'about-team', 'cta-simple'],
    testimonials: ['testimonials-hero', 'testimonials-grid', 'cta-simple'],
    faq: ['faq-hero', 'faq-accordion', 'contact-split'],
    gallery: ['gallery-hero', 'gallery-masonry', 'cta-simple'],
    pricing: ['pricing-hero', 'pricing-cards', 'faq-accordion', 'cta-with-form'],
    blog: ['blog-hero', 'blog-grid', 'newsletter-cta', 'cta-simple'],
    booking: ['booking-hero', 'appointment-booking', 'faq-accordion'],
    // Basic Customer Portal Pages (fallback)
    login: ['auth-hero', 'login-form', 'social-login', 'forgot-password'],
    register: ['auth-hero', 'register-form', 'terms-checkbox'],
    dashboard: ['dashboard-header', 'quick-actions', 'recent-activity', 'upcoming-items', 'notifications'],
    profile: ['profile-header', 'personal-info', 'notification-settings', 'security-settings'],
    appointments: ['appointments-header', 'upcoming-appointments', 'past-appointments', 'schedule-appointment'],
    payments: ['payments-header', 'payment-methods', 'billing-history', 'make-payment']
  }
};

// ============================================
// RESEARCH-BASED LAYOUT VARIATIONS
// Layout A/B/C patterns based on industry design research
// ============================================

const RESEARCH_LAYOUTS = {
  // ==========================================
  // FOOD & BEVERAGE
  // ==========================================
  'coffee-shop': {
    layoutA: {
      name: 'Video-First Hero',
      heroType: 'video',
      sectionOrder: ['hero-video', 'featured-drinks', 'about-preview', 'locations', 'loyalty-cta'],
      features: ['autoplay-hero-video', 'floating-order-button', 'animated-menu-cards']
    },
    layoutB: {
      name: 'Photography-Heavy',
      heroType: 'image-carousel',
      sectionOrder: ['hero-carousel', 'menu-preview', 'atmosphere-gallery', 'about', 'contact'],
      features: ['full-bleed-images', 'hover-zoom-gallery', 'instagram-feed']
    },
    layoutC: {
      name: 'Story-Driven',
      heroType: 'split',
      sectionOrder: ['hero-split', 'our-story', 'sourcing', 'menu', 'community', 'visit-us'],
      features: ['parallax-scrolling', 'timeline-history', 'team-carousel']
    }
  },

  'cafe': {
    layoutA: {
      name: 'Cozy Atmosphere',
      heroType: 'image',
      sectionOrder: ['hero-image', 'daily-specials', 'menu-preview', 'atmosphere-gallery', 'about', 'contact'],
      features: ['warm-color-overlays', 'handwritten-fonts', 'instagram-feed']
    },
    layoutB: {
      name: 'Menu-Forward',
      heroType: 'split',
      sectionOrder: ['hero-split', 'menu-categories', 'featured-items', 'about-preview', 'testimonials', 'location'],
      features: ['tabbed-menu', 'dietary-filters', 'order-online-integration']
    },
    layoutC: {
      name: 'Community Hub',
      heroType: 'video',
      sectionOrder: ['hero-video', 'events-calendar', 'menu-preview', 'community', 'about', 'contact'],
      features: ['event-booking', 'newsletter-signup', 'local-partnerships']
    }
  },

  'restaurant': {
    layoutA: {
      name: 'Reservation-Focused',
      heroType: 'fullscreen-image',
      sectionOrder: ['hero-fullscreen', 'reservation-widget', 'menu-preview', 'chef-story', 'reviews', 'private-events'],
      features: ['inline-reservation-form', 'opentable-integration', 'seasonal-menu-highlight']
    },
    layoutB: {
      name: 'Visual Feast',
      heroType: 'video',
      sectionOrder: ['hero-video', 'signature-dishes', 'atmosphere-gallery', 'menu-tabs', 'about', 'contact'],
      features: ['food-photography-hero', 'dish-hover-details', 'wine-pairing-suggestions']
    },
    layoutC: {
      name: 'Story & Tradition',
      heroType: 'split',
      sectionOrder: ['hero-split', 'our-story', 'farm-partners', 'seasonal-menu', 'press-awards', 'reservations'],
      features: ['origin-timeline', 'sourcing-map', 'press-logos']
    }
  },

  'bakery': {
    layoutA: {
      name: 'Gallery Showcase',
      heroType: 'image-grid',
      sectionOrder: ['hero-image', 'daily-fresh', 'gallery-masonry', 'custom-orders', 'about', 'contact'],
      features: ['product-lightbox', 'daily-menu-board', 'pre-order-system']
    },
    layoutB: {
      name: 'Order-Focused',
      heroType: 'split',
      sectionOrder: ['hero-split', 'order-online-cta', 'menu-categories', 'custom-cakes', 'testimonials', 'location'],
      features: ['quick-add-to-cart', 'custom-order-form', 'pickup-scheduler']
    },
    layoutC: {
      name: 'Artisan Story',
      heroType: 'video',
      sectionOrder: ['hero-video', 'our-process', 'signature-items', 'baker-profiles', 'wholesale', 'visit-us'],
      features: ['behind-scenes-video', 'ingredient-sourcing', 'wholesale-inquiry']
    }
  },

  'pizza': {
    layoutA: {
      name: 'Order-First',
      heroType: 'split',
      sectionOrder: ['hero-split', 'order-now-banner', 'menu-grid', 'build-your-own', 'delivery-info', 'locations'],
      features: ['prominent-order-button', 'delivery-tracker', 'pizza-builder']
    },
    layoutB: {
      name: 'Authentic Story',
      heroType: 'video',
      sectionOrder: ['hero-video', 'our-tradition', 'signature-pizzas', 'ingredients', 'reviews', 'order-cta'],
      features: ['wood-fired-oven-video', 'ingredient-origins', 'family-history']
    },
    layoutC: {
      name: 'Menu Showcase',
      heroType: 'fullscreen-image',
      sectionOrder: ['hero-fullscreen', 'menu-categories', 'specials', 'catering', 'about', 'contact'],
      features: ['visual-menu', 'daily-specials-banner', 'group-ordering']
    }
  },

  'steakhouse': {
    layoutA: {
      name: 'Luxury Experience',
      heroType: 'video',
      sectionOrder: ['hero-video', 'signature-cuts', 'wine-program', 'private-dining', 'chef-profile', 'reservations'],
      features: ['dark-elegant-theme', 'wine-list-preview', 'vip-booking']
    },
    layoutB: {
      name: 'Menu Excellence',
      heroType: 'fullscreen-image',
      sectionOrder: ['hero-fullscreen', 'prime-cuts', 'sides-seafood', 'wine-pairings', 'about', 'book-table'],
      features: ['premium-imagery', 'cut-descriptions', 'sommelier-picks']
    },
    layoutC: {
      name: 'Heritage Story',
      heroType: 'split',
      sectionOrder: ['hero-split', 'our-heritage', 'aging-process', 'menu-preview', 'awards', 'reservations'],
      features: ['history-timeline', 'aging-room-tour', 'press-accolades']
    }
  },

  'food-truck': {
    layoutA: {
      name: 'Location Finder',
      heroType: 'map',
      sectionOrder: ['hero-with-map', 'todays-location', 'menu-grid', 'schedule-calendar', 'catering', 'social-feed'],
      features: ['live-location-map', 'schedule-notifications', 'social-integration']
    },
    layoutB: {
      name: 'Menu-First',
      heroType: 'image',
      sectionOrder: ['hero-image', 'menu-showcase', 'find-us', 'about-truck', 'events', 'contact'],
      features: ['visual-menu', 'event-booking', 'private-events']
    },
    layoutC: {
      name: 'Story & Schedule',
      heroType: 'video',
      sectionOrder: ['hero-video', 'our-story', 'weekly-schedule', 'menu-preview', 'catering', 'follow-us'],
      features: ['behind-scenes', 'calendar-widget', 'email-signup']
    }
  },

  'bar-brewery': {
    layoutA: {
      name: 'Tap List Focus',
      heroType: 'image',
      sectionOrder: ['hero-image', 'on-tap-now', 'events-calendar', 'food-menu', 'brewery-tour', 'visit-us'],
      features: ['live-tap-list', 'untappd-integration', 'event-rsvp']
    },
    layoutB: {
      name: 'Brewery Experience',
      heroType: 'video',
      sectionOrder: ['hero-video', 'our-beers', 'brewing-process', 'taproom-info', 'merchandise', 'contact'],
      features: ['brewery-tour-video', 'beer-finder', 'merchandise-shop']
    },
    layoutC: {
      name: 'Events & Community',
      heroType: 'split',
      sectionOrder: ['hero-split', 'upcoming-events', 'tap-list', 'private-events', 'about', 'visit'],
      features: ['event-calendar', 'private-booking', 'mailing-list']
    }
  },

  // ==========================================
  // BEAUTY & GROOMING
  // ==========================================
  'salon': {
    layoutA: {
      name: 'Booking-Optimized',
      heroType: 'split',
      sectionOrder: ['hero-split', 'book-now-widget', 'services-grid', 'team-carousel', 'gallery', 'reviews'],
      features: ['inline-booking', 'service-menu-pricing', 'stylist-selection']
    },
    layoutB: {
      name: 'Portfolio Showcase',
      heroType: 'video',
      sectionOrder: ['hero-video', 'before-after-gallery', 'services', 'stylists', 'testimonials', 'contact'],
      features: ['transformation-slider', 'instagram-feed', 'video-portfolio']
    },
    layoutC: {
      name: 'Luxury Experience',
      heroType: 'fullscreen-image',
      sectionOrder: ['hero-fullscreen', 'experience-overview', 'signature-services', 'products', 'gift-cards', 'book'],
      features: ['elegant-animations', 'product-shop', 'gift-card-purchase']
    }
  },

  'spa': {
    layoutA: {
      name: 'Serene Escape',
      heroType: 'video',
      sectionOrder: ['hero-video', 'spa-menu', 'packages', 'virtual-tour', 'gift-cards', 'book-escape'],
      features: ['calming-animations', 'package-builder', 'gift-certificates']
    },
    layoutB: {
      name: 'Service Menu',
      heroType: 'fullscreen-image',
      sectionOrder: ['hero-fullscreen', 'treatment-categories', 'signature-treatments', 'membership', 'about', 'contact'],
      features: ['categorized-services', 'membership-tiers', 'online-booking']
    },
    layoutC: {
      name: 'Wellness Journey',
      heroType: 'split',
      sectionOrder: ['hero-split', 'wellness-philosophy', 'treatments', 'practitioners', 'testimonials', 'book-journey'],
      features: ['wellness-quiz', 'practitioner-bios', 'consultation-booking']
    }
  },

  'barbershop': {
    layoutA: {
      name: 'Classic Masculine',
      heroType: 'image',
      sectionOrder: ['hero-image', 'services-pricing', 'barber-profiles', 'gallery', 'walk-in-status', 'contact'],
      features: ['dark-theme', 'walk-in-indicator', 'barber-booking']
    },
    layoutB: {
      name: 'Modern Portfolio',
      heroType: 'video',
      sectionOrder: ['hero-video', 'work-gallery', 'services', 'team', 'products', 'book-now'],
      features: ['portfolio-grid', 'product-shop', 'style-gallery']
    },
    layoutC: {
      name: 'Community Shop',
      heroType: 'split',
      sectionOrder: ['hero-split', 'our-story', 'services', 'the-crew', 'community', 'visit-us'],
      features: ['shop-culture', 'social-feed', 'community-events']
    }
  },

  // ==========================================
  // FITNESS & WELLNESS
  // ==========================================
  'fitness': {
    layoutA: {
      name: 'Trial-Focused',
      heroType: 'video',
      sectionOrder: ['hero-video', 'free-trial-cta', 'membership-tiers', 'class-schedule', 'trainers', 'facility-tour'],
      features: ['trial-signup-form', 'membership-comparison', 'schedule-filter']
    },
    layoutB: {
      name: 'Results-Driven',
      heroType: 'split',
      sectionOrder: ['hero-split', 'transformation-stories', 'programs', 'pricing', 'trainers', 'start-today'],
      features: ['before-after-gallery', 'program-cards', 'trainer-booking']
    },
    layoutC: {
      name: 'Community Focus',
      heroType: 'image',
      sectionOrder: ['hero-image', 'class-schedule', 'community-events', 'membership', 'about', 'join-us'],
      features: ['class-calendar', 'event-signup', 'member-spotlight']
    }
  },

  'gym': {
    layoutA: {
      name: 'Membership-First',
      heroType: 'video',
      sectionOrder: ['hero-video', 'membership-tiers', 'amenities', 'class-schedule', 'trainers', 'free-pass'],
      features: ['membership-comparison', 'virtual-tour', 'class-booking']
    },
    layoutB: {
      name: 'Facility Showcase',
      heroType: 'image-carousel',
      sectionOrder: ['hero-carousel', 'equipment-tour', 'classes', 'personal-training', 'pricing', 'contact'],
      features: ['facility-gallery', 'equipment-list', 'trainer-profiles']
    },
    layoutC: {
      name: 'Results & Community',
      heroType: 'split',
      sectionOrder: ['hero-split', 'success-stories', 'programs', 'schedule', 'community', 'join-now'],
      features: ['transformation-carousel', 'program-finder', 'community-board']
    }
  },

  'yoga': {
    layoutA: {
      name: 'Class Schedule Focus',
      heroType: 'image',
      sectionOrder: ['hero-image', 'todays-classes', 'class-types', 'instructors', 'pricing', 'new-student-offer'],
      features: ['live-schedule', 'class-descriptions', 'instructor-bios']
    },
    layoutB: {
      name: 'Wellness Journey',
      heroType: 'video',
      sectionOrder: ['hero-video', 'your-practice', 'class-offerings', 'teachers', 'workshops', 'begin-journey'],
      features: ['calming-video', 'workshop-calendar', 'retreat-info']
    },
    layoutC: {
      name: 'Community Studio',
      heroType: 'split',
      sectionOrder: ['hero-split', 'philosophy', 'schedule', 'teachers', 'community', 'visit-us'],
      features: ['studio-philosophy', 'teacher-spotlight', 'community-events']
    }
  },

  // ==========================================
  // HEALTHCARE
  // ==========================================
  'dental': {
    layoutA: {
      name: 'Booking-Optimized',
      heroType: 'split',
      sectionOrder: ['hero-split', 'book-appointment', 'services', 'smile-gallery', 'team', 'insurance'],
      features: ['online-scheduling', 'smile-transformations', 'insurance-checker']
    },
    layoutB: {
      name: 'Family-Friendly',
      heroType: 'image',
      sectionOrder: ['hero-image', 'welcome-families', 'services', 'meet-team', 'patient-forms', 'contact'],
      features: ['warm-imagery', 'family-services', 'new-patient-portal']
    },
    layoutC: {
      name: 'Technology-Forward',
      heroType: 'video',
      sectionOrder: ['hero-video', 'advanced-technology', 'services', 'providers', 'patient-portal', 'schedule'],
      features: ['technology-showcase', 'virtual-tour', 'telehealth-option']
    }
  },

  'medical': {
    layoutA: {
      name: 'Patient Portal Focus',
      heroType: 'split',
      sectionOrder: ['hero-split', 'patient-portal-cta', 'services', 'providers', 'insurance', 'locations'],
      features: ['portal-integration', 'provider-search', 'insurance-lookup']
    },
    layoutB: {
      name: 'Service-Oriented',
      heroType: 'image',
      sectionOrder: ['hero-image', 'quick-actions', 'specialties', 'providers', 'patient-resources', 'contact'],
      features: ['service-cards', 'provider-bios', 'resource-library']
    },
    layoutC: {
      name: 'Community Health',
      heroType: 'video',
      sectionOrder: ['hero-video', 'care-approach', 'services', 'team', 'community-programs', 'get-care'],
      features: ['care-philosophy', 'community-outreach', 'telehealth']
    }
  },

  'healthcare': {
    layoutA: {
      name: 'Appointment-First',
      heroType: 'split',
      sectionOrder: ['hero-split', 'schedule-appointment', 'services', 'providers', 'patient-portal', 'insurance'],
      features: ['online-scheduling', 'provider-directory', 'portal-access']
    },
    layoutB: {
      name: 'Comprehensive Care',
      heroType: 'image',
      sectionOrder: ['hero-image', 'our-services', 'care-team', 'patient-resources', 'insurance-billing', 'contact'],
      features: ['service-overview', 'team-profiles', 'forms-download']
    },
    layoutC: {
      name: 'Wellness-Centered',
      heroType: 'video',
      sectionOrder: ['hero-video', 'whole-person-care', 'services', 'providers', 'wellness-programs', 'begin'],
      features: ['wellness-approach', 'preventive-care', 'health-education']
    }
  },

  'vet': {
    layoutA: {
      name: 'Pet-First',
      heroType: 'image',
      sectionOrder: ['hero-image', 'book-visit', 'services', 'our-team', 'pet-portal', 'emergency-info'],
      features: ['pet-friendly-design', 'species-services', 'emergency-banner']
    },
    layoutB: {
      name: 'Full-Service',
      heroType: 'split',
      sectionOrder: ['hero-split', 'services-overview', 'care-team', 'patient-resources', 'pharmacy', 'contact'],
      features: ['service-categories', 'pharmacy-refills', 'pet-records']
    },
    layoutC: {
      name: 'Emergency-Ready',
      heroType: 'image',
      sectionOrder: ['emergency-banner', 'hero-image', 'urgent-care', 'services', 'team', 'contact'],
      features: ['emergency-prominent', '24-7-info', 'quick-contact']
    }
  },

  // ==========================================
  // HOME SERVICES
  // ==========================================
  'plumber': {
    layoutA: {
      name: 'Emergency-First',
      heroType: 'split',
      sectionOrder: ['emergency-banner', 'hero-split', 'services', 'pricing', 'service-area', 'reviews'],
      features: ['24-7-badge', 'click-to-call', 'instant-quote']
    },
    layoutB: {
      name: 'Trust-Builder',
      heroType: 'image',
      sectionOrder: ['hero-image', 'why-choose-us', 'services', 'credentials', 'testimonials', 'get-quote'],
      features: ['license-display', 'review-integration', 'guarantee-badge']
    },
    layoutC: {
      name: 'Service-Focused',
      heroType: 'split',
      sectionOrder: ['hero-split', 'common-issues', 'services-pricing', 'about', 'service-area', 'contact'],
      features: ['problem-solver', 'transparent-pricing', 'area-map']
    }
  },

  'hvac': {
    layoutA: {
      name: 'Emergency & Maintenance',
      heroType: 'split',
      sectionOrder: ['emergency-banner', 'hero-split', 'services', 'maintenance-plans', 'financing', 'contact'],
      features: ['emergency-cta', 'plan-comparison', 'financing-calculator']
    },
    layoutB: {
      name: 'Seasonal Focus',
      heroType: 'image',
      sectionOrder: ['hero-image', 'seasonal-services', 'maintenance', 'new-systems', 'reviews', 'schedule'],
      features: ['seasonal-promotions', 'system-finder', 'rebate-info']
    },
    layoutC: {
      name: 'Full-Service',
      heroType: 'video',
      sectionOrder: ['hero-video', 'services', 'brands-we-service', 'maintenance-club', 'about', 'contact'],
      features: ['brand-logos', 'membership-benefits', 'video-testimonials']
    }
  },

  'electrician': {
    layoutA: {
      name: 'Safety-First',
      heroType: 'split',
      sectionOrder: ['emergency-banner', 'hero-split', 'services', 'safety-tips', 'credentials', 'contact'],
      features: ['emergency-contact', 'safety-resources', 'license-verification']
    },
    layoutB: {
      name: 'Residential Focus',
      heroType: 'image',
      sectionOrder: ['hero-image', 'home-services', 'smart-home', 'pricing', 'reviews', 'schedule'],
      features: ['service-categories', 'smart-home-showcase', 'upfront-pricing']
    },
    layoutC: {
      name: 'Commercial & Residential',
      heroType: 'split',
      sectionOrder: ['hero-split', 'residential', 'commercial', 'about', 'service-area', 'get-quote'],
      features: ['segment-tabs', 'project-gallery', 'area-coverage']
    }
  },

  'cleaning': {
    layoutA: {
      name: 'Quote-Focused',
      heroType: 'split',
      sectionOrder: ['hero-split', 'instant-quote', 'services', 'how-it-works', 'trust-badges', 'reviews'],
      features: ['quote-calculator', 'booking-widget', 'satisfaction-guarantee']
    },
    layoutB: {
      name: 'Service Showcase',
      heroType: 'image',
      sectionOrder: ['hero-image', 'cleaning-types', 'add-ons', 'pricing', 'about', 'book-now'],
      features: ['service-cards', 'checklist-preview', 'eco-friendly-badge']
    },
    layoutC: {
      name: 'Trust-Builder',
      heroType: 'video',
      sectionOrder: ['hero-video', 'why-us', 'services', 'our-cleaners', 'reviews', 'get-started'],
      features: ['team-video', 'background-check-badge', 'review-carousel']
    }
  },

  'auto-shop': {
    layoutA: {
      name: 'Service-First',
      heroType: 'split',
      sectionOrder: ['hero-split', 'common-services', 'full-services', 'pricing', 'reviews', 'schedule'],
      features: ['service-menu', 'price-transparency', 'online-scheduling']
    },
    layoutB: {
      name: 'Trust-Builder',
      heroType: 'image',
      sectionOrder: ['hero-image', 'why-choose-us', 'services', 'certifications', 'reviews', 'contact'],
      features: ['ase-certified-badge', 'warranty-info', 'review-integration']
    },
    layoutC: {
      name: 'Full-Service',
      heroType: 'video',
      sectionOrder: ['hero-video', 'services', 'brands-serviced', 'about', 'customer-portal', 'contact'],
      features: ['shop-tour-video', 'brand-logos', 'maintenance-reminders']
    }
  },

  // ==========================================
  // PROFESSIONAL SERVICES
  // ==========================================
  'law-firm': {
    layoutA: {
      name: 'Consultation-Focused',
      heroType: 'split',
      sectionOrder: ['hero-split', 'free-consultation', 'practice-areas', 'results', 'attorneys', 'contact'],
      features: ['consultation-form', 'case-results', 'attorney-profiles']
    },
    layoutB: {
      name: 'Results-Driven',
      heroType: 'image',
      sectionOrder: ['hero-image', 'track-record', 'practice-areas', 'case-studies', 'team', 'get-help'],
      features: ['results-stats', 'case-study-cards', 'awards-display']
    },
    layoutC: {
      name: 'Client-Centered',
      heroType: 'video',
      sectionOrder: ['hero-video', 'how-we-help', 'practice-areas', 'testimonials', 'about', 'contact'],
      features: ['client-testimonials-video', 'practice-area-detail', 'empathy-messaging']
    }
  },

  'professional': {
    layoutA: {
      name: 'Lead-Generator',
      heroType: 'split',
      sectionOrder: ['hero-with-form', 'services', 'case-studies', 'team', 'testimonials', 'contact'],
      features: ['lead-capture-form', 'case-study-grid', 'team-expertise']
    },
    layoutB: {
      name: 'Expertise-Focused',
      heroType: 'image',
      sectionOrder: ['hero-image', 'our-expertise', 'services', 'insights', 'team', 'schedule-call'],
      features: ['expertise-showcase', 'blog-preview', 'calendar-booking']
    },
    layoutC: {
      name: 'Results-Oriented',
      heroType: 'video',
      sectionOrder: ['hero-video', 'impact-stats', 'services', 'success-stories', 'about', 'contact'],
      features: ['animated-stats', 'video-testimonials', 'roi-calculator']
    }
  },

  // ==========================================
  // REAL ESTATE
  // ==========================================
  'real-estate': {
    layoutA: {
      name: 'Search-First',
      heroType: 'fullscreen-image',
      sectionOrder: ['hero-with-search', 'featured-listings', 'market-stats', 'agents', 'testimonials', 'contact'],
      features: ['property-search', 'listing-cards', 'market-data']
    },
    layoutB: {
      name: 'Agent-Focused',
      heroType: 'split',
      sectionOrder: ['hero-split', 'agent-stats', 'featured-properties', 'about-agent', 'reviews', 'contact'],
      features: ['agent-branding', 'success-metrics', 'personal-approach']
    },
    layoutC: {
      name: 'Market Expert',
      heroType: 'image',
      sectionOrder: ['hero-image', 'home-valuation', 'market-insights', 'listings', 'services', 'contact'],
      features: ['valuation-tool', 'market-reports', 'buyer-seller-resources']
    }
  },

  // ==========================================
  // RETAIL & ECOMMERCE
  // ==========================================
  'retail': {
    layoutA: {
      name: 'Product-First',
      heroType: 'image-carousel',
      sectionOrder: ['hero-carousel', 'featured-products', 'categories', 'new-arrivals', 'reviews', 'newsletter'],
      features: ['product-slider', 'quick-add', 'category-nav']
    },
    layoutB: {
      name: 'Brand Story',
      heroType: 'video',
      sectionOrder: ['hero-video', 'our-story', 'collections', 'bestsellers', 'sustainability', 'shop-now'],
      features: ['brand-video', 'collection-showcase', 'values-display']
    },
    layoutC: {
      name: 'Sale-Focused',
      heroType: 'split',
      sectionOrder: ['promo-banner', 'hero-split', 'sale-items', 'categories', 'loyalty', 'contact'],
      features: ['countdown-timer', 'sale-badges', 'loyalty-program']
    }
  },

  'ecommerce': {
    layoutA: {
      name: 'Conversion-Optimized',
      heroType: 'split',
      sectionOrder: ['promo-bar', 'hero-split', 'bestsellers', 'categories', 'trust-badges', 'reviews'],
      features: ['free-shipping-bar', 'quick-add-cart', 'trust-signals']
    },
    layoutB: {
      name: 'Category-Focused',
      heroType: 'image',
      sectionOrder: ['hero-image', 'shop-categories', 'featured-products', 'new-arrivals', 'about', 'newsletter'],
      features: ['category-grid', 'product-filters', 'collection-pages']
    },
    layoutC: {
      name: 'Brand Experience',
      heroType: 'video',
      sectionOrder: ['hero-video', 'brand-values', 'collections', 'sustainability', 'reviews', 'join-community'],
      features: ['lifestyle-video', 'brand-story', 'community-building']
    }
  },

  // ==========================================
  // SAAS & TECHNOLOGY
  // ==========================================
  'saas': {
    layoutA: {
      name: 'Trial-Focused',
      heroType: 'split',
      sectionOrder: ['hero-split', 'social-proof', 'features', 'how-it-works', 'pricing', 'testimonials'],
      features: ['trial-cta', 'logo-carousel', 'feature-grid']
    },
    layoutB: {
      name: 'Demo-Driven',
      heroType: 'video',
      sectionOrder: ['hero-video', 'demo-cta', 'features', 'integrations', 'pricing', 'case-studies'],
      features: ['product-video', 'demo-booking', 'integration-logos']
    },
    layoutC: {
      name: 'Enterprise-Ready',
      heroType: 'image',
      sectionOrder: ['hero-image', 'enterprise-features', 'security', 'pricing', 'case-studies', 'contact-sales'],
      features: ['enterprise-badges', 'security-certifications', 'sales-contact']
    }
  },

  // ==========================================
  // EDUCATION
  // ==========================================
  'school': {
    layoutA: {
      name: 'Admissions-Focused',
      heroType: 'video',
      sectionOrder: ['hero-video', 'apply-now', 'programs', 'campus-life', 'outcomes', 'visit-campus'],
      features: ['admissions-cta', 'program-cards', 'virtual-tour']
    },
    layoutB: {
      name: 'Academic Excellence',
      heroType: 'image',
      sectionOrder: ['hero-image', 'academics', 'faculty', 'student-success', 'facilities', 'inquire'],
      features: ['program-details', 'faculty-profiles', 'success-stats']
    },
    layoutC: {
      name: 'Community-Centered',
      heroType: 'split',
      sectionOrder: ['hero-split', 'our-approach', 'programs', 'community', 'events', 'join-us'],
      features: ['philosophy-showcase', 'community-events', 'parent-resources']
    }
  }
};

/**
 * Get research-based layout for an industry
 * @param {string} industryKey - Industry key
 * @param {string} layoutVariant - 'A', 'B', or 'C'
 * @returns {object|null} Layout configuration or null
 */
function getResearchLayout(industryKey, layoutVariant = 'A') {
  const industryLayouts = RESEARCH_LAYOUTS[industryKey];
  if (!industryLayouts) return null;

  const variantKey = `layout${layoutVariant}`;
  return industryLayouts[variantKey] || null;
}

/**
 * Get all available layout variants for an industry
 * @param {string} industryKey - Industry key
 * @returns {object} Object with layoutA, layoutB, layoutC
 */
function getResearchLayoutVariants(industryKey) {
  return RESEARCH_LAYOUTS[industryKey] || null;
}

/**
 * Get section order from research layout
 * @param {string} industryKey - Industry key
 * @param {string} layoutVariant - 'A', 'B', or 'C'
 * @returns {string[]} Array of section keys
 */
function getResearchSectionOrder(industryKey, layoutVariant = 'A') {
  const layout = getResearchLayout(industryKey, layoutVariant);
  return layout?.sectionOrder || [];
}

/**
 * Get layout features from research layout
 * @param {string} industryKey - Industry key
 * @param {string} layoutVariant - 'A', 'B', or 'C'
 * @returns {string[]} Array of feature keys
 */
function getResearchLayoutFeatures(industryKey, layoutVariant = 'A') {
  const layout = getResearchLayout(industryKey, layoutVariant);
  return layout?.features || [];
}

/**
 * Get the section order for a specific page type and industry
 * @param {string} industryKey - Industry key (e.g., 'dental', 'restaurant')
 * @param {string} pageId - Page identifier (e.g., 'home', 'about', 'services')
 * @returns {string[]} Array of section keys for that page
 */
function getPageLayout(industryKey, pageId) {
  // Get the industry category
  const categoryKey = getLayoutCategory(industryKey);

  // Get page layouts for this category, or fall back to default
  const categoryLayouts = PAGE_LAYOUTS[categoryKey] || PAGE_LAYOUTS['default'];

  // Get the specific page layout, or fall back to default page layout
  const pageLayout = categoryLayouts[pageId] || PAGE_LAYOUTS['default'][pageId];

  // If still no layout found, return a generic fallback
  if (!pageLayout) {
    return ['hero-centered', 'services-grid', 'testimonials-carousel', 'cta-simple'];
  }

  return pageLayout;
}

module.exports = {
  INDUSTRY_LAYOUTS,
  SECTION_DETAILS,
  INDUSTRY_TO_LAYOUT_MAP,
  PAGE_LAYOUTS,
  RESEARCH_LAYOUTS,
  buildLayoutContext,
  getLayoutConfig,
  getLayoutCategory,
  getDefaultLayout,
  buildDetailedLayoutContext,
  getAvailableLayouts,
  getLayoutConfigFull,
  getPageLayout,
  getResearchLayout,
  getResearchLayoutVariants,
  getResearchSectionOrder,
  getResearchLayoutFeatures
};
