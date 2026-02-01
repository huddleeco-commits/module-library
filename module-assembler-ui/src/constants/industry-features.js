/**
 * Industry Feature Configuration
 *
 * Defines what features are available/recommended for each industry,
 * what portal content looks like, and what admin pages are needed.
 *
 * Everything syncs: Website <-> Companion App <-> Admin Dashboard
 */

// ═══════════════════════════════════════════════════════════════
// FEATURE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const FEATURES = {
  // Authentication & User Management
  auth: {
    id: 'auth',
    name: 'User Login',
    icon: '🔐',
    description: 'User accounts, login, registration',
    category: 'core',
    adminPages: ['users', 'roles'],
    companionScreens: ['profile', 'settings'],
    websitePages: ['login', 'register', 'profile']
  },

  // Loyalty & Rewards
  loyalty: {
    id: 'loyalty',
    name: 'Loyalty & Rewards',
    icon: '⭐',
    description: 'Points system, rewards redemption, tiers',
    category: 'engagement',
    requires: ['auth'],
    adminPages: ['loyalty-settings', 'rewards-catalog', 'points-ledger'],
    companionScreens: ['rewards', 'points-history'],
    websitePages: ['rewards', 'loyalty-program']
  },

  // Online Ordering
  ordering: {
    id: 'ordering',
    name: 'Online Ordering',
    icon: '🛒',
    description: 'Cart, checkout, order tracking',
    category: 'commerce',
    adminPages: ['orders', 'order-settings', 'delivery-zones'],
    companionScreens: ['cart', 'order-history', 'order-tracking'],
    websitePages: ['menu', 'cart', 'checkout', 'order-status']
  },

  // Reservations/Booking
  reservations: {
    id: 'reservations',
    name: 'Reservations',
    icon: '📅',
    description: 'Table reservations, party booking',
    category: 'scheduling',
    adminPages: ['reservations', 'table-management', 'reservation-settings'],
    companionScreens: ['reservations', 'book-table'],
    websitePages: ['reservations', 'book-table']
  },

  // Appointments (Services)
  appointments: {
    id: 'appointments',
    name: 'Appointments',
    icon: '📆',
    description: 'Service appointments, calendar booking',
    category: 'scheduling',
    adminPages: ['appointments', 'calendar', 'availability', 'services'],
    companionScreens: ['appointments', 'book-appointment'],
    websitePages: ['booking', 'appointments', 'schedule']
  },

  // Client/Patient Portal
  portal: {
    id: 'portal',
    name: 'Client Portal',
    icon: '🚪',
    description: 'Secure client/patient area with documents',
    category: 'portal',
    requires: ['auth'],
    adminPages: ['clients', 'documents', 'portal-settings'],
    companionScreens: ['portal', 'documents', 'messages'],
    websitePages: ['portal', 'my-account']
  },

  // Blog/Content
  blog: {
    id: 'blog',
    name: 'Blog',
    icon: '📝',
    description: 'Articles, news, content marketing',
    category: 'content',
    adminPages: ['posts', 'categories', 'media'],
    companionScreens: ['blog', 'articles'],
    websitePages: ['blog', 'articles', 'news']
  },

  // Gallery/Portfolio
  gallery: {
    id: 'gallery',
    name: 'Gallery',
    icon: '🖼️',
    description: 'Photo gallery, portfolio, before/after',
    category: 'content',
    adminPages: ['gallery', 'albums', 'media'],
    companionScreens: ['gallery'],
    websitePages: ['gallery', 'portfolio', 'before-after']
  },

  // Reviews & Testimonials
  reviews: {
    id: 'reviews',
    name: 'Reviews',
    icon: '💬',
    description: 'Customer reviews, testimonials',
    category: 'engagement',
    adminPages: ['reviews', 'testimonials'],
    companionScreens: ['reviews', 'leave-review'],
    websitePages: ['reviews', 'testimonials']
  },

  // Team/Staff Management
  team: {
    id: 'team',
    name: 'Team Directory',
    icon: '👥',
    description: 'Staff profiles, team pages',
    category: 'content',
    adminPages: ['team', 'staff-profiles'],
    companionScreens: ['team'],
    websitePages: ['team', 'about']
  },

  // Notifications
  notifications: {
    id: 'notifications',
    name: 'Notifications',
    icon: '🔔',
    description: 'Push notifications, email alerts',
    category: 'engagement',
    requires: ['auth'],
    adminPages: ['notifications', 'email-templates', 'push-settings'],
    companionScreens: ['notifications'],
    websitePages: []
  },

  // Analytics
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    icon: '📊',
    description: 'Traffic, conversions, reports',
    category: 'admin',
    adminPages: ['analytics', 'reports', 'dashboard'],
    companionScreens: [],
    websitePages: []
  },

  // E-commerce/Products
  products: {
    id: 'products',
    name: 'Products',
    icon: '📦',
    description: 'Product catalog, inventory',
    category: 'commerce',
    adminPages: ['products', 'inventory', 'categories'],
    companionScreens: ['products', 'shop'],
    websitePages: ['products', 'shop', 'catalog']
  },

  // Gift Cards
  giftCards: {
    id: 'giftCards',
    name: 'Gift Cards',
    icon: '🎁',
    description: 'Digital gift cards, balance check',
    category: 'commerce',
    adminPages: ['gift-cards', 'gift-card-ledger'],
    companionScreens: ['gift-cards'],
    websitePages: ['gift-cards']
  },

  // Membership
  membership: {
    id: 'membership',
    name: 'Membership',
    icon: '🎫',
    description: 'Membership plans, subscriptions',
    category: 'commerce',
    requires: ['auth'],
    adminPages: ['memberships', 'plans', 'subscribers'],
    companionScreens: ['membership', 'my-plan'],
    websitePages: ['membership', 'pricing', 'join']
  },

  // Classes/Events
  classes: {
    id: 'classes',
    name: 'Classes & Events',
    icon: '🎓',
    description: 'Class schedules, event registration',
    category: 'scheduling',
    adminPages: ['classes', 'events', 'registrations'],
    companionScreens: ['classes', 'schedule', 'events'],
    websitePages: ['classes', 'schedule', 'events']
  },

  // Forms/Intake
  forms: {
    id: 'forms',
    name: 'Forms & Intake',
    icon: '📋',
    description: 'Custom forms, intake documents',
    category: 'portal',
    requires: ['auth'],
    adminPages: ['forms', 'form-builder', 'submissions'],
    companionScreens: ['forms', 'documents'],
    websitePages: ['forms', 'patient-forms', 'intake']
  },

  // Insurance/Billing
  insurance: {
    id: 'insurance',
    name: 'Insurance & Billing',
    icon: '💳',
    description: 'Insurance verification, billing',
    category: 'portal',
    requires: ['auth', 'portal'],
    adminPages: ['insurance', 'billing', 'claims'],
    companionScreens: ['insurance', 'billing'],
    websitePages: ['insurance', 'billing', 'payment']
  },

  // Real Estate Listings
  listings: {
    id: 'listings',
    name: 'Property Listings',
    icon: '🏠',
    description: 'Property listings, MLS integration',
    category: 'commerce',
    adminPages: ['listings', 'properties', 'mls-sync'],
    companionScreens: ['listings', 'saved-homes', 'search'],
    websitePages: ['listings', 'search', 'property']
  },

  // Case Management (Legal)
  caseManagement: {
    id: 'caseManagement',
    name: 'Case Management',
    icon: '📁',
    description: 'Case tracking, documents, updates',
    category: 'portal',
    requires: ['auth', 'portal'],
    adminPages: ['cases', 'case-documents', 'case-timeline'],
    companionScreens: ['cases', 'case-status', 'documents'],
    websitePages: ['client-portal', 'case-status']
  }
};

// ═══════════════════════════════════════════════════════════════
// INDUSTRY FEATURE PROFILES
// ═══════════════════════════════════════════════════════════════

export const INDUSTRY_FEATURES = {
  // ─────────────────────────────────────────────────────────────
  // FOOD & BEVERAGE
  // ─────────────────────────────────────────────────────────────
  restaurant: {
    essential: ['ordering'],
    recommended: ['ordering', 'reservations', 'auth', 'loyalty'],
    premium: ['ordering', 'reservations', 'auth', 'loyalty', 'reviews', 'giftCards', 'notifications'],
    all: ['ordering', 'reservations', 'auth', 'loyalty', 'reviews', 'giftCards', 'notifications', 'blog', 'gallery', 'team', 'analytics'],
    portalType: 'customer',
    portalContent: {
      title: 'My Account',
      sections: ['order-history', 'reservations', 'loyalty-points', 'saved-items', 'payment-methods']
    }
  },
  pizza: {
    essential: ['ordering'],
    recommended: ['ordering', 'auth', 'loyalty'],
    premium: ['ordering', 'auth', 'loyalty', 'giftCards', 'notifications'],
    all: ['ordering', 'auth', 'loyalty', 'giftCards', 'notifications', 'reviews', 'blog', 'gallery', 'analytics'],
    portalType: 'customer',
    portalContent: {
      title: 'My Account',
      sections: ['order-history', 'loyalty-points', 'saved-orders', 'addresses', 'payment-methods']
    }
  },
  cafe: {
    essential: ['ordering'],
    recommended: ['ordering', 'auth', 'loyalty'],
    premium: ['ordering', 'auth', 'loyalty', 'products', 'notifications'],
    all: ['ordering', 'auth', 'loyalty', 'products', 'notifications', 'blog', 'gallery', 'reviews', 'analytics'],
    portalType: 'customer',
    portalContent: {
      title: 'My Account',
      sections: ['order-history', 'loyalty-points', 'subscriptions', 'payment-methods']
    }
  },

  // ─────────────────────────────────────────────────────────────
  // HEALTHCARE & MEDICAL
  // ─────────────────────────────────────────────────────────────
  dental: {
    essential: ['appointments'],
    recommended: ['appointments', 'auth', 'portal', 'forms'],
    premium: ['appointments', 'auth', 'portal', 'forms', 'insurance', 'reviews', 'notifications'],
    all: ['appointments', 'auth', 'portal', 'forms', 'insurance', 'reviews', 'notifications', 'blog', 'gallery', 'team', 'analytics'],
    portalType: 'patient',
    portalContent: {
      title: 'Patient Portal',
      sections: ['appointments', 'treatment-history', 'forms', 'insurance-info', 'billing', 'messages', 'documents']
    }
  },
  healthcare: {
    essential: ['appointments'],
    recommended: ['appointments', 'auth', 'portal', 'forms'],
    premium: ['appointments', 'auth', 'portal', 'forms', 'insurance', 'notifications', 'team'],
    all: ['appointments', 'auth', 'portal', 'forms', 'insurance', 'notifications', 'team', 'blog', 'reviews', 'analytics'],
    portalType: 'patient',
    portalContent: {
      title: 'Patient Portal',
      sections: ['appointments', 'medical-records', 'prescriptions', 'lab-results', 'forms', 'insurance', 'billing', 'messages']
    }
  },
  'medical-spa': {
    essential: ['appointments'],
    recommended: ['appointments', 'auth', 'gallery', 'products'],
    premium: ['appointments', 'auth', 'gallery', 'products', 'loyalty', 'reviews', 'notifications'],
    all: ['appointments', 'auth', 'gallery', 'products', 'loyalty', 'reviews', 'notifications', 'blog', 'giftCards', 'membership', 'analytics'],
    portalType: 'client',
    portalContent: {
      title: 'My Account',
      sections: ['appointments', 'treatment-history', 'before-after', 'product-orders', 'loyalty-points', 'payment-methods']
    }
  },
  veterinary: {
    essential: ['appointments'],
    recommended: ['appointments', 'auth', 'portal', 'forms'],
    premium: ['appointments', 'auth', 'portal', 'forms', 'notifications', 'products'],
    all: ['appointments', 'auth', 'portal', 'forms', 'notifications', 'products', 'blog', 'team', 'reviews', 'analytics'],
    portalType: 'pet-owner',
    portalContent: {
      title: 'Pet Portal',
      sections: ['pets', 'appointments', 'vaccination-records', 'prescriptions', 'forms', 'billing', 'messages']
    }
  },

  // ─────────────────────────────────────────────────────────────
  // BEAUTY & WELLNESS
  // ─────────────────────────────────────────────────────────────
  'spa-salon': {
    essential: ['appointments'],
    recommended: ['appointments', 'auth', 'team', 'gallery'],
    premium: ['appointments', 'auth', 'team', 'gallery', 'loyalty', 'products', 'giftCards'],
    all: ['appointments', 'auth', 'team', 'gallery', 'loyalty', 'products', 'giftCards', 'membership', 'reviews', 'blog', 'notifications', 'analytics'],
    portalType: 'client',
    portalContent: {
      title: 'My Account',
      sections: ['appointments', 'service-history', 'favorite-stylist', 'loyalty-points', 'product-orders', 'gift-cards']
    }
  },
  yoga: {
    essential: ['classes'],
    recommended: ['classes', 'auth', 'membership', 'team'],
    premium: ['classes', 'auth', 'membership', 'team', 'notifications', 'blog'],
    all: ['classes', 'auth', 'membership', 'team', 'notifications', 'blog', 'gallery', 'products', 'reviews', 'analytics'],
    portalType: 'member',
    portalContent: {
      title: 'Member Portal',
      sections: ['class-schedule', 'my-classes', 'membership-status', 'workshops', 'teacher-training', 'payment']
    }
  },
  fitness: {
    essential: ['classes', 'membership'],
    recommended: ['classes', 'membership', 'auth', 'team'],
    premium: ['classes', 'membership', 'auth', 'team', 'notifications', 'blog', 'gallery'],
    all: ['classes', 'membership', 'auth', 'team', 'notifications', 'blog', 'gallery', 'products', 'reviews', 'analytics'],
    portalType: 'member',
    portalContent: {
      title: 'Member Portal',
      sections: ['class-schedule', 'my-bookings', 'membership', 'personal-training', 'progress-tracking', 'payment']
    }
  },

  // ─────────────────────────────────────────────────────────────
  // PROFESSIONAL SERVICES
  // ─────────────────────────────────────────────────────────────
  'law-firm': {
    essential: ['appointments', 'auth'],
    recommended: ['appointments', 'auth', 'portal', 'caseManagement'],
    premium: ['appointments', 'auth', 'portal', 'caseManagement', 'forms', 'notifications', 'blog'],
    all: ['appointments', 'auth', 'portal', 'caseManagement', 'forms', 'notifications', 'blog', 'team', 'reviews', 'analytics'],
    portalType: 'client',
    portalContent: {
      title: 'Client Portal',
      sections: ['cases', 'case-status', 'documents', 'invoices', 'payments', 'messages', 'appointments']
    }
  },
  accounting: {
    essential: ['appointments', 'auth'],
    recommended: ['appointments', 'auth', 'portal', 'forms'],
    premium: ['appointments', 'auth', 'portal', 'forms', 'notifications', 'blog'],
    all: ['appointments', 'auth', 'portal', 'forms', 'notifications', 'blog', 'team', 'reviews', 'analytics'],
    portalType: 'client',
    portalContent: {
      title: 'Client Portal',
      sections: ['documents', 'tax-returns', 'financial-statements', 'invoices', 'messages', 'appointments']
    }
  },
  'real-estate': {
    essential: ['listings', 'auth'],
    recommended: ['listings', 'auth', 'portal', 'appointments'],
    premium: ['listings', 'auth', 'portal', 'appointments', 'notifications', 'blog'],
    all: ['listings', 'auth', 'portal', 'appointments', 'notifications', 'blog', 'team', 'reviews', 'analytics'],
    portalType: 'buyer-seller',
    portalContent: {
      title: 'My Account',
      sections: ['saved-listings', 'search-alerts', 'showing-requests', 'documents', 'mortgage-calculator', 'messages']
    }
  },
  finance: {
    essential: ['appointments', 'auth'],
    recommended: ['appointments', 'auth', 'portal'],
    premium: ['appointments', 'auth', 'portal', 'forms', 'notifications', 'blog'],
    all: ['appointments', 'auth', 'portal', 'forms', 'notifications', 'blog', 'team', 'reviews', 'analytics'],
    portalType: 'client',
    portalContent: {
      title: 'Client Portal',
      sections: ['portfolio', 'statements', 'documents', 'performance', 'messages', 'appointments']
    }
  },
  insurance: {
    essential: ['auth', 'portal'],
    recommended: ['auth', 'portal', 'forms', 'appointments'],
    premium: ['auth', 'portal', 'forms', 'appointments', 'notifications', 'blog'],
    all: ['auth', 'portal', 'forms', 'appointments', 'notifications', 'blog', 'team', 'reviews', 'analytics'],
    portalType: 'policyholder',
    portalContent: {
      title: 'Policyholder Portal',
      sections: ['policies', 'claims', 'documents', 'billing', 'coverage-details', 'messages']
    }
  },

  // ─────────────────────────────────────────────────────────────
  // TRADES & HOME SERVICES
  // ─────────────────────────────────────────────────────────────
  plumber: {
    essential: ['appointments'],
    recommended: ['appointments', 'auth', 'reviews'],
    premium: ['appointments', 'auth', 'reviews', 'notifications', 'gallery'],
    all: ['appointments', 'auth', 'reviews', 'notifications', 'gallery', 'blog', 'team', 'analytics'],
    portalType: 'customer',
    portalContent: {
      title: 'My Account',
      sections: ['service-history', 'upcoming-appointments', 'invoices', 'messages']
    }
  },
  electrician: {
    essential: ['appointments'],
    recommended: ['appointments', 'auth', 'reviews'],
    premium: ['appointments', 'auth', 'reviews', 'notifications', 'gallery'],
    all: ['appointments', 'auth', 'reviews', 'notifications', 'gallery', 'blog', 'team', 'analytics'],
    portalType: 'customer',
    portalContent: {
      title: 'My Account',
      sections: ['service-history', 'upcoming-appointments', 'invoices', 'messages']
    }
  },
  construction: {
    essential: ['gallery', 'auth'],
    recommended: ['gallery', 'auth', 'portal', 'reviews'],
    premium: ['gallery', 'auth', 'portal', 'reviews', 'notifications', 'blog'],
    all: ['gallery', 'auth', 'portal', 'reviews', 'notifications', 'blog', 'team', 'analytics'],
    portalType: 'client',
    portalContent: {
      title: 'Project Portal',
      sections: ['project-status', 'timeline', 'photos', 'documents', 'invoices', 'messages']
    }
  },

  // ─────────────────────────────────────────────────────────────
  // TECHNOLOGY & CREATIVE
  // ─────────────────────────────────────────────────────────────
  saas: {
    essential: ['auth'],
    recommended: ['auth', 'blog', 'analytics'],
    premium: ['auth', 'blog', 'analytics', 'notifications', 'reviews'],
    all: ['auth', 'blog', 'analytics', 'notifications', 'reviews', 'team', 'membership'],
    portalType: 'user',
    portalContent: {
      title: 'Dashboard',
      sections: ['overview', 'usage', 'billing', 'settings', 'api-keys', 'support']
    }
  },
  agency: {
    essential: ['gallery', 'auth'],
    recommended: ['gallery', 'auth', 'portal', 'blog'],
    premium: ['gallery', 'auth', 'portal', 'blog', 'reviews', 'team'],
    all: ['gallery', 'auth', 'portal', 'blog', 'reviews', 'team', 'notifications', 'analytics'],
    portalType: 'client',
    portalContent: {
      title: 'Client Portal',
      sections: ['projects', 'deliverables', 'feedback', 'invoices', 'messages']
    }
  },
  photography: {
    essential: ['gallery', 'appointments'],
    recommended: ['gallery', 'appointments', 'auth', 'reviews'],
    premium: ['gallery', 'appointments', 'auth', 'reviews', 'portal', 'blog'],
    all: ['gallery', 'appointments', 'auth', 'reviews', 'portal', 'blog', 'products', 'giftCards', 'analytics'],
    portalType: 'client',
    portalContent: {
      title: 'Client Gallery',
      sections: ['galleries', 'downloads', 'orders', 'favorites', 'invoices']
    }
  },

  // ─────────────────────────────────────────────────────────────
  // RETAIL
  // ─────────────────────────────────────────────────────────────
  retail: {
    essential: ['products'],
    recommended: ['products', 'auth', 'ordering'],
    premium: ['products', 'auth', 'ordering', 'loyalty', 'reviews'],
    all: ['products', 'auth', 'ordering', 'loyalty', 'reviews', 'giftCards', 'blog', 'notifications', 'analytics'],
    portalType: 'customer',
    portalContent: {
      title: 'My Account',
      sections: ['orders', 'wishlist', 'loyalty-points', 'addresses', 'payment-methods']
    }
  },
  collectibles: {
    essential: ['products'],
    recommended: ['products', 'auth', 'ordering'],
    premium: ['products', 'auth', 'ordering', 'loyalty', 'blog'],
    all: ['products', 'auth', 'ordering', 'loyalty', 'blog', 'gallery', 'notifications', 'analytics'],
    portalType: 'collector',
    portalContent: {
      title: 'Collector Portal',
      sections: ['orders', 'consignments', 'wishlist', 'price-alerts', 'authentication-history']
    }
  },

  // Default
  default: {
    essential: ['auth'],
    recommended: ['auth', 'appointments', 'reviews'],
    premium: ['auth', 'appointments', 'reviews', 'blog', 'gallery'],
    all: ['auth', 'appointments', 'reviews', 'blog', 'gallery', 'team', 'notifications', 'analytics'],
    portalType: 'customer',
    portalContent: {
      title: 'My Account',
      sections: ['profile', 'history', 'messages', 'settings']
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// ADMIN PAGE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const ADMIN_PAGES = {
  // Dashboard & Analytics
  dashboard: { name: 'Dashboard', icon: '📊', category: 'overview' },
  analytics: { name: 'Analytics', icon: '📈', category: 'overview' },
  reports: { name: 'Reports', icon: '📄', category: 'overview' },

  // Users & Auth
  users: { name: 'Users', icon: '👤', category: 'users' },
  roles: { name: 'Roles & Permissions', icon: '🔑', category: 'users' },
  clients: { name: 'Clients', icon: '👥', category: 'users' },

  // Orders & Commerce
  orders: { name: 'Orders', icon: '📦', category: 'commerce' },
  products: { name: 'Products', icon: '🏷️', category: 'commerce' },
  inventory: { name: 'Inventory', icon: '📋', category: 'commerce' },
  'gift-cards': { name: 'Gift Cards', icon: '🎁', category: 'commerce' },

  // Scheduling
  appointments: { name: 'Appointments', icon: '📅', category: 'scheduling' },
  reservations: { name: 'Reservations', icon: '🍽️', category: 'scheduling' },
  calendar: { name: 'Calendar', icon: '📆', category: 'scheduling' },
  classes: { name: 'Classes', icon: '🎓', category: 'scheduling' },

  // Loyalty
  'loyalty-settings': { name: 'Loyalty Settings', icon: '⭐', category: 'loyalty' },
  'rewards-catalog': { name: 'Rewards Catalog', icon: '🎁', category: 'loyalty' },
  'points-ledger': { name: 'Points Ledger', icon: '📒', category: 'loyalty' },

  // Content
  posts: { name: 'Blog Posts', icon: '📝', category: 'content' },
  gallery: { name: 'Gallery', icon: '🖼️', category: 'content' },
  media: { name: 'Media Library', icon: '📁', category: 'content' },
  team: { name: 'Team', icon: '👥', category: 'content' },

  // Portal & Documents
  documents: { name: 'Documents', icon: '📄', category: 'portal' },
  forms: { name: 'Forms', icon: '📋', category: 'portal' },
  submissions: { name: 'Submissions', icon: '📥', category: 'portal' },

  // Healthcare Specific
  insurance: { name: 'Insurance', icon: '🏥', category: 'healthcare' },
  billing: { name: 'Billing', icon: '💳', category: 'healthcare' },

  // Legal Specific
  cases: { name: 'Cases', icon: '📁', category: 'legal' },
  'case-documents': { name: 'Case Documents', icon: '📄', category: 'legal' },

  // Real Estate Specific
  listings: { name: 'Listings', icon: '🏠', category: 'real-estate' },
  properties: { name: 'Properties', icon: '🏢', category: 'real-estate' },

  // Communications
  messages: { name: 'Messages', icon: '💬', category: 'communications' },
  notifications: { name: 'Notifications', icon: '🔔', category: 'communications' },
  'email-templates': { name: 'Email Templates', icon: '📧', category: 'communications' },

  // Settings
  settings: { name: 'Settings', icon: '⚙️', category: 'settings' },
  'site-settings': { name: 'Site Settings', icon: '🌐', category: 'settings' },
  integrations: { name: 'Integrations', icon: '🔗', category: 'settings' }
};

// ═══════════════════════════════════════════════════════════════
// FEATURE PACKAGES
// ═══════════════════════════════════════════════════════════════

export const FEATURE_PACKAGES = {
  essential: {
    name: 'Essential',
    icon: '⚡',
    description: 'Core functionality to get started',
    color: '#22c55e'
  },
  recommended: {
    name: 'Recommended',
    icon: '⭐',
    description: 'Best for most businesses',
    color: '#6366f1'
  },
  premium: {
    name: 'Premium',
    icon: '💎',
    description: 'Full-featured professional solution',
    color: '#8b5cf6'
  },
  all: {
    name: 'Complete',
    icon: '🚀',
    description: 'Everything available',
    color: '#f59e0b'
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get features for an industry at a specific tier
 */
export function getIndustryFeatures(industryKey, tier = 'recommended') {
  const config = INDUSTRY_FEATURES[industryKey] || INDUSTRY_FEATURES.default;
  return config[tier] || config.recommended;
}

/**
 * Get all available features for an industry
 */
export function getAllIndustryFeatures(industryKey) {
  const config = INDUSTRY_FEATURES[industryKey] || INDUSTRY_FEATURES.default;
  return config.all || [];
}

/**
 * Get portal configuration for an industry
 */
export function getPortalConfig(industryKey) {
  const config = INDUSTRY_FEATURES[industryKey] || INDUSTRY_FEATURES.default;
  return {
    type: config.portalType,
    ...config.portalContent
  };
}

/**
 * Get admin pages needed for selected features
 */
export function getAdminPages(selectedFeatures) {
  const pages = new Set(['dashboard', 'settings']); // Always include these

  selectedFeatures.forEach(featureId => {
    const feature = FEATURES[featureId];
    if (feature?.adminPages) {
      feature.adminPages.forEach(page => pages.add(page));
    }
  });

  return Array.from(pages);
}

/**
 * Get companion app screens for selected features
 */
export function getCompanionScreens(selectedFeatures) {
  const screens = new Set(['home']); // Always include home

  selectedFeatures.forEach(featureId => {
    const feature = FEATURES[featureId];
    if (feature?.companionScreens) {
      feature.companionScreens.forEach(screen => screens.add(screen));
    }
  });

  return Array.from(screens);
}

/**
 * Get website pages for selected features
 */
export function getFeaturePages(selectedFeatures) {
  const pages = new Set();

  selectedFeatures.forEach(featureId => {
    const feature = FEATURES[featureId];
    if (feature?.websitePages) {
      feature.websitePages.forEach(page => pages.add(page));
    }
  });

  return Array.from(pages);
}

/**
 * Check if a feature's dependencies are met
 */
export function checkFeatureDependencies(featureId, selectedFeatures) {
  const feature = FEATURES[featureId];
  if (!feature?.requires) return { met: true, missing: [] };

  const missing = feature.requires.filter(req => !selectedFeatures.includes(req));
  return {
    met: missing.length === 0,
    missing
  };
}

/**
 * Get feature by ID
 */
export function getFeature(featureId) {
  return FEATURES[featureId] || null;
}
