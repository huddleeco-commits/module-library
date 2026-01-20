/**
 * Test Presets for Automated Generation Testing
 *
 * Aligned with the TIER SYSTEM (L1-L4):
 *
 * L1 - Single Page / Landing
 *   - 1 page (landing/home)
 *   - No auth, no admin
 *   - Use case: Quick landing page
 *
 * L2 - Multi-Page Brochure
 *   - 5-7 pages (home, about, services, contact, gallery, etc.)
 *   - No auth, no admin
 *   - Use case: Full website without user accounts
 *
 * L3 - With User Accounts
 *   - 8-10 pages (all L2 + login, dashboard, profile)
 *   - Auth modules, user dashboard
 *   - Use case: Users can create accounts
 *
 * L4 - Full SaaS / Platform
 *   - 12+ pages (all L3 + cart, checkout, orders, admin, payments)
 *   - Full modules, admin dashboard, payments
 *   - Use case: Complete platform with everything
 */

const testPresets = {
  // ============================================
  // L1 - SINGLE PAGE / LANDING
  // ============================================

  'pizza-L1': {
    name: 'Pizza Landing (L1)',
    mode: 'quickstart',
    tier: 'L1',
    industry: 'pizza',
    description: 'Single landing page for a pizzeria',
    data: {
      businessName: 'QuickSlice',
      industry: 'pizza',
      location: 'Austin, TX',
      tagline: 'Pizza in minutes',
      pages: ['home'],
      adminTier: null,
      description: 'A quick-service pizza shop specializing in fast, delicious slices.'
    }
  },

  'salon-L1': {
    name: 'Salon Landing (L1)',
    mode: 'quickstart',
    tier: 'L1',
    industry: 'salon',
    description: 'Single landing page for a hair salon',
    data: {
      businessName: 'StyleQuick',
      industry: 'salon',
      location: 'Miami, FL',
      tagline: 'Look your best',
      pages: ['home'],
      adminTier: null,
      description: 'A modern hair salon offering cuts, color, and styling services.'
    }
  },

  'saas-L1': {
    name: 'SaaS Landing (L1)',
    mode: 'quickstart',
    tier: 'L1',
    industry: 'saas',
    description: 'Single landing page for a SaaS product',
    data: {
      businessName: 'LaunchPad',
      industry: 'saas',
      location: 'San Francisco, CA',
      tagline: 'Ship faster',
      pages: ['landing'],
      adminTier: null,
      description: 'A developer tool that helps teams ship products faster.'
    }
  },

  'fitness-L1': {
    name: 'Fitness Landing (L1)',
    mode: 'quickstart',
    tier: 'L1',
    industry: 'fitness',
    description: 'Single landing page for a gym',
    data: {
      businessName: 'FlexStart',
      industry: 'fitness',
      location: 'Denver, CO',
      tagline: 'Start your fitness journey',
      pages: ['home'],
      adminTier: null,
      description: 'A boutique fitness studio offering personal training and group classes.'
    }
  },

  // ============================================
  // L2 - MULTI-PAGE BROCHURE (No Auth)
  // ============================================

  'pizza-L2': {
    name: 'Pizza Brochure (L2)',
    mode: 'instant',
    tier: 'L2',
    industry: 'pizza',
    description: '5-7 page pizzeria website, no auth',
    data: {
      businessName: 'BrickOven',
      industry: 'pizza',
      location: 'Brooklyn, NY',
      tagline: 'Authentic wood-fired pizza since 2010',
      pages: ['home', 'about', 'menu', 'gallery', 'contact'],
      adminTier: null,
      description: 'A family-owned pizzeria serving authentic Neapolitan-style pizza with imported Italian ingredients.',
      visualStyle: 'Warm Italian trattoria vibes. Red and cream colors, rustic wood textures, friendly and inviting.',
      communicationStyle: 0.6
    }
  },

  'salon-L2': {
    name: 'Salon Brochure (L2)',
    mode: 'instant',
    tier: 'L2',
    industry: 'salon',
    description: '5-7 page salon website, no auth',
    data: {
      businessName: 'GlowUp Studio',
      industry: 'salon',
      location: 'Los Angeles, CA',
      tagline: 'Where beauty meets artistry',
      pages: ['home', 'about', 'services', 'team', 'gallery', 'contact'],
      adminTier: null,
      description: 'A full-service beauty salon offering hair, nails, makeup, and spa treatments.',
      visualStyle: 'Elegant and feminine. Soft pinks, golds, and whites. Clean modern aesthetic with luxurious touches.',
      communicationStyle: 0.5
    }
  },

  'restaurant-L2': {
    name: 'Restaurant Brochure (L2)',
    mode: 'instant',
    tier: 'L2',
    industry: 'restaurant',
    description: '5-7 page restaurant website, no auth',
    data: {
      businessName: 'Harvest Table',
      industry: 'restaurant',
      location: 'Portland, OR',
      tagline: 'Farm-fresh, locally sourced',
      pages: ['home', 'about', 'menu', 'reservations', 'events', 'contact'],
      adminTier: null,
      description: 'A farm-to-table restaurant featuring seasonal menus with ingredients from local farms and producers.',
      visualStyle: 'Organic and earthy. Natural greens, warm woods, handwritten typography touches. Cozy yet refined.',
      communicationStyle: 0.5
    }
  },

  'agency-L2': {
    name: 'Agency Brochure (L2)',
    mode: 'instant',
    tier: 'L2',
    industry: 'agency',
    description: '5-7 page agency website, no auth',
    data: {
      businessName: 'Pixel & Code',
      industry: 'agency',
      location: 'New York, NY',
      tagline: 'Digital experiences that convert',
      pages: ['home', 'about', 'services', 'portfolio', 'case-studies', 'contact'],
      adminTier: null,
      description: 'A digital agency specializing in web design, branding, and conversion optimization for growing businesses.',
      visualStyle: 'Bold and modern. Dark backgrounds with vibrant accent colors. Clean typography, lots of whitespace.',
      communicationStyle: 0.4
    }
  },

  // ============================================
  // L3 - WITH USER ACCOUNTS
  // ============================================

  'pizza-L3': {
    name: 'Pizza + Auth (L3)',
    mode: 'instant',
    tier: 'L3',
    industry: 'pizza',
    description: '8-10 pages with user accounts and ordering',
    data: {
      businessName: 'SliceClub',
      industry: 'pizza',
      location: 'Chicago, IL',
      tagline: 'Join the club, earn free pizza',
      pages: ['home', 'about', 'menu', 'gallery', 'contact', 'login', 'signup', 'dashboard', 'profile', 'rewards'],
      adminTier: 'basic',
      description: 'A modern pizzeria with a loyalty program. Members earn points on every order and unlock exclusive deals.',
      visualStyle: 'Fun and energetic. Bold reds and yellows, playful typography, gamification elements for rewards.',
      aiInstructions: 'Include a rewards/loyalty system where users can track points. Dashboard shows order history and available rewards.',
      communicationStyle: 0.7
    }
  },

  'ecommerce-L3': {
    name: 'Ecommerce + Auth (L3)',
    mode: 'instant',
    tier: 'L3',
    industry: 'ecommerce',
    description: '8-10 pages with user accounts and wishlist',
    data: {
      businessName: 'ThreadCraft',
      industry: 'ecommerce',
      location: 'Austin, TX',
      tagline: 'Sustainable fashion, timeless style',
      pages: ['home', 'shop', 'about', 'sustainability', 'contact', 'login', 'signup', 'account', 'wishlist', 'orders'],
      adminTier: 'basic',
      description: 'An ethical clothing brand selling organic, fair-trade apparel. Users can save favorites and track orders.',
      visualStyle: 'Clean and minimal. Earth tones, lots of whitespace, Scandinavian-inspired aesthetic.',
      aiInstructions: 'Emphasize sustainability messaging. User dashboard shows order history and saved items. No checkout yet (L3).',
      communicationStyle: 0.5
    }
  },

  'fitness-L3': {
    name: 'Fitness + Auth (L3)',
    mode: 'instant',
    tier: 'L3',
    industry: 'fitness',
    description: '8-10 pages with member accounts',
    data: {
      businessName: 'FitForge',
      industry: 'fitness',
      location: 'Denver, CO',
      tagline: 'Transform your body, track your progress',
      pages: ['home', 'about', 'classes', 'trainers', 'schedule', 'contact', 'login', 'signup', 'dashboard', 'profile'],
      adminTier: 'basic',
      description: 'A boutique gym with personal training and group classes. Members can book classes and track workouts.',
      visualStyle: 'High-energy and bold. Black and orange accents, dynamic imagery, strong typography.',
      aiInstructions: 'Dashboard shows upcoming bookings, workout history, and progress stats. Class schedule with booking capability.',
      communicationStyle: 0.7
    }
  },

  'saas-L3': {
    name: 'SaaS + Auth (L3)',
    mode: 'instant',
    tier: 'L3',
    industry: 'saas',
    description: '8-10 pages with user dashboard',
    data: {
      businessName: 'MetricFlow',
      industry: 'saas',
      location: 'San Francisco, CA',
      tagline: 'Analytics made simple',
      pages: ['landing', 'features', 'pricing', 'about', 'contact', 'login', 'signup', 'dashboard', 'settings', 'profile'],
      adminTier: 'basic',
      description: 'A business analytics platform that connects to your data sources and provides actionable insights.',
      visualStyle: 'Modern SaaS aesthetic. Dark mode with purple/blue gradients. Clean data visualizations, glassmorphism.',
      aiInstructions: 'Dashboard shows sample analytics widgets. Settings page for account preferences. No billing yet (L3).',
      communicationStyle: 0.4
    }
  },

  // ============================================
  // L4 - FULL SAAS / PLATFORM
  // ============================================

  'pizza-L4': {
    name: 'Pizza Full Platform (L4)',
    mode: 'custom',
    tier: 'L4',
    industry: 'pizza',
    description: 'Complete pizzeria platform with ordering, payments, admin',
    data: {
      businessName: 'PrimePizza',
      industry: 'pizza',
      location: 'Dallas, TX',
      tagline: 'Where luxury meets the perfect slice',

      description: `PrimePizza is Dallas's premier gourmet pizzeria, featuring wood-fired Neapolitan-style pizzas with locally-sourced ingredients. Our signature truffle mushroom pizza has been featured in D Magazine. We offer an intimate 40-seat dining room, private event space, and a curated wine list focusing on Italian varietals.`,

      visualStyle: `Upscale Italian bistro meets modern luxury. Rich blacks and deep burgundy with gold accents. Think high-end steakhouse ambiance but for artisan pizza. Marble textures, warm ambient lighting, elegant typography. Premium feel - like a place where a $45 pizza makes sense.`,

      aiInstructions: `This is an upscale gourmet pizzeria, NOT a casual pizza joint. Emphasize artisan ingredients, hand-crafted dough, wood-fired ovens, and premium toppings. Pricing reflects quality ($35-65 per pizza). Target audience is affluent foodies and business dinners. Include full ordering system, cart, checkout, payment processing, and order tracking.`,

      pages: ['home', 'about', 'menu', 'gallery', 'reservations', 'private-events', 'contact', 'login', 'signup', 'dashboard', 'profile', 'cart', 'checkout', 'orders', 'rewards', 'admin'],
      adminTier: 'full',
      adminModules: ['analytics', 'orders', 'menu-management', 'reservations', 'customers', 'rewards'],

      teamSize: '5-10',
      priceRange: '$$$',
      cta: 'Order Now',
      communicationStyle: 0.8,
      layout: 'story-driven',
      videoHero: true
    }
  },

  'ecommerce-L4': {
    name: 'Ecommerce Full Platform (L4)',
    mode: 'custom',
    tier: 'L4',
    industry: 'ecommerce',
    description: 'Complete ecommerce store with cart, checkout, payments, admin',
    data: {
      businessName: 'CraftGoods',
      industry: 'ecommerce',
      location: 'Portland, OR',
      tagline: 'Handmade goods for intentional living',

      description: `CraftGoods curates and sells handmade home goods, ceramics, textiles, and accessories from independent artisans across North America. Every product tells a story - we visit each maker personally and share their craft with our community. Small batch, limited editions, fair prices for makers.`,

      visualStyle: `Warm, artisanal, authentic. Cream backgrounds, terracotta and sage accents. Hand-drawn elements mixed with clean photography. Typography should feel handcrafted. The vibe is farmers market meets design-forward boutique.`,

      aiInstructions: `Target audience is design-conscious consumers 30-55 who value craftsmanship. Price point $40-400. Emphasize maker stories, handmade quality, limited availability. Full shopping experience: product pages, cart, checkout, payment processing, order tracking. Admin dashboard for inventory and orders.`,

      pages: ['home', 'shop', 'product', 'makers', 'about', 'sustainability', 'journal', 'contact', 'login', 'signup', 'account', 'wishlist', 'cart', 'checkout', 'orders', 'admin'],
      adminTier: 'full',
      adminModules: ['analytics', 'orders', 'inventory', 'products', 'customers', 'shipping'],

      teamSize: '1-5',
      priceRange: '$$',
      cta: 'Shop Now',
      communicationStyle: 0.6
    }
  },

  'saas-L4': {
    name: 'SaaS Full Platform (L4)',
    mode: 'custom',
    tier: 'L4',
    industry: 'saas',
    description: 'Complete SaaS with billing, team management, admin',
    data: {
      businessName: 'FlowMetrics',
      industry: 'saas',
      location: 'San Francisco, CA',
      tagline: 'Analytics that actually make sense',

      description: `FlowMetrics transforms complex business data into actionable insights. Our AI-powered dashboard connects to 50+ data sources and automatically surfaces the metrics that matter. Used by 500+ companies from startups to Fortune 500. SOC2 certified, GDPR compliant. Plans start at $49/month.`,

      visualStyle: `Modern SaaS aesthetic - dark mode default with option for light. Electric blue and purple gradients as accent colors on dark backgrounds. Clean data visualizations, smooth animations, glassmorphism effects. Think Linear or Vercel dashboard vibes.`,

      aiInstructions: `Target audience is operations managers, founders, and data analysts at companies with 10-500 employees. Emphasize time savings, AI-powered insights, easy setup. Pricing tiers: Starter ($49/mo), Growth ($149/mo), Enterprise (custom). Full billing system, team management, usage tracking. Admin dashboard for customer management.`,

      pages: ['landing', 'features', 'pricing', 'integrations', 'about', 'contact', 'login', 'signup', 'dashboard', 'settings', 'profile', 'team', 'billing', 'usage', 'admin'],
      adminTier: 'full',
      adminModules: ['analytics', 'customers', 'subscriptions', 'usage', 'support-tickets'],

      teamSize: '10-50',
      priceRange: '$$$',
      cta: 'Start Free Trial',
      communicationStyle: 0.4
    }
  },

  'restaurant-L4': {
    name: 'Restaurant Full Platform (L4)',
    mode: 'custom',
    tier: 'L4',
    industry: 'restaurant',
    description: 'Complete restaurant with reservations, ordering, loyalty, admin',
    data: {
      businessName: 'LuxeDine',
      industry: 'restaurant',
      location: 'Miami, FL',
      tagline: 'An unforgettable culinary journey',

      description: `LuxeDine is Miami's most exclusive fine dining destination, offering a 12-course tasting menu that changes weekly based on the freshest available ingredients. Our Michelin-starred chef creates dishes that are as visually stunning as they are delicious. Reservations required 4+ weeks in advance.`,

      visualStyle: `Ultra-luxury, dramatic. Deep blacks with copper and champagne gold accents. Moody, atmospheric lighting in photography. Typography should be refined and elegant - thin serifs. Think high fashion editorial meets fine dining.`,

      aiInstructions: `This is a Michelin-starred fine dining experience, price point $350+ per person. Target audience is wealthy residents, celebrities, and special occasion diners. Emphasize exclusivity, award-winning chef, seasonal tasting menu. Full reservation system, gift cards, private events booking, loyalty program for VIP guests. Admin dashboard for reservations and guest management.`,

      pages: ['home', 'about', 'experience', 'chef', 'menu', 'wine', 'private-events', 'gift-cards', 'press', 'contact', 'login', 'signup', 'dashboard', 'reservations', 'rewards', 'admin'],
      adminTier: 'full',
      adminModules: ['analytics', 'reservations', 'guests', 'events', 'gift-cards', 'menu-management'],

      teamSize: '5-10',
      priceRange: '$$$',
      cta: 'Reserve Your Experience',
      communicationStyle: 0.9,
      layout: 'story-driven',
      videoHero: true
    }
  },

  // ============================================
  // MODE-SPECIFIC TESTS (for testing specific flows)
  // ============================================

  'quickstart-L1': {
    name: 'Quick Start Test (L1)',
    mode: 'quickstart',
    tier: 'L1',
    industry: 'consulting',
    description: 'Test Quick Start mode with L1 landing',
    data: {
      businessName: 'StrategyPro',
      industry: 'consulting',
      location: 'Boston, MA',
      tagline: 'Business strategy that works',
      pages: ['home'],
      adminTier: null
    }
  },

  'assemble-L2': {
    name: 'Assemble Test (L2)',
    mode: 'quickstart',
    tier: 'L2',
    industry: 'bakery',
    description: 'Test direct assemble with L2 brochure site',
    data: {
      businessName: 'SunriseBakery',
      industry: 'bakery',
      location: 'Seattle, WA',
      tagline: 'Fresh baked daily',
      pages: ['home', 'about', 'menu', 'gallery', 'catering', 'contact'],
      adminTier: null
    }
  },

  'assemble-L4': {
    name: 'Assemble Test (L4)',
    mode: 'quickstart',
    tier: 'L4',
    industry: 'medical',
    description: 'Test direct assemble with L4 medical platform',
    data: {
      businessName: 'CareFirst Clinic',
      industry: 'medical',
      location: 'Chicago, IL',
      tagline: 'Your health, our priority',

      description: 'A comprehensive family medical practice providing primary care, preventive services, telehealth, and chronic disease management. Patient portal for appointments, records, and messaging.',

      visualStyle: 'Clean, professional, trustworthy. Calming blues and greens, friendly imagery, accessible design. HIPAA-compliant feel.',

      aiInstructions: 'Medical practice website with full patient portal. Appointment booking, medical records access, provider messaging, prescription refills. Admin dashboard for staff scheduling and patient management.',

      pages: ['home', 'about', 'services', 'providers', 'locations', 'patient-resources', 'contact', 'login', 'signup', 'patient-portal', 'appointments', 'records', 'messages', 'prescriptions', 'admin'],
      adminTier: 'full',
      adminModules: ['analytics', 'appointments', 'patients', 'providers', 'scheduling'],

      cta: 'Book Appointment',
      communicationStyle: 0.3
    }
  },

  // ============================================
  // AI DETECTION TESTS (test orchestrator inference)
  // ============================================

  'orchestrate-pizza': {
    name: 'AI Detection: Pizza',
    mode: 'orchestrate-test',
    tier: null,  // Let AI decide
    industry: null,  // Let AI detect
    description: 'Test AI detection with pizza prompt (should detect restaurant/pizza)',
    data: {
      businessName: 'TestPizzeria',
      // NO pages array - let AI decide
      // NO industry - let AI detect
      location: 'New York, NY'
    }
  },

  'orchestrate-saas': {
    name: 'AI Detection: SaaS',
    mode: 'orchestrate-test',
    tier: null,
    industry: null,
    description: 'Test AI detection with SaaS prompt (should detect saas)',
    data: {
      businessName: 'TestApp',
      location: 'San Francisco, CA',
      tagline: 'The best project management tool'
    }
  }
};

// Test categories for UI grouping - organized by tier
const testCategories = {
  'L1 - Landing Pages': ['pizza-L1', 'salon-L1', 'saas-L1', 'fitness-L1'],
  'L2 - Brochure Sites': ['pizza-L2', 'salon-L2', 'restaurant-L2', 'agency-L2'],
  'L3 - With Auth': ['pizza-L3', 'ecommerce-L3', 'fitness-L3', 'saas-L3'],
  'L4 - Full Platform': ['pizza-L4', 'ecommerce-L4', 'saas-L4', 'restaurant-L4'],
  'Assemble Tests': ['quickstart-L1', 'assemble-L2', 'assemble-L4'],
  'AI Detection Tests': ['orchestrate-pizza', 'orchestrate-saas']
};

// Keyboard shortcut mappings
const keyboardShortcuts = {
  'ctrl+1': 'pizza-L1',
  'ctrl+2': 'pizza-L2',
  'ctrl+3': 'pizza-L3',
  'ctrl+4': 'pizza-L4',
  'ctrl+5': 'saas-L4'
};

// Helper to generate unique test name with timestamp
function generateTestName(baseName) {
  const timestamp = Date.now().toString(36).slice(-4);
  return `${baseName}-${timestamp}`;
}

// Helper to get all presets as array
function getAllPresets() {
  return Object.entries(testPresets).map(([id, preset]) => ({
    id,
    ...preset
  }));
}

// Get presets by tier
function getPresetsByTier(tier) {
  return Object.entries(testPresets)
    .filter(([_, preset]) => preset.tier === tier)
    .map(([id, preset]) => ({ id, ...preset }));
}

// Get presets by mode
function getPresetsByMode(mode) {
  return Object.entries(testPresets)
    .filter(([_, preset]) => preset.mode === mode)
    .map(([id, preset]) => ({ id, ...preset }));
}

module.exports = {
  testPresets,
  testCategories,
  keyboardShortcuts,
  generateTestName,
  getAllPresets,
  getPresetsByTier,
  getPresetsByMode
};
