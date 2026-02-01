/**
 * Industry Fixtures
 *
 * Realistic demo data for zero-cost sandbox testing.
 * Includes real Unsplash images, menu items, services, team members, etc.
 *
 * This enables full system simulation without any API costs.
 */

// ============================================
// IMAGE LIBRARIES (Unsplash - free to use)
// ============================================

const IMAGES = {
  // Restaurant/Food
  restaurant: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    interior: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    dishes: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400',
      'https://images.unsplash.com/photo-1482049016gy8-c09c75bdc36f?w=400',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'
    ],
    appetizers: [
      'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
      'https://images.unsplash.com/photo-1608039829572-ffabb4d3df39?w=400'
    ],
    desserts: [
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400'
    ],
    drinks: [
      'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'
    ],
    chef: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
    team: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200'
    ]
  },

  // Pizza
  pizza: {
    hero: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200',
    dishes: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'
    ]
  },

  // Cafe/Coffee
  cafe: {
    hero: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200',
    interior: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    drinks: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'
    ],
    pastries: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
      'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400'
    ]
  },

  // Dental
  dental: {
    hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200',
    office: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800',
    team: [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300'
    ],
    equipment: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400'
  },

  // Salon/Spa
  salon: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    interior: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800',
    services: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400'
    ],
    team: [
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=300'
    ]
  },

  // Fitness/Gym
  fitness: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
    interior: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    classes: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400'
    ],
    trainers: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300',
      'https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=300'
    ]
  },

  // Real Estate
  realEstate: {
    hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200',
    properties: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'
    ],
    agents: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
    ]
  },

  // Professional/Consulting
  professional: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    office: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    team: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300'
    ]
  },

  // Generic placeholders
  placeholder: {
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
  },

  // Law Firm
  lawFirm: {
    hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    team: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
    ],
    library: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    courtroom: 'https://images.unsplash.com/photo-1593115057322-e94b77572f20?w=800'
  },

  // Healthcare / Medical
  healthcare: {
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200',
    facility: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
    team: [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300'
    ],
    equipment: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400',
    reception: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800'
  },

  // Accounting / Financial
  accounting: {
    hero: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
    office: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    team: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
    ],
    workspace: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800'
  },

  // Insurance
  insurance: {
    hero: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    team: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
    ],
    family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
    car: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
    home: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
  },

  // Construction
  construction: {
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200',
    site: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
    team: [
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300',
      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300'
    ],
    projects: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
    ]
  },

  // Auto / Mechanic
  automotive: {
    hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200',
    shop: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
    team: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300',
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300'
    ],
    services: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400'
    ]
  },

  // Cleaning Services
  cleaning: {
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200',
    team: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300'
    ],
    services: [
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400',
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400'
    ]
  },

  // Pet Services
  petServices: {
    hero: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200',
    facility: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    team: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300'
    ],
    pets: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
      'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400'
    ]
  },

  // Consulting / Agency
  consulting: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    office: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    team: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300'
    ],
    meeting: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800'
  },

  // Barbershop
  barbershop: {
    hero: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200',
    interior: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
    services: [
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400'
    ],
    team: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
    ]
  },

  // Yoga Studio
  yoga: {
    hero: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200',
    studio: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800',
    classes: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400'
    ],
    instructors: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300'
    ]
  },

  // Bakery
  bakery: {
    hero: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200',
    interior: 'https://images.unsplash.com/photo-1517433670267-30f41c1f3a71?w=800',
    products: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400',
      'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
      'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?w=400'
    ]
  }
};

// ============================================
// RESTAURANT FIXTURE
// ============================================

const RESTAURANT_FIXTURE = {
  type: 'restaurant',
  business: {
    name: 'The Olive Garden',
    tagline: 'Fine Mediterranean Dining',
    description: 'Experience authentic Mediterranean cuisine in an elegant atmosphere. Our chef brings 20 years of culinary expertise to every dish.',
    phone: '(555) 123-4567',
    email: 'hello@olivegarden-demo.com',
    address: '123 Main Street, Downtown',
    hours: {
      'Mon-Thu': '11:00 AM - 10:00 PM',
      'Fri-Sat': '11:00 AM - 11:00 PM',
      'Sunday': '10:00 AM - 9:00 PM'
    }
  },
  images: IMAGES.restaurant,
  menu: [
    {
      category: 'Appetizers',
      items: [
        { id: 'app-1', name: 'Bruschetta Classica', price: 12.99, description: 'Toasted bread topped with fresh tomatoes, basil, garlic & olive oil', image: IMAGES.restaurant.appetizers[0] },
        { id: 'app-2', name: 'Calamari Fritti', price: 14.99, description: 'Crispy fried calamari with marinara sauce & lemon aioli', image: IMAGES.restaurant.appetizers[1] },
        { id: 'app-3', name: 'Caprese Salad', price: 11.99, description: 'Fresh mozzarella, tomatoes, basil with balsamic glaze', image: IMAGES.restaurant.dishes[2] }
      ]
    },
    {
      category: 'Main Courses',
      items: [
        { id: 'main-1', name: 'Grilled Salmon', price: 28.99, description: 'Atlantic salmon with lemon butter sauce, seasonal vegetables', image: IMAGES.restaurant.dishes[0] },
        { id: 'main-2', name: 'Chicken Parmesan', price: 24.99, description: 'Breaded chicken breast with marinara & melted mozzarella', image: IMAGES.restaurant.dishes[1] },
        { id: 'main-3', name: 'Filet Mignon', price: 42.99, description: '8oz prime beef tenderloin with red wine reduction', image: IMAGES.restaurant.dishes[4] },
        { id: 'main-4', name: 'Lobster Ravioli', price: 32.99, description: 'Handmade pasta filled with lobster in cream sauce', image: IMAGES.restaurant.dishes[3] }
      ]
    },
    {
      category: 'Desserts',
      items: [
        { id: 'des-1', name: 'Tiramisu', price: 9.99, description: 'Classic Italian dessert with espresso-soaked ladyfingers', image: IMAGES.restaurant.desserts[0] },
        { id: 'des-2', name: 'Chocolate Lava Cake', price: 10.99, description: 'Warm chocolate cake with molten center & vanilla gelato', image: IMAGES.restaurant.desserts[1] }
      ]
    },
    {
      category: 'Beverages',
      items: [
        { id: 'bev-1', name: 'House Red Wine', price: 9.99, description: 'Glass of our signature Italian red blend', image: IMAGES.restaurant.drinks[0] },
        { id: 'bev-2', name: 'Craft Cocktail', price: 12.99, description: 'Ask about our seasonal cocktail specials', image: IMAGES.restaurant.drinks[1] }
      ]
    }
  ],
  team: [
    { id: 't-1', name: 'Marco Rossi', role: 'Executive Chef', bio: '20 years of culinary excellence', image: IMAGES.restaurant.chef },
    { id: 't-2', name: 'Sofia Martinez', role: 'General Manager', bio: 'Ensuring every visit is memorable', image: IMAGES.restaurant.team[0] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Sarah M.', rating: 5, text: 'Absolutely incredible dining experience! The salmon was cooked to perfection.' },
    { id: 'rev-2', name: 'James R.', rating: 5, text: 'Best Italian food in the city. The tiramisu is a must-try!' },
    { id: 'rev-3', name: 'Emily K.', rating: 4, text: 'Beautiful ambiance and excellent service. Will definitely return.' }
  ],
  loyalty: {
    pointsPerDollar: 10,
    rewards: [
      { id: 'rew-1', name: 'Free Appetizer', points: 500, description: 'Any appetizer on the menu' },
      { id: 'rew-2', name: '$10 Off', points: 1000, description: 'Discount on your next order' },
      { id: 'rew-3', name: 'Free Dessert', points: 750, description: "Chef's selection dessert" },
      { id: 'rew-4', name: 'Free Entree', points: 2500, description: 'Any main course up to $35' }
    ]
  }
};

// ============================================
// PIZZA FIXTURE
// ============================================

const PIZZA_FIXTURE = {
  type: 'pizza',
  business: {
    name: "Tony's Pizza",
    tagline: 'Authentic New York Style Pizza',
    description: 'Family-owned since 1985. Hand-tossed dough, fresh ingredients, and recipes passed down through generations.',
    phone: '(555) 234-5678',
    email: 'orders@tonyspizza-demo.com',
    address: '456 Oak Avenue',
    hours: {
      'Mon-Thu': '11:00 AM - 10:00 PM',
      'Fri-Sat': '11:00 AM - 12:00 AM',
      'Sunday': '12:00 PM - 9:00 PM'
    }
  },
  images: IMAGES.pizza,
  menu: [
    {
      category: 'Classic Pizzas',
      items: [
        { id: 'pz-1', name: 'Margherita', price: 16.99, description: 'Fresh mozzarella, tomato sauce, basil', image: IMAGES.pizza.dishes[0] },
        { id: 'pz-2', name: 'Pepperoni', price: 18.99, description: 'Classic pepperoni with mozzarella', image: IMAGES.pizza.dishes[1] },
        { id: 'pz-3', name: 'Supreme', price: 22.99, description: 'Pepperoni, sausage, peppers, onions, olives', image: IMAGES.pizza.dishes[2] },
        { id: 'pz-4', name: 'Meat Lovers', price: 24.99, description: 'Pepperoni, sausage, bacon, ham', image: IMAGES.pizza.dishes[3] }
      ]
    },
    {
      category: 'Specialty Pizzas',
      items: [
        { id: 'sp-1', name: 'BBQ Chicken', price: 21.99, description: 'Grilled chicken, BBQ sauce, red onions, cilantro', image: IMAGES.pizza.dishes[0] },
        { id: 'sp-2', name: 'White Pizza', price: 19.99, description: 'Ricotta, mozzarella, garlic, olive oil', image: IMAGES.pizza.dishes[1] }
      ]
    },
    {
      category: 'Sides & Drinks',
      items: [
        { id: 'sd-1', name: 'Garlic Knots (6)', price: 5.99, description: 'Fresh baked with garlic butter', image: IMAGES.restaurant.appetizers[0] },
        { id: 'sd-2', name: 'Caesar Salad', price: 8.99, description: 'Romaine, parmesan, croutons, caesar dressing', image: IMAGES.restaurant.dishes[5] },
        { id: 'sd-3', name: 'Soda', price: 2.99, description: 'Coke, Diet Coke, Sprite, Root Beer', image: IMAGES.restaurant.drinks[1] }
      ]
    }
  ],
  loyalty: {
    pointsPerDollar: 10,
    rewards: [
      { id: 'rew-1', name: 'Free Garlic Knots', points: 300, description: '6 piece garlic knots' },
      { id: 'rew-2', name: 'Free 2-Liter', points: 200, description: 'Any 2-liter soda' },
      { id: 'rew-3', name: '$5 Off', points: 500, description: 'Any order over $20' },
      { id: 'rew-4', name: 'Free Medium Pizza', points: 1500, description: 'Any medium 1-topping' }
    ]
  }
};

// ============================================
// CAFE FIXTURE
// ============================================

const CAFE_FIXTURE = {
  type: 'cafe',
  business: {
    name: 'The Daily Grind',
    tagline: 'Artisan Coffee & Fresh Pastries',
    description: 'Locally roasted beans, handcrafted drinks, and fresh-baked goods made daily.',
    phone: '(555) 345-6789',
    email: 'hello@dailygrind-demo.com',
    address: '789 Coffee Lane',
    hours: {
      'Mon-Fri': '6:00 AM - 8:00 PM',
      'Saturday': '7:00 AM - 9:00 PM',
      'Sunday': '7:00 AM - 6:00 PM'
    }
  },
  images: IMAGES.cafe,
  menu: [
    {
      category: 'Coffee',
      items: [
        { id: 'cof-1', name: 'Espresso', price: 3.49, description: 'Double shot of our house blend', image: IMAGES.cafe.drinks[0] },
        { id: 'cof-2', name: 'Latte', price: 4.99, description: 'Espresso with steamed milk', image: IMAGES.cafe.drinks[1] },
        { id: 'cof-3', name: 'Cappuccino', price: 4.99, description: 'Espresso with foamed milk', image: IMAGES.cafe.drinks[2] },
        { id: 'cof-4', name: 'Cold Brew', price: 4.49, description: '24-hour steeped cold brew', image: IMAGES.cafe.drinks[0] }
      ]
    },
    {
      category: 'Pastries',
      items: [
        { id: 'pas-1', name: 'Croissant', price: 3.99, description: 'Buttery, flaky French croissant', image: IMAGES.cafe.pastries[0] },
        { id: 'pas-2', name: 'Blueberry Muffin', price: 3.49, description: 'Fresh-baked with real blueberries', image: IMAGES.cafe.pastries[1] },
        { id: 'pas-3', name: 'Cinnamon Roll', price: 4.49, description: 'Warm with cream cheese frosting', image: IMAGES.cafe.pastries[0] }
      ]
    }
  ],
  loyalty: {
    pointsPerDollar: 15,
    rewards: [
      { id: 'rew-1', name: 'Free Pastry', points: 200, description: 'Any pastry item' },
      { id: 'rew-2', name: 'Free Coffee', points: 350, description: 'Any size drip coffee' },
      { id: 'rew-3', name: 'Free Drink', points: 500, description: 'Any drink up to $6' }
    ]
  }
};

// ============================================
// DENTAL FIXTURE
// ============================================

const DENTAL_FIXTURE = {
  type: 'dental',
  business: {
    name: 'Bright Smile Dental',
    tagline: 'Your Smile, Our Priority',
    description: 'Modern dental care with a gentle touch. State-of-the-art technology and compassionate care for the whole family.',
    phone: '(555) 456-7890',
    email: 'appointments@brightsmile-demo.com',
    address: '321 Healthcare Blvd, Suite 100',
    hours: {
      'Mon-Thu': '8:00 AM - 5:00 PM',
      'Friday': '8:00 AM - 3:00 PM',
      'Sat-Sun': 'Closed'
    }
  },
  images: IMAGES.dental,
  services: [
    {
      category: 'General Dentistry',
      items: [
        { id: 'srv-1', name: 'Dental Exam & Cleaning', price: 150, description: 'Comprehensive exam with professional cleaning', duration: '60 min' },
        { id: 'srv-2', name: 'Dental X-Rays', price: 75, description: 'Digital x-rays for accurate diagnosis', duration: '15 min' },
        { id: 'srv-3', name: 'Filling', price: 200, description: 'Tooth-colored composite filling', duration: '45 min' }
      ]
    },
    {
      category: 'Cosmetic Dentistry',
      items: [
        { id: 'srv-4', name: 'Teeth Whitening', price: 350, description: 'Professional in-office whitening', duration: '90 min' },
        { id: 'srv-5', name: 'Veneers', price: 1200, description: 'Porcelain veneers per tooth', duration: '2 visits' },
        { id: 'srv-6', name: 'Bonding', price: 300, description: 'Cosmetic tooth repair', duration: '60 min' }
      ]
    },
    {
      category: 'Restorative',
      items: [
        { id: 'srv-7', name: 'Crown', price: 1100, description: 'Porcelain crown restoration', duration: '2 visits' },
        { id: 'srv-8', name: 'Root Canal', price: 900, description: 'Endodontic treatment', duration: '90 min' },
        { id: 'srv-9', name: 'Dental Implant', price: 3500, description: 'Titanium implant with crown', duration: 'Multiple visits' }
      ]
    }
  ],
  team: [
    { id: 'dr-1', name: 'Dr. Sarah Chen', role: 'Lead Dentist, DMD', bio: '15 years of experience in family and cosmetic dentistry', image: IMAGES.dental.team[0] },
    { id: 'dr-2', name: 'Dr. Michael Park', role: 'Dentist, DDS', bio: 'Specializing in restorative and implant dentistry', image: IMAGES.dental.team[1] },
    { id: 'hyg-1', name: 'Lisa Thompson', role: 'Dental Hygienist', bio: 'Making cleanings comfortable for over 10 years', image: IMAGES.dental.team[2] }
  ],
  insurance: ['Delta Dental', 'Cigna', 'Aetna', 'MetLife', 'Blue Cross', 'United Healthcare'],
  testimonials: [
    { id: 'rev-1', name: 'Michael T.', rating: 5, text: 'Best dental experience ever. Dr. Chen is incredibly gentle and thorough.' },
    { id: 'rev-2', name: 'Jennifer L.', rating: 5, text: 'The whole staff is friendly and professional. My kids actually look forward to visits!' }
  ]
};

// ============================================
// SALON FIXTURE
// ============================================

const SALON_FIXTURE = {
  type: 'salon',
  business: {
    name: 'Luxe Hair Studio',
    tagline: 'Where Style Meets Elegance',
    description: 'Premier hair salon offering cutting-edge styles, colors, and treatments in a luxurious atmosphere.',
    phone: '(555) 567-8901',
    email: 'book@luxehair-demo.com',
    address: '555 Style Avenue',
    hours: {
      'Tue-Fri': '9:00 AM - 8:00 PM',
      'Saturday': '9:00 AM - 6:00 PM',
      'Sun-Mon': 'Closed'
    }
  },
  images: IMAGES.salon,
  services: [
    {
      category: 'Haircuts',
      items: [
        { id: 'hc-1', name: "Women's Cut & Style", price: 65, description: 'Consultation, cut, and blowout', duration: '60 min' },
        { id: 'hc-2', name: "Men's Cut", price: 35, description: 'Precision cut with styling', duration: '30 min' },
        { id: 'hc-3', name: "Children's Cut", price: 25, description: 'Ages 12 and under', duration: '30 min' }
      ]
    },
    {
      category: 'Color Services',
      items: [
        { id: 'col-1', name: 'Single Process Color', price: 85, description: 'All-over color application', duration: '90 min' },
        { id: 'col-2', name: 'Highlights', price: 120, description: 'Partial or full highlights', duration: '2 hours' },
        { id: 'col-3', name: 'Balayage', price: 175, description: 'Hand-painted highlights for natural look', duration: '2.5 hours' },
        { id: 'col-4', name: 'Color Correction', price: 200, description: 'Starting price, consultation required', duration: 'Varies' }
      ]
    },
    {
      category: 'Treatments',
      items: [
        { id: 'tr-1', name: 'Deep Conditioning', price: 35, description: 'Intensive moisture treatment', duration: '30 min' },
        { id: 'tr-2', name: 'Keratin Treatment', price: 250, description: 'Smoothing and frizz control', duration: '2.5 hours' },
        { id: 'tr-3', name: 'Scalp Treatment', price: 45, description: 'Exfoliating scalp therapy', duration: '30 min' }
      ]
    }
  ],
  team: [
    { id: 'st-1', name: 'Jessica Milano', role: 'Master Stylist & Owner', bio: '18 years experience, color specialist', image: IMAGES.salon.team[0] },
    { id: 'st-2', name: 'David Chen', role: 'Senior Stylist', bio: 'Precision cuts and men\'s grooming expert', image: IMAGES.salon.team[1] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Amanda R.', rating: 5, text: 'Jessica transformed my hair! Best balayage I\'ve ever had.' },
    { id: 'rev-2', name: 'Nicole P.', rating: 5, text: 'The atmosphere is so relaxing. I always leave feeling amazing.' }
  ],
  loyalty: {
    pointsPerDollar: 5,
    rewards: [
      { id: 'rew-1', name: 'Free Conditioning', points: 200, description: 'Deep conditioning treatment' },
      { id: 'rew-2', name: '$15 Off', points: 400, description: 'Any service over $50' },
      { id: 'rew-3', name: 'Free Blowout', points: 600, description: 'Blowout styling service' }
    ]
  }
};

// ============================================
// FITNESS FIXTURE
// ============================================

const FITNESS_FIXTURE = {
  type: 'fitness',
  business: {
    name: 'Peak Performance Gym',
    tagline: 'Transform Your Body, Transform Your Life',
    description: 'State-of-the-art fitness facility with personal training, group classes, and everything you need to reach your goals.',
    phone: '(555) 678-9012',
    email: 'info@peakperformance-demo.com',
    address: '888 Fitness Way',
    hours: {
      'Mon-Fri': '5:00 AM - 11:00 PM',
      'Saturday': '6:00 AM - 10:00 PM',
      'Sunday': '7:00 AM - 8:00 PM'
    }
  },
  images: IMAGES.fitness,
  memberships: [
    { id: 'mem-1', name: 'Basic', price: 29.99, period: 'month', features: ['Gym access', 'Locker room', 'Free WiFi'] },
    { id: 'mem-2', name: 'Premium', price: 49.99, period: 'month', features: ['Gym access', 'All classes', 'Sauna', 'Guest passes'] },
    { id: 'mem-3', name: 'Elite', price: 99.99, period: 'month', features: ['Gym access', 'All classes', 'Personal training (2/mo)', 'Nutrition consult'] }
  ],
  classes: [
    { id: 'cls-1', name: 'Spin Class', instructor: 'Mike', time: '6:00 AM', duration: '45 min', image: IMAGES.fitness.classes[0] },
    { id: 'cls-2', name: 'Yoga Flow', instructor: 'Sarah', time: '9:00 AM', duration: '60 min', image: IMAGES.fitness.classes[1] },
    { id: 'cls-3', name: 'HIIT Training', instructor: 'Jake', time: '5:30 PM', duration: '45 min', image: IMAGES.fitness.classes[2] },
    { id: 'cls-4', name: 'Boxing', instructor: 'Maria', time: '7:00 PM', duration: '60 min', image: IMAGES.fitness.classes[0] }
  ],
  trainers: [
    { id: 'tr-1', name: 'Mike Torres', specialty: 'Strength & Conditioning', image: IMAGES.fitness.trainers[0] },
    { id: 'tr-2', name: 'Sarah Kim', specialty: 'Yoga & Flexibility', image: IMAGES.fitness.trainers[1] }
  ]
};

// ============================================
// LAW FIRM FIXTURE
// ============================================

const LAW_FIRM_FIXTURE = {
  type: 'law-firm',
  business: {
    name: 'Morrison & Associates',
    tagline: 'Trusted Legal Counsel Since 1985',
    description: 'Full-service law firm providing experienced legal representation in personal injury, family law, business litigation, and estate planning.',
    phone: '(555) 789-0123',
    email: 'contact@morrisonlaw-demo.com',
    address: '100 Legal Plaza, Suite 500',
    hours: {
      'Mon-Fri': '8:30 AM - 6:00 PM',
      'Saturday': 'By Appointment',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.lawFirm,
  practiceAreas: [
    {
      id: 'pa-1',
      name: 'Personal Injury',
      description: 'Car accidents, slip & fall, wrongful death',
      icon: '⚖️'
    },
    {
      id: 'pa-2',
      name: 'Family Law',
      description: 'Divorce, custody, child support, adoption',
      icon: '👨‍👩‍👧'
    },
    {
      id: 'pa-3',
      name: 'Business Law',
      description: 'Contracts, litigation, employment disputes',
      icon: '🏢'
    },
    {
      id: 'pa-4',
      name: 'Estate Planning',
      description: 'Wills, trusts, probate, power of attorney',
      icon: '📜'
    },
    {
      id: 'pa-5',
      name: 'Criminal Defense',
      description: 'DUI, misdemeanors, felonies',
      icon: '🛡️'
    },
    {
      id: 'pa-6',
      name: 'Real Estate',
      description: 'Closings, disputes, commercial transactions',
      icon: '🏠'
    }
  ],
  team: [
    { id: 'atty-1', name: 'Robert Morrison', role: 'Managing Partner', bio: 'Over 30 years trial experience', image: IMAGES.lawFirm.team[0], specialties: ['Personal Injury', 'Business Litigation'] },
    { id: 'atty-2', name: 'Jennifer Walsh', role: 'Partner', bio: 'Family law and estate planning specialist', image: IMAGES.lawFirm.team[1], specialties: ['Family Law', 'Estate Planning'] },
    { id: 'atty-3', name: 'Michael Chen', role: 'Associate', bio: 'Criminal defense and civil rights', image: IMAGES.lawFirm.team[2], specialties: ['Criminal Defense', 'Civil Rights'] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'David H.', rating: 5, text: 'They fought for me and won my personal injury case. Highly professional and caring.' },
    { id: 'rev-2', name: 'Sarah M.', rating: 5, text: 'Jennifer made my divorce process as smooth as possible. Forever grateful.' }
  ],
  // Portal-specific data for Client Portal
  portalData: {
    cases: [
      { id: 'case-1', title: 'Smith v. ABC Corp', status: 'Active', type: 'Personal Injury', attorney: 'Robert Morrison', lastUpdate: '2024-01-15', nextAction: 'Deposition scheduled Jan 25' },
      { id: 'case-2', title: 'Estate of Johnson', status: 'In Progress', type: 'Estate Planning', attorney: 'Jennifer Walsh', lastUpdate: '2024-01-12', nextAction: 'Document review pending' }
    ],
    documents: [
      { id: 'doc-1', name: 'Retainer Agreement.pdf', type: 'Contract', date: '2024-01-01', size: '245 KB' },
      { id: 'doc-2', name: 'Discovery Request.pdf', type: 'Legal Document', date: '2024-01-10', size: '1.2 MB' },
      { id: 'doc-3', name: 'Settlement Offer.pdf', type: 'Correspondence', date: '2024-01-14', size: '89 KB' }
    ],
    billing: [
      { id: 'inv-1', number: 'INV-2024-001', amount: 2500, status: 'Paid', date: '2024-01-01', description: 'Initial consultation and case review' },
      { id: 'inv-2', number: 'INV-2024-015', amount: 4750, status: 'Pending', date: '2024-01-15', dueDate: '2024-02-15', description: 'January legal services' }
    ],
    messages: [
      { id: 'msg-1', from: 'Jennifer Walsh', subject: 'Document Review Complete', date: '2024-01-14', preview: 'I have completed the review of your estate documents...' },
      { id: 'msg-2', from: 'Legal Assistant', subject: 'Appointment Reminder', date: '2024-01-13', preview: 'This is a reminder of your upcoming appointment...' }
    ],
    appointments: [
      { id: 'apt-1', title: 'Case Review Meeting', attorney: 'Robert Morrison', date: '2024-01-25', time: '10:00 AM', duration: '1 hour', location: 'Office' },
      { id: 'apt-2', title: 'Document Signing', attorney: 'Jennifer Walsh', date: '2024-01-30', time: '2:00 PM', duration: '30 min', location: 'Office' }
    ]
  }
};

// ============================================
// REAL ESTATE FIXTURE
// ============================================

const REAL_ESTATE_FIXTURE = {
  type: 'real-estate',
  business: {
    name: 'Prestige Realty Group',
    tagline: 'Your Dream Home Awaits',
    description: 'Full-service real estate brokerage specializing in residential and commercial properties. Over $500M in sales volume.',
    phone: '(555) 890-1234',
    email: 'info@prestigerealty-demo.com',
    address: '200 Market Street, Suite 300',
    hours: {
      'Mon-Fri': '9:00 AM - 7:00 PM',
      'Saturday': '10:00 AM - 5:00 PM',
      'Sunday': '12:00 PM - 4:00 PM'
    }
  },
  images: IMAGES.realEstate,
  services: [
    { id: 'svc-1', name: 'Buyer Representation', description: 'Full-service support from search to closing' },
    { id: 'svc-2', name: 'Seller Representation', description: 'Marketing, staging, and negotiation expertise' },
    { id: 'svc-3', name: 'Property Valuation', description: 'Accurate market analysis and pricing' },
    { id: 'svc-4', name: 'Investment Consulting', description: 'ROI analysis and portfolio building' }
  ],
  team: [
    { id: 'agt-1', name: 'Michael Torres', role: 'Broker/Owner', bio: 'Top 1% nationally, 20+ years experience', image: IMAGES.realEstate.agents[0], sold: '$85M lifetime' },
    { id: 'agt-2', name: 'Sarah Chen', role: 'Senior Agent', bio: 'Luxury property specialist', image: IMAGES.realEstate.agents[1], sold: '$42M lifetime' }
  ],
  featuredListings: [
    { id: 'prop-1', address: '123 Oak Drive', city: 'Hillside Heights', price: 850000, beds: 4, baths: 3, sqft: 2800, type: 'Single Family', status: 'Active', image: IMAGES.realEstate.properties[0] },
    { id: 'prop-2', address: '456 Maple Lane', city: 'Downtown', price: 425000, beds: 2, baths: 2, sqft: 1500, type: 'Condo', status: 'Active', image: IMAGES.realEstate.properties[1] },
    { id: 'prop-3', address: '789 Pine Street', city: 'Lakewood', price: 1200000, beds: 5, baths: 4, sqft: 4200, type: 'Single Family', status: 'Pending', image: IMAGES.realEstate.properties[2] },
    { id: 'prop-4', address: '321 Cedar Court', city: 'Riverside', price: 675000, beds: 3, baths: 2.5, sqft: 2200, type: 'Townhouse', status: 'Active', image: IMAGES.realEstate.properties[3] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'The Johnsons', rating: 5, text: 'Michael found us our dream home in just 3 weeks! Amazing service.' },
    { id: 'rev-2', name: 'Tom R.', rating: 5, text: 'Sarah sold our house for 15% over asking. Could not be happier!' }
  ],
  // Portal-specific data for Client Portal
  portalData: {
    savedHomes: [
      { id: 'sh-1', address: '123 Oak Drive', price: 850000, beds: 4, baths: 3, status: 'Still Available', image: IMAGES.realEstate.properties[0], savedDate: '2024-01-10' },
      { id: 'sh-2', address: '456 Maple Lane', price: 425000, beds: 2, baths: 2, status: 'Price Reduced', image: IMAGES.realEstate.properties[1], savedDate: '2024-01-08' }
    ],
    searchAlerts: [
      { id: 'alert-1', criteria: '3+ beds, 2+ baths, $400K-$600K, Downtown', frequency: 'Daily', newMatches: 3 },
      { id: 'alert-2', criteria: '4+ beds, pool, Hillside Heights', frequency: 'Instant', newMatches: 1 }
    ],
    showings: [
      { id: 'show-1', property: '123 Oak Drive', date: '2024-01-20', time: '2:00 PM', agent: 'Sarah Chen', status: 'Confirmed' },
      { id: 'show-2', property: '789 Pine Street', date: '2024-01-22', time: '10:30 AM', agent: 'Michael Torres', status: 'Pending' }
    ],
    documents: [
      { id: 'doc-1', name: 'Pre-Approval Letter.pdf', type: 'Financial', date: '2024-01-05', size: '156 KB' },
      { id: 'doc-2', name: 'Buyer Agreement.pdf', type: 'Contract', date: '2024-01-06', size: '234 KB' }
    ],
    offers: [
      { id: 'offer-1', property: '456 Maple Lane', amount: 415000, status: 'Submitted', date: '2024-01-15', response: 'Awaiting seller response' }
    ],
    messages: [
      { id: 'msg-1', from: 'Sarah Chen', subject: 'New Listings Matching Your Criteria', date: '2024-01-16', preview: 'I found 3 new properties that match what you are looking for...' }
    ],
    mortgageCalculator: {
      recentCalculations: [
        { price: 500000, downPayment: 100000, rate: 6.5, term: 30, monthlyPayment: 2528 }
      ]
    }
  }
};

// ============================================
// HEALTHCARE FIXTURE
// ============================================

const HEALTHCARE_FIXTURE = {
  type: 'healthcare',
  business: {
    name: 'Wellness Medical Center',
    tagline: 'Comprehensive Care for Your Family',
    description: 'Multi-specialty medical practice providing primary care, urgent care, and specialized services in a patient-centered environment.',
    phone: '(555) 901-2345',
    email: 'appointments@wellnessmed-demo.com',
    address: '500 Health Way, Medical Plaza',
    hours: {
      'Mon-Fri': '7:00 AM - 7:00 PM',
      'Saturday': '8:00 AM - 2:00 PM',
      'Sunday': 'Urgent Care Only'
    }
  },
  images: IMAGES.healthcare,
  departments: [
    { id: 'dept-1', name: 'Primary Care', description: 'Annual exams, preventive care, chronic disease management' },
    { id: 'dept-2', name: 'Urgent Care', description: 'Walk-in care for non-emergency conditions' },
    { id: 'dept-3', name: 'Pediatrics', description: 'Comprehensive care for infants through adolescents' },
    { id: 'dept-4', name: 'Women\'s Health', description: 'OB/GYN services and wellness care' },
    { id: 'dept-5', name: 'Cardiology', description: 'Heart health diagnostics and treatment' },
    { id: 'dept-6', name: 'Orthopedics', description: 'Bone, joint, and sports medicine' }
  ],
  services: [
    { id: 'srv-1', name: 'Annual Physical', price: 200, description: 'Comprehensive health exam', duration: '45 min' },
    { id: 'srv-2', name: 'Urgent Care Visit', price: 150, description: 'Same-day care for acute conditions', duration: '30 min' },
    { id: 'srv-3', name: 'Lab Work', price: 75, description: 'Blood tests and diagnostics', duration: '15 min' },
    { id: 'srv-4', name: 'Immunizations', price: 50, description: 'Vaccines and boosters', duration: '15 min' }
  ],
  team: [
    { id: 'dr-1', name: 'Dr. Amanda Roberts', role: 'Medical Director, MD', bio: 'Board-certified in Internal Medicine, 18 years experience', image: IMAGES.healthcare.team[0], specialties: ['Primary Care', 'Preventive Medicine'] },
    { id: 'dr-2', name: 'Dr. James Park', role: 'Physician, MD', bio: 'Pediatric and family medicine specialist', image: IMAGES.healthcare.team[1], specialties: ['Pediatrics', 'Family Medicine'] },
    { id: 'np-1', name: 'Lisa Chen', role: 'Nurse Practitioner', bio: 'Women\'s health and wellness expert', image: IMAGES.healthcare.team[2], specialties: ['Women\'s Health'] }
  ],
  insurance: ['Blue Cross', 'Aetna', 'Cigna', 'United Healthcare', 'Medicare', 'Medicaid', 'Humana'],
  testimonials: [
    { id: 'rev-1', name: 'Patricia L.', rating: 5, text: 'Dr. Roberts takes the time to really listen. Best doctor I have ever had.' },
    { id: 'rev-2', name: 'Mark S.', rating: 5, text: 'Urgent care was fast and professional. In and out in under an hour.' }
  ],
  // Portal-specific data for Patient Portal
  portalData: {
    appointments: [
      { id: 'apt-1', type: 'Annual Physical', provider: 'Dr. Amanda Roberts', date: '2024-02-01', time: '9:00 AM', status: 'Confirmed', location: 'Main Office' },
      { id: 'apt-2', type: 'Lab Work', provider: 'Lab Services', date: '2024-01-25', time: '7:30 AM', status: 'Scheduled', location: 'Lab Wing' }
    ],
    upcomingAppointments: 2,
    medicalRecords: {
      lastVisit: '2024-01-10',
      conditions: ['Hypertension (controlled)', 'Seasonal Allergies'],
      allergies: ['Penicillin', 'Shellfish'],
      immunizations: [
        { name: 'Flu Shot', date: '2024-10-15', nextDue: '2025-10-01' },
        { name: 'Tetanus', date: '2022-05-20', nextDue: '2032-05-20' },
        { name: 'COVID-19 Booster', date: '2024-09-01', nextDue: '2025-09-01' }
      ]
    },
    prescriptions: [
      { id: 'rx-1', name: 'Lisinopril 10mg', dosage: 'Once daily', refills: 3, pharmacy: 'CVS Main St', lastFilled: '2024-01-05', nextRefill: '2024-02-05' },
      { id: 'rx-2', name: 'Zyrtec 10mg', dosage: 'As needed', refills: 5, pharmacy: 'CVS Main St', lastFilled: '2024-01-10', nextRefill: 'As needed' }
    ],
    labResults: [
      { id: 'lab-1', test: 'Complete Blood Count', date: '2024-01-10', status: 'Normal', provider: 'Dr. Roberts' },
      { id: 'lab-2', test: 'Lipid Panel', date: '2024-01-10', status: 'Review Required', provider: 'Dr. Roberts' },
      { id: 'lab-3', test: 'A1C', date: '2024-01-10', status: 'Normal', provider: 'Dr. Roberts' }
    ],
    messages: [
      { id: 'msg-1', from: 'Dr. Amanda Roberts', subject: 'Lab Results Review', date: '2024-01-12', preview: 'Your recent lab results are mostly normal, but I would like to discuss...' },
      { id: 'msg-2', from: 'Wellness Medical Center', subject: 'Appointment Reminder', date: '2024-01-24', preview: 'This is a reminder of your upcoming appointment...' }
    ],
    billing: [
      { id: 'bill-1', date: '2024-01-10', service: 'Office Visit', amount: 150, insurance: 'Blue Cross', patientOwes: 25, status: 'Pending' },
      { id: 'bill-2', date: '2024-01-10', service: 'Lab Work', amount: 175, insurance: 'Blue Cross', patientOwes: 35, status: 'Pending' }
    ],
    forms: [
      { id: 'form-1', name: 'Patient Information Update', status: 'Complete', lastUpdated: '2024-01-10' },
      { id: 'form-2', name: 'HIPAA Authorization', status: 'Complete', lastUpdated: '2023-06-15' },
      { id: 'form-3', name: 'Annual Health Questionnaire', status: 'Due', dueDate: '2024-02-01' }
    ]
  }
};

// ============================================
// ACCOUNTING FIXTURE
// ============================================

const ACCOUNTING_FIXTURE = {
  type: 'accounting',
  business: {
    name: 'Sterling Financial Group',
    tagline: 'Your Financial Success, Our Priority',
    description: 'Full-service CPA firm providing tax preparation, bookkeeping, audit services, and business consulting for individuals and businesses.',
    phone: '(555) 012-3456',
    email: 'info@sterlingcpa-demo.com',
    address: '750 Commerce Drive, Suite 200',
    hours: {
      'Mon-Fri': '8:00 AM - 6:00 PM',
      'Saturday': '9:00 AM - 1:00 PM (Tax Season)',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.accounting,
  services: [
    {
      category: 'Tax Services',
      items: [
        { id: 'tax-1', name: 'Individual Tax Return', price: 250, description: 'Form 1040 with standard deductions' },
        { id: 'tax-2', name: 'Business Tax Return', price: 750, description: 'S-Corp, LLC, or Partnership returns' },
        { id: 'tax-3', name: 'Tax Planning', price: 500, description: 'Strategic tax minimization consultation' }
      ]
    },
    {
      category: 'Accounting Services',
      items: [
        { id: 'acc-1', name: 'Monthly Bookkeeping', price: 350, description: 'Full-service bookkeeping per month' },
        { id: 'acc-2', name: 'Payroll Services', price: 150, description: 'Per payroll processing' },
        { id: 'acc-3', name: 'Financial Statements', price: 500, description: 'Compiled or reviewed statements' }
      ]
    },
    {
      category: 'Business Advisory',
      items: [
        { id: 'adv-1', name: 'Business Valuation', price: 2500, description: 'Comprehensive business valuation' },
        { id: 'adv-2', name: 'CFO Services', price: 1500, description: 'Part-time CFO per month' },
        { id: 'adv-3', name: 'Audit Preparation', price: 1000, description: 'Audit readiness assessment' }
      ]
    }
  ],
  team: [
    { id: 'cpa-1', name: 'Robert Sterling', role: 'Managing Partner, CPA', bio: '25 years experience, tax specialist', image: IMAGES.accounting.team[0], credentials: ['CPA', 'MBA'] },
    { id: 'cpa-2', name: 'Michelle Yang', role: 'Partner, CPA', bio: 'Business advisory and audit specialist', image: IMAGES.accounting.team[1], credentials: ['CPA', 'CMA'] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Tech Startup Inc.', rating: 5, text: 'Sterling helped us save over $50K in taxes our first year. Incredible ROI!' },
    { id: 'rev-2', name: 'Jennifer K.', rating: 5, text: 'They made my complex tax situation simple. Highly recommend.' }
  ],
  // Portal-specific data for Client Portal
  portalData: {
    taxReturns: [
      { id: 'tr-1', year: 2023, type: 'Individual 1040', status: 'Completed', filed: '2024-03-15', refund: 3250 },
      { id: 'tr-2', year: 2023, type: 'Business (S-Corp)', status: 'In Progress', dueDate: '2024-03-15', assignee: 'Robert Sterling' },
      { id: 'tr-3', year: 2022, type: 'Individual 1040', status: 'Completed', filed: '2023-04-10', refund: 2800 }
    ],
    documents: [
      { id: 'doc-1', name: 'W-2 Forms 2023.pdf', category: 'Tax Documents', uploadDate: '2024-01-15', year: 2023 },
      { id: 'doc-2', name: '1099-INT Bank Statement.pdf', category: 'Tax Documents', uploadDate: '2024-01-16', year: 2023 },
      { id: 'doc-3', name: 'Business P&L 2023.xlsx', category: 'Financial Statements', uploadDate: '2024-01-18', year: 2023 },
      { id: 'doc-4', name: 'Prior Year Return 2022.pdf', category: 'Tax Returns', uploadDate: '2023-04-15', year: 2022 }
    ],
    financialStatements: [
      { id: 'fs-1', name: 'Q4 2023 Balance Sheet', type: 'Balance Sheet', date: '2023-12-31', status: 'Final' },
      { id: 'fs-2', name: 'Q4 2023 Income Statement', type: 'Income Statement', date: '2023-12-31', status: 'Final' },
      { id: 'fs-3', name: 'Q4 2023 Cash Flow', type: 'Cash Flow Statement', date: '2023-12-31', status: 'Draft' }
    ],
    invoices: [
      { id: 'inv-1', number: 'INV-2024-001', amount: 750, status: 'Paid', date: '2024-01-15', description: 'Q4 2023 Bookkeeping' },
      { id: 'inv-2', number: 'INV-2024-010', amount: 250, status: 'Pending', date: '2024-02-01', dueDate: '2024-02-28', description: '2023 Tax Preparation Deposit' }
    ],
    deadlines: [
      { id: 'dl-1', title: 'Q4 Estimated Tax Payment', date: '2024-01-15', status: 'Completed' },
      { id: 'dl-2', title: 'Business Tax Return Due', date: '2024-03-15', status: 'Upcoming' },
      { id: 'dl-3', title: 'Individual Tax Return Due', date: '2024-04-15', status: 'Upcoming' }
    ],
    messages: [
      { id: 'msg-1', from: 'Robert Sterling', subject: 'Missing Documents for 2023 Return', date: '2024-01-20', preview: 'To complete your return, we still need the following documents...' }
    ],
    taxPlanning: {
      estimatedTax2024: 15000,
      recommendations: [
        'Maximize 401(k) contributions',
        'Consider HSA contributions',
        'Review quarterly estimated payments'
      ]
    }
  }
};

// ============================================
// INSURANCE FIXTURE
// ============================================

const INSURANCE_FIXTURE = {
  type: 'insurance',
  business: {
    name: 'SafeGuard Insurance Agency',
    tagline: 'Protection You Can Count On',
    description: 'Independent insurance agency offering personalized coverage solutions for auto, home, life, and business insurance from top-rated carriers.',
    phone: '(555) 123-4567',
    email: 'quotes@safeguard-demo.com',
    address: '300 Protection Blvd',
    hours: {
      'Mon-Fri': '8:30 AM - 5:30 PM',
      'Saturday': '9:00 AM - 12:00 PM',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.insurance,
  products: [
    { id: 'prod-1', name: 'Auto Insurance', description: 'Comprehensive coverage for your vehicles', icon: '🚗', image: IMAGES.insurance.car },
    { id: 'prod-2', name: 'Home Insurance', description: 'Protect your most valuable asset', icon: '🏠', image: IMAGES.insurance.home },
    { id: 'prod-3', name: 'Life Insurance', description: 'Financial security for your loved ones', icon: '❤️', image: IMAGES.insurance.family },
    { id: 'prod-4', name: 'Business Insurance', description: 'Coverage for your business operations', icon: '🏢' },
    { id: 'prod-5', name: 'Health Insurance', description: 'Medical coverage options', icon: '🏥' },
    { id: 'prod-6', name: 'Umbrella Policy', description: 'Extra liability protection', icon: '☂️' }
  ],
  carriers: ['State Farm', 'Allstate', 'Progressive', 'Liberty Mutual', 'Nationwide', 'Travelers', 'Hartford'],
  team: [
    { id: 'agt-1', name: 'David Martinez', role: 'Agency Owner', bio: 'Helping families protect what matters for 20 years', image: IMAGES.insurance.team[0] },
    { id: 'agt-2', name: 'Karen Thompson', role: 'Senior Agent', bio: 'Commercial insurance specialist', image: IMAGES.insurance.team[1] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'The Williams Family', rating: 5, text: 'David found us better coverage at a lower price. Saved us $400/year!' },
    { id: 'rev-2', name: 'Mike R.', rating: 5, text: 'When I had a claim, Karen handled everything. True professionals.' }
  ],
  // Portal-specific data for Policy Portal
  portalData: {
    policies: [
      { id: 'pol-1', type: 'Auto Insurance', policyNumber: 'AUTO-2024-12345', carrier: 'Progressive', premium: 1200, frequency: 'Annual', status: 'Active', expirationDate: '2024-06-15', vehicles: ['2022 Toyota Camry', '2020 Honda CR-V'] },
      { id: 'pol-2', type: 'Homeowners Insurance', policyNumber: 'HOME-2024-67890', carrier: 'State Farm', premium: 1800, frequency: 'Annual', status: 'Active', expirationDate: '2024-08-01', property: '123 Main Street' },
      { id: 'pol-3', type: 'Life Insurance', policyNumber: 'LIFE-2023-11111', carrier: 'Nationwide', premium: 50, frequency: 'Monthly', status: 'Active', coverage: 500000, beneficiaries: ['Jane Doe (Spouse)'] }
    ],
    claims: [
      { id: 'clm-1', policyType: 'Auto', claimNumber: 'CLM-2024-001', date: '2024-01-10', status: 'In Progress', description: 'Minor fender bender', adjuster: 'John Smith', amount: 2500 },
      { id: 'clm-2', policyType: 'Home', claimNumber: 'CLM-2023-045', date: '2023-08-15', status: 'Closed', description: 'Storm damage to roof', amount: 8500, paid: 8500 }
    ],
    documents: [
      { id: 'doc-1', name: 'Auto Insurance Declaration.pdf', policy: 'AUTO-2024-12345', date: '2024-01-01' },
      { id: 'doc-2', name: 'Home Insurance Policy.pdf', policy: 'HOME-2024-67890', date: '2024-08-01' },
      { id: 'doc-3', name: 'Life Insurance Certificate.pdf', policy: 'LIFE-2023-11111', date: '2023-05-15' }
    ],
    payments: [
      { id: 'pmt-1', policy: 'Life Insurance', amount: 50, dueDate: '2024-02-01', status: 'Upcoming' },
      { id: 'pmt-2', policy: 'Auto Insurance', amount: 1200, dueDate: '2024-06-15', status: 'Scheduled' }
    ],
    idCards: [
      { id: 'card-1', type: 'Auto ID Card', policyNumber: 'AUTO-2024-12345', vehicle: '2022 Toyota Camry', validThrough: '2024-06-15' },
      { id: 'card-2', type: 'Auto ID Card', policyNumber: 'AUTO-2024-12345', vehicle: '2020 Honda CR-V', validThrough: '2024-06-15' }
    ],
    quotes: [
      { id: 'quote-1', type: 'Umbrella Policy', premium: 350, status: 'Pending Review', expiresDate: '2024-02-15' }
    ],
    messages: [
      { id: 'msg-1', from: 'David Martinez', subject: 'Policy Renewal Reminder', date: '2024-01-15', preview: 'Your auto policy is coming up for renewal. I have reviewed your coverage and...' }
    ]
  }
};

// ============================================
// CONSTRUCTION FIXTURE
// ============================================

const CONSTRUCTION_FIXTURE = {
  type: 'construction',
  business: {
    name: 'BuildRight Construction',
    tagline: 'Quality Craftsmanship, On Time & On Budget',
    description: 'Full-service general contractor specializing in residential and commercial construction, renovations, and custom builds.',
    phone: '(555) 234-5678',
    email: 'projects@buildright-demo.com',
    address: '450 Industrial Way',
    hours: {
      'Mon-Fri': '7:00 AM - 5:00 PM',
      'Saturday': 'By Appointment',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.construction,
  services: [
    { id: 'svc-1', name: 'Custom Home Building', description: 'Design and build your dream home from the ground up' },
    { id: 'svc-2', name: 'Home Renovations', description: 'Kitchen, bathroom, and whole-home remodeling' },
    { id: 'svc-3', name: 'Commercial Construction', description: 'Office buildings, retail spaces, warehouses' },
    { id: 'svc-4', name: 'Additions', description: 'Add square footage to your existing home' },
    { id: 'svc-5', name: 'Decks & Outdoor Living', description: 'Decks, patios, outdoor kitchens' }
  ],
  team: [
    { id: 'tm-1', name: 'John Builder', role: 'Owner/General Contractor', bio: '30 years building excellence', image: IMAGES.construction.team[0] },
    { id: 'tm-2', name: 'Mike Foreman', role: 'Project Manager', bio: 'Expert in residential and commercial projects', image: IMAGES.construction.team[1] }
  ],
  projects: [
    { id: 'proj-1', name: 'Modern Farmhouse', type: 'Custom Home', sqft: 3500, image: IMAGES.construction.projects[0], status: 'Completed' },
    { id: 'proj-2', name: 'Downtown Office Tower', type: 'Commercial', sqft: 50000, image: IMAGES.construction.projects[1], status: 'Completed' },
    { id: 'proj-3', name: 'Lakeside Retreat', type: 'Custom Home', sqft: 4200, image: IMAGES.construction.projects[2], status: 'In Progress' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'The Anderson Family', rating: 5, text: 'BuildRight made our dream home a reality. Professional from start to finish.' },
    { id: 'rev-2', name: 'Metro Business Center', rating: 5, text: 'On time, on budget, and exceptional quality. Our go-to contractor.' }
  ],
  // Portal-specific data for Client Portal
  portalData: {
    activeProjects: [
      {
        id: 'proj-1',
        name: 'Kitchen Renovation',
        address: '123 Oak Street',
        status: 'In Progress',
        completion: 65,
        startDate: '2024-01-02',
        estimatedEnd: '2024-03-15',
        manager: 'Mike Foreman',
        budget: 45000,
        spent: 28500,
        phases: [
          { name: 'Demolition', status: 'Complete', completion: 100 },
          { name: 'Electrical & Plumbing', status: 'Complete', completion: 100 },
          { name: 'Cabinets & Counters', status: 'In Progress', completion: 60 },
          { name: 'Flooring', status: 'Pending', completion: 0 },
          { name: 'Final Details', status: 'Pending', completion: 0 }
        ]
      }
    ],
    documents: [
      { id: 'doc-1', name: 'Project Contract.pdf', type: 'Contract', date: '2024-01-01' },
      { id: 'doc-2', name: 'Kitchen Design Plans.pdf', type: 'Plans', date: '2023-12-15' },
      { id: 'doc-3', name: 'Permit Approval.pdf', type: 'Permit', date: '2024-01-05' },
      { id: 'doc-4', name: 'Change Order #1.pdf', type: 'Change Order', date: '2024-01-20' }
    ],
    invoices: [
      { id: 'inv-1', number: 'INV-2024-001', amount: 15000, status: 'Paid', date: '2024-01-02', description: 'Initial deposit (33%)' },
      { id: 'inv-2', number: 'INV-2024-015', amount: 13500, status: 'Paid', date: '2024-01-25', description: 'Progress payment - Demolition complete' },
      { id: 'inv-3', number: 'INV-2024-030', amount: 10000, status: 'Pending', date: '2024-02-15', description: 'Progress payment - Cabinets' }
    ],
    schedule: [
      { id: 'sch-1', task: 'Cabinet Installation', date: '2024-02-01', time: '8:00 AM', crew: 'Cabinet Team' },
      { id: 'sch-2', task: 'Countertop Template', date: '2024-02-10', time: '9:00 AM', crew: 'Granite Pros' },
      { id: 'sch-3', task: 'Flooring Installation', date: '2024-02-20', time: '7:00 AM', crew: 'Floor Masters' }
    ],
    messages: [
      { id: 'msg-1', from: 'Mike Foreman', subject: 'Weekly Progress Update', date: '2024-01-26', preview: 'Great progress this week! Cabinets are 60% installed...' }
    ],
    photos: [
      { id: 'photo-1', title: 'Before - Kitchen', date: '2024-01-01', url: IMAGES.construction.projects[0] },
      { id: 'photo-2', title: 'Demolition Complete', date: '2024-01-08', url: IMAGES.construction.site },
      { id: 'photo-3', title: 'New Electrical', date: '2024-01-15', url: IMAGES.construction.projects[1] }
    ]
  }
};

// ============================================
// AUTOMOTIVE FIXTURE
// ============================================

const AUTOMOTIVE_FIXTURE = {
  type: 'automotive',
  business: {
    name: "Mike's Auto Service",
    tagline: 'Honest Service, Fair Prices',
    description: 'Family-owned auto repair shop providing quality maintenance and repairs for all makes and models since 1995.',
    phone: '(555) 345-6789',
    email: 'service@mikesauto-demo.com',
    address: '800 Mechanic Lane',
    hours: {
      'Mon-Fri': '7:30 AM - 6:00 PM',
      'Saturday': '8:00 AM - 2:00 PM',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.automotive,
  services: [
    {
      category: 'Maintenance',
      items: [
        { id: 'mnt-1', name: 'Oil Change', price: 45, description: 'Conventional oil, filter, and inspection' },
        { id: 'mnt-2', name: 'Synthetic Oil Change', price: 85, description: 'Full synthetic with filter' },
        { id: 'mnt-3', name: 'Brake Inspection', price: 0, description: 'Free brake check' },
        { id: 'mnt-4', name: 'Tire Rotation', price: 25, description: 'Rotate and balance all four tires' }
      ]
    },
    {
      category: 'Repairs',
      items: [
        { id: 'rep-1', name: 'Brake Pads & Rotors', price: 350, description: 'Front or rear, parts and labor' },
        { id: 'rep-2', name: 'Timing Belt', price: 650, description: 'Belt replacement with inspection' },
        { id: 'rep-3', name: 'AC Service', price: 150, description: 'Recharge and leak check' },
        { id: 'rep-4', name: 'Diagnostic', price: 95, description: 'Computer diagnostic scan' }
      ]
    }
  ],
  team: [
    { id: 'mech-1', name: 'Mike Thompson', role: 'Owner/Master Technician', bio: 'ASE Master Certified, 30 years experience', image: IMAGES.automotive.team[0] },
    { id: 'mech-2', name: 'Carlos Rodriguez', role: 'Lead Technician', bio: 'Specializing in European vehicles', image: IMAGES.automotive.team[1] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Sarah M.', rating: 5, text: 'Finally found an honest mechanic! Mike explained everything clearly.' },
    { id: 'rev-2', name: 'Bob K.', rating: 5, text: 'Quick service, fair prices. Been coming here for 10 years.' }
  ],
  // Portal-specific data
  portalData: {
    vehicles: [
      { id: 'veh-1', year: 2022, make: 'Toyota', model: 'Camry', vin: '1HGBH41JXMN109186', mileage: 28500, lastService: '2024-01-10' },
      { id: 'veh-2', year: 2019, make: 'Honda', model: 'CR-V', vin: '5J6RW2H85KA023456', mileage: 52000, lastService: '2023-11-15' }
    ],
    serviceHistory: [
      { id: 'svc-1', date: '2024-01-10', vehicle: '2022 Toyota Camry', service: 'Oil Change & Tire Rotation', mileage: 28500, cost: 70 },
      { id: 'svc-2', date: '2023-11-15', vehicle: '2019 Honda CR-V', service: 'Brake Pads - Front', mileage: 50000, cost: 350 },
      { id: 'svc-3', date: '2023-08-20', vehicle: '2022 Toyota Camry', service: 'Synthetic Oil Change', mileage: 25000, cost: 85 }
    ],
    upcomingService: [
      { id: 'up-1', vehicle: '2022 Toyota Camry', service: 'Next Oil Change Due', dueMileage: 33500, dueDate: '2024-04-10' },
      { id: 'up-2', vehicle: '2019 Honda CR-V', service: 'Timing Belt Recommended', dueMileage: 60000, dueDate: '2024-06-01' }
    ],
    appointments: [
      { id: 'apt-1', vehicle: '2019 Honda CR-V', service: 'AC Service', date: '2024-02-01', time: '9:00 AM', status: 'Confirmed' }
    ],
    invoices: [
      { id: 'inv-1', number: 'INV-12345', date: '2024-01-10', amount: 70, status: 'Paid' },
      { id: 'inv-2', number: 'INV-12300', date: '2023-11-15', amount: 350, status: 'Paid' }
    ]
  },
  loyalty: {
    pointsPerDollar: 5,
    rewards: [
      { id: 'rew-1', name: 'Free Oil Change', points: 500, description: 'Conventional oil change' },
      { id: 'rew-2', name: '$25 Off Service', points: 400, description: 'Any service over $100' },
      { id: 'rew-3', name: 'Free Tire Rotation', points: 200, description: 'Includes balance' }
    ]
  }
};

// ============================================
// PET SERVICES FIXTURE
// ============================================

const PET_SERVICES_FIXTURE = {
  type: 'pet-services',
  business: {
    name: 'Happy Tails Pet Care',
    tagline: 'Where Every Pet is Family',
    description: 'Full-service pet care including grooming, boarding, daycare, and training. Your pets deserve the best!',
    phone: '(555) 456-7890',
    email: 'woof@happytails-demo.com',
    address: '500 Pet Paradise Lane',
    hours: {
      'Mon-Fri': '7:00 AM - 7:00 PM',
      'Saturday': '8:00 AM - 6:00 PM',
      'Sunday': '9:00 AM - 5:00 PM'
    }
  },
  images: IMAGES.petServices,
  services: [
    {
      category: 'Grooming',
      items: [
        { id: 'grm-1', name: 'Bath & Brush', price: 45, description: 'Bath, blow dry, brush out, nail trim' },
        { id: 'grm-2', name: 'Full Groom', price: 75, description: 'Bath, haircut, style, nails, ears' },
        { id: 'grm-3', name: 'Nail Trim', price: 15, description: 'Quick nail trim service' },
        { id: 'grm-4', name: 'De-shedding Treatment', price: 35, description: 'Reduce shedding up to 90%' }
      ]
    },
    {
      category: 'Boarding',
      items: [
        { id: 'brd-1', name: 'Standard Suite', price: 45, description: 'Per night, includes playtime' },
        { id: 'brd-2', name: 'Luxury Suite', price: 65, description: 'Per night, private room, extra play' },
        { id: 'brd-3', name: 'Cat Boarding', price: 30, description: 'Per night, quiet cat condos' }
      ]
    },
    {
      category: 'Daycare',
      items: [
        { id: 'day-1', name: 'Full Day', price: 35, description: 'All-day supervised play' },
        { id: 'day-2', name: 'Half Day', price: 22, description: 'Up to 5 hours' },
        { id: 'day-3', name: 'Daycare Package (10)', price: 300, description: '10 full days, save $50' }
      ]
    }
  ],
  team: [
    { id: 'tm-1', name: 'Jenny Wilson', role: 'Owner & Head Groomer', bio: 'Certified groomer with 15 years experience', image: IMAGES.petServices.team[0] },
    { id: 'tm-2', name: 'Mark Davis', role: 'Daycare Manager', bio: 'Dog trainer and behavior specialist', image: IMAGES.petServices.team[1] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Lucy the Golden Retriever', rating: 5, text: 'My human says I come home so happy and tired! - Lucy\'s Mom' },
    { id: 'rev-2', name: 'Max & Bella', rating: 5, text: 'Best grooming in town. My two pups always look amazing!' }
  ],
  // Portal-specific data
  portalData: {
    pets: [
      { id: 'pet-1', name: 'Max', species: 'Dog', breed: 'Golden Retriever', age: 4, weight: 70, vaccinations: 'Current', notes: 'Loves belly rubs!' },
      { id: 'pet-2', name: 'Luna', species: 'Cat', breed: 'Maine Coon', age: 2, weight: 12, vaccinations: 'Current', notes: 'Shy at first' }
    ],
    appointments: [
      { id: 'apt-1', pet: 'Max', service: 'Full Groom', date: '2024-02-01', time: '10:00 AM', status: 'Confirmed' },
      { id: 'apt-2', pet: 'Luna', service: 'Nail Trim', date: '2024-02-05', time: '2:00 PM', status: 'Scheduled' }
    ],
    reservations: [
      { id: 'res-1', pet: 'Max', service: 'Boarding - Luxury Suite', checkIn: '2024-02-15', checkOut: '2024-02-18', nights: 3, total: 195, status: 'Confirmed' }
    ],
    daycarePackage: {
      remaining: 7,
      total: 10,
      expiresDate: '2024-06-01'
    },
    vaccineRecords: [
      { id: 'vax-1', pet: 'Max', vaccine: 'Rabies', date: '2023-06-15', expires: '2024-06-15' },
      { id: 'vax-2', pet: 'Max', vaccine: 'DHPP', date: '2023-06-15', expires: '2024-06-15' },
      { id: 'vax-3', pet: 'Max', vaccine: 'Bordetella', date: '2023-12-01', expires: '2024-06-01' }
    ],
    serviceHistory: [
      { id: 'hist-1', date: '2024-01-15', pet: 'Max', service: 'Daycare', notes: 'Great day, played well with others' },
      { id: 'hist-2', date: '2024-01-10', pet: 'Luna', service: 'Full Groom', notes: 'Did great, very calm' }
    ]
  },
  loyalty: {
    pointsPerDollar: 10,
    rewards: [
      { id: 'rew-1', name: 'Free Nail Trim', points: 150, description: 'Complimentary nail trim' },
      { id: 'rew-2', name: 'Free Bath', points: 400, description: 'Basic bath and brush' },
      { id: 'rew-3', name: 'Free Daycare Day', points: 350, description: 'One full day of daycare' }
    ]
  }
};

// ============================================
// CONSULTING / AGENCY FIXTURE
// ============================================

const CONSULTING_FIXTURE = {
  type: 'consulting',
  business: {
    name: 'Apex Strategy Group',
    tagline: 'Driving Business Transformation',
    description: 'Management consulting firm helping businesses optimize operations, accelerate growth, and navigate digital transformation.',
    phone: '(555) 567-8901',
    email: 'engage@apexstrategy-demo.com',
    address: '1000 Executive Tower, Suite 2500',
    hours: {
      'Mon-Fri': '8:00 AM - 6:00 PM',
      'Saturday': 'By Appointment',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.consulting,
  services: [
    { id: 'svc-1', name: 'Strategic Planning', description: 'Long-term vision and roadmap development' },
    { id: 'svc-2', name: 'Digital Transformation', description: 'Technology-driven business evolution' },
    { id: 'svc-3', name: 'Operations Optimization', description: 'Efficiency and process improvement' },
    { id: 'svc-4', name: 'Market Entry Strategy', description: 'New market analysis and entry planning' },
    { id: 'svc-5', name: 'M&A Advisory', description: 'Merger and acquisition support' },
    { id: 'svc-6', name: 'Executive Coaching', description: 'Leadership development and coaching' }
  ],
  team: [
    { id: 'tm-1', name: 'Alexandra Chen', role: 'Managing Partner', bio: 'Former McKinsey, Harvard MBA', image: IMAGES.consulting.team[0] },
    { id: 'tm-2', name: 'James Morrison', role: 'Partner', bio: 'Digital transformation expert, 20 years experience', image: IMAGES.consulting.team[1] },
    { id: 'tm-3', name: 'Sarah Kim', role: 'Senior Consultant', bio: 'Operations and supply chain specialist', image: IMAGES.consulting.team[2] }
  ],
  caseStudies: [
    { id: 'cs-1', client: 'Fortune 500 Retailer', result: '35% increase in operational efficiency', industry: 'Retail' },
    { id: 'cs-2', client: 'Healthcare System', result: '$12M annual savings through process optimization', industry: 'Healthcare' },
    { id: 'cs-3', client: 'Tech Startup', result: 'Successful Series B funding and 3x growth', industry: 'Technology' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'CEO, Tech Company', rating: 5, text: 'Apex transformed our approach to digital. Game-changing results.' },
    { id: 'rev-2', name: 'COO, Manufacturing', rating: 5, text: 'Their operations expertise saved us millions. Highly recommend.' }
  ],
  // Portal-specific data for Client Portal
  portalData: {
    activeEngagements: [
      {
        id: 'eng-1',
        name: 'Digital Transformation Initiative',
        status: 'Active',
        phase: 'Implementation',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        lead: 'James Morrison',
        team: ['Sarah Kim', 'David Chen'],
        progress: 45,
        milestones: [
          { name: 'Discovery & Assessment', status: 'Complete' },
          { name: 'Strategy Development', status: 'Complete' },
          { name: 'Implementation Phase 1', status: 'In Progress' },
          { name: 'Implementation Phase 2', status: 'Upcoming' },
          { name: 'Change Management', status: 'Upcoming' }
        ]
      }
    ],
    deliverables: [
      { id: 'del-1', name: 'Assessment Report.pdf', engagement: 'Digital Transformation', date: '2024-01-15', status: 'Delivered' },
      { id: 'del-2', name: 'Strategy Presentation.pptx', engagement: 'Digital Transformation', date: '2024-02-01', status: 'Delivered' },
      { id: 'del-3', name: 'Implementation Roadmap.xlsx', engagement: 'Digital Transformation', date: '2024-02-15', status: 'In Review' }
    ],
    meetings: [
      { id: 'mtg-1', title: 'Weekly Status Update', date: '2024-02-01', time: '10:00 AM', attendees: ['James Morrison', 'Your Team'], type: 'Video Call' },
      { id: 'mtg-2', title: 'Steering Committee', date: '2024-02-15', time: '2:00 PM', attendees: ['Alexandra Chen', 'Executive Team'], type: 'In Person' }
    ],
    invoices: [
      { id: 'inv-1', number: 'APEX-2024-001', amount: 75000, status: 'Paid', date: '2024-01-15', description: 'Discovery Phase' },
      { id: 'inv-2', number: 'APEX-2024-002', amount: 50000, status: 'Pending', date: '2024-02-01', dueDate: '2024-02-28', description: 'Strategy Development' }
    ],
    kpis: [
      { name: 'Process Efficiency', baseline: 100, current: 125, target: 150, unit: '%' },
      { name: 'Digital Adoption', baseline: 30, current: 55, target: 90, unit: '%' },
      { name: 'Cost Savings', baseline: 0, current: 250000, target: 500000, unit: '$' }
    ],
    messages: [
      { id: 'msg-1', from: 'James Morrison', subject: 'Phase 1 Progress Update', date: '2024-01-28', preview: 'Great progress this month. Implementation is on track...' }
    ]
  }
};

// ============================================
// BARBERSHOP FIXTURE
// ============================================

const BARBERSHOP_FIXTURE = {
  type: 'barbershop',
  business: {
    name: 'Classic Cuts Barbershop',
    tagline: 'Traditional Craftsmanship, Modern Style',
    description: 'Premium men\'s grooming experience with expert barbers, hot towel shaves, and a relaxed atmosphere.',
    phone: '(555) 234-5678',
    email: 'appointments@classiccuts-demo.com',
    address: '456 Main Street',
    hours: {
      'Mon-Fri': '9:00 AM - 7:00 PM',
      'Saturday': '8:00 AM - 5:00 PM',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.salon,
  services: [
    { id: 'srv-1', name: 'Classic Haircut', price: 28, description: 'Traditional cut with hot towel finish', duration: '30 min' },
    { id: 'srv-2', name: 'Fade & Style', price: 35, description: 'Precision fade with styled finish', duration: '40 min' },
    { id: 'srv-3', name: 'Beard Trim', price: 18, description: 'Shape and detail your beard', duration: '20 min' },
    { id: 'srv-4', name: 'Hot Towel Shave', price: 35, description: 'Traditional straight razor shave with hot towels', duration: '45 min' },
    { id: 'srv-5', name: 'Haircut & Beard Combo', price: 45, description: 'Full haircut with beard trim', duration: '50 min' },
    { id: 'srv-6', name: 'Kids Haircut', price: 20, description: 'For ages 12 and under', duration: '25 min' },
    { id: 'srv-7', name: 'The Works', price: 65, description: 'Haircut, shave, facial, and hot towel treatment', duration: '75 min' },
    { id: 'srv-8', name: 'Grey Blending', price: 25, description: 'Natural-looking grey coverage', duration: '30 min' }
  ],
  team: [
    { id: 'brb-1', name: 'Marcus Johnson', role: 'Master Barber', bio: '15 years experience, specializes in classic cuts', image: IMAGES.salon.team?.[0] },
    { id: 'brb-2', name: 'Tony Ramirez', role: 'Senior Barber', bio: 'Fade specialist with 10 years experience', image: IMAGES.salon.team?.[1] },
    { id: 'brb-3', name: 'Derek Williams', role: 'Barber', bio: 'Young talent, expert in modern styles', image: null }
  ],
  testimonials: [
    { id: 'rev-1', name: 'James T.', rating: 5, text: 'Best haircut I\'ve had in years. Marcus really knows his craft.' },
    { id: 'rev-2', name: 'Mike R.', rating: 5, text: 'Great atmosphere, cold beers, and an amazing hot towel shave.' },
    { id: 'rev-3', name: 'David K.', rating: 5, text: 'Finally found my go-to barbershop. These guys are pros.' }
  ]
};

// ============================================
// BAKERY FIXTURE
// ============================================

const BAKERY_FIXTURE = {
  type: 'bakery',
  business: {
    name: 'Sweet Rise Bakery',
    tagline: 'Baked Fresh Daily',
    description: 'Artisan bakery specializing in handcrafted breads, pastries, and custom cakes made with locally sourced ingredients.',
    phone: '(555) 345-6789',
    email: 'orders@sweetrise-demo.com',
    address: '789 Baker Street',
    hours: {
      'Tue-Fri': '6:00 AM - 6:00 PM',
      'Saturday': '7:00 AM - 5:00 PM',
      'Sunday': '7:00 AM - 2:00 PM',
      'Monday': 'Closed'
    }
  },
  images: IMAGES.cafe,
  menu: [
    { id: 'brd-1', category: 'Artisan Breads', name: 'Sourdough Loaf', price: 8.50, description: 'Traditional 24-hour fermented sourdough' },
    { id: 'brd-2', category: 'Artisan Breads', name: 'French Baguette', price: 4.50, description: 'Crispy crust, soft interior' },
    { id: 'brd-3', category: 'Artisan Breads', name: 'Multigrain Loaf', price: 7.50, description: 'Seven grains and seeds' },
    { id: 'brd-4', category: 'Artisan Breads', name: 'Ciabatta', price: 5.50, description: 'Italian-style rustic bread' },
    { id: 'pst-1', category: 'Pastries', name: 'Butter Croissant', price: 4.25, description: 'Flaky, buttery, French-style' },
    { id: 'pst-2', category: 'Pastries', name: 'Pain au Chocolat', price: 4.75, description: 'Croissant with dark chocolate' },
    { id: 'pst-3', category: 'Pastries', name: 'Almond Croissant', price: 5.25, description: 'Filled with almond cream, topped with sliced almonds' },
    { id: 'pst-4', category: 'Pastries', name: 'Cinnamon Roll', price: 4.50, description: 'Classic with cream cheese frosting' },
    { id: 'pst-5', category: 'Pastries', name: 'Danish', price: 4.25, description: 'Fruit-filled puff pastry' },
    { id: 'cke-1', category: 'Cakes & Desserts', name: 'Slice of Cake', price: 6.50, description: 'Daily selection - ask for today\'s flavors' },
    { id: 'cke-2', category: 'Cakes & Desserts', name: 'Brownie', price: 3.75, description: 'Rich, fudgy chocolate brownie' },
    { id: 'cke-3', category: 'Cakes & Desserts', name: 'Fruit Tart', price: 5.50, description: 'Seasonal fruit on vanilla custard' }
  ],
  customCakes: [
    { id: 'cc-1', name: 'Birthday Cake', startingPrice: 45, description: '6" round, serves 8-10', leadTime: '48 hours' },
    { id: 'cc-2', name: 'Wedding Cake', startingPrice: 350, description: 'Custom tiered cakes, consultation required', leadTime: '2 weeks' },
    { id: 'cc-3', name: 'Cupcake Dozen', startingPrice: 36, description: '12 decorated cupcakes', leadTime: '24 hours' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Sarah M.', rating: 5, text: 'The best croissants I\'ve ever had! So buttery and flaky.' },
    { id: 'rev-2', name: 'John P.', rating: 5, text: 'Their sourdough is incredible. We buy it every weekend.' },
    { id: 'rev-3', name: 'Emily R.', rating: 5, text: 'They made our wedding cake and it was absolutely beautiful and delicious!' }
  ]
};

// ============================================
// CLEANING SERVICE FIXTURE
// ============================================

const CLEANING_FIXTURE = {
  type: 'cleaning',
  business: {
    name: 'Sparkle Clean Pro',
    tagline: 'Your Trusted Cleaning Experts',
    description: 'Professional residential and commercial cleaning services. Eco-friendly products, background-checked staff, satisfaction guaranteed.',
    phone: '(555) 456-7890',
    email: 'book@sparkleclean-demo.com',
    address: 'Serving the Greater Metro Area',
    hours: {
      'Mon-Fri': '7:00 AM - 7:00 PM',
      'Saturday': '8:00 AM - 4:00 PM',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.cleaning,
  services: [
    { id: 'srv-1', name: 'Standard Cleaning', price: 150, description: 'Complete home cleaning - dusting, vacuuming, mopping, bathrooms, kitchen', duration: '2-3 hours', priceNote: 'Starting at' },
    { id: 'srv-2', name: 'Deep Cleaning', price: 250, description: 'Intensive cleaning including inside appliances, baseboards, windows', duration: '4-6 hours', priceNote: 'Starting at' },
    { id: 'srv-3', name: 'Move In/Out Cleaning', price: 300, description: 'Thorough cleaning for empty homes, ready for new occupants', duration: '5-8 hours', priceNote: 'Starting at' },
    { id: 'srv-4', name: 'Office Cleaning', price: 200, description: 'Commercial space cleaning, flexible scheduling', duration: '2-4 hours', priceNote: 'Starting at' },
    { id: 'srv-5', name: 'Post-Construction', price: 400, description: 'Debris removal, dust cleaning, surface sanitization', duration: '6-8 hours', priceNote: 'Starting at' },
    { id: 'srv-6', name: 'Recurring Service', price: 120, description: 'Weekly or bi-weekly maintenance cleaning', duration: '2-3 hours', priceNote: 'Per visit from' }
  ],
  packages: [
    { id: 'pkg-1', name: 'Basic Package', price: 120, frequency: 'Weekly', features: ['Kitchen cleaning', 'Bathroom sanitization', 'Vacuuming & mopping', 'Dusting surfaces'] },
    { id: 'pkg-2', name: 'Premium Package', price: 180, frequency: 'Weekly', features: ['All Basic features', 'Inside fridge & oven', 'Window cleaning', 'Laundry & bed making'] },
    { id: 'pkg-3', name: 'Ultimate Package', price: 250, frequency: 'Weekly', features: ['All Premium features', 'Organizing', 'Closet cleaning', 'Garage tidying'] }
  ],
  addOns: [
    { id: 'add-1', name: 'Inside Fridge', price: 35 },
    { id: 'add-2', name: 'Inside Oven', price: 45 },
    { id: 'add-3', name: 'Window Cleaning', price: 8, priceNote: 'per window' },
    { id: 'add-4', name: 'Laundry', price: 25 },
    { id: 'add-5', name: 'Organizing', price: 50, priceNote: 'per hour' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Jennifer L.', rating: 5, text: 'They transformed my home! So thorough and professional.' },
    { id: 'rev-2', name: 'Robert M.', rating: 5, text: 'Use them weekly for our office. Always reliable and detailed.' },
    { id: 'rev-3', name: 'Amanda K.', rating: 5, text: 'Their move-out cleaning got us our full deposit back!' }
  ]
};

// ============================================
// ELECTRICIAN FIXTURE
// ============================================

const ELECTRICIAN_FIXTURE = {
  type: 'electrician',
  business: {
    name: 'PowerPro Electric',
    tagline: 'Reliable Electrical Solutions',
    description: 'Licensed and insured electrical contractors serving residential and commercial clients. Available 24/7 for emergencies.',
    phone: '(555) 567-8901',
    email: 'service@powerpro-demo.com',
    address: 'Serving the Greater Metro Area',
    license: 'License #EC-12345',
    hours: {
      'Mon-Fri': '7:00 AM - 6:00 PM',
      'Saturday': '8:00 AM - 2:00 PM',
      'Emergency': '24/7 Available'
    }
  },
  images: IMAGES.construction,
  services: [
    { id: 'srv-1', name: 'Service Call', price: 89, description: 'Diagnostic visit and minor repairs', priceNote: 'Starting at' },
    { id: 'srv-2', name: 'Outlet Installation', price: 150, description: 'New outlet or switch installation', priceNote: 'Per outlet' },
    { id: 'srv-3', name: 'Panel Upgrade', price: 1800, description: '100-200 amp panel upgrade', priceNote: 'Starting at' },
    { id: 'srv-4', name: 'Ceiling Fan Install', price: 175, description: 'Installation with existing wiring', priceNote: 'Starting at' },
    { id: 'srv-5', name: 'Recessed Lighting', price: 200, description: 'LED can light installation', priceNote: 'Per light' },
    { id: 'srv-6', name: 'EV Charger Install', price: 800, description: 'Level 2 charger installation', priceNote: 'Starting at' },
    { id: 'srv-7', name: 'Whole House Surge', price: 450, description: 'Surge protection for entire home', priceNote: 'Installed' },
    { id: 'srv-8', name: 'Generator Install', price: 3500, description: 'Standby generator installation', priceNote: 'Starting at' }
  ],
  emergencyServices: [
    { id: 'emg-1', name: 'Power Outage Diagnosis', price: 150, description: '24/7 emergency response' },
    { id: 'emg-2', name: 'Electrical Fire Safety', price: 175, description: 'Immediate safety inspection' },
    { id: 'emg-3', name: 'Exposed Wiring Repair', price: 200, description: 'Emergency hazard repair' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Tom H.', rating: 5, text: 'Upgraded our panel in one day. Professional and clean work.' },
    { id: 'rev-2', name: 'Linda S.', rating: 5, text: 'Came out at 10pm for an emergency. Fixed it fast and fair price.' },
    { id: 'rev-3', name: 'Mark D.', rating: 5, text: 'Installed 12 recessed lights. House looks amazing now.' }
  ]
};

// ============================================
// PLUMBER FIXTURE
// ============================================

const PLUMBER_FIXTURE = {
  type: 'plumber',
  business: {
    name: 'FlowRight Plumbing',
    tagline: 'Plumbing Done Right, Every Time',
    description: 'Full-service plumbing company handling everything from minor repairs to major installations. Licensed, bonded, and insured.',
    phone: '(555) 678-9012',
    email: 'service@flowright-demo.com',
    address: 'Serving the Greater Metro Area',
    license: 'License #PL-67890',
    hours: {
      'Mon-Fri': '7:00 AM - 6:00 PM',
      'Saturday': '8:00 AM - 4:00 PM',
      'Emergency': '24/7 Available'
    }
  },
  images: IMAGES.construction,
  services: [
    { id: 'srv-1', name: 'Service Call', price: 79, description: 'Diagnosis and minor repairs', priceNote: 'Starting at' },
    { id: 'srv-2', name: 'Drain Cleaning', price: 150, description: 'Professional drain snaking', priceNote: 'Starting at' },
    { id: 'srv-3', name: 'Toilet Repair', price: 125, description: 'Fix running, leaking, or clogged toilets', priceNote: 'Starting at' },
    { id: 'srv-4', name: 'Water Heater Install', price: 1200, description: 'Tank or tankless installation', priceNote: 'Starting at' },
    { id: 'srv-5', name: 'Faucet Installation', price: 175, description: 'Kitchen or bathroom faucet', priceNote: 'Starting at' },
    { id: 'srv-6', name: 'Garbage Disposal', price: 250, description: 'New disposal installation', priceNote: 'Installed' },
    { id: 'srv-7', name: 'Pipe Repair', price: 200, description: 'Leak repair and pipe replacement', priceNote: 'Starting at' },
    { id: 'srv-8', name: 'Sewer Line Service', price: 350, description: 'Camera inspection and cleaning', priceNote: 'Starting at' },
    { id: 'srv-9', name: 'Repiping', price: 4500, description: 'Whole house repiping', priceNote: 'Starting at' }
  ],
  emergencyServices: [
    { id: 'emg-1', name: 'Burst Pipe Repair', price: 200, description: '24/7 emergency response', priceNote: 'Starting at' },
    { id: 'emg-2', name: 'Sewer Backup', price: 250, description: 'Emergency sewer service', priceNote: 'Starting at' },
    { id: 'emg-3', name: 'No Hot Water', price: 175, description: 'Same-day water heater repair', priceNote: 'Starting at' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Susan W.', rating: 5, text: 'Fixed our leak in under an hour. Fair pricing, great work.' },
    { id: 'rev-2', name: 'Jim B.', rating: 5, text: 'They came at midnight for a burst pipe. Saved our home from flooding.' },
    { id: 'rev-3', name: 'Karen T.', rating: 5, text: 'Installed a new tankless water heater. Love the endless hot water!' }
  ]
};

// ============================================
// YOGA STUDIO FIXTURE
// ============================================

const YOGA_FIXTURE = {
  type: 'yoga',
  business: {
    name: 'Harmony Yoga Studio',
    tagline: 'Find Your Balance',
    description: 'A welcoming space for all levels to explore yoga, meditation, and mindful movement. Certified instructors, heated and non-heated classes.',
    phone: '(555) 789-0123',
    email: 'namaste@harmonyyoga-demo.com',
    address: '123 Serenity Lane, Suite 200',
    hours: {
      'Mon-Fri': '6:00 AM - 9:00 PM',
      'Saturday': '7:00 AM - 6:00 PM',
      'Sunday': '8:00 AM - 4:00 PM'
    }
  },
  images: IMAGES.fitness,
  classes: [
    { id: 'cls-1', name: 'Vinyasa Flow', duration: '60 min', level: 'All Levels', description: 'Dynamic flowing sequences linking breath and movement' },
    { id: 'cls-2', name: 'Hot Yoga', duration: '75 min', level: 'Intermediate', description: 'Heated room, traditional 26-posture series' },
    { id: 'cls-3', name: 'Yin Yoga', duration: '60 min', level: 'All Levels', description: 'Deep stretching, long-held poses for flexibility' },
    { id: 'cls-4', name: 'Power Yoga', duration: '60 min', level: 'Intermediate/Advanced', description: 'Athletic, strength-building practice' },
    { id: 'cls-5', name: 'Gentle Yoga', duration: '60 min', level: 'Beginner', description: 'Slow-paced, accessible to all bodies' },
    { id: 'cls-6', name: 'Restorative', duration: '75 min', level: 'All Levels', description: 'Deeply relaxing with props support' },
    { id: 'cls-7', name: 'Meditation', duration: '30 min', level: 'All Levels', description: 'Guided meditation and breathwork' },
    { id: 'cls-8', name: 'Prenatal Yoga', duration: '60 min', level: 'All Trimesters', description: 'Safe practice for expecting mothers' }
  ],
  memberships: [
    { id: 'mem-1', name: 'Drop-In Class', price: 25, period: 'single', features: ['One class'] },
    { id: 'mem-2', name: '10-Class Pack', price: 200, period: 'pack', features: ['10 classes', 'Valid 3 months', 'Mat rental included'] },
    { id: 'mem-3', name: 'Monthly Unlimited', price: 129, period: 'month', features: ['Unlimited classes', 'Mat storage', '10% retail discount'] },
    { id: 'mem-4', name: 'Annual Unlimited', price: 1199, period: 'year', features: ['Unlimited classes', 'Free workshops', '20% retail discount', 'Guest passes'] }
  ],
  newStudentOffer: {
    name: 'New Student Special',
    price: 49,
    description: '2 weeks unlimited classes',
    features: ['Unlimited classes for 14 days', 'One free mat rental', 'Studio tour and orientation']
  },
  instructors: [
    { id: 'ins-1', name: 'Maya Chen', specialty: 'Vinyasa, Meditation', bio: 'RYT-500, 12 years teaching experience', image: IMAGES.fitness.trainers?.[0] },
    { id: 'ins-2', name: 'David Martinez', specialty: 'Hot Yoga, Power Yoga', bio: 'Former athlete, focus on strength and flexibility', image: IMAGES.fitness.trainers?.[1] },
    { id: 'ins-3', name: 'Sarah Johnson', specialty: 'Yin, Restorative', bio: 'Trauma-informed yoga specialist', image: null }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Jennifer R.', rating: 5, text: 'This studio changed my life. The instructors are amazing and so supportive.' },
    { id: 'rev-2', name: 'Michael T.', rating: 5, text: 'Best hot yoga in the city. Clean studio, great community.' },
    { id: 'rev-3', name: 'Lisa M.', rating: 5, text: 'Started as a complete beginner and now I practice 4x a week!' }
  ]
};

// ============================================
// SAAS / SOFTWARE FIXTURE
// ============================================

const SAAS_FIXTURE = {
  type: 'saas',
  business: {
    name: 'CloudFlow',
    tagline: 'Streamline Your Workflow',
    description: 'All-in-one project management and collaboration platform for modern teams. Automate tasks, track progress, ship faster.',
    email: 'hello@cloudflow-demo.com',
    website: 'www.cloudflow-demo.com'
  },
  images: IMAGES.professional,
  features: [
    { id: 'feat-1', name: 'Task Management', description: 'Organize tasks with boards, lists, and timelines', icon: 'CheckSquare' },
    { id: 'feat-2', name: 'Team Collaboration', description: 'Real-time chat, comments, and file sharing', icon: 'Users' },
    { id: 'feat-3', name: 'Automation', description: 'Automate repetitive tasks with custom rules', icon: 'Zap' },
    { id: 'feat-4', name: 'Reporting', description: 'Visual dashboards and custom reports', icon: 'BarChart' },
    { id: 'feat-5', name: 'Integrations', description: 'Connect with 100+ popular tools', icon: 'Plug' },
    { id: 'feat-6', name: 'Mobile Apps', description: 'iOS and Android apps for work on the go', icon: 'Smartphone' }
  ],
  pricing: [
    { id: 'plan-1', name: 'Free', price: 0, period: 'month', description: 'For individuals', features: ['Up to 10 projects', 'Basic task management', '1 GB storage', 'Email support'], cta: 'Get Started' },
    { id: 'plan-2', name: 'Pro', price: 12, period: 'month', description: 'For growing teams', features: ['Unlimited projects', 'Advanced automation', '100 GB storage', 'Priority support', 'Custom fields', 'Time tracking'], popular: true, cta: 'Start Free Trial' },
    { id: 'plan-3', name: 'Business', price: 24, period: 'month', description: 'For organizations', features: ['Everything in Pro', 'Advanced security', 'Unlimited storage', 'SSO/SAML', 'API access', 'Dedicated success manager'], cta: 'Contact Sales' },
    { id: 'plan-4', name: 'Enterprise', price: null, period: 'custom', description: 'For large teams', features: ['Everything in Business', 'Custom contracts', 'On-premise option', 'SLA guarantee', 'Custom integrations'], cta: 'Contact Sales' }
  ],
  stats: [
    { value: '50,000+', label: 'Teams using CloudFlow' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '4.8/5', label: 'Customer rating' },
    { value: '24/7', label: 'Support available' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Sarah Chen', company: 'TechStartup Inc', role: 'CTO', rating: 5, text: 'CloudFlow replaced 5 different tools for us. Our team is 40% more productive.' },
    { id: 'rev-2', name: 'Marcus Johnson', company: 'DesignCo', role: 'Creative Director', rating: 5, text: 'The automation features save us hours every week. Game changer.' },
    { id: 'rev-3', name: 'Emily Rodriguez', company: 'AgencyPro', role: 'Project Manager', rating: 5, text: 'Best project management tool we\'ve used. The client loves the transparency.' }
  ],
  integrations: ['Slack', 'Google Workspace', 'Microsoft 365', 'GitHub', 'Figma', 'Zoom', 'Salesforce', 'Jira']
};

// ============================================
// BAR / NIGHTCLUB FIXTURE
// ============================================

const BAR_FIXTURE = {
  type: 'bar',
  business: {
    name: 'The Velvet Lounge',
    tagline: 'Craft Cocktails & Good Vibes',
    description: 'Upscale cocktail bar featuring handcrafted drinks, premium spirits, and live entertainment in an intimate setting.',
    phone: '(555) 234-5678',
    email: 'reservations@velvetlounge-demo.com',
    address: '456 Downtown Ave',
    hours: {
      'Mon-Thu': '5:00 PM - 12:00 AM',
      'Fri-Sat': '5:00 PM - 2:00 AM',
      'Sunday': '6:00 PM - 11:00 PM'
    }
  },
  images: IMAGES.restaurant,
  menu: [
    { id: 'sig-1', category: 'Signature Cocktails', name: 'Velvet Sunset', price: 16, description: 'Bourbon, blood orange, honey, aromatic bitters' },
    { id: 'sig-2', category: 'Signature Cocktails', name: 'Midnight Garden', price: 17, description: 'Gin, elderflower, cucumber, fresh mint' },
    { id: 'sig-3', category: 'Signature Cocktails', name: 'Smoky Manhattan', price: 18, description: 'Rye whiskey, sweet vermouth, applewood smoke' },
    { id: 'sig-4', category: 'Signature Cocktails', name: 'Spicy Margarita', price: 15, description: 'Tequila, fresh lime, jalapeño, agave' },
    { id: 'cls-1', category: 'Classic Cocktails', name: 'Old Fashioned', price: 14, description: 'Bourbon, sugar, Angostura bitters' },
    { id: 'cls-2', category: 'Classic Cocktails', name: 'Martini', price: 14, description: 'Gin or vodka, dry vermouth, olive or twist' },
    { id: 'cls-3', category: 'Classic Cocktails', name: 'Negroni', price: 14, description: 'Gin, Campari, sweet vermouth' },
    { id: 'wne-1', category: 'Wine & Beer', name: 'Wine by the Glass', price: 12, description: 'Rotating selection, ask your server' },
    { id: 'wne-2', category: 'Wine & Beer', name: 'Craft Beer', price: 8, description: 'Local and imported selections' },
    { id: 'bte-1', category: 'Small Plates', name: 'Truffle Fries', price: 12, description: 'Parmesan, truffle oil, fresh herbs' },
    { id: 'bte-2', category: 'Small Plates', name: 'Charcuterie Board', price: 24, description: 'Cured meats, artisan cheeses, accompaniments' }
  ],
  happyHour: {
    days: 'Monday - Friday',
    hours: '5:00 PM - 7:00 PM',
    specials: ['$10 Select Cocktails', '$6 Draft Beers', '$8 Wine', '50% Off Small Plates']
  },
  events: [
    { day: 'Thursday', name: 'Live Jazz Night', time: '8:00 PM' },
    { day: 'Friday', name: 'DJ & Dancing', time: '10:00 PM' },
    { day: 'Saturday', name: 'Live Band', time: '9:00 PM' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Amanda L.', rating: 5, text: 'Best cocktails in the city! The Midnight Garden is incredible.' },
    { id: 'rev-2', name: 'Chris M.', rating: 5, text: 'Great vibe, amazing drinks, perfect for date night.' }
  ]
};

// ============================================
// CHIROPRACTIC FIXTURE
// ============================================

const CHIROPRACTIC_FIXTURE = {
  type: 'chiropractic',
  business: {
    name: 'Align Chiropractic',
    tagline: 'Natural Healing, Lasting Relief',
    description: 'Comprehensive chiropractic care for pain relief, injury recovery, and wellness. Evidence-based treatments in a caring environment.',
    phone: '(555) 345-6789',
    email: 'care@alignchiro-demo.com',
    address: '789 Health Center Blvd, Suite 100',
    hours: {
      'Mon/Wed/Fri': '8:00 AM - 6:00 PM',
      'Tue/Thu': '10:00 AM - 7:00 PM',
      'Saturday': '9:00 AM - 1:00 PM',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.healthcare,
  services: [
    { id: 'srv-1', name: 'Initial Consultation', price: 75, description: 'Comprehensive exam, X-rays if needed, treatment plan', duration: '60 min' },
    { id: 'srv-2', name: 'Chiropractic Adjustment', price: 65, description: 'Spinal manipulation and joint adjustments', duration: '20-30 min' },
    { id: 'srv-3', name: 'Spinal Decompression', price: 85, description: 'Non-surgical treatment for disc issues', duration: '30 min' },
    { id: 'srv-4', name: 'Massage Therapy', price: 80, description: 'Therapeutic massage for muscle tension', duration: '60 min' },
    { id: 'srv-5', name: 'Sports Injury Treatment', price: 75, description: 'Specialized care for athletic injuries', duration: '45 min' },
    { id: 'srv-6', name: 'Prenatal Chiropractic', price: 70, description: 'Safe, gentle care for expecting mothers', duration: '30 min' },
    { id: 'srv-7', name: 'Pediatric Chiropractic', price: 45, description: 'Gentle adjustments for children', duration: '20 min' },
    { id: 'srv-8', name: 'Wellness Package', price: 199, description: '4 adjustments per month', priceNote: 'Monthly' }
  ],
  conditions: ['Back Pain', 'Neck Pain', 'Headaches & Migraines', 'Sciatica', 'Sports Injuries', 'Whiplash', 'Posture Issues', 'Pregnancy Discomfort'],
  team: [
    { id: 'dr-1', name: 'Dr. Michael Chen', role: 'Chiropractor, DC', bio: '15 years experience, sports medicine certified', image: IMAGES.healthcare.team?.[0] },
    { id: 'dr-2', name: 'Dr. Sarah Williams', role: 'Chiropractor, DC', bio: 'Prenatal and pediatric specialist', image: IMAGES.healthcare.team?.[1] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Robert K.', rating: 5, text: 'After years of back pain, Dr. Chen finally gave me relief. Life-changing!' },
    { id: 'rev-2', name: 'Maria S.', rating: 5, text: 'The prenatal care helped me have a much more comfortable pregnancy.' }
  ]
};

// ============================================
// PHOTOGRAPHY FIXTURE
// ============================================

const PHOTOGRAPHY_FIXTURE = {
  type: 'photography',
  business: {
    name: 'Capture Moments Studio',
    tagline: 'Telling Your Story Through Images',
    description: 'Professional photography for weddings, portraits, events, and commercial projects. Creating timeless images that capture your most precious moments.',
    phone: '(555) 456-7890',
    email: 'hello@capturemoments-demo.com',
    address: '321 Creative Way, Studio 5',
    hours: {
      'By Appointment': 'Mon-Sat',
      'Studio Hours': '10:00 AM - 6:00 PM'
    }
  },
  images: IMAGES.professional,
  packages: [
    { id: 'pkg-1', name: 'Portrait Session', price: 250, description: '1-hour session, 20 edited images, online gallery', includes: ['1 hour session', '20 edited digital images', 'Online gallery', 'Print release'] },
    { id: 'pkg-2', name: 'Family Session', price: 350, description: '90-min session for up to 6 people', includes: ['90 minute session', '30 edited digital images', 'Online gallery', 'Print release', '1 8x10 print'] },
    { id: 'pkg-3', name: 'Headshot Package', price: 200, description: 'Professional headshots, 3 looks', includes: ['45 minute session', '3 outfit changes', '10 edited images', 'Retouching included'] },
    { id: 'pkg-4', name: 'Event Coverage', price: 500, description: 'Up to 4 hours of event photography', includes: ['4 hours coverage', '100+ edited images', 'Online gallery', 'Quick turnaround'], priceNote: 'Starting at' },
    { id: 'pkg-5', name: 'Wedding - Essential', price: 2500, description: '6 hours coverage, second shooter', includes: ['6 hours coverage', 'Second photographer', '400+ edited images', 'Engagement session', 'Online gallery'] },
    { id: 'pkg-6', name: 'Wedding - Premium', price: 4500, description: 'Full day coverage, album included', includes: ['10 hours coverage', 'Second photographer', '600+ edited images', 'Engagement session', 'Premium album', 'Canvas print'] }
  ],
  addOns: [
    { id: 'add-1', name: 'Extra Hour', price: 150 },
    { id: 'add-2', name: 'Rush Editing', price: 100, description: '48-hour turnaround' },
    { id: 'add-3', name: 'Photo Album', price: 300, description: '20-page premium album' },
    { id: 'add-4', name: 'Canvas Print 16x20', price: 175 }
  ],
  portfolio: ['Weddings', 'Portraits', 'Family', 'Events', 'Commercial', 'Headshots'],
  testimonials: [
    { id: 'rev-1', name: 'Jennifer & Mark', rating: 5, text: 'Our wedding photos are absolutely stunning! They captured every special moment.' },
    { id: 'rev-2', name: 'Lisa T.', rating: 5, text: 'The family session was so fun and the photos turned out beautiful.' }
  ]
};

// ============================================
// WEDDING PLANNER FIXTURE
// ============================================

const WEDDING_FIXTURE = {
  type: 'wedding',
  business: {
    name: 'Blissful Beginnings',
    tagline: 'Creating Your Perfect Day',
    description: 'Full-service wedding planning and coordination. From intimate elopements to grand celebrations, we bring your vision to life.',
    phone: '(555) 567-8901',
    email: 'love@blissfulbeginnings-demo.com',
    address: '555 Romance Lane, Suite 200',
    hours: {
      'Consultations': 'By Appointment',
      'Office': 'Tue-Sat 10 AM - 6 PM'
    }
  },
  images: IMAGES.professional,
  packages: [
    { id: 'pkg-1', name: 'Day-Of Coordination', price: 1500, description: 'Let us handle your wedding day', includes: ['Final vendor confirmations', 'Rehearsal coordination', 'Wedding day timeline', '10 hours day-of coverage', 'Emergency kit'] },
    { id: 'pkg-2', name: 'Partial Planning', price: 3500, description: 'Planning support where you need it', includes: ['Unlimited consultations', 'Vendor recommendations', 'Budget management', 'Design assistance', 'Day-of coordination'], popular: true },
    { id: 'pkg-3', name: 'Full Planning', price: 6500, description: 'Complete wedding planning experience', includes: ['Everything in Partial', 'Venue scouting', 'Full vendor management', 'Design & styling', 'Guest management', 'Unlimited hours'], priceNote: 'Starting at' },
    { id: 'pkg-4', name: 'Luxury Experience', price: 12000, description: 'White-glove service for your dream wedding', includes: ['Dedicated planning team', 'Destination coordination', 'Custom design elements', 'VIP vendor access', 'Welcome events', 'Honeymoon planning'], priceNote: 'Starting at' }
  ],
  services: ['Venue Selection', 'Vendor Management', 'Budget Planning', 'Design & Decor', 'Timeline Creation', 'Guest Management', 'Destination Weddings', 'Elopement Planning'],
  testimonials: [
    { id: 'rev-1', name: 'Ashley & Ryan', rating: 5, text: 'They made our dream wedding a reality. Every detail was perfect!' },
    { id: 'rev-2', name: 'Nicole & James', rating: 5, text: 'Worth every penny. We actually enjoyed our wedding day stress-free!' }
  ]
};

// ============================================
// NONPROFIT FIXTURE
// ============================================

const NONPROFIT_FIXTURE = {
  type: 'nonprofit',
  business: {
    name: 'Hope Foundation',
    tagline: 'Building Brighter Futures',
    description: 'Community-focused nonprofit dedicated to education, hunger relief, and family support services. Together, we make a difference.',
    phone: '(555) 678-9012',
    email: 'info@hopefoundation-demo.org',
    address: '100 Community Way',
    ein: '12-3456789',
    hours: {
      'Office': 'Mon-Fri 9 AM - 5 PM',
      'Food Pantry': 'Tue/Thu 10 AM - 2 PM',
      'Tutoring': 'Mon-Thu 3 PM - 7 PM'
    }
  },
  images: IMAGES.professional,
  programs: [
    { id: 'prg-1', name: 'Youth Education Program', description: 'After-school tutoring and mentorship for K-12 students', impact: '500+ students served annually' },
    { id: 'prg-2', name: 'Community Food Pantry', description: 'Weekly food distribution for families in need', impact: '1,000+ families fed monthly' },
    { id: 'prg-3', name: 'Family Support Services', description: 'Emergency assistance, counseling, and resources', impact: '200+ families helped annually' },
    { id: 'prg-4', name: 'Scholarship Fund', description: 'College scholarships for local students', impact: '$50,000 awarded yearly' }
  ],
  impactStats: [
    { value: '10,000+', label: 'Lives Impacted' },
    { value: '$2.5M', label: 'Programs Funded' },
    { value: '500+', label: 'Active Volunteers' },
    { value: '15', label: 'Years Serving' }
  ],
  donationLevels: [
    { amount: 25, impact: 'Provides school supplies for one student' },
    { amount: 50, impact: 'Feeds a family of four for one week' },
    { amount: 100, impact: 'Sponsors one month of tutoring' },
    { amount: 500, impact: 'Supports a family in crisis' },
    { amount: 1000, impact: 'Funds a semester scholarship' }
  ],
  volunteerOpportunities: ['Tutoring', 'Food Pantry', 'Event Support', 'Administrative', 'Fundraising', 'Board Membership'],
  testimonials: [
    { id: 'rev-1', name: 'Maria G.', text: 'Hope Foundation helped my family when we needed it most. Now I volunteer every week.' },
    { id: 'rev-2', name: 'James T.', text: 'The tutoring program changed my son\'s life. He\'s now thriving in school.' }
  ]
};

// ============================================
// CHURCH FIXTURE
// ============================================

const CHURCH_FIXTURE = {
  type: 'church',
  business: {
    name: 'Grace Community Church',
    tagline: 'A Place to Belong',
    description: 'A welcoming community of faith dedicated to worship, growth, and service. Everyone is welcome here.',
    phone: '(555) 789-0123',
    email: 'hello@gracecommunity-demo.org',
    address: '1000 Faith Street',
    hours: {
      'Sunday Worship': '9:00 AM & 11:00 AM',
      'Wednesday Bible Study': '7:00 PM',
      'Office Hours': 'Mon-Fri 9 AM - 4 PM'
    }
  },
  images: IMAGES.professional,
  services: [
    { id: 'srv-1', name: 'Sunday Worship', time: '9:00 AM', description: 'Traditional service with choir' },
    { id: 'srv-2', name: 'Sunday Worship', time: '11:00 AM', description: 'Contemporary service with band' },
    { id: 'srv-3', name: 'Wednesday Bible Study', time: '7:00 PM', description: 'Midweek study and prayer' },
    { id: 'srv-4', name: 'Youth Group', time: 'Sundays 6 PM', description: 'For students grades 6-12' }
  ],
  ministries: [
    { id: 'min-1', name: 'Children\'s Ministry', description: 'Sunday school and activities for ages 0-11' },
    { id: 'min-2', name: 'Youth Ministry', description: 'Programs for middle and high school students' },
    { id: 'min-3', name: 'Small Groups', description: 'Weekly home groups for connection and growth' },
    { id: 'min-4', name: 'Outreach', description: 'Local and global mission opportunities' },
    { id: 'min-5', name: 'Worship Arts', description: 'Choir, band, and creative arts teams' },
    { id: 'min-6', name: 'Care Ministry', description: 'Support for those in need' }
  ],
  staff: [
    { id: 'stf-1', name: 'Pastor David Miller', role: 'Senior Pastor', bio: 'Leading our community since 2015' },
    { id: 'stf-2', name: 'Pastor Sarah Johnson', role: 'Associate Pastor', bio: 'Overseeing discipleship and care' },
    { id: 'stf-3', name: 'Mike Thompson', role: 'Youth Pastor', bio: 'Passionate about student ministry' }
  ],
  upcomingEvents: [
    { name: 'Community Potluck', date: 'First Sunday of the Month', time: 'After 11 AM service' },
    { name: 'VBS', date: 'June 15-19', time: '9 AM - 12 PM' },
    { name: 'Men\'s Breakfast', date: 'Second Saturday', time: '8:00 AM' }
  ]
};

// ============================================
// LANDSCAPING FIXTURE
// ============================================

const LANDSCAPING_FIXTURE = {
  type: 'landscaping',
  business: {
    name: 'GreenScape Pro',
    tagline: 'Transforming Outdoor Spaces',
    description: 'Full-service landscaping company offering design, installation, and maintenance. Creating beautiful outdoor living spaces since 2010.',
    phone: '(555) 890-1234',
    email: 'info@greenscapepro-demo.com',
    address: 'Serving the Greater Metro Area',
    license: 'License #LS-54321',
    hours: {
      'Mon-Fri': '7:00 AM - 6:00 PM',
      'Saturday': '8:00 AM - 4:00 PM',
      'Sunday': 'Closed'
    }
  },
  images: IMAGES.construction,
  services: [
    { id: 'srv-1', name: 'Lawn Maintenance', price: 50, description: 'Weekly mowing, edging, and blowing', priceNote: 'Starting at/visit' },
    { id: 'srv-2', name: 'Landscape Design', price: 500, description: 'Custom design with 3D rendering', priceNote: 'Starting at' },
    { id: 'srv-3', name: 'Planting & Gardens', price: 300, description: 'Flower beds, shrubs, and trees', priceNote: 'Starting at' },
    { id: 'srv-4', name: 'Hardscaping', price: 2000, description: 'Patios, walkways, retaining walls', priceNote: 'Starting at' },
    { id: 'srv-5', name: 'Irrigation Systems', price: 1500, description: 'Sprinkler installation and repair', priceNote: 'Starting at' },
    { id: 'srv-6', name: 'Outdoor Lighting', price: 800, description: 'Landscape and security lighting', priceNote: 'Starting at' },
    { id: 'srv-7', name: 'Sod Installation', price: 1.50, description: 'Premium quality sod', priceNote: 'Per sq ft' },
    { id: 'srv-8', name: 'Seasonal Cleanup', price: 200, description: 'Spring or fall cleanup service', priceNote: 'Starting at' }
  ],
  maintenancePlans: [
    { id: 'plan-1', name: 'Basic', price: 150, frequency: 'Monthly', includes: ['Weekly mowing', 'Edging', 'Blowing'] },
    { id: 'plan-2', name: 'Standard', price: 250, frequency: 'Monthly', includes: ['Weekly mowing', 'Edging', 'Blowing', 'Bi-weekly trimming', 'Weed control'] },
    { id: 'plan-3', name: 'Premium', price: 400, frequency: 'Monthly', includes: ['All Standard services', 'Fertilization', 'Pest control', 'Seasonal flowers', 'Mulching'] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Tom & Linda H.', rating: 5, text: 'They transformed our backyard into an oasis. The patio is perfect!' },
    { id: 'rev-2', name: 'Michael R.', rating: 5, text: 'Reliable weekly service. Our lawn has never looked better.' }
  ]
};

// ============================================
// HOTEL FIXTURE
// ============================================

const HOTEL_FIXTURE = {
  type: 'hotel',
  business: {
    name: 'The Grand Harbor Hotel',
    tagline: 'Where Luxury Meets Comfort',
    description: 'Boutique hotel offering elegant accommodations, world-class dining, and exceptional service in the heart of downtown.',
    phone: '(555) 901-2345',
    email: 'reservations@grandharbor-demo.com',
    address: '1 Harbor View Drive',
    hours: {
      'Front Desk': '24 Hours',
      'Check-in': '3:00 PM',
      'Check-out': '11:00 AM'
    }
  },
  images: IMAGES.realEstate,
  rooms: [
    { id: 'rm-1', name: 'Deluxe King', price: 199, description: 'Spacious room with king bed, city view', size: '350 sq ft', sleeps: 2, amenities: ['King Bed', 'Work Desk', 'Mini Fridge', 'Smart TV', 'Free WiFi'] },
    { id: 'rm-2', name: 'Double Queen', price: 219, description: 'Two queen beds, perfect for families', size: '400 sq ft', sleeps: 4, amenities: ['2 Queen Beds', 'Work Desk', 'Mini Fridge', 'Smart TV', 'Free WiFi'] },
    { id: 'rm-3', name: 'Harbor Suite', price: 349, description: 'Luxury suite with harbor views', size: '550 sq ft', sleeps: 2, amenities: ['King Bed', 'Separate Living Area', 'Soaking Tub', 'Harbor View', 'Turndown Service'] },
    { id: 'rm-4', name: 'Presidential Suite', price: 599, description: 'Ultimate luxury experience', size: '1000 sq ft', sleeps: 4, amenities: ['Master Bedroom', 'Living Room', 'Dining Area', 'Butler Service', 'Private Terrace'] }
  ],
  amenities: [
    { name: 'Rooftop Pool', icon: 'pool' },
    { name: 'Fitness Center', icon: 'fitness' },
    { name: 'Spa & Wellness', icon: 'spa' },
    { name: 'On-Site Restaurant', icon: 'restaurant' },
    { name: 'Rooftop Bar', icon: 'bar' },
    { name: 'Business Center', icon: 'business' },
    { name: 'Valet Parking', icon: 'parking' },
    { name: 'Concierge', icon: 'concierge' }
  ],
  dining: [
    { name: 'Harbor Kitchen', type: 'Restaurant', hours: '6:30 AM - 10:00 PM', description: 'Farm-to-table cuisine' },
    { name: 'Sky Lounge', type: 'Rooftop Bar', hours: '5:00 PM - 12:00 AM', description: 'Craft cocktails with views' }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Elizabeth W.', rating: 5, text: 'Exceptional service and beautiful rooms. The rooftop pool was amazing!' },
    { id: 'rev-2', name: 'David & Susan M.', rating: 5, text: 'Our anniversary stay was perfect. The suite had stunning harbor views.' }
  ]
};

// ============================================
// MOVING COMPANY FIXTURE
// ============================================

const MOVING_FIXTURE = {
  type: 'moving',
  business: {
    name: 'SwiftMove Pro',
    tagline: 'Moving Made Easy',
    description: 'Professional moving services for homes and businesses. Licensed, insured, and committed to careful handling of your belongings.',
    phone: '(555) 012-3456',
    email: 'quote@swiftmovepro-demo.com',
    address: 'Serving the Tri-State Area',
    license: 'DOT# 1234567, MC# 987654',
    hours: {
      'Mon-Sat': '7:00 AM - 8:00 PM',
      'Sunday': '8:00 AM - 6:00 PM'
    }
  },
  images: IMAGES.construction,
  services: [
    { id: 'srv-1', name: 'Local Moving', price: 125, description: 'Moves within 50 miles', priceNote: 'Per hour (2 movers)' },
    { id: 'srv-2', name: 'Long Distance', price: null, description: 'Interstate and cross-country moves', priceNote: 'Custom quote' },
    { id: 'srv-3', name: 'Office Moving', price: null, description: 'Commercial and office relocations', priceNote: 'Custom quote' },
    { id: 'srv-4', name: 'Packing Services', price: 50, description: 'Professional packing by our team', priceNote: 'Per hour' },
    { id: 'srv-5', name: 'Packing Supplies', price: null, description: 'Boxes, tape, bubble wrap, and more', priceNote: 'À la carte' },
    { id: 'srv-6', name: 'Storage', price: 150, description: 'Climate-controlled storage units', priceNote: 'Per month starting at' },
    { id: 'srv-7', name: 'Piano Moving', price: 300, description: 'Specialized piano transport', priceNote: 'Starting at' },
    { id: 'srv-8', name: 'Furniture Assembly', price: 75, description: 'Disassembly and reassembly', priceNote: 'Per hour' }
  ],
  packages: [
    { id: 'pkg-1', name: 'Basic Move', description: 'Loading, transport, unloading', includes: ['Professional movers', 'Moving truck', 'Basic equipment', 'Furniture protection'] },
    { id: 'pkg-2', name: 'Full Service', description: 'We handle everything', includes: ['All Basic features', 'Packing & unpacking', 'Furniture disassembly', 'Box labeling', 'Placement at destination'], popular: true },
    { id: 'pkg-3', name: 'White Glove', description: 'Premium moving experience', includes: ['All Full Service features', 'Specialty item handling', 'Same-day service available', 'Dedicated move coordinator'] }
  ],
  testimonials: [
    { id: 'rev-1', name: 'Jennifer K.', rating: 5, text: 'Best movers ever! Fast, careful, and so professional. Made our move stress-free.' },
    { id: 'rev-2', name: 'Marcus T.', rating: 5, text: 'Moved our office over the weekend with zero issues. Highly recommend!' }
  ]
};

// ============================================
// EVENT VENUE FIXTURE
// ============================================

const EVENT_VENUE_FIXTURE = {
  type: 'event-venue',
  business: {
    name: 'The Edison Event Space',
    tagline: 'Where Moments Become Memories',
    description: 'Versatile event venue perfect for weddings, corporate events, and private celebrations. Modern spaces with full-service catering.',
    phone: '(555) 123-4567',
    email: 'events@edisonspace-demo.com',
    address: '500 Grand Avenue',
    hours: {
      'Tours': 'By Appointment',
      'Office': 'Mon-Fri 10 AM - 6 PM'
    }
  },
  images: IMAGES.restaurant,
  spaces: [
    { id: 'spc-1', name: 'The Grand Ballroom', capacity: 300, sqft: 5000, price: 5000, description: 'Elegant ballroom with crystal chandeliers', features: ['Dance floor', 'Stage', 'Full bar', 'Bridal suite'] },
    { id: 'spc-2', name: 'The Loft', capacity: 150, sqft: 2500, price: 2500, description: 'Industrial-chic space with exposed brick', features: ['Open floor plan', 'Bar area', 'Photo-ready backdrops'] },
    { id: 'spc-3', name: 'The Garden Terrace', capacity: 200, sqft: 3000, price: 3500, description: 'Beautiful outdoor space with string lights', features: ['Covered pavilion', 'Garden setting', 'Fire pits', 'Sunset views'] },
    { id: 'spc-4', name: 'The Boardroom', capacity: 30, sqft: 600, price: 500, description: 'Professional meeting space', features: ['AV equipment', 'Video conferencing', 'Whiteboard', 'Catering available'] }
  ],
  packages: [
    { id: 'pkg-1', name: 'Venue Only', description: 'Space rental with tables and chairs', includes: ['8-hour rental', 'Setup & breakdown', 'Tables & chairs', 'Basic linens'] },
    { id: 'pkg-2', name: 'Standard Package', description: 'Venue with basic catering', includes: ['10-hour rental', 'Appetizers & dinner', 'Open bar (4 hours)', 'Basic decor', 'Event coordinator'] },
    { id: 'pkg-3', name: 'Premium Package', description: 'All-inclusive celebration', includes: ['12-hour rental', 'Full catering', 'Premium bar', 'DJ & lighting', 'Floral arrangements', 'Day-of coordinator'], popular: true }
  ],
  eventTypes: ['Weddings', 'Corporate Events', 'Galas', 'Birthday Parties', 'Anniversaries', 'Holiday Parties', 'Product Launches', 'Conferences'],
  catering: {
    inHouse: true,
    cuisines: ['American', 'Italian', 'Asian Fusion', 'Mediterranean'],
    minGuests: 50
  },
  testimonials: [
    { id: 'rev-1', name: 'Sarah & Michael', rating: 5, text: 'Our wedding at The Edison was absolutely magical. The team made everything perfect!' },
    { id: 'rev-2', name: 'TechCorp Events', rating: 5, text: 'We host our annual gala here every year. Always flawless execution.' }
  ]
};

// ============================================
// SCHOOL / EDUCATION FIXTURE
// ============================================

const SCHOOL_FIXTURE = {
  name: 'Bright Futures Academy',
  tagline: 'Where Learning Meets Excellence',
  description: 'A leading private school committed to academic excellence and character development.',
  programs: [
    { name: 'Early Childhood', grades: 'Pre-K - K', students: 120, description: 'Play-based learning foundation' },
    { name: 'Elementary School', grades: '1st - 5th', students: 350, description: 'Core academics with enrichment' },
    { name: 'Middle School', grades: '6th - 8th', students: 280, description: 'College prep curriculum' },
    { name: 'High School', grades: '9th - 12th', students: 320, description: 'Advanced placement courses' }
  ],
  tuition: [
    { level: 'Pre-K', annual: 12500, monthly: 1250 },
    { level: 'Elementary', annual: 15000, monthly: 1500 },
    { level: 'Middle School', annual: 18000, monthly: 1800 },
    { level: 'High School', annual: 22000, monthly: 2200 }
  ],
  extracurriculars: ['Athletics', 'Drama Club', 'Robotics', 'Music Program', 'Art Studio', 'Debate Team', 'Student Government'],
  stats: { students: 1070, teachers: 85, classSize: 18, collegePlacement: '98%' },
  testimonials: [
    { name: 'Sarah Mitchell', role: 'Parent', text: 'The teachers truly care about each student\'s success. My children have thrived here.', rating: 5 },
    { name: 'James Wilson', role: 'Alumni 2020', text: 'BFA prepared me exceptionally well for college. The rigorous academics made university feel manageable.', rating: 5 }
  ]
};

// ============================================
// ONLINE COURSE FIXTURE
// ============================================

const ONLINE_COURSE_FIXTURE = {
  name: 'SkillUp Academy',
  tagline: 'Learn In-Demand Skills Online',
  description: 'Master new skills with expert-led courses designed for career advancement.',
  courses: [
    { name: 'Complete Web Development Bootcamp', price: 199, originalPrice: 499, duration: '40 hours', students: 45000, rating: 4.8, level: 'Beginner' },
    { name: 'Data Science Fundamentals', price: 149, originalPrice: 399, duration: '32 hours', students: 28000, rating: 4.7, level: 'Intermediate' },
    { name: 'UX/UI Design Masterclass', price: 179, originalPrice: 449, duration: '28 hours', students: 18500, rating: 4.9, level: 'All Levels' },
    { name: 'Digital Marketing Strategy', price: 129, originalPrice: 299, duration: '24 hours', students: 32000, rating: 4.6, level: 'Beginner' },
    { name: 'Python for Machine Learning', price: 249, originalPrice: 599, duration: '48 hours', students: 22000, rating: 4.8, level: 'Advanced' }
  ],
  memberships: [
    { name: 'Monthly', price: 29, features: ['Unlimited course access', 'New courses monthly', 'Certificates'] },
    { name: 'Annual', price: 199, features: ['Everything in Monthly', 'Priority support', 'Exclusive workshops', 'Career coaching'] },
    { name: 'Lifetime', price: 499, features: ['Permanent access', 'All future courses', 'VIP community', '1-on-1 mentoring'] }
  ],
  stats: { students: 500000, courses: 150, instructors: 85, completionRate: '78%' },
  testimonials: [
    { name: 'Michael Chen', role: 'Career Changer', text: 'Went from retail to software developer in 6 months. These courses changed my life.', rating: 5 },
    { name: 'Emma Davis', role: 'Marketing Manager', text: 'The digital marketing course helped me land a promotion. Practical, actionable content.', rating: 5 }
  ]
};

// ============================================
// TRAVEL AGENCY FIXTURE
// ============================================

const TRAVEL_FIXTURE = {
  name: 'Wanderlust Travel Co.',
  tagline: 'Your Journey Begins Here',
  description: 'Creating unforgettable travel experiences with personalized itineraries and expert guidance.',
  packages: [
    { name: 'European Discovery', destination: 'Paris, Rome, Barcelona', duration: '14 days', price: 4999, priceFrom: true, highlights: ['Guided tours', 'Local cuisine', 'Historic sites'] },
    { name: 'Caribbean Escape', destination: 'Jamaica & Bahamas', duration: '7 days', price: 2499, priceFrom: true, highlights: ['Beach resorts', 'Snorkeling', 'Island hopping'] },
    { name: 'Asian Adventure', destination: 'Tokyo, Kyoto, Seoul', duration: '12 days', price: 5499, priceFrom: true, highlights: ['Cultural immersion', 'Food tours', 'Temple visits'] },
    { name: 'African Safari', destination: 'Kenya & Tanzania', duration: '10 days', price: 6999, priceFrom: true, highlights: ['Wildlife viewing', 'Luxury lodges', 'Local guides'] }
  ],
  services: [
    { name: 'Custom Itinerary Planning', price: 150, description: 'Personalized trip planning consultation' },
    { name: 'Flight Booking', price: 50, description: 'Best fare search and booking' },
    { name: 'Hotel Reservations', price: 25, description: 'Per booking service fee' },
    { name: 'Travel Insurance', price: 89, description: 'Comprehensive coverage per trip' },
    { name: 'Airport Transfers', price: 75, description: 'Round-trip from airport to hotel' }
  ],
  stats: { trips: 15000, destinations: 120, satisfaction: '99%', yearsExperience: 25 },
  testimonials: [
    { name: 'David & Lisa Thompson', role: 'Honeymooners', text: 'Our honeymoon to Bali was absolutely perfect. Every detail was handled flawlessly.', rating: 5 },
    { name: 'Robert Kim', role: 'Business Traveler', text: 'They saved me hours of planning. Professional service and great recommendations.', rating: 5 }
  ]
};

// ============================================
// FINANCE / INVESTMENT FIXTURE
// ============================================

const FINANCE_FIXTURE = {
  name: 'Pinnacle Wealth Advisors',
  tagline: 'Building Your Financial Future',
  description: 'Comprehensive wealth management and financial planning for individuals and families.',
  services: [
    { name: 'Retirement Planning', description: 'Strategic planning for a secure retirement', minInvestment: 100000 },
    { name: 'Investment Management', description: 'Portfolio management and asset allocation', minInvestment: 250000 },
    { name: 'Estate Planning', description: 'Wealth transfer and legacy planning', minInvestment: 500000 },
    { name: 'Tax Optimization', description: 'Tax-efficient investment strategies', minInvestment: 100000 },
    { name: 'College Savings', description: '529 plans and education funding', minInvestment: 25000 }
  ],
  advisoryTiers: [
    { name: 'Essential', aum: '$100K - $500K', fee: '1.25%', features: ['Annual review', 'Basic planning', 'Online portal'] },
    { name: 'Premium', aum: '$500K - $2M', fee: '1.00%', features: ['Quarterly reviews', 'Tax planning', 'Direct advisor access'] },
    { name: 'Private Client', aum: '$2M+', fee: '0.75%', features: ['Monthly reviews', 'Full planning suite', 'Family office services'] }
  ],
  stats: { aum: '$2.5B', clients: 1200, avgReturn: '8.2%', yearsExperience: 35 },
  team: [
    { name: 'Margaret Collins, CFP', role: 'Managing Partner', credentials: 'CFP, CFA', experience: '28 years' },
    { name: 'Thomas Wright', role: 'Senior Advisor', credentials: 'CFP, ChFC', experience: '22 years' },
    { name: 'Jennifer Park', role: 'Investment Analyst', credentials: 'CFA', experience: '12 years' }
  ],
  testimonials: [
    { name: 'Richard & Anne Morrison', role: 'Retirees', text: 'They helped us retire 5 years early with complete peace of mind.', rating: 5 },
    { name: 'Steven Cho', role: 'Business Owner', text: 'Outstanding tax planning saved me over $50,000 last year alone.', rating: 5 }
  ]
};

// ============================================
// PORTFOLIO / DESIGNER FIXTURE
// ============================================

const PORTFOLIO_FIXTURE = {
  name: 'Alex Rivera Design',
  tagline: 'Creative Solutions That Connect',
  description: 'Award-winning designer specializing in brand identity, web design, and creative direction.',
  services: [
    { name: 'Brand Identity', price: 5000, priceFrom: true, description: 'Logo, color palette, typography, brand guidelines', timeline: '4-6 weeks' },
    { name: 'Website Design', price: 3500, priceFrom: true, description: 'Custom responsive website design', timeline: '3-4 weeks' },
    { name: 'UI/UX Design', price: 4000, priceFrom: true, description: 'User experience and interface design for apps', timeline: '4-8 weeks' },
    { name: 'Print Design', price: 500, priceFrom: true, description: 'Business cards, brochures, marketing materials', timeline: '1-2 weeks' }
  ],
  projects: [
    { name: 'TechStart Rebrand', client: 'TechStart Inc.', category: 'Brand Identity', year: 2025, image: 'project1.jpg' },
    { name: 'Bloom E-commerce', client: 'Bloom Flowers', category: 'Web Design', year: 2025, image: 'project2.jpg' },
    { name: 'HealthFirst App', client: 'HealthFirst', category: 'UI/UX Design', year: 2024, image: 'project3.jpg' },
    { name: 'Artisan Coffee Brand', client: 'Artisan Roasters', category: 'Brand Identity', year: 2024, image: 'project4.jpg' }
  ],
  stats: { projects: 150, clients: 80, awards: 12, yearsExperience: 10 },
  clients: ['Google', 'Spotify', 'Adobe', 'Nike', 'Airbnb'],
  testimonials: [
    { name: 'Jennifer Walsh', role: 'CEO, TechStart', text: 'Alex transformed our brand completely. The new identity perfectly captures who we are.', rating: 5 },
    { name: 'Mark Anderson', role: 'Marketing Director', text: 'Incredibly talented and professional. Delivered beyond our expectations.', rating: 5 }
  ]
};

// ============================================
// SUBSCRIPTION BOX FIXTURE
// ============================================

const SUBSCRIPTION_BOX_FIXTURE = {
  name: 'CurateBox',
  tagline: 'Discover Something New Every Month',
  description: 'Curated subscription boxes delivering premium products tailored to your interests.',
  boxes: [
    { name: 'Gourmet Snacks', price: 39.99, frequency: 'monthly', value: 75, items: '8-10 snacks', description: 'Artisan snacks from around the world' },
    { name: 'Self-Care Essentials', price: 49.99, frequency: 'monthly', value: 120, items: '6-8 items', description: 'Premium skincare and wellness products' },
    { name: 'Book Lover\'s Box', price: 34.99, frequency: 'monthly', value: 60, items: '1 book + extras', description: 'Bestselling book with themed goodies' },
    { name: 'Coffee Connoisseur', price: 29.99, frequency: 'monthly', value: 50, items: '3 bags', description: 'Small-batch roasted coffee beans' },
    { name: 'Pet Paradise', price: 44.99, frequency: 'monthly', value: 80, items: '5-7 items', description: 'Toys and treats for your furry friend' }
  ],
  plans: [
    { duration: 'Monthly', discount: '0%', commitment: 'Cancel anytime' },
    { duration: '3 Months', discount: '10%', commitment: 'Prepay quarterly' },
    { duration: '6 Months', discount: '15%', commitment: 'Best value' },
    { duration: '12 Months', discount: '20%', commitment: 'Ultimate savings' }
  ],
  stats: { subscribers: 125000, productsTested: 5000, satisfaction: '96%', countriesShipped: 45 },
  testimonials: [
    { name: 'Ashley Brooks', role: 'Subscriber since 2023', text: 'Every box is like a little birthday! Love discovering new products.', rating: 5 },
    { name: 'Tom Martinez', role: 'Gift Recipient', text: 'My wife got me the coffee box and I\'m hooked. Best gift ever!', rating: 5 }
  ]
};

// ============================================
// MUSICIAN / BAND FIXTURE
// ============================================

const MUSICIAN_FIXTURE = {
  name: 'The Midnight Echo',
  tagline: 'Alternative Rock with Soul',
  description: 'Indie alternative rock band blending atmospheric soundscapes with powerful vocals.',
  albums: [
    { name: 'Neon Dreams', year: 2025, tracks: 12, price: 12.99, type: 'Album' },
    { name: 'City Lights EP', year: 2024, tracks: 5, price: 7.99, type: 'EP' },
    { name: 'First Light', year: 2023, tracks: 10, price: 9.99, type: 'Album' },
    { name: 'Acoustic Sessions', year: 2023, tracks: 6, price: 6.99, type: 'EP' }
  ],
  tourDates: [
    { date: '2026-02-15', venue: 'The Roxy', city: 'Los Angeles, CA', price: 45, status: 'On Sale' },
    { date: '2026-02-18', venue: 'Fillmore', city: 'San Francisco, CA', price: 50, status: 'On Sale' },
    { date: '2026-02-22', venue: 'House of Blues', city: 'Chicago, IL', price: 40, status: 'Low Tickets' },
    { date: '2026-02-25', venue: 'Terminal 5', city: 'New York, NY', price: 55, status: 'On Sale' }
  ],
  merch: [
    { name: 'Neon Dreams Tour Tee', price: 35, category: 'Apparel' },
    { name: 'Logo Hoodie', price: 65, category: 'Apparel' },
    { name: 'Signed Vinyl', price: 40, category: 'Music' },
    { name: 'Poster Bundle', price: 25, category: 'Collectibles' }
  ],
  stats: { monthlyListeners: 850000, followers: 320000, songsStreamed: '45M', shows: 200 },
  bandMembers: [
    { name: 'Alex Turner', role: 'Lead Vocals, Guitar', image: 'member1.jpg' },
    { name: 'Jordan Lee', role: 'Guitar, Synth', image: 'member2.jpg' },
    { name: 'Sam Rivera', role: 'Bass', image: 'member3.jpg' },
    { name: 'Casey Park', role: 'Drums', image: 'member4.jpg' }
  ]
};

// ============================================
// PODCAST FIXTURE
// ============================================

const PODCAST_FIXTURE = {
  name: 'The Curious Mind',
  tagline: 'Exploring Ideas That Matter',
  description: 'Weekly conversations with fascinating people about science, technology, culture, and the human experience.',
  episodes: [
    { title: 'The Future of AI with Dr. Sarah Chen', number: 156, duration: '1:23:45', date: '2026-01-15', downloads: 125000 },
    { title: 'Building a Second Brain: Digital Note-Taking', number: 155, duration: '58:20', date: '2026-01-08', downloads: 98000 },
    { title: 'The Psychology of Habits', number: 154, duration: '1:15:30', date: '2026-01-01', downloads: 115000 },
    { title: 'Space Exploration: What\'s Next?', number: 153, duration: '1:42:10', date: '2025-12-25', downloads: 142000 }
  ],
  sponsorTiers: [
    { name: 'Spot Ad', price: 2500, description: '60-second mid-roll ad read', reach: '~250K downloads' },
    { name: 'Premium Sponsor', price: 5000, description: 'Pre-roll + mid-roll + show notes', reach: '~250K downloads' },
    { name: 'Season Sponsor', price: 45000, description: 'Full season sponsorship (12 episodes)', reach: '~3M downloads' }
  ],
  memberships: [
    { name: 'Listener', price: 0, features: ['Weekly episodes', 'Show notes'] },
    { name: 'Supporter', price: 5, features: ['Ad-free episodes', 'Early access', 'Bonus content'] },
    { name: 'Insider', price: 15, features: ['Everything above', 'Monthly Q&A', 'Discord access', 'Exclusive merch'] }
  ],
  stats: { totalDownloads: '25M', episodes: 156, subscribers: 180000, avgListenTime: '85%' },
  host: { name: 'Michael Torres', bio: 'Former tech journalist, lifelong learner, and professional question-asker.', image: 'host.jpg' }
};

// ============================================
// GAMING / ESPORTS FIXTURE
// ============================================

const GAMING_FIXTURE = {
  name: 'Phoenix Rising Esports',
  tagline: 'Rise Above the Competition',
  description: 'Professional esports organization competing at the highest levels across multiple titles.',
  teams: [
    { game: 'League of Legends', ranking: '#3 NA', players: 7, achievements: ['LCS Spring 2025 Finalist', 'Worlds 2025 Quarterfinalist'] },
    { game: 'Valorant', ranking: '#1 NA', players: 6, achievements: ['VCT Champions 2025 Winner', 'Masters Tokyo 2025'] },
    { game: 'Counter-Strike 2', ranking: '#5 World', players: 5, achievements: ['Major Copenhagen 2025 Semi-finalist'] },
    { game: 'Rocket League', ranking: '#2 NA', players: 3, achievements: ['RLCS World Championship 2025'] }
  ],
  merch: [
    { name: '2026 Pro Jersey', price: 89.99, category: 'Apparel', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'Team Hoodie', price: 74.99, category: 'Apparel' },
    { name: 'Gaming Mousepad XL', price: 34.99, category: 'Gear' },
    { name: 'Supporter Pack', price: 149.99, category: 'Bundle', items: ['Jersey', 'Mousepad', 'Stickers', 'Poster'] }
  ],
  memberships: [
    { name: 'Free', price: 0, features: ['Discord access', 'Match alerts', 'Public content'] },
    { name: 'Fan Club', price: 4.99, features: ['Exclusive emotes', 'Monthly giveaways', 'Behind-the-scenes'] },
    { name: 'VIP', price: 14.99, features: ['All above', 'Player meet & greets', 'Pro player coaching sessions', 'Merch discounts'] }
  ],
  stats: { socialFollowers: '2.5M', trophies: 28, prizeWinnings: '$8.5M', yearsActive: 6 },
  upcomingMatches: [
    { opponent: 'Cloud9', game: 'Valorant', date: '2026-01-25', tournament: 'VCT Americas', time: '5:00 PM EST' },
    { opponent: 'Team Liquid', game: 'League of Legends', date: '2026-01-27', tournament: 'LCS Spring', time: '3:00 PM EST' }
  ]
};

// ============================================
// DEMO USERS (for auth simulation)
// ============================================

const DEMO_USERS = {
  'demo@test.com': {
    id: 'user-1',
    email: 'demo@test.com',
    password: 'demo123',
    name: 'John Demo',
    phone: '(555) 999-0000',
    tier: 'Gold',
    points: 2450,
    visits: 12,
    memberSince: '2024-01-15',
    savedAmount: 240
  },
  'jane@test.com': {
    id: 'user-2',
    email: 'jane@test.com',
    password: 'test123',
    name: 'Jane Smith',
    phone: '(555) 888-1111',
    tier: 'Silver',
    points: 850,
    visits: 5,
    memberSince: '2024-06-01',
    savedAmount: 45
  }
};

// ============================================
// FIXTURE GETTERS
// ============================================

/**
 * Get fixture data for an industry
 */
function getIndustryFixture(industry) {
  const fixtures = {
    // Food & Beverage
    restaurant: RESTAURANT_FIXTURE,
    steakhouse: RESTAURANT_FIXTURE,
    'fine-dining': RESTAURANT_FIXTURE,
    pizza: PIZZA_FIXTURE,
    cafe: CAFE_FIXTURE,
    bakery: BAKERY_FIXTURE,
    'pastry-shop': BAKERY_FIXTURE,
    coffee: CAFE_FIXTURE,
    'coffee-shop': CAFE_FIXTURE,

    // Health & Wellness
    dental: DENTAL_FIXTURE,
    healthcare: HEALTHCARE_FIXTURE,
    medical: HEALTHCARE_FIXTURE,
    'medical-practice': HEALTHCARE_FIXTURE,
    clinic: HEALTHCARE_FIXTURE,

    // Beauty & Personal Care
    salon: SALON_FIXTURE,
    'spa-salon': SALON_FIXTURE,
    'hair-salon': SALON_FIXTURE,
    spa: SALON_FIXTURE,
    barbershop: BARBERSHOP_FIXTURE,
    barber: BARBERSHOP_FIXTURE,

    // Fitness & Wellness
    fitness: FITNESS_FIXTURE,
    gym: FITNESS_FIXTURE,
    'fitness-studio': FITNESS_FIXTURE,
    yoga: YOGA_FIXTURE,
    'yoga-studio': YOGA_FIXTURE,
    pilates: YOGA_FIXTURE,

    // Professional Services
    'law-firm': LAW_FIRM_FIXTURE,
    legal: LAW_FIRM_FIXTURE,
    attorney: LAW_FIRM_FIXTURE,
    accounting: ACCOUNTING_FIXTURE,
    cpa: ACCOUNTING_FIXTURE,
    'financial-services': ACCOUNTING_FIXTURE,
    insurance: INSURANCE_FIXTURE,
    'insurance-agency': INSURANCE_FIXTURE,
    consulting: CONSULTING_FIXTURE,
    agency: CONSULTING_FIXTURE,
    'marketing-agency': CONSULTING_FIXTURE,

    // Technology
    saas: SAAS_FIXTURE,
    software: SAAS_FIXTURE,
    startup: SAAS_FIXTURE,
    'tech-startup': SAAS_FIXTURE,

    // Real Estate
    'real-estate': REAL_ESTATE_FIXTURE,
    realtor: REAL_ESTATE_FIXTURE,
    'property-management': REAL_ESTATE_FIXTURE,

    // Home Services / Trade
    construction: CONSTRUCTION_FIXTURE,
    contractor: CONSTRUCTION_FIXTURE,
    'general-contractor': CONSTRUCTION_FIXTURE,
    remodeling: CONSTRUCTION_FIXTURE,
    plumber: PLUMBER_FIXTURE,
    plumbing: PLUMBER_FIXTURE,
    hvac: PLUMBER_FIXTURE,
    electrician: ELECTRICIAN_FIXTURE,
    electrical: ELECTRICIAN_FIXTURE,
    cleaning: CLEANING_FIXTURE,
    'cleaning-service': CLEANING_FIXTURE,
    'house-cleaning': CLEANING_FIXTURE,
    'maid-service': CLEANING_FIXTURE,

    // Automotive
    automotive: AUTOMOTIVE_FIXTURE,
    'auto-repair': AUTOMOTIVE_FIXTURE,
    mechanic: AUTOMOTIVE_FIXTURE,
    'auto-service': AUTOMOTIVE_FIXTURE,

    // Pet Services
    'pet-services': PET_SERVICES_FIXTURE,
    'pet-grooming': PET_SERVICES_FIXTURE,
    veterinary: PET_SERVICES_FIXTURE,
    'dog-grooming': PET_SERVICES_FIXTURE,
    kennel: PET_SERVICES_FIXTURE,

    // Bars & Nightlife
    bar: BAR_FIXTURE,
    nightclub: BAR_FIXTURE,
    'wine-bar': BAR_FIXTURE,
    lounge: BAR_FIXTURE,
    brewery: BAR_FIXTURE,

    // Chiropractic & Wellness
    chiropractic: CHIROPRACTIC_FIXTURE,
    chiropractor: CHIROPRACTIC_FIXTURE,
    'physical-therapy': CHIROPRACTIC_FIXTURE,
    'sports-medicine': CHIROPRACTIC_FIXTURE,

    // Photography & Creative
    photography: PHOTOGRAPHY_FIXTURE,
    photographer: PHOTOGRAPHY_FIXTURE,
    'photo-studio': PHOTOGRAPHY_FIXTURE,
    videography: PHOTOGRAPHY_FIXTURE,

    // Wedding & Events
    wedding: WEDDING_FIXTURE,
    'wedding-planner': WEDDING_FIXTURE,
    'event-planner': WEDDING_FIXTURE,

    // Nonprofit & Community
    nonprofit: NONPROFIT_FIXTURE,
    'non-profit': NONPROFIT_FIXTURE,
    charity: NONPROFIT_FIXTURE,
    foundation: NONPROFIT_FIXTURE,

    // Religious & Spiritual
    church: CHURCH_FIXTURE,
    'religious-org': CHURCH_FIXTURE,
    temple: CHURCH_FIXTURE,
    mosque: CHURCH_FIXTURE,
    synagogue: CHURCH_FIXTURE,

    // Landscaping & Outdoor
    landscaping: LANDSCAPING_FIXTURE,
    'lawn-care': LANDSCAPING_FIXTURE,
    gardening: LANDSCAPING_FIXTURE,
    'tree-service': LANDSCAPING_FIXTURE,

    // Hospitality
    hotel: HOTEL_FIXTURE,
    'bed-and-breakfast': HOTEL_FIXTURE,
    resort: HOTEL_FIXTURE,
    inn: HOTEL_FIXTURE,
    motel: HOTEL_FIXTURE,

    // Moving & Storage
    moving: MOVING_FIXTURE,
    'moving-company': MOVING_FIXTURE,
    storage: MOVING_FIXTURE,
    relocation: MOVING_FIXTURE,

    // Event Venues
    'event-venue': EVENT_VENUE_FIXTURE,
    'wedding-venue': EVENT_VENUE_FIXTURE,
    'conference-center': EVENT_VENUE_FIXTURE,
    banquet: EVENT_VENUE_FIXTURE,

    // Education
    school: SCHOOL_FIXTURE,
    academy: SCHOOL_FIXTURE,
    'private-school': SCHOOL_FIXTURE,
    'charter-school': SCHOOL_FIXTURE,
    daycare: SCHOOL_FIXTURE,

    // Online Learning
    'online-course': ONLINE_COURSE_FIXTURE,
    elearning: ONLINE_COURSE_FIXTURE,
    'e-learning': ONLINE_COURSE_FIXTURE,
    'online-education': ONLINE_COURSE_FIXTURE,
    courses: ONLINE_COURSE_FIXTURE,

    // Travel & Tourism
    travel: TRAVEL_FIXTURE,
    'travel-agency': TRAVEL_FIXTURE,
    tourism: TRAVEL_FIXTURE,
    'tour-operator': TRAVEL_FIXTURE,

    // Finance & Investment
    finance: FINANCE_FIXTURE,
    investment: FINANCE_FIXTURE,
    'wealth-management': FINANCE_FIXTURE,
    'financial-advisor': FINANCE_FIXTURE,
    'financial-planning': FINANCE_FIXTURE,

    // Portfolio & Creative
    portfolio: PORTFOLIO_FIXTURE,
    designer: PORTFOLIO_FIXTURE,
    'graphic-design': PORTFOLIO_FIXTURE,
    freelancer: PORTFOLIO_FIXTURE,
    creative: PORTFOLIO_FIXTURE,

    // Subscription Services
    'subscription-box': SUBSCRIPTION_BOX_FIXTURE,
    subscription: SUBSCRIPTION_BOX_FIXTURE,
    'monthly-box': SUBSCRIPTION_BOX_FIXTURE,

    // Music & Entertainment
    musician: MUSICIAN_FIXTURE,
    band: MUSICIAN_FIXTURE,
    artist: MUSICIAN_FIXTURE,
    'music-artist': MUSICIAN_FIXTURE,
    dj: MUSICIAN_FIXTURE,

    // Podcasting
    podcast: PODCAST_FIXTURE,
    podcaster: PODCAST_FIXTURE,
    'audio-show': PODCAST_FIXTURE,

    // Gaming & Esports
    gaming: GAMING_FIXTURE,
    esports: GAMING_FIXTURE,
    'esports-team': GAMING_FIXTURE,
    streamer: GAMING_FIXTURE
  };

  // Return matching fixture or restaurant as default
  return fixtures[industry] || RESTAURANT_FIXTURE;
}

/**
 * Get appropriate images for an industry
 */
function getIndustryImages(industry) {
  const imageMap = {
    // Food & Beverage
    restaurant: IMAGES.restaurant,
    steakhouse: IMAGES.restaurant,
    'fine-dining': IMAGES.restaurant,
    pizza: IMAGES.pizza,
    cafe: IMAGES.cafe,
    bakery: IMAGES.cafe,
    coffee: IMAGES.cafe,
    'coffee-shop': IMAGES.cafe,

    // Health & Wellness
    dental: IMAGES.dental,
    healthcare: IMAGES.healthcare,
    medical: IMAGES.healthcare,
    'medical-practice': IMAGES.healthcare,
    clinic: IMAGES.healthcare,

    // Beauty & Personal Care
    salon: IMAGES.salon,
    'spa-salon': IMAGES.salon,
    'hair-salon': IMAGES.salon,
    spa: IMAGES.salon,
    barbershop: IMAGES.salon,

    // Fitness
    fitness: IMAGES.fitness,
    gym: IMAGES.fitness,
    'fitness-studio': IMAGES.fitness,
    yoga: IMAGES.fitness,

    // Professional Services
    'law-firm': IMAGES.lawFirm,
    legal: IMAGES.lawFirm,
    attorney: IMAGES.lawFirm,
    accounting: IMAGES.accounting,
    cpa: IMAGES.accounting,
    'financial-services': IMAGES.accounting,
    insurance: IMAGES.insurance,
    'insurance-agency': IMAGES.insurance,
    consulting: IMAGES.consulting,
    agency: IMAGES.consulting,
    'marketing-agency': IMAGES.consulting,
    professional: IMAGES.professional,

    // Real Estate
    'real-estate': IMAGES.realEstate,
    realtor: IMAGES.realEstate,
    'property-management': IMAGES.realEstate,

    // Home Services
    construction: IMAGES.construction,
    contractor: IMAGES.construction,
    'general-contractor': IMAGES.construction,
    remodeling: IMAGES.construction,
    cleaning: IMAGES.cleaning,
    'cleaning-service': IMAGES.cleaning,

    // Automotive
    automotive: IMAGES.automotive,
    'auto-repair': IMAGES.automotive,
    mechanic: IMAGES.automotive,
    'auto-service': IMAGES.automotive,

    // Pet Services
    'pet-services': IMAGES.petServices,
    'pet-grooming': IMAGES.petServices,
    veterinary: IMAGES.petServices,
    'dog-grooming': IMAGES.petServices,
    kennel: IMAGES.petServices,

    // Bars & Nightlife
    bar: IMAGES.restaurant,
    nightclub: IMAGES.restaurant,
    'wine-bar': IMAGES.restaurant,
    lounge: IMAGES.restaurant,
    brewery: IMAGES.restaurant,

    // Chiropractic & Wellness
    chiropractic: IMAGES.healthcare,
    chiropractor: IMAGES.healthcare,
    'physical-therapy': IMAGES.healthcare,
    'sports-medicine': IMAGES.healthcare,

    // Photography & Creative
    photography: IMAGES.professional,
    photographer: IMAGES.professional,
    'photo-studio': IMAGES.professional,
    videography: IMAGES.professional,

    // Wedding & Events
    wedding: IMAGES.professional,
    'wedding-planner': IMAGES.professional,
    'event-planner': IMAGES.professional,

    // Nonprofit & Community
    nonprofit: IMAGES.professional,
    'non-profit': IMAGES.professional,
    charity: IMAGES.professional,
    foundation: IMAGES.professional,

    // Religious & Spiritual
    church: IMAGES.professional,
    'religious-org': IMAGES.professional,
    temple: IMAGES.professional,
    mosque: IMAGES.professional,
    synagogue: IMAGES.professional,

    // Landscaping & Outdoor
    landscaping: IMAGES.construction,
    'lawn-care': IMAGES.construction,
    gardening: IMAGES.construction,
    'tree-service': IMAGES.construction,

    // Hospitality
    hotel: IMAGES.realEstate,
    'bed-and-breakfast': IMAGES.realEstate,
    resort: IMAGES.realEstate,
    inn: IMAGES.realEstate,
    motel: IMAGES.realEstate,

    // Moving & Storage
    moving: IMAGES.construction,
    'moving-company': IMAGES.construction,
    storage: IMAGES.construction,
    relocation: IMAGES.construction,

    // Event Venues
    'event-venue': IMAGES.professional,
    'wedding-venue': IMAGES.professional,
    'conference-center': IMAGES.professional,
    banquet: IMAGES.professional,

    // Education
    school: IMAGES.professional,
    academy: IMAGES.professional,
    'private-school': IMAGES.professional,
    'charter-school': IMAGES.professional,
    daycare: IMAGES.professional,

    // Online Learning
    'online-course': IMAGES.professional,
    elearning: IMAGES.professional,
    'e-learning': IMAGES.professional,
    'online-education': IMAGES.professional,
    courses: IMAGES.professional,

    // Travel & Tourism
    travel: IMAGES.realEstate,
    'travel-agency': IMAGES.realEstate,
    tourism: IMAGES.realEstate,
    'tour-operator': IMAGES.realEstate,

    // Finance & Investment
    finance: IMAGES.accounting,
    investment: IMAGES.accounting,
    'wealth-management': IMAGES.accounting,
    'financial-advisor': IMAGES.accounting,
    'financial-planning': IMAGES.accounting,

    // Portfolio & Creative
    portfolio: IMAGES.professional,
    designer: IMAGES.professional,
    'graphic-design': IMAGES.professional,
    freelancer: IMAGES.professional,
    creative: IMAGES.professional,

    // Subscription Services
    'subscription-box': IMAGES.professional,
    subscription: IMAGES.professional,
    'monthly-box': IMAGES.professional,

    // Music & Entertainment
    musician: IMAGES.professional,
    band: IMAGES.professional,
    artist: IMAGES.professional,
    'music-artist': IMAGES.professional,
    dj: IMAGES.professional,

    // Podcasting
    podcast: IMAGES.professional,
    podcaster: IMAGES.professional,
    'audio-show': IMAGES.professional,

    // Gaming & Esports
    gaming: IMAGES.fitness,
    esports: IMAGES.fitness,
    'esports-team': IMAGES.fitness,
    streamer: IMAGES.fitness
  };

  return imageMap[industry] || IMAGES.restaurant;
}

/**
 * Get demo users
 */
function getDemoUsers() {
  return DEMO_USERS;
}

/**
 * Get portal-specific data for an industry
 * Returns portal data structure for client/patient/customer portals
 */
function getPortalData(industry) {
  const fixture = getIndustryFixture(industry);
  return fixture.portalData || null;
}

/**
 * Get all available industries with portal data
 */
function getIndustriesWithPortals() {
  return [
    { key: 'law-firm', name: 'Law Firm', portalType: 'Client Portal' },
    { key: 'real-estate', name: 'Real Estate', portalType: 'Client Portal' },
    { key: 'healthcare', name: 'Healthcare', portalType: 'Patient Portal' },
    { key: 'dental', name: 'Dental', portalType: 'Patient Portal' },
    { key: 'accounting', name: 'Accounting', portalType: 'Client Portal' },
    { key: 'insurance', name: 'Insurance', portalType: 'Policy Portal' },
    { key: 'construction', name: 'Construction', portalType: 'Project Portal' },
    { key: 'automotive', name: 'Auto Service', portalType: 'Service Portal' },
    { key: 'pet-services', name: 'Pet Services', portalType: 'Pet Portal' },
    { key: 'consulting', name: 'Consulting', portalType: 'Client Portal' },
    { key: 'fitness', name: 'Fitness', portalType: 'Member Portal' },
    { key: 'salon', name: 'Salon', portalType: 'Client Portal' },
    { key: 'restaurant', name: 'Restaurant', portalType: 'Customer Portal' },
    { key: 'cafe', name: 'Cafe', portalType: 'Customer Portal' },
    { key: 'pizza', name: 'Pizza', portalType: 'Customer Portal' }
  ];
}

/**
 * Get sample loyalty/rewards data for an industry
 */
function getLoyaltyData(industry) {
  const fixture = getIndustryFixture(industry);
  return fixture.loyalty || null;
}

/**
 * Get sample team/staff data for an industry
 */
function getTeamData(industry) {
  const fixture = getIndustryFixture(industry);
  return fixture.team || [];
}

/**
 * Get sample services/menu data for an industry
 */
function getServicesData(industry) {
  const fixture = getIndustryFixture(industry);
  return fixture.services || fixture.menu || [];
}

/**
 * Get sample testimonials for an industry
 */
function getTestimonialsData(industry) {
  const fixture = getIndustryFixture(industry);
  return fixture.testimonials || [];
}

module.exports = {
  // Image libraries
  IMAGES,

  // Food & Beverage
  RESTAURANT_FIXTURE,
  PIZZA_FIXTURE,
  CAFE_FIXTURE,
  BAKERY_FIXTURE,

  // Health & Wellness
  DENTAL_FIXTURE,
  HEALTHCARE_FIXTURE,

  // Beauty & Personal Care
  SALON_FIXTURE,
  BARBERSHOP_FIXTURE,

  // Fitness & Wellness
  FITNESS_FIXTURE,
  YOGA_FIXTURE,

  // Professional Services
  LAW_FIRM_FIXTURE,
  ACCOUNTING_FIXTURE,
  INSURANCE_FIXTURE,
  CONSULTING_FIXTURE,

  // Technology
  SAAS_FIXTURE,

  // Real Estate
  REAL_ESTATE_FIXTURE,

  // Home Services / Trade
  CONSTRUCTION_FIXTURE,
  PLUMBER_FIXTURE,
  ELECTRICIAN_FIXTURE,
  CLEANING_FIXTURE,

  // Automotive
  AUTOMOTIVE_FIXTURE,

  // Pet Services
  PET_SERVICES_FIXTURE,

  // Bars & Nightlife
  BAR_FIXTURE,

  // Chiropractic & Wellness
  CHIROPRACTIC_FIXTURE,

  // Photography & Creative
  PHOTOGRAPHY_FIXTURE,

  // Wedding & Events
  WEDDING_FIXTURE,

  // Nonprofit & Community
  NONPROFIT_FIXTURE,

  // Religious & Spiritual
  CHURCH_FIXTURE,

  // Landscaping & Outdoor
  LANDSCAPING_FIXTURE,

  // Hospitality
  HOTEL_FIXTURE,

  // Moving & Storage
  MOVING_FIXTURE,

  // Event Venues
  EVENT_VENUE_FIXTURE,

  // Education
  SCHOOL_FIXTURE,
  ONLINE_COURSE_FIXTURE,

  // Travel & Tourism
  TRAVEL_FIXTURE,

  // Finance & Investment
  FINANCE_FIXTURE,

  // Portfolio & Creative
  PORTFOLIO_FIXTURE,

  // Subscription Services
  SUBSCRIPTION_BOX_FIXTURE,

  // Music & Entertainment
  MUSICIAN_FIXTURE,

  // Podcasting
  PODCAST_FIXTURE,

  // Gaming & Esports
  GAMING_FIXTURE,

  // Auth
  DEMO_USERS,

  // Helper functions
  getIndustryFixture,
  getIndustryImages,
  getDemoUsers,
  getPortalData,
  getIndustriesWithPortals,
  getLoyaltyData,
  getTeamData,
  getServicesData,
  getTestimonialsData
};
