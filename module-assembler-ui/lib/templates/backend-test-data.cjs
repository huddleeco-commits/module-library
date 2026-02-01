/**
 * Backend Test Data Generator
 *
 * Provides industry-specific mock data for test mode.
 * This gets injected into generated backends so they work without a real database.
 */

const INDUSTRY_TEST_DATA = {
  // ============================================
  // FOOD & BEVERAGE
  // ============================================
  'pizza': {
    menu: {
      categories: [
        { id: 1, name: 'Pizzas', description: 'Hand-tossed, stone-baked pizzas', sort_order: 1 },
        { id: 2, name: 'Sides', description: 'Perfect companions', sort_order: 2 },
        { id: 3, name: 'Drinks', description: 'Refreshing beverages', sort_order: 3 }
      ],
      items: [
        { id: 1, category_id: 1, name: 'Margherita', description: 'Fresh mozzarella, tomato sauce, basil', price: 14.99, image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', is_available: 1, is_popular: 1 },
        { id: 2, category_id: 1, name: 'Pepperoni', description: 'Classic pepperoni with extra cheese', price: 16.99, image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', is_available: 1, is_popular: 1 },
        { id: 3, category_id: 1, name: 'Supreme', description: 'Pepperoni, sausage, peppers, onions, olives', price: 18.99, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', is_available: 1, is_popular: 0 },
        { id: 4, category_id: 1, name: 'BBQ Chicken', description: 'Grilled chicken, BBQ sauce, red onions', price: 17.99, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', is_available: 1, is_popular: 0 },
        { id: 5, category_id: 2, name: 'Garlic Knots', description: '6 pieces with marinara', price: 6.99, image_url: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400', is_available: 1 },
        { id: 6, category_id: 2, name: 'Wings', description: '8 crispy wings, choice of sauce', price: 12.99, image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', is_available: 1 },
        { id: 7, category_id: 3, name: 'Soda', description: 'Coke, Sprite, or Fanta', price: 2.99, is_available: 1 },
        { id: 8, category_id: 3, name: 'Iced Tea', description: 'Fresh brewed', price: 3.49, is_available: 1 }
      ]
    },
    services: []
  },

  'restaurant': {
    menu: {
      categories: [
        { id: 1, name: 'Starters', description: 'Begin your meal', sort_order: 1 },
        { id: 2, name: 'Mains', description: 'Signature dishes', sort_order: 2 },
        { id: 3, name: 'Desserts', description: 'Sweet endings', sort_order: 3 }
      ],
      items: [
        { id: 1, category_id: 1, name: 'Soup of the Day', description: 'Chef\'s daily creation', price: 8.99, is_available: 1 },
        { id: 2, category_id: 1, name: 'Caesar Salad', description: 'Romaine, parmesan, croutons', price: 12.99, is_available: 1, is_popular: 1 },
        { id: 3, category_id: 2, name: 'Grilled Salmon', description: 'Atlantic salmon, seasonal vegetables', price: 28.99, is_available: 1, is_popular: 1 },
        { id: 4, category_id: 2, name: 'Filet Mignon', description: '8oz prime cut, truffle mash', price: 42.99, is_available: 1 },
        { id: 5, category_id: 2, name: 'Pasta Primavera', description: 'Fresh vegetables, light cream sauce', price: 18.99, is_available: 1 },
        { id: 6, category_id: 3, name: 'Chocolate Lava Cake', description: 'Warm, with vanilla ice cream', price: 10.99, is_available: 1, is_popular: 1 },
        { id: 7, category_id: 3, name: 'Tiramisu', description: 'Classic Italian', price: 9.99, is_available: 1 }
      ]
    },
    services: []
  },

  'cafe': {
    menu: {
      categories: [
        { id: 1, name: 'Coffee', description: 'Freshly roasted', sort_order: 1 },
        { id: 2, name: 'Pastries', description: 'Baked fresh daily', sort_order: 2 },
        { id: 3, name: 'Breakfast', description: 'Start your day right', sort_order: 3 }
      ],
      items: [
        { id: 1, category_id: 1, name: 'Espresso', description: 'Double shot', price: 3.50, is_available: 1 },
        { id: 2, category_id: 1, name: 'Latte', description: 'Espresso with steamed milk', price: 5.50, is_available: 1, is_popular: 1 },
        { id: 3, category_id: 1, name: 'Cappuccino', description: 'Espresso, steamed milk, foam', price: 5.00, is_available: 1, is_popular: 1 },
        { id: 4, category_id: 1, name: 'Cold Brew', description: '16oz smooth cold brew', price: 4.50, is_available: 1 },
        { id: 5, category_id: 2, name: 'Croissant', description: 'Butter croissant', price: 4.00, is_available: 1, is_popular: 1 },
        { id: 6, category_id: 2, name: 'Blueberry Muffin', description: 'Fresh baked', price: 3.50, is_available: 1 },
        { id: 7, category_id: 3, name: 'Avocado Toast', description: 'Sourdough, poached egg', price: 12.99, is_available: 1, is_popular: 1 },
        { id: 8, category_id: 3, name: 'Breakfast Sandwich', description: 'Egg, cheese, bacon', price: 9.99, is_available: 1 }
      ]
    },
    services: []
  },

  'bakery': {
    menu: {
      categories: [
        { id: 1, name: 'Breads', description: 'Fresh baked loaves', sort_order: 1 },
        { id: 2, name: 'Pastries', description: 'Sweet treats', sort_order: 2 },
        { id: 3, name: 'Cakes', description: 'Special occasion cakes', sort_order: 3 }
      ],
      items: [
        { id: 1, category_id: 1, name: 'Sourdough Loaf', description: '24-hour ferment', price: 8.00, is_available: 1, is_popular: 1 },
        { id: 2, category_id: 1, name: 'Baguette', description: 'Crusty French style', price: 4.50, is_available: 1 },
        { id: 3, category_id: 2, name: 'Butter Croissant', description: 'Flaky, golden', price: 4.50, is_available: 1, is_popular: 1 },
        { id: 4, category_id: 2, name: 'Pain au Chocolat', description: 'Chocolate filled', price: 5.00, is_available: 1 },
        { id: 5, category_id: 2, name: 'Cinnamon Roll', description: 'With cream cheese frosting', price: 5.50, is_available: 1, is_popular: 1 },
        { id: 6, category_id: 3, name: 'Custom Cake', description: 'Starting at (serves 10)', price: 45.00, is_available: 1 },
        { id: 7, category_id: 3, name: 'Cupcakes (6)', description: 'Assorted flavors', price: 24.00, is_available: 1 }
      ]
    },
    services: []
  },

  // ============================================
  // SPA & GROOMING
  // ============================================
  'spa': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Swedish Massage', description: '60 minutes of relaxation', price: 95, duration: 60, category: 'Massage', is_popular: true },
      { id: 2, name: 'Deep Tissue Massage', description: 'Targeted muscle relief', price: 115, duration: 60, category: 'Massage', is_popular: true },
      { id: 3, name: 'Hot Stone Massage', description: 'Heated stones, full body', price: 125, duration: 75, category: 'Massage' },
      { id: 4, name: 'Signature Facial', description: 'Deep cleanse, hydration', price: 85, duration: 60, category: 'Facial', is_popular: true },
      { id: 5, name: 'Anti-Aging Facial', description: 'Collagen boost treatment', price: 120, duration: 75, category: 'Facial' },
      { id: 6, name: 'Body Scrub', description: 'Exfoliation, moisturize', price: 75, duration: 45, category: 'Body' },
      { id: 7, name: 'Couples Massage', description: 'Side by side relaxation', price: 180, duration: 60, category: 'Packages', is_popular: true },
      { id: 8, name: 'Spa Day Package', description: 'Massage + Facial + Lunch', price: 250, duration: 180, category: 'Packages' }
    ],
    timeSlots: generateTimeSlots(9, 19, 60) // 9am-7pm, 60 min slots
  },

  'salon': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Haircut & Style', description: 'Cut, wash, blow dry', price: 55, duration: 45, category: 'Hair', is_popular: true },
      { id: 2, name: 'Color Service', description: 'Full color application', price: 95, duration: 90, category: 'Hair', is_popular: true },
      { id: 3, name: 'Highlights', description: 'Partial or full', price: 125, duration: 120, category: 'Hair' },
      { id: 4, name: 'Balayage', description: 'Hand-painted highlights', price: 175, duration: 150, category: 'Hair', is_popular: true },
      { id: 5, name: 'Blowout', description: 'Wash and style', price: 45, duration: 45, category: 'Hair' },
      { id: 6, name: 'Manicure', description: 'Shape, polish, massage', price: 35, duration: 30, category: 'Nails' },
      { id: 7, name: 'Pedicure', description: 'Full spa pedicure', price: 55, duration: 45, category: 'Nails', is_popular: true },
      { id: 8, name: 'Gel Manicure', description: 'Long-lasting gel polish', price: 50, duration: 45, category: 'Nails' }
    ],
    timeSlots: generateTimeSlots(9, 19, 30) // 9am-7pm, 30 min slots
  },

  'barbershop': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Classic Cut', description: 'Haircut with clippers and scissors', price: 30, duration: 30, category: 'Cuts', is_popular: true },
      { id: 2, name: 'Fade', description: 'Precision fade haircut', price: 35, duration: 30, category: 'Cuts', is_popular: true },
      { id: 3, name: 'Cut & Beard Trim', description: 'Haircut plus beard shaping', price: 45, duration: 45, category: 'Cuts', is_popular: true },
      { id: 4, name: 'Hot Towel Shave', description: 'Classic straight razor shave', price: 35, duration: 30, category: 'Shave' },
      { id: 5, name: 'Beard Trim', description: 'Shape and line up', price: 20, duration: 15, category: 'Beard' },
      { id: 6, name: 'Beard Treatment', description: 'Trim, oil, hot towel', price: 35, duration: 30, category: 'Beard' },
      { id: 7, name: 'Kids Cut', description: 'Ages 12 and under', price: 20, duration: 20, category: 'Cuts' },
      { id: 8, name: 'Senior Cut', description: '65 and over', price: 25, duration: 30, category: 'Cuts' }
    ],
    timeSlots: generateTimeSlots(9, 19, 30) // 9am-7pm, 30 min slots
  },

  // ============================================
  // HEALTHCARE
  // ============================================
  'dental': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Dental Cleaning', description: 'Routine cleaning and exam', price: 150, duration: 60, category: 'Preventive', is_popular: true },
      { id: 2, name: 'Comprehensive Exam', description: 'Full exam with X-rays', price: 200, duration: 60, category: 'Preventive' },
      { id: 3, name: 'Teeth Whitening', description: 'In-office whitening treatment', price: 350, duration: 90, category: 'Cosmetic', is_popular: true },
      { id: 4, name: 'Filling', description: 'Composite filling', price: 200, duration: 45, category: 'Restorative' },
      { id: 5, name: 'Crown', description: 'Porcelain crown', price: 1200, duration: 90, category: 'Restorative' },
      { id: 6, name: 'Root Canal', description: 'Single tooth', price: 900, duration: 90, category: 'Restorative' },
      { id: 7, name: 'Emergency Visit', description: 'Same-day urgent care', price: 175, duration: 30, category: 'Emergency', is_popular: true },
      { id: 8, name: 'Invisalign Consult', description: 'Free consultation', price: 0, duration: 30, category: 'Cosmetic' }
    ],
    timeSlots: generateTimeSlots(8, 17, 30) // 8am-5pm, 30 min slots
  },

  'healthcare': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Annual Physical', description: 'Comprehensive health exam', price: 250, duration: 60, category: 'Preventive', is_popular: true },
      { id: 2, name: 'Sick Visit', description: 'Same-day illness appointment', price: 125, duration: 30, category: 'Urgent', is_popular: true },
      { id: 3, name: 'Follow-Up Visit', description: 'Check progress on treatment', price: 100, duration: 20, category: 'General' },
      { id: 4, name: 'Lab Work', description: 'Blood tests and analysis', price: 75, duration: 15, category: 'Diagnostic' },
      { id: 5, name: 'Vaccination', description: 'Flu, COVID, other vaccines', price: 45, duration: 15, category: 'Preventive' },
      { id: 6, name: 'Telehealth Visit', description: 'Virtual consultation', price: 75, duration: 20, category: 'Virtual', is_popular: true }
    ],
    timeSlots: generateTimeSlots(8, 17, 30)
  },

  // ============================================
  // PROFESSIONAL SERVICES
  // ============================================
  'law-firm': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Free Consultation', description: '30-minute case review', price: 0, duration: 30, category: 'Consultation', is_popular: true },
      { id: 2, name: 'Document Review', description: 'Contract or legal document review', price: 250, duration: 60, category: 'Services' },
      { id: 3, name: 'Legal Consultation', description: 'Hourly legal advice', price: 350, duration: 60, category: 'Services' },
      { id: 4, name: 'Case Evaluation', description: 'Comprehensive case analysis', price: 500, duration: 90, category: 'Litigation' }
    ],
    timeSlots: generateTimeSlots(9, 17, 30)
  },

  'real-estate': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Buyer Consultation', description: 'Free home buying consultation', price: 0, duration: 60, category: 'Buying', is_popular: true },
      { id: 2, name: 'Seller Consultation', description: 'Home valuation and listing strategy', price: 0, duration: 60, category: 'Selling', is_popular: true },
      { id: 3, name: 'Property Tour', description: 'Scheduled home viewing', price: 0, duration: 60, category: 'Tours' },
      { id: 4, name: 'Market Analysis', description: 'Comprehensive market report', price: 0, duration: 30, category: 'Services' }
    ],
    timeSlots: generateTimeSlots(9, 18, 60)
  },

  // ============================================
  // HOME SERVICES
  // ============================================
  'plumber': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Emergency Service', description: '24/7 emergency plumbing', price: 150, duration: 60, category: 'Emergency', is_popular: true },
      { id: 2, name: 'Drain Cleaning', description: 'Clear clogged drains', price: 125, duration: 60, category: 'Drains', is_popular: true },
      { id: 3, name: 'Water Heater Service', description: 'Repair or replace', price: 200, duration: 90, category: 'Water Heater' },
      { id: 4, name: 'Leak Detection', description: 'Find and fix leaks', price: 175, duration: 60, category: 'Repairs' },
      { id: 5, name: 'Fixture Installation', description: 'Faucet, toilet, etc.', price: 150, duration: 60, category: 'Installation' },
      { id: 6, name: 'Free Estimate', description: 'On-site estimate', price: 0, duration: 30, category: 'Consultation', is_popular: true }
    ],
    timeSlots: generateTimeSlots(7, 19, 60) // 7am-7pm, 60 min windows
  },

  'electrician': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Emergency Service', description: '24/7 electrical emergency', price: 175, duration: 60, category: 'Emergency', is_popular: true },
      { id: 2, name: 'Outlet Installation', description: 'New outlet or upgrade', price: 125, duration: 45, category: 'Installation' },
      { id: 3, name: 'Panel Upgrade', description: 'Electrical panel replacement', price: 500, duration: 180, category: 'Panel' },
      { id: 4, name: 'Lighting Installation', description: 'Fixtures, recessed lights', price: 150, duration: 60, category: 'Lighting', is_popular: true },
      { id: 5, name: 'Ceiling Fan Install', description: 'New fan installation', price: 125, duration: 60, category: 'Installation' },
      { id: 6, name: 'Free Estimate', description: 'On-site evaluation', price: 0, duration: 30, category: 'Consultation', is_popular: true }
    ],
    timeSlots: generateTimeSlots(7, 18, 60)
  },

  // ============================================
  // FITNESS
  // ============================================
  'fitness': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Personal Training (1 hr)', description: 'One-on-one training session', price: 75, duration: 60, category: 'Training', is_popular: true },
      { id: 2, name: 'PT Package (5 sessions)', description: 'Save $50', price: 325, duration: 60, category: 'Packages', is_popular: true },
      { id: 3, name: 'Group Fitness Class', description: 'Drop-in class', price: 20, duration: 45, category: 'Classes' },
      { id: 4, name: 'Nutrition Consultation', description: 'Personalized meal planning', price: 100, duration: 60, category: 'Nutrition' },
      { id: 5, name: 'Body Composition Analysis', description: 'InBody scan and review', price: 50, duration: 30, category: 'Assessment' },
      { id: 6, name: 'Free Trial', description: 'First session free', price: 0, duration: 60, category: 'Consultation', is_popular: true }
    ],
    timeSlots: generateTimeSlots(5, 21, 60) // 5am-9pm, hourly
  },

  'yoga': {
    menu: { categories: [], items: [] },
    services: [
      { id: 1, name: 'Drop-In Class', description: 'Single class visit', price: 25, duration: 60, category: 'Classes', is_popular: true },
      { id: 2, name: 'Class Pack (10)', description: '10 classes, use anytime', price: 200, duration: 60, category: 'Packages', is_popular: true },
      { id: 3, name: 'Monthly Unlimited', description: 'All classes included', price: 150, duration: 0, category: 'Membership' },
      { id: 4, name: 'Private Session', description: 'One-on-one instruction', price: 85, duration: 60, category: 'Private', is_popular: true },
      { id: 5, name: 'First Class Free', description: 'New students only', price: 0, duration: 60, category: 'Trial' }
    ],
    timeSlots: generateTimeSlots(6, 20, 60) // 6am-8pm
  }
};

// Helper to generate time slots for a day
function generateTimeSlots(startHour, endHour, intervalMinutes) {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const displayTime = formatTime(hour, min);
      slots.push({
        time,
        displayTime,
        available: Math.random() > 0.3 // 70% chance available
      });
    }
  }
  return slots;
}

function formatTime(hour, min) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMin = min.toString().padStart(2, '0');
  return `${displayHour}:${displayMin} ${ampm}`;
}

// Get test data for an industry
function getTestDataForIndustry(industry) {
  const normalizedIndustry = (industry || '').toLowerCase().replace(/[^a-z]/g, '');

  // Direct match
  if (INDUSTRY_TEST_DATA[normalizedIndustry]) {
    return INDUSTRY_TEST_DATA[normalizedIndustry];
  }

  // Fuzzy match
  if (normalizedIndustry.includes('pizza')) return INDUSTRY_TEST_DATA['pizza'];
  if (normalizedIndustry.includes('restaurant') || normalizedIndustry.includes('dining')) return INDUSTRY_TEST_DATA['restaurant'];
  if (normalizedIndustry.includes('cafe') || normalizedIndustry.includes('coffee')) return INDUSTRY_TEST_DATA['cafe'];
  if (normalizedIndustry.includes('bakery') || normalizedIndustry.includes('cake')) return INDUSTRY_TEST_DATA['bakery'];
  if (normalizedIndustry.includes('spa') || normalizedIndustry.includes('massage')) return INDUSTRY_TEST_DATA['spa'];
  if (normalizedIndustry.includes('salon') || normalizedIndustry.includes('hair')) return INDUSTRY_TEST_DATA['salon'];
  if (normalizedIndustry.includes('barber')) return INDUSTRY_TEST_DATA['barbershop'];
  if (normalizedIndustry.includes('dental') || normalizedIndustry.includes('dentist')) return INDUSTRY_TEST_DATA['dental'];
  if (normalizedIndustry.includes('health') || normalizedIndustry.includes('medical') || normalizedIndustry.includes('clinic')) return INDUSTRY_TEST_DATA['healthcare'];
  if (normalizedIndustry.includes('law') || normalizedIndustry.includes('attorney') || normalizedIndustry.includes('legal')) return INDUSTRY_TEST_DATA['law-firm'];
  if (normalizedIndustry.includes('real') || normalizedIndustry.includes('realty') || normalizedIndustry.includes('property')) return INDUSTRY_TEST_DATA['real-estate'];
  if (normalizedIndustry.includes('plumb')) return INDUSTRY_TEST_DATA['plumber'];
  if (normalizedIndustry.includes('electric')) return INDUSTRY_TEST_DATA['electrician'];
  if (normalizedIndustry.includes('fitness') || normalizedIndustry.includes('gym')) return INDUSTRY_TEST_DATA['fitness'];
  if (normalizedIndustry.includes('yoga') || normalizedIndustry.includes('pilates')) return INDUSTRY_TEST_DATA['yoga'];

  // Default to restaurant
  return INDUSTRY_TEST_DATA['restaurant'];
}

// Generate test data JS file content for a project
function generateTestDataModule(industry) {
  const data = getTestDataForIndustry(industry);

  return `/**
 * Test Data Module
 * Auto-generated mock data for test mode
 * Industry: ${industry}
 */

const TEST_DATA = ${JSON.stringify(data, null, 2)};

// Get menu with categories
function getMenu() {
  const { categories, items } = TEST_DATA.menu;
  return {
    categories: categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.category_id === cat.id)
    }))
  };
}

// Get services list
function getServices() {
  return TEST_DATA.services || [];
}

// Get available time slots for a date
function getTimeSlots(date) {
  // Return slots with some randomized availability
  return (TEST_DATA.timeSlots || []).map(slot => ({
    ...slot,
    available: Math.random() > 0.3,
    date: date || new Date().toISOString().split('T')[0]
  }));
}

// Mock order storage
const orders = [];
function createOrder(orderData) {
  const order = {
    id: 'ORD-' + Date.now(),
    ...orderData,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  return order;
}

// Mock booking storage
const bookings = [];
function createBooking(bookingData) {
  const booking = {
    id: 'BK-' + Date.now(),
    ...bookingData,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  return booking;
}

module.exports = {
  TEST_DATA,
  getMenu,
  getServices,
  getTimeSlots,
  createOrder,
  createBooking,
  orders,
  bookings
};
`;
}

module.exports = {
  INDUSTRY_TEST_DATA,
  getTestDataForIndustry,
  generateTestDataModule,
  generateTimeSlots
};
