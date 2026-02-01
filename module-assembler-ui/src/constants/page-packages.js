/**
 * Page Packages by Industry
 * Defines which pages are included in each tier
 */

export const PAGE_PACKAGES = {
  // Fitness / Gym
  fitness: {
    essential: {
      name: 'Essential',
      price: 'Free',
      pages: ['home', 'classes', 'membership', 'contact'],
      description: 'Perfect for getting started'
    },
    standard: {
      name: 'Standard',
      price: '$49',
      pages: ['home', 'classes', 'membership', 'trainers', 'schedule', 'about', 'contact'],
      description: 'Most popular choice',
      recommended: true
    },
    complete: {
      name: 'Complete',
      price: '$99',
      pages: ['home', 'classes', 'membership', 'trainers', 'schedule', 'about', 'contact', 'blog', 'gallery', 'faq'],
      description: 'Everything you need'
    }
  },

  // Restaurant / Cafe
  restaurant: {
    essential: {
      name: 'Essential',
      price: 'Free',
      pages: ['home', 'menu', 'contact'],
      description: 'Perfect for getting started'
    },
    standard: {
      name: 'Standard',
      price: '$49',
      pages: ['home', 'menu', 'about', 'reservations', 'contact', 'gallery'],
      description: 'Most popular choice',
      recommended: true
    },
    complete: {
      name: 'Complete',
      price: '$99',
      pages: ['home', 'menu', 'about', 'reservations', 'catering', 'events', 'contact', 'gallery', 'blog'],
      description: 'Everything you need'
    }
  },

  // Salon / Spa
  salon: {
    essential: {
      name: 'Essential',
      price: 'Free',
      pages: ['home', 'services', 'contact'],
      description: 'Perfect for getting started'
    },
    standard: {
      name: 'Standard',
      price: '$49',
      pages: ['home', 'services', 'team', 'booking', 'gallery', 'about', 'contact'],
      description: 'Most popular choice',
      recommended: true
    },
    complete: {
      name: 'Complete',
      price: '$99',
      pages: ['home', 'services', 'team', 'booking', 'gallery', 'about', 'contact', 'blog', 'faq', 'gift-cards'],
      description: 'Everything you need'
    }
  },

  // Professional Services (Law, Real Estate, etc.)
  professional: {
    essential: {
      name: 'Essential',
      price: 'Free',
      pages: ['home', 'services', 'contact'],
      description: 'Perfect for getting started'
    },
    standard: {
      name: 'Standard',
      price: '$49',
      pages: ['home', 'services', 'about', 'team', 'testimonials', 'faq', 'contact'],
      description: 'Most popular choice',
      recommended: true
    },
    complete: {
      name: 'Complete',
      price: '$99',
      pages: ['home', 'services', 'about', 'team', 'testimonials', 'faq', 'contact', 'blog', 'case-studies', 'resources'],
      description: 'Everything you need'
    }
  },

  // Tech / SaaS
  tech: {
    essential: {
      name: 'Essential',
      price: 'Free',
      pages: ['home', 'features', 'pricing', 'contact'],
      description: 'Perfect for getting started'
    },
    standard: {
      name: 'Standard',
      price: '$49',
      pages: ['home', 'features', 'pricing', 'about', 'demo', 'blog', 'contact'],
      description: 'Most popular choice',
      recommended: true
    },
    complete: {
      name: 'Complete',
      price: '$99',
      pages: ['home', 'features', 'pricing', 'about', 'demo', 'blog', 'contact', 'docs', 'changelog', 'integrations'],
      description: 'Everything you need'
    }
  },

  // Education / School
  education: {
    essential: {
      name: 'Essential',
      price: 'Free',
      pages: ['home', 'programs', 'contact'],
      description: 'Perfect for getting started'
    },
    standard: {
      name: 'Standard',
      price: '$49',
      pages: ['home', 'programs', 'admissions', 'faculty', 'campus', 'about', 'contact'],
      description: 'Most popular choice',
      recommended: true
    },
    complete: {
      name: 'Complete',
      price: '$99',
      pages: ['home', 'programs', 'admissions', 'faculty', 'campus', 'about', 'contact', 'news', 'events', 'alumni'],
      description: 'Everything you need'
    }
  },

  // Healthcare
  healthcare: {
    essential: {
      name: 'Essential',
      price: 'Free',
      pages: ['home', 'services', 'contact'],
      description: 'Perfect for getting started'
    },
    standard: {
      name: 'Standard',
      price: '$49',
      pages: ['home', 'services', 'providers', 'appointments', 'about', 'contact', 'patient-portal'],
      description: 'Most popular choice',
      recommended: true
    },
    complete: {
      name: 'Complete',
      price: '$99',
      pages: ['home', 'services', 'providers', 'appointments', 'about', 'contact', 'patient-portal', 'blog', 'faq', 'insurance'],
      description: 'Everything you need'
    }
  }
};

// Page display names
export const PAGE_NAMES = {
  home: 'Homepage',
  menu: 'Menu',
  about: 'About Us',
  contact: 'Contact',
  services: 'Services',
  team: 'Our Team',
  gallery: 'Gallery',
  blog: 'Blog',
  faq: 'FAQ',
  testimonials: 'Testimonials',
  booking: 'Book Online',
  reservations: 'Reservations',
  catering: 'Catering',
  events: 'Events',
  classes: 'Classes',
  membership: 'Membership',
  trainers: 'Trainers',
  schedule: 'Schedule',
  features: 'Features',
  pricing: 'Pricing',
  demo: 'Get Demo',
  docs: 'Documentation',
  changelog: 'Changelog',
  integrations: 'Integrations',
  programs: 'Programs',
  admissions: 'Admissions',
  faculty: 'Faculty',
  campus: 'Campus Life',
  news: 'News',
  alumni: 'Alumni',
  providers: 'Our Providers',
  appointments: 'Book Appointment',
  'patient-portal': 'Patient Portal',
  insurance: 'Insurance',
  'gift-cards': 'Gift Cards',
  'case-studies': 'Case Studies',
  resources: 'Resources'
};

export default PAGE_PACKAGES;
