/**
 * Hero Images Configuration by Industry
 *
 * High-quality Unsplash images organized by industry and sub-category.
 * Each industry has multiple image options for variety.
 *
 * Image guidelines:
 * - Use ?w=1920 for full-width heroes
 * - All images are landscape orientation suitable for hero sections
 * - Images should be appetizing/professional for the industry
 */

const HERO_IMAGES = {
  // ===============================================
  // FOOD & BEVERAGE
  // ===============================================
  'bakery': {
    primary: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920', // Fresh bread assortment
      'https://images.unsplash.com/photo-1486427944544-d2c6128c6e75?w=1920', // Pastry display
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920', // Croissants close-up
      'https://images.unsplash.com/photo-1517433670267-30f41c91c6c0?w=1920', // Baker working
    ],
    interior: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920', // Bakery interior
      'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=1920', // Display case
    ],
    products: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1920', // Cakes
      'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=1920', // Decorated cupcakes
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920', // Wedding cake
    ]
  },

  'cake-shop': {
    primary: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920', // Beautiful cake
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1920', // Cake slice
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1920', // Tiered cake
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920', // Elegant cake
    ],
    products: [
      'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=1920', // Cupcakes
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1920', // Cake decorating
      'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=1920', // Birthday cake
    ]
  },

  'coffee-cafe': {
    primary: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920', // Coffee cup art
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920', // Coffee shop atmosphere
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920', // Coffee beans and cup
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920', // Latte art
    ],
    interior: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920', // Cozy cafe
      'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1920', // Modern coffee shop
    ],
    products: [
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1920', // Espresso
      'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=1920', // Pastries and coffee
    ]
  },

  'restaurant': {
    primary: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920', // Restaurant interior
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920', // Fine dining plate
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1920', // Chef plating
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920', // Restaurant ambiance
    ],
    food: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920', // Food spread
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920', // Gourmet dish
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920', // Healthy dish
    ]
  },

  'pizza-restaurant': {
    primary: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1920', // Pizza hero
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920', // Pizza close-up
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=1920', // Pizza making
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=1920', // Pizza slice
    ],
    interior: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920', // Pizzeria
    ]
  },

  'steakhouse': {
    primary: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=1920', // Steak on grill
      'https://images.unsplash.com/photo-1558030006-450675393462?w=1920', // Steak plated
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1920', // Ribeye
      'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=1920', // Dark ambiance steak
    ]
  },

  // ===============================================
  // HEALTHCARE & DENTAL
  // ===============================================
  'dental': {
    primary: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920', // Modern dental office
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1920', // Smiling patient
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1920', // Dental tools clean
    ],
    team: [
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1920', // Dental team
    ]
  },

  'healthcare': {
    primary: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920', // Hospital corridor
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920', // Doctor patient
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920', // Medical professional
    ]
  },

  // ===============================================
  // BEAUTY & WELLNESS
  // ===============================================
  'salon-spa': {
    primary: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920', // Salon interior
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920', // Spa treatment
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1920', // Hair styling
    ]
  },

  'barbershop': {
    primary: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920', // Barbershop
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1920', // Classic barber
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1920', // Modern barber
    ]
  },

  'fitness-gym': {
    primary: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920', // Gym equipment
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920', // People training
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1920', // Gym interior
    ]
  },

  'yoga': {
    primary: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920', // Yoga class
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1920', // Yoga studio
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920', // Peaceful yoga
    ]
  },

  // ===============================================
  // PROFESSIONAL SERVICES
  // ===============================================
  'law-firm': {
    primary: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920', // Law library
      'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=1920', // Courthouse
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920', // Legal documents
    ]
  },

  'real-estate': {
    primary: [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920', // Luxury home
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920', // Modern house
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920', // Beautiful home
    ]
  },

  'auto-shop': {
    primary: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920', // Auto shop
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920', // Mechanic working
      'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920', // Car service
    ]
  },

  'plumber': {
    primary: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920', // Plumber working
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1920', // Plumbing tools
    ]
  },

  'cleaning': {
    primary: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920', // Clean home
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1920', // Cleaning service
    ]
  },

  // ===============================================
  // DEFAULT / FALLBACK
  // ===============================================
  'default': {
    primary: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920', // Modern office
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920', // Business meeting
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920', // Building exterior
    ]
  }
};

/**
 * Get hero images for an industry
 * @param {string} industry - Industry identifier
 * @param {string} category - Image category (primary, interior, products, etc.)
 * @returns {string[]} Array of image URLs
 */
function getHeroImages(industry, category = 'primary') {
  const normalizedIndustry = normalizeIndustry(industry);
  const industryImages = HERO_IMAGES[normalizedIndustry] || HERO_IMAGES['default'];
  return industryImages[category] || industryImages.primary || HERO_IMAGES.default.primary;
}

/**
 * Get a single hero image (random from available)
 * @param {string} industry - Industry identifier
 * @param {string} category - Image category
 * @param {number} index - Specific index (optional, random if not provided)
 * @returns {string} Single image URL
 */
function getHeroImage(industry, category = 'primary', index = null) {
  const images = getHeroImages(industry, category);
  if (index !== null && index >= 0 && index < images.length) {
    return images[index];
  }
  // Return first for consistency, or random for variety
  return images[0];
}

/**
 * Get hero image by layout style
 * Maps layout heroStyle to appropriate image selection
 */
function getHeroImageForLayout(industry, layoutStyle) {
  // Visual-first layouts should prioritize food/product images
  const visualFirstLayouts = ['fullscreen', 'fullscreen-carousel', 'fullwidth-image', 'centered', 'split'];

  if (visualFirstLayouts.includes(layoutStyle)) {
    return getHeroImage(industry, 'primary');
  }

  // For minimal/compact layouts, we might not need a hero image
  if (layoutStyle === 'minimal' || layoutStyle === 'compact') {
    return null;
  }

  return getHeroImage(industry, 'primary');
}

/**
 * Normalize industry name for lookup
 */
function normalizeIndustry(industry) {
  if (!industry) return 'default';

  const normalized = industry.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Handle aliases
  const aliases = {
    'patisserie': 'bakery',
    'cafe': 'coffee-cafe',
    'coffee': 'coffee-cafe',
    'coffee-shop': 'coffee-cafe',
    'coffeeshop': 'coffee-cafe',
    'pizzeria': 'pizza-restaurant',
    'pizza': 'pizza-restaurant',
    'dentist': 'dental',
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
    'cleaning-service': 'cleaning',
    'maid': 'cleaning',
    'house-cleaning': 'cleaning',
  };

  // Check if it's an alias
  if (aliases[normalized]) {
    return aliases[normalized];
  }

  // Check if it exists directly
  if (HERO_IMAGES[normalized]) {
    return normalized;
  }

  // Check partial matches
  for (const key of Object.keys(HERO_IMAGES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key;
    }
  }

  return 'default';
}

module.exports = {
  HERO_IMAGES,
  getHeroImages,
  getHeroImage,
  getHeroImageForLayout,
  normalizeIndustry
};
