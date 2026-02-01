/**
 * Industry Configuration
 * Page recommendations and packages by industry
 *
 * Package Tiers:
 * - essential: Bare minimum to launch (3-4 pages)
 * - recommended: What most businesses need (5-6 pages)
 * - premium: Full-featured site (7-9 pages)
 * - all: Every possible page for the industry
 */

export const INDUSTRY_PAGE_PACKAGES = {
  // ═══════════════════════════════════════════════════════════════
  // FOOD & BEVERAGE
  // ═══════════════════════════════════════════════════════════════
  'restaurant': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'reservations', 'catering', 'contact'],
    all: ['home', 'menu', 'about', 'gallery', 'reservations', 'catering', 'private-events', 'gift-cards', 'testimonials', 'blog', 'contact']
  },
  'pizza': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'order-online', 'catering', 'contact'],
    all: ['home', 'menu', 'about', 'gallery', 'order-online', 'catering', 'specials', 'gift-cards', 'careers', 'contact']
  },
  'cafe': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'events', 'loyalty', 'contact'],
    all: ['home', 'menu', 'about', 'gallery', 'events', 'loyalty', 'wholesale', 'blog', 'careers', 'contact']
  },
  'bakery': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'order-online', 'catering', 'contact'],
    all: ['home', 'menu', 'about', 'gallery', 'order-online', 'catering', 'wholesale', 'classes', 'blog', 'contact']
  },
  'bar': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'events', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'events', 'reservations', 'private-events', 'contact'],
    all: ['home', 'menu', 'about', 'gallery', 'events', 'reservations', 'private-events', 'happy-hour', 'careers', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // HEALTHCARE & MEDICAL
  // ═══════════════════════════════════════════════════════════════
  'dental': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'patient-forms', 'insurance', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'team', 'patient-forms', 'insurance', 'testimonials', 'before-after', 'technology', 'financing', 'emergency', 'faq', 'blog', 'careers', 'contact']
  },
  'healthcare': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'providers', 'contact'],
    premium: ['home', 'services', 'about', 'providers', 'patient-portal', 'insurance', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'providers', 'patient-portal', 'insurance', 'testimonials', 'conditions', 'resources', 'appointments', 'faq', 'blog', 'careers', 'contact']
  },
  'medical-spa': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'gallery', 'before-after', 'pricing', 'booking', 'contact'],
    all: ['home', 'services', 'about', 'team', 'gallery', 'before-after', 'pricing', 'booking', 'specials', 'financing', 'testimonials', 'faq', 'blog', 'contact']
  },
  'chiropractic': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'conditions', 'testimonials', 'booking', 'contact'],
    all: ['home', 'services', 'about', 'team', 'conditions', 'testimonials', 'booking', 'insurance', 'new-patients', 'faq', 'blog', 'contact']
  },
  'veterinary': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'pet-portal', 'emergency', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'team', 'pet-portal', 'emergency', 'testimonials', 'resources', 'pharmacy', 'gallery', 'faq', 'blog', 'careers', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // BEAUTY & WELLNESS
  // ═══════════════════════════════════════════════════════════════
  'spa-salon': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'gallery', 'pricing', 'booking', 'contact'],
    all: ['home', 'services', 'about', 'team', 'gallery', 'pricing', 'booking', 'specials', 'gift-cards', 'products', 'testimonials', 'blog', 'careers', 'contact']
  },
  'barbershop': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'gallery', 'pricing', 'booking', 'contact'],
    all: ['home', 'services', 'about', 'team', 'gallery', 'pricing', 'booking', 'products', 'testimonials', 'blog', 'contact']
  },
  'tattoo': {
    essential: ['home', 'gallery', 'contact'],
    recommended: ['home', 'gallery', 'artists', 'about', 'contact'],
    premium: ['home', 'gallery', 'artists', 'about', 'styles', 'aftercare', 'booking', 'contact'],
    all: ['home', 'gallery', 'artists', 'about', 'styles', 'aftercare', 'booking', 'pricing', 'faq', 'testimonials', 'blog', 'contact']
  },
  'yoga': {
    essential: ['home', 'classes', 'contact'],
    recommended: ['home', 'classes', 'schedule', 'instructors', 'contact'],
    premium: ['home', 'classes', 'schedule', 'instructors', 'pricing', 'workshops', 'about', 'contact'],
    all: ['home', 'classes', 'schedule', 'instructors', 'pricing', 'workshops', 'about', 'retreats', 'teacher-training', 'blog', 'testimonials', 'contact']
  },
  'fitness': {
    essential: ['home', 'classes', 'contact'],
    recommended: ['home', 'classes', 'trainers', 'membership', 'contact'],
    premium: ['home', 'classes', 'trainers', 'membership', 'schedule', 'about', 'gallery', 'contact'],
    all: ['home', 'classes', 'trainers', 'membership', 'schedule', 'about', 'gallery', 'nutrition', 'personal-training', 'testimonials', 'blog', 'careers', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // PROFESSIONAL SERVICES
  // ═══════════════════════════════════════════════════════════════
  'law-firm': {
    essential: ['home', 'practice-areas', 'contact'],
    recommended: ['home', 'practice-areas', 'attorneys', 'about', 'contact'],
    premium: ['home', 'practice-areas', 'attorneys', 'about', 'case-results', 'testimonials', 'blog', 'contact'],
    all: ['home', 'practice-areas', 'attorneys', 'about', 'case-results', 'testimonials', 'blog', 'resources', 'faq', 'careers', 'contact']
  },
  'accounting': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'industries', 'resources', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'team', 'industries', 'resources', 'testimonials', 'client-portal', 'blog', 'careers', 'contact']
  },
  'consulting': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'case-studies', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'team', 'case-studies', 'testimonials', 'industries', 'insights', 'blog', 'careers', 'contact']
  },
  'finance': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'approach', 'insights', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'team', 'approach', 'insights', 'testimonials', 'client-portal', 'resources', 'blog', 'careers', 'contact']
  },
  'real-estate': {
    essential: ['home', 'listings', 'contact'],
    recommended: ['home', 'listings', 'about', 'agents', 'contact'],
    premium: ['home', 'listings', 'about', 'agents', 'buyers', 'sellers', 'testimonials', 'contact'],
    all: ['home', 'listings', 'about', 'agents', 'buyers', 'sellers', 'testimonials', 'neighborhoods', 'market-reports', 'resources', 'blog', 'contact']
  },
  'insurance': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'quote', 'claims', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'team', 'quote', 'claims', 'testimonials', 'resources', 'client-portal', 'blog', 'careers', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // TRADES & HOME SERVICES
  // ═══════════════════════════════════════════════════════════════
  'plumber': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'service-areas', 'contact'],
    premium: ['home', 'services', 'about', 'service-areas', 'gallery', 'testimonials', 'emergency', 'contact'],
    all: ['home', 'services', 'about', 'service-areas', 'gallery', 'testimonials', 'emergency', 'pricing', 'faq', 'blog', 'careers', 'contact']
  },
  'electrician': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'service-areas', 'contact'],
    premium: ['home', 'services', 'about', 'service-areas', 'gallery', 'testimonials', 'emergency', 'contact'],
    all: ['home', 'services', 'about', 'service-areas', 'gallery', 'testimonials', 'emergency', 'commercial', 'residential', 'faq', 'blog', 'contact']
  },
  'hvac': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'service-areas', 'contact'],
    premium: ['home', 'services', 'about', 'service-areas', 'maintenance-plans', 'testimonials', 'emergency', 'contact'],
    all: ['home', 'services', 'about', 'service-areas', 'maintenance-plans', 'testimonials', 'emergency', 'financing', 'brands', 'faq', 'blog', 'careers', 'contact']
  },
  'construction': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'projects', 'contact'],
    premium: ['home', 'services', 'about', 'projects', 'process', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'projects', 'process', 'testimonials', 'commercial', 'residential', 'team', 'blog', 'careers', 'contact']
  },
  'landscaping': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'gallery', 'service-areas', 'testimonials', 'contact'],
    all: ['home', 'services', 'about', 'gallery', 'service-areas', 'testimonials', 'seasonal', 'maintenance-plans', 'blog', 'careers', 'contact']
  },
  'cleaning': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'pricing', 'contact'],
    premium: ['home', 'services', 'about', 'pricing', 'service-areas', 'testimonials', 'booking', 'contact'],
    all: ['home', 'services', 'about', 'pricing', 'service-areas', 'testimonials', 'booking', 'commercial', 'residential', 'faq', 'careers', 'contact']
  },
  'roofing': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'gallery', 'service-areas', 'testimonials', 'financing', 'contact'],
    all: ['home', 'services', 'about', 'gallery', 'service-areas', 'testimonials', 'financing', 'emergency', 'commercial', 'residential', 'faq', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // TECHNOLOGY & CREATIVE
  // ═══════════════════════════════════════════════════════════════
  'saas': {
    essential: ['home', 'features', 'pricing', 'contact'],
    recommended: ['home', 'features', 'pricing', 'about', 'contact'],
    premium: ['home', 'features', 'pricing', 'about', 'integrations', 'docs', 'blog', 'contact'],
    all: ['home', 'features', 'pricing', 'about', 'integrations', 'docs', 'blog', 'case-studies', 'security', 'changelog', 'careers', 'contact']
  },
  'agency': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'portfolio', 'about', 'contact'],
    premium: ['home', 'services', 'portfolio', 'about', 'team', 'case-studies', 'contact'],
    all: ['home', 'services', 'portfolio', 'about', 'team', 'case-studies', 'process', 'testimonials', 'blog', 'careers', 'contact']
  },
  'photography': {
    essential: ['home', 'portfolio', 'contact'],
    recommended: ['home', 'portfolio', 'about', 'pricing', 'contact'],
    premium: ['home', 'portfolio', 'about', 'pricing', 'services', 'testimonials', 'booking', 'contact'],
    all: ['home', 'portfolio', 'about', 'pricing', 'services', 'testimonials', 'booking', 'packages', 'faq', 'blog', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // RETAIL & E-COMMERCE
  // ═══════════════════════════════════════════════════════════════
  'retail': {
    essential: ['home', 'products', 'contact'],
    recommended: ['home', 'products', 'about', 'contact'],
    premium: ['home', 'products', 'about', 'gallery', 'testimonials', 'faq', 'contact'],
    all: ['home', 'products', 'about', 'gallery', 'testimonials', 'faq', 'shipping', 'returns', 'wholesale', 'blog', 'contact']
  },
  'collectibles': {
    essential: ['home', 'inventory', 'contact'],
    recommended: ['home', 'inventory', 'about', 'sell-to-us', 'contact'],
    premium: ['home', 'inventory', 'about', 'sell-to-us', 'grading', 'events', 'contact'],
    all: ['home', 'inventory', 'about', 'sell-to-us', 'grading', 'events', 'consignment', 'authentication', 'blog', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // EDUCATION & NON-PROFIT
  // ═══════════════════════════════════════════════════════════════
  'education': {
    essential: ['home', 'programs', 'contact'],
    recommended: ['home', 'programs', 'about', 'faculty', 'contact'],
    premium: ['home', 'programs', 'about', 'faculty', 'admissions', 'campus', 'testimonials', 'contact'],
    all: ['home', 'programs', 'about', 'faculty', 'admissions', 'campus', 'testimonials', 'calendar', 'resources', 'alumni', 'careers', 'contact']
  },
  'nonprofit': {
    essential: ['home', 'mission', 'contact'],
    recommended: ['home', 'mission', 'programs', 'about', 'donate', 'contact'],
    premium: ['home', 'mission', 'programs', 'about', 'donate', 'impact', 'events', 'contact'],
    all: ['home', 'mission', 'programs', 'about', 'donate', 'impact', 'events', 'volunteer', 'team', 'news', 'resources', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // HOSPITALITY & TRAVEL
  // ═══════════════════════════════════════════════════════════════
  'hotel': {
    essential: ['home', 'rooms', 'contact'],
    recommended: ['home', 'rooms', 'amenities', 'about', 'contact'],
    premium: ['home', 'rooms', 'amenities', 'about', 'gallery', 'dining', 'booking', 'contact'],
    all: ['home', 'rooms', 'amenities', 'about', 'gallery', 'dining', 'booking', 'events', 'spa', 'location', 'faq', 'contact']
  },
  'travel': {
    essential: ['home', 'destinations', 'contact'],
    recommended: ['home', 'destinations', 'tours', 'about', 'contact'],
    premium: ['home', 'destinations', 'tours', 'about', 'packages', 'testimonials', 'booking', 'contact'],
    all: ['home', 'destinations', 'tours', 'about', 'packages', 'testimonials', 'booking', 'blog', 'faq', 'contact']
  },
  'event-venue': {
    essential: ['home', 'venues', 'contact'],
    recommended: ['home', 'venues', 'events', 'gallery', 'contact'],
    premium: ['home', 'venues', 'events', 'gallery', 'packages', 'catering', 'booking', 'contact'],
    all: ['home', 'venues', 'events', 'gallery', 'packages', 'catering', 'booking', 'testimonials', 'faq', 'blog', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // PET & HOME SERVICES
  // ═══════════════════════════════════════════════════════════════
  'pet-services': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'gallery', 'pricing', 'booking', 'contact'],
    all: ['home', 'services', 'about', 'team', 'gallery', 'pricing', 'booking', 'testimonials', 'faq', 'blog', 'contact']
  },
  'moving': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'service-areas', 'contact'],
    premium: ['home', 'services', 'about', 'service-areas', 'pricing', 'testimonials', 'quote', 'contact'],
    all: ['home', 'services', 'about', 'service-areas', 'pricing', 'testimonials', 'quote', 'faq', 'blog', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // ENTERTAINMENT & MEDIA
  // ═══════════════════════════════════════════════════════════════
  'musician': {
    essential: ['home', 'music', 'contact'],
    recommended: ['home', 'music', 'about', 'events', 'contact'],
    premium: ['home', 'music', 'about', 'events', 'gallery', 'videos', 'merch', 'contact'],
    all: ['home', 'music', 'about', 'events', 'gallery', 'videos', 'merch', 'press', 'booking', 'blog', 'contact']
  },
  'podcast': {
    essential: ['home', 'episodes', 'contact'],
    recommended: ['home', 'episodes', 'about', 'hosts', 'contact'],
    premium: ['home', 'episodes', 'about', 'hosts', 'subscribe', 'sponsors', 'contact'],
    all: ['home', 'episodes', 'about', 'hosts', 'subscribe', 'sponsors', 'blog', 'merch', 'contact']
  },
  'gaming': {
    essential: ['home', 'games', 'contact'],
    recommended: ['home', 'games', 'about', 'team', 'contact'],
    premium: ['home', 'games', 'about', 'team', 'streams', 'schedule', 'merch', 'contact'],
    all: ['home', 'games', 'about', 'team', 'streams', 'schedule', 'merch', 'sponsors', 'blog', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL HEALTHCARE
  // ═══════════════════════════════════════════════════════════════
  'medical-spa': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'gallery', 'before-after', 'pricing', 'booking', 'contact'],
    all: ['home', 'services', 'about', 'team', 'gallery', 'before-after', 'pricing', 'booking', 'specials', 'testimonials', 'faq', 'blog', 'contact']
  },
  'veterinary': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'emergency', 'resources', 'booking', 'contact'],
    all: ['home', 'services', 'about', 'team', 'emergency', 'resources', 'booking', 'pharmacy', 'gallery', 'testimonials', 'faq', 'blog', 'contact']
  },
  'tattoo': {
    essential: ['home', 'gallery', 'contact'],
    recommended: ['home', 'gallery', 'artists', 'about', 'contact'],
    premium: ['home', 'gallery', 'artists', 'about', 'styles', 'aftercare', 'booking', 'contact'],
    all: ['home', 'gallery', 'artists', 'about', 'styles', 'aftercare', 'booking', 'pricing', 'faq', 'blog', 'contact']
  },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL TRADES
  // ═══════════════════════════════════════════════════════════════
  'hvac': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'service-areas', 'contact'],
    premium: ['home', 'services', 'about', 'service-areas', 'maintenance-plans', 'testimonials', 'emergency', 'contact'],
    all: ['home', 'services', 'about', 'service-areas', 'maintenance-plans', 'testimonials', 'emergency', 'financing', 'brands', 'faq', 'blog', 'contact']
  },
  'roofing': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'gallery', 'service-areas', 'testimonials', 'financing', 'contact'],
    all: ['home', 'services', 'about', 'gallery', 'service-areas', 'testimonials', 'financing', 'emergency', 'faq', 'blog', 'contact']
  },

  // Default fallback
  'default': {
    essential: ['home', 'about', 'contact'],
    recommended: ['home', 'about', 'services', 'contact'],
    premium: ['home', 'about', 'services', 'gallery', 'testimonials', 'contact'],
    all: ['home', 'about', 'services', 'gallery', 'testimonials', 'team', 'faq', 'blog', 'contact']
  }
};

// Package metadata for UI display
export const PAGE_PACKAGES = {
  essential: {
    name: 'Essential',
    icon: '⚡',
    description: 'Quick launch with core pages',
    color: '#22c55e',
    badge: 'Starter'
  },
  recommended: {
    name: 'Recommended',
    icon: '⭐',
    description: 'Best for most businesses',
    color: '#6366f1',
    badge: 'Popular'
  },
  premium: {
    name: 'Premium',
    icon: '💎',
    description: 'Full-featured professional site',
    color: '#8b5cf6',
    badge: 'Pro'
  },
  all: {
    name: 'Complete',
    icon: '🚀',
    description: 'Every page for your industry',
    color: '#f59e0b',
    badge: 'Max'
  }
};

// Extended page labels including all new pages
export const PAGE_LABELS = {
  // Core pages
  'home': 'Home',
  'about': 'About',
  'services': 'Services',
  'contact': 'Contact',

  // Food & Beverage
  'menu': 'Menu',
  'reservations': 'Reservations',
  'catering': 'Catering',
  'order-online': 'Order Online',
  'private-events': 'Private Events',
  'gift-cards': 'Gift Cards',
  'specials': 'Specials',
  'happy-hour': 'Happy Hour',
  'loyalty': 'Loyalty Program',
  'wholesale': 'Wholesale',

  // Healthcare
  'providers': 'Providers',
  'patient-portal': 'Patient Portal',
  'patient-forms': 'Patient Forms',
  'insurance': 'Insurance',
  'conditions': 'Conditions We Treat',
  'appointments': 'Appointments',
  'before-after': 'Before & After',
  'technology': 'Our Technology',
  'financing': 'Financing',
  'emergency': 'Emergency',
  'new-patients': 'New Patients',
  'pet-portal': 'Pet Portal',
  'pharmacy': 'Pharmacy',

  // Beauty & Wellness
  'team': 'Team',
  'pricing': 'Pricing',
  'booking': 'Book Now',
  'gallery': 'Gallery',
  'products': 'Products',
  'artists': 'Artists',
  'styles': 'Styles',
  'aftercare': 'Aftercare',
  'classes': 'Classes',
  'schedule': 'Schedule',
  'instructors': 'Instructors',
  'workshops': 'Workshops',
  'retreats': 'Retreats',
  'teacher-training': 'Teacher Training',
  'trainers': 'Trainers',
  'membership': 'Membership',
  'nutrition': 'Nutrition',
  'personal-training': 'Personal Training',

  // Professional Services
  'practice-areas': 'Practice Areas',
  'attorneys': 'Attorneys',
  'case-results': 'Case Results',
  'industries': 'Industries',
  'client-portal': 'Client Portal',
  'case-studies': 'Case Studies',
  'insights': 'Insights',
  'approach': 'Our Approach',
  'listings': 'Listings',
  'agents': 'Agents',
  'buyers': 'Buyers',
  'sellers': 'Sellers',
  'neighborhoods': 'Neighborhoods',
  'market-reports': 'Market Reports',
  'quote': 'Get a Quote',
  'claims': 'Claims',

  // Trades
  'service-areas': 'Service Areas',
  'maintenance-plans': 'Maintenance Plans',
  'commercial': 'Commercial',
  'residential': 'Residential',
  'brands': 'Brands We Service',
  'projects': 'Projects',
  'process': 'Our Process',
  'seasonal': 'Seasonal Services',

  // Tech & Creative
  'features': 'Features',
  'integrations': 'Integrations',
  'docs': 'Documentation',
  'security': 'Security',
  'changelog': 'Changelog',
  'portfolio': 'Portfolio',

  // Retail
  'inventory': 'Inventory',
  'sell-to-us': 'Sell to Us',
  'grading': 'Grading',
  'consignment': 'Consignment',
  'authentication': 'Authentication',
  'shipping': 'Shipping',
  'returns': 'Returns',

  // Education & Non-profit
  'programs': 'Programs',
  'faculty': 'Faculty',
  'admissions': 'Admissions',
  'campus': 'Campus',
  'calendar': 'Calendar',
  'alumni': 'Alumni',
  'mission': 'Our Mission',
  'donate': 'Donate',
  'impact': 'Our Impact',
  'volunteer': 'Volunteer',
  'events': 'Events',

  // Hospitality & Travel
  'rooms': 'Rooms',
  'amenities': 'Amenities',
  'dining': 'Dining',
  'spa': 'Spa',
  'location': 'Location',
  'destinations': 'Destinations',
  'tours': 'Tours',
  'packages': 'Packages',
  'venues': 'Venues',

  // Entertainment & Media
  'music': 'Music',
  'videos': 'Videos',
  'merch': 'Merchandise',
  'press': 'Press',
  'episodes': 'Episodes',
  'hosts': 'Hosts',
  'subscribe': 'Subscribe',
  'sponsors': 'Sponsors',
  'games': 'Games',
  'streams': 'Streams',

  // General
  'testimonials': 'Testimonials',
  'faq': 'FAQ',
  'blog': 'Blog',
  'news': 'News',
  'resources': 'Resources',
  'careers': 'Careers'
};

// Helper function to get pages for an industry
export function getIndustryPages(industryKey, packageTier = 'recommended') {
  const config = INDUSTRY_PAGE_PACKAGES[industryKey] || INDUSTRY_PAGE_PACKAGES['default'];
  return config[packageTier] || config.recommended;
}

// Helper function to get all available pages for an industry
export function getAllIndustryPages(industryKey) {
  const config = INDUSTRY_PAGE_PACKAGES[industryKey] || INDUSTRY_PAGE_PACKAGES['default'];
  return config.all || [];
}

// Helper function to get page label
export function getPageLabel(pageKey) {
  return PAGE_LABELS[pageKey] || pageKey.charAt(0).toUpperCase() + pageKey.slice(1).replace(/-/g, ' ');
}

// Legacy exports for backwards compatibility
export const INDUSTRY_PAGES = Object.fromEntries(
  Object.entries(INDUSTRY_PAGE_PACKAGES).map(([key, val]) => [
    key,
    { recommended: val.recommended, optional: val.all.filter(p => !val.recommended.includes(p)) }
  ])
);
