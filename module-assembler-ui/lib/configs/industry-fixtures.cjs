/**
 * Industry Fixtures for Test Mode
 *
 * Defines industry-specific:
 * - Website pages and content
 * - Companion app screens
 * - Sample data (products, services, etc.)
 * - Terminology mappings
 *
 * LOYALTY & REWARDS are included in ALL industries
 */

// ==========================================
// INDUSTRY CATEGORY MAPPINGS
// ==========================================

const INDUSTRY_CATEGORIES = {
  'food-beverage': ['pizza', 'restaurant', 'cafe', 'bar', 'bakery'],
  'professional-services': ['law-firm', 'accounting', 'consulting', 'real-estate', 'insurance'],
  'healthcare': ['healthcare', 'dental', 'chiropractic', 'barbershop', 'spa-salon'],
  'health-wellness': ['fitness', 'yoga'],
  'technology': ['saas', 'startup', 'agency'],
  'retail': ['ecommerce', 'subscription-box'],
  'creative': ['photography', 'wedding', 'portfolio'],
  'organization': ['nonprofit', 'church'],
  'education': ['school', 'online-course'],
  'trade-services': ['construction', 'plumber', 'electrician', 'landscaping', 'cleaning', 'auto-repair'],
  'pet-industry': ['pet-services'],
  'services': ['moving'],
  'events': ['event-venue'],
  'hospitality': ['hotel', 'travel'],
  'entertainment': ['musician', 'podcast', 'gaming'],
  'finance': ['finance'],
  'collectibles': ['collectibles', 'survey-rewards']
};

// Get category for an industry
function getIndustryCategory(industry) {
  for (const [category, industries] of Object.entries(INDUSTRY_CATEGORIES)) {
    if (industries.includes(industry)) {
      return category;
    }
  }
  return 'professional-services'; // Default
}

// ==========================================
// WEBSITE PAGE TEMPLATES BY CATEGORY
// ==========================================

const WEBSITE_PAGES = {
  'food-beverage': {
    pages: ['HomePage', 'MenuPage', 'AboutPage', 'ContactPage', 'GalleryPage', 'OrderPage'],
    primary: 'MenuPage',
    terminology: { items: 'Menu Items', action: 'Order Now', category: 'Menu Category' }
  },
  'retail': {
    pages: ['HomePage', 'ProductsPage', 'ProductDetailPage', 'CartPage', 'AboutPage', 'ContactPage'],
    primary: 'ProductsPage',
    terminology: { items: 'Products', action: 'Shop Now', category: 'Category' }
  },
  'professional-services': {
    pages: ['HomePage', 'ServicesPage', 'AboutPage', 'TeamPage', 'ContactPage', 'TestimonialsPage'],
    primary: 'ServicesPage',
    terminology: { items: 'Services', action: 'Get Started', category: 'Practice Area' }
  },
  'healthcare': {
    pages: ['HomePage', 'ServicesPage', 'AboutPage', 'TeamPage', 'ContactPage', 'BookingPage'],
    primary: 'ServicesPage',
    terminology: { items: 'Services', action: 'Book Appointment', category: 'Treatment' }
  },
  'health-wellness': {
    pages: ['HomePage', 'ClassesPage', 'MembershipPage', 'SchedulePage', 'AboutPage', 'ContactPage'],
    primary: 'ClassesPage',
    terminology: { items: 'Classes', action: 'Join Now', category: 'Class Type' }
  },
  'technology': {
    pages: ['HomePage', 'FeaturesPage', 'PricingPage', 'AboutPage', 'ContactPage', 'DemoPage'],
    primary: 'FeaturesPage',
    terminology: { items: 'Features', action: 'Start Free Trial', category: 'Plan' }
  },
  'creative': {
    pages: ['HomePage', 'PortfolioPage', 'ServicesPage', 'AboutPage', 'ContactPage', 'BookingPage'],
    primary: 'PortfolioPage',
    terminology: { items: 'Work', action: 'Book Now', category: 'Service' }
  },
  'trade-services': {
    pages: ['HomePage', 'ServicesPage', 'ProjectsPage', 'AboutPage', 'ContactPage', 'QuotePage'],
    primary: 'ServicesPage',
    terminology: { items: 'Services', action: 'Get Quote', category: 'Service Type' }
  },
  'hospitality': {
    pages: ['HomePage', 'RoomsPage', 'AmenitiesPage', 'AboutPage', 'ContactPage', 'BookingPage'],
    primary: 'RoomsPage',
    terminology: { items: 'Rooms', action: 'Book Now', category: 'Room Type' }
  },
  'education': {
    pages: ['HomePage', 'ProgramsPage', 'AboutPage', 'FacultyPage', 'ContactPage', 'ApplyPage'],
    primary: 'ProgramsPage',
    terminology: { items: 'Programs', action: 'Apply Now', category: 'Program' }
  },
  'entertainment': {
    pages: ['HomePage', 'EventsPage', 'AboutPage', 'GalleryPage', 'ContactPage', 'TicketsPage'],
    primary: 'EventsPage',
    terminology: { items: 'Events', action: 'Get Tickets', category: 'Event Type' }
  },
  'events': {
    pages: ['HomePage', 'VenuesPage', 'EventTypesPage', 'GalleryPage', 'ContactPage', 'InquiryPage'],
    primary: 'VenuesPage',
    terminology: { items: 'Venues', action: 'Inquire Now', category: 'Event Type' }
  },
  'organization': {
    pages: ['HomePage', 'MissionPage', 'ProgramsPage', 'EventsPage', 'AboutPage', 'DonatePage'],
    primary: 'MissionPage',
    terminology: { items: 'Programs', action: 'Donate Now', category: 'Initiative' }
  },
  'finance': {
    pages: ['HomePage', 'ServicesPage', 'InsightsPage', 'TeamPage', 'ContactPage', 'ConsultPage'],
    primary: 'ServicesPage',
    terminology: { items: 'Services', action: 'Schedule Consultation', category: 'Service' }
  },
  'collectibles': {
    pages: ['HomePage', 'CollectionPage', 'MarketplacePage', 'PortfolioPage', 'AboutPage'],
    primary: 'CollectionPage',
    terminology: { items: 'Items', action: 'Browse Collection', category: 'Collection' }
  },
  'pet-industry': {
    pages: ['HomePage', 'ServicesPage', 'TeamPage', 'GalleryPage', 'ContactPage', 'BookingPage'],
    primary: 'ServicesPage',
    terminology: { items: 'Services', action: 'Book Appointment', category: 'Service' }
  },
  'services': {
    pages: ['HomePage', 'ServicesPage', 'AboutPage', 'TestimonialsPage', 'ContactPage', 'QuotePage'],
    primary: 'ServicesPage',
    terminology: { items: 'Services', action: 'Get Quote', category: 'Service' }
  }
};

// ==========================================
// COMPANION APP SCREENS BY CATEGORY
// ==========================================

const APP_SCREENS = {
  'food-beverage': {
    screens: ['HomeScreen', 'MenuScreen', 'OrderHistoryScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/menu', icon: 'UtensilsCrossed', label: 'Order' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/history', icon: 'Clock', label: 'Orders' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['ordering', 'rewards', 'order-tracking']
  },
  'retail': {
    screens: ['HomeScreen', 'ShopScreen', 'CartScreen', 'OrdersScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/shop', icon: 'ShoppingBag', label: 'Shop' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/orders', icon: 'Package', label: 'Orders' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['shopping', 'rewards', 'order-tracking', 'wishlist']
  },
  'professional-services': {
    screens: ['HomeScreen', 'ServicesScreen', 'BookingScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Briefcase', label: 'Services' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['booking', 'rewards', 'documents']
  },
  'healthcare': {
    screens: ['HomeScreen', 'ServicesScreen', 'AppointmentsScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Heart', label: 'Services' },
      { path: '/appointments', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['booking', 'rewards', 'health-records']
  },
  'health-wellness': {
    screens: ['HomeScreen', 'ClassesScreen', 'ScheduleScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/classes', icon: 'Dumbbell', label: 'Classes' },
      { path: '/schedule', icon: 'Calendar', label: 'Schedule' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['class-booking', 'rewards', 'progress-tracking']
  },
  'technology': {
    screens: ['HomeScreen', 'DashboardScreen', 'FeaturesScreen', 'SupportScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
      { path: '/features', icon: 'Sparkles', label: 'Features' },
      { path: '/support', icon: 'MessageCircle', label: 'Support' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['dashboard', 'support', 'notifications']
  },
  'creative': {
    screens: ['HomeScreen', 'PortfolioScreen', 'BookingScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/portfolio', icon: 'Image', label: 'Work' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['booking', 'rewards', 'gallery']
  },
  'hospitality': {
    screens: ['HomeScreen', 'RoomsScreen', 'BookingScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/rooms', icon: 'Bed', label: 'Rooms' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['booking', 'rewards', 'concierge']
  },
  'trade-services': {
    screens: ['HomeScreen', 'ServicesScreen', 'QuoteScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Wrench', label: 'Services' },
      { path: '/quote', icon: 'FileText', label: 'Quote' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['quotes', 'rewards', 'scheduling']
  },
  // Default for other categories
  'default': {
    screens: ['HomeScreen', 'ServicesScreen', 'BookingScreen', 'RewardsScreen', 'ProfileScreen'],
    bottomNav: [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Grid', label: 'Services' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    features: ['booking', 'rewards']
  }
};

// ==========================================
// SAMPLE DATA BY INDUSTRY
// ==========================================

const SAMPLE_DATA = {
  // FOOD & BEVERAGE
  'pizza': {
    categories: [
      { name: 'Classic Pizzas', items: [
        { name: 'Margherita', price: 16, description: 'Fresh mozzarella, basil, San Marzano tomatoes' },
        { name: 'Pepperoni', price: 17, description: 'Cup & char pepperoni, mozzarella' },
        { name: 'Hawaiian', price: 18, description: 'Ham, pineapple, mozzarella' },
        { name: 'Meat Lovers', price: 22, description: 'Pepperoni, sausage, bacon, ham' }
      ]},
      { name: 'Specialty Pizzas', items: [
        { name: 'BBQ Chicken', price: 20, description: 'Grilled chicken, BBQ sauce, red onions' },
        { name: 'White Pizza', price: 19, description: 'Ricotta, mozzarella, garlic, olive oil' },
        { name: 'Veggie Supreme', price: 19, description: 'Mushrooms, peppers, onions, olives' }
      ]},
      { name: 'Sides & Drinks', items: [
        { name: 'Garlic Knots', price: 6, description: '6 fresh-baked knots' },
        { name: 'Caesar Salad', price: 9, description: 'Romaine, parmesan, croutons' },
        { name: 'Soda', price: 3, description: 'Coke, Sprite, Dr Pepper' }
      ]}
    ]
  },
  'restaurant': {
    categories: [
      { name: 'Appetizers', items: [
        { name: 'Soup of the Day', price: 8, description: 'Chef\'s daily selection' },
        { name: 'House Salad', price: 10, description: 'Mixed greens, seasonal vegetables' },
        { name: 'Bruschetta', price: 12, description: 'Tomato, basil, garlic on crostini' }
      ]},
      { name: 'Entrees', items: [
        { name: 'Grilled Salmon', price: 28, description: 'With roasted vegetables' },
        { name: 'Filet Mignon', price: 38, description: '8oz with mashed potatoes' },
        { name: 'Pasta Primavera', price: 22, description: 'Fresh vegetables, garlic cream' }
      ]},
      { name: 'Desserts', items: [
        { name: 'Tiramisu', price: 10, description: 'Classic Italian dessert' },
        { name: 'Cheesecake', price: 9, description: 'NY style with berry compote' }
      ]}
    ]
  },
  'cafe': {
    categories: [
      { name: 'Coffee', items: [
        { name: 'Espresso', price: 3.50, description: 'Double shot' },
        { name: 'Latte', price: 5, description: 'Espresso with steamed milk' },
        { name: 'Cappuccino', price: 5, description: 'Espresso, steamed milk, foam' },
        { name: 'Cold Brew', price: 4.50, description: '16oz smooth cold coffee' }
      ]},
      { name: 'Pastries', items: [
        { name: 'Croissant', price: 4, description: 'Buttery, flaky, fresh-baked' },
        { name: 'Muffin', price: 3.50, description: 'Blueberry or chocolate chip' },
        { name: 'Scone', price: 4, description: 'With clotted cream' }
      ]}
    ]
  },

  // RETAIL / ECOMMERCE
  'ecommerce': {
    categories: [
      { name: 'Featured', items: [
        { name: 'Premium Headphones', price: 199, description: 'Wireless noise-canceling' },
        { name: 'Smart Watch', price: 299, description: 'Fitness & health tracking' },
        { name: 'Laptop Stand', price: 79, description: 'Ergonomic aluminum design' }
      ]},
      { name: 'Accessories', items: [
        { name: 'Phone Case', price: 29, description: 'Protective with style' },
        { name: 'Charging Cable', price: 19, description: 'Fast-charge compatible' },
        { name: 'Wireless Earbuds', price: 149, description: 'True wireless freedom' }
      ]}
    ]
  },

  // PROFESSIONAL SERVICES
  'law-firm': {
    categories: [
      { name: 'Practice Areas', items: [
        { name: 'Personal Injury', price: null, description: 'Car accidents, slip & fall, medical malpractice' },
        { name: 'Family Law', price: null, description: 'Divorce, custody, adoption' },
        { name: 'Business Law', price: null, description: 'Contracts, disputes, formation' },
        { name: 'Criminal Defense', price: null, description: 'DUI, misdemeanors, felonies' }
      ]}
    ]
  },
  'real-estate': {
    categories: [
      { name: 'Featured Listings', items: [
        { name: '123 Oak Street', price: 450000, description: '3 bed, 2 bath, 1,800 sqft' },
        { name: '456 Maple Ave', price: 625000, description: '4 bed, 3 bath, 2,400 sqft' },
        { name: '789 Pine Drive', price: 375000, description: '2 bed, 2 bath, 1,200 sqft' }
      ]},
      { name: 'Services', items: [
        { name: 'Buyer Representation', price: null, description: 'Find your perfect home' },
        { name: 'Seller Services', price: null, description: 'Get top dollar for your property' },
        { name: 'Market Analysis', price: null, description: 'Know your home\'s value' }
      ]}
    ]
  },

  // HEALTHCARE
  'dental': {
    categories: [
      { name: 'General Dentistry', items: [
        { name: 'Cleaning & Exam', price: 150, description: 'Comprehensive dental cleaning' },
        { name: 'X-Rays', price: 100, description: 'Digital imaging' },
        { name: 'Fillings', price: 200, description: 'Tooth-colored composite' }
      ]},
      { name: 'Cosmetic', items: [
        { name: 'Teeth Whitening', price: 400, description: 'Professional in-office treatment' },
        { name: 'Veneers', price: 1200, description: 'Per tooth, porcelain' },
        { name: 'Invisalign', price: 5000, description: 'Clear aligner treatment' }
      ]}
    ]
  },
  'spa-salon': {
    categories: [
      { name: 'Hair Services', items: [
        { name: 'Haircut', price: 55, description: 'Wash, cut, and style' },
        { name: 'Color', price: 120, description: 'Full color treatment' },
        { name: 'Highlights', price: 150, description: 'Partial or full' }
      ]},
      { name: 'Spa Services', items: [
        { name: 'Swedish Massage', price: 90, description: '60 minutes relaxation' },
        { name: 'Facial', price: 85, description: 'Deep cleansing treatment' },
        { name: 'Manicure & Pedicure', price: 65, description: 'Full nail service' }
      ]}
    ]
  },

  // FITNESS
  'fitness': {
    categories: [
      { name: 'Memberships', items: [
        { name: 'Basic', price: 29, description: 'Gym access, monthly' },
        { name: 'Premium', price: 59, description: 'Gym + classes, monthly' },
        { name: 'VIP', price: 99, description: 'All access + personal training' }
      ]},
      { name: 'Classes', items: [
        { name: 'Spin Class', price: 15, description: 'High-intensity cycling' },
        { name: 'Yoga', price: 15, description: 'All levels welcome' },
        { name: 'HIIT', price: 15, description: 'High-intensity interval training' }
      ]}
    ]
  },

  // TRADE SERVICES
  'plumber': {
    categories: [
      { name: 'Residential', items: [
        { name: 'Drain Cleaning', price: 150, description: 'Clear clogged drains' },
        { name: 'Faucet Repair', price: 125, description: 'Fix leaks and drips' },
        { name: 'Water Heater', price: 200, description: 'Inspection and repair' }
      ]},
      { name: 'Emergency', items: [
        { name: 'Emergency Call', price: 200, description: '24/7 availability' },
        { name: 'Burst Pipe', price: 300, description: 'Emergency pipe repair' },
        { name: 'Sewer Backup', price: 350, description: 'Emergency sewer service' }
      ]}
    ]
  },

  // Default for unmapped industries
  'default': {
    categories: [
      { name: 'Services', items: [
        { name: 'Service A', price: 99, description: 'Description of service A' },
        { name: 'Service B', price: 149, description: 'Description of service B' },
        { name: 'Service C', price: 199, description: 'Description of service C' }
      ]},
      { name: 'Premium', items: [
        { name: 'Premium Service', price: 299, description: 'Our top-tier offering' },
        { name: 'VIP Package', price: 499, description: 'All-inclusive package' }
      ]}
    ]
  }
};

// ==========================================
// LOYALTY REWARDS CONFIG (UNIVERSAL)
// ==========================================

const LOYALTY_CONFIG = {
  tiers: [
    { name: 'Bronze', minPoints: 0, multiplier: 1, perks: ['Earn 1 point per $1', 'Member-only offers'] },
    { name: 'Silver', minPoints: 500, multiplier: 1.25, perks: ['Earn 1.25x points', 'Early access to sales', 'Birthday reward'] },
    { name: 'Gold', minPoints: 1500, multiplier: 1.5, perks: ['Earn 1.5x points', 'Free shipping', 'Exclusive events'] },
    { name: 'Platinum', minPoints: 5000, multiplier: 2, perks: ['Earn 2x points', 'Priority support', 'VIP experiences'] }
  ],
  rewards: [
    { name: '$5 Off', points: 100, type: 'discount', value: 5 },
    { name: '$10 Off', points: 200, type: 'discount', value: 10 },
    { name: '$25 Off', points: 450, type: 'discount', value: 25 },
    { name: 'Free Item', points: 300, type: 'freebie', value: null },
    { name: 'VIP Access', points: 1000, type: 'experience', value: null }
  ],
  streaks: {
    daily: { bonus: 10, maxStreak: 30 },
    weekly: { bonus: 50, maxStreak: 12 },
    monthly: { bonus: 200, maxStreak: 12 }
  }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

function getIndustryFixture(industry) {
  const category = getIndustryCategory(industry);
  const websiteConfig = WEBSITE_PAGES[category] || WEBSITE_PAGES['professional-services'];
  const appConfig = APP_SCREENS[category] || APP_SCREENS['default'];
  const sampleData = SAMPLE_DATA[industry] || SAMPLE_DATA['default'];

  return {
    industry,
    category,
    website: websiteConfig,
    app: appConfig,
    data: sampleData,
    loyalty: LOYALTY_CONFIG,
    terminology: websiteConfig.terminology
  };
}

function getWebsitePages(industry) {
  const category = getIndustryCategory(industry);
  return WEBSITE_PAGES[category] || WEBSITE_PAGES['professional-services'];
}

function getAppScreens(industry) {
  const category = getIndustryCategory(industry);
  return APP_SCREENS[category] || APP_SCREENS['default'];
}

function getSampleData(industry) {
  return SAMPLE_DATA[industry] || SAMPLE_DATA['default'];
}

function getLoyaltyConfig() {
  return LOYALTY_CONFIG;
}

module.exports = {
  getIndustryFixture,
  getIndustryCategory,
  getWebsitePages,
  getAppScreens,
  getSampleData,
  getLoyaltyConfig,
  INDUSTRY_CATEGORIES,
  WEBSITE_PAGES,
  APP_SCREENS,
  SAMPLE_DATA,
  LOYALTY_CONFIG
};
