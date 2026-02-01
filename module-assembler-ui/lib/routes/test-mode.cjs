/**
 * Test Mode Routes
 *
 * Provides endpoints for Test Mode - allows testing full pipeline without AI API costs
 * Uses mock fixtures instead of calling Claude API
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const {
  getAvailableFixtures,
  loadFixture,
  applyCustomizations
} = require('../../test-fixtures/index.cjs');

const {
  getIndustryFixture,
  getIndustryCategory,
  getAppScreens,
  getSampleData,
  getLoyaltyConfig
} = require('../configs/industry-fixtures.cjs');

// Screenshot service for automated previews
let screenshotService = null;
try {
  screenshotService = require('../services/screenshot-service.cjs');
} catch (e) {
  console.log('[Test Mode] Screenshot service not available:', e.message);
}

// Archetype system for artisan food industries
let archetypeSystem = null;
let archetypePages = null;
try {
  archetypeSystem = require('../config/layout-archetypes.cjs');
  archetypePages = require('../generators/archetype-pages.cjs');
  console.log('[Test Mode] Archetype system loaded');
} catch (e) {
  console.log('[Test Mode] Archetype system not available:', e.message);
}

/**
 * Business Type Detection & Content Adjustment
 * Scans business name/tagline for keywords and adjusts content accordingly
 * Covers: Restaurants, Fitness, Salon/Beauty, Healthcare, Professional Services, Tech, Education, Retail, Home Services
 */

// ============================================
// RESTAURANT / FOOD & BEVERAGE TYPES
// ============================================
const CUISINE_KEYWORDS = {
  italian: {
    keywords: ['italian', 'italia', 'pizzeria', 'trattoria', 'ristorante', 'pasta', 'tuscan', 'sicilian', 'roman'],
    menuItems: [
      { name: 'Margherita Pizza', price: '$16', description: 'Fresh mozzarella, tomato sauce, basil' },
      { name: 'Spaghetti Carbonara', price: '$18', description: 'Guanciale, egg, pecorino, black pepper' },
      { name: 'Lasagna Bolognese', price: '$22', description: 'Layers of pasta, meat ragù, béchamel' },
      { name: 'Chicken Parmigiana', price: '$24', description: 'Breaded chicken, marinara, mozzarella' },
      { name: 'Tiramisu', price: '$10', description: 'Espresso-soaked ladyfingers, mascarpone' },
      { name: 'Bruschetta', price: '$12', description: 'Grilled bread, tomatoes, garlic, basil' }
    ],
    heroImage: 'italian-restaurant-interior.jpg',
    ambiance: 'Warm and inviting Italian atmosphere'
  },
  pizza: {
    keywords: ['pizza', 'pizzeria', 'pie', 'slice'],
    menuItems: [
      { name: 'Classic Margherita', price: '$18', description: 'San Marzano tomatoes, fresh mozzarella, basil' },
      { name: 'Pepperoni Supreme', price: '$20', description: 'Loaded pepperoni, mozzarella, oregano' },
      { name: 'Meat Lovers', price: '$24', description: 'Pepperoni, sausage, bacon, ham' },
      { name: 'Veggie Delight', price: '$19', description: 'Bell peppers, mushrooms, onions, olives' },
      { name: 'Buffalo Chicken', price: '$22', description: 'Spicy buffalo chicken, ranch, celery' },
      { name: 'Garlic Knots', price: '$8', description: 'Fresh baked, garlic butter, parmesan' }
    ],
    heroImage: 'pizza-oven-hero.jpg',
    ambiance: 'Authentic pizzeria experience'
  },
  burger: {
    keywords: ['burger', 'burgers', 'grill', 'patty', 'smash'],
    menuItems: [
      { name: 'Classic Smash Burger', price: '$14', description: 'Double patty, American cheese, pickles, special sauce' },
      { name: 'Bacon BBQ Burger', price: '$16', description: 'Crispy bacon, cheddar, BBQ sauce, onion rings' },
      { name: 'Mushroom Swiss', price: '$15', description: 'Sautéed mushrooms, Swiss cheese, garlic aioli' },
      { name: 'Spicy Jalapeño', price: '$15', description: 'Pepper jack, jalapeños, chipotle mayo' },
      { name: 'Loaded Fries', price: '$10', description: 'Cheese sauce, bacon bits, green onions' },
      { name: 'Milkshake', price: '$7', description: 'Hand-spun, choice of flavor' }
    ],
    heroImage: 'burger-grill-hero.jpg',
    ambiance: 'Classic American burger joint'
  },
  steakhouse: {
    keywords: ['steak', 'steakhouse', 'chophouse', 'prime', 'ribeye', 'filet'],
    menuItems: [
      { name: 'Filet Mignon', price: '$58', description: '8oz center cut, butter-basted' },
      { name: 'Ribeye', price: '$52', description: '16oz bone-in, perfectly marbled' },
      { name: 'NY Strip', price: '$48', description: '14oz prime cut, char-grilled' },
      { name: 'Surf & Turf', price: '$72', description: 'Filet and lobster tail' },
      { name: 'Creamed Spinach', price: '$14', description: 'Classic steakhouse style' },
      { name: 'Loaded Baked Potato', price: '$12', description: 'Bacon, sour cream, chives' }
    ],
    heroImage: 'steakhouse-interior.jpg',
    ambiance: 'Upscale steakhouse dining'
  },
  mexican: {
    keywords: ['mexican', 'taco', 'tacos', 'burrito', 'cantina', 'taqueria', 'tex-mex'],
    menuItems: [
      { name: 'Street Tacos', price: '$14', description: 'Three tacos, cilantro, onion, salsa verde' },
      { name: 'Burrito Supreme', price: '$16', description: 'Rice, beans, meat, cheese, sour cream, guac' },
      { name: 'Enchiladas', price: '$18', description: 'Three enchiladas, red or green sauce' },
      { name: 'Chips & Guacamole', price: '$10', description: 'Fresh made tableside' },
      { name: 'Queso Fundido', price: '$12', description: 'Melted cheese, chorizo, tortillas' },
      { name: 'Churros', price: '$8', description: 'Cinnamon sugar, chocolate sauce' }
    ],
    heroImage: 'mexican-restaurant-hero.jpg',
    ambiance: 'Vibrant Mexican cantina'
  },
  sushi: {
    keywords: ['sushi', 'japanese', 'ramen', 'izakaya', 'omakase', 'sake'],
    menuItems: [
      { name: 'Dragon Roll', price: '$18', description: 'Eel, avocado, cucumber, eel sauce' },
      { name: 'Salmon Sashimi', price: '$16', description: 'Fresh Atlantic salmon, 8 pieces' },
      { name: 'Spicy Tuna Roll', price: '$14', description: 'Spicy tuna, cucumber, sesame' },
      { name: 'Tonkotsu Ramen', price: '$17', description: 'Rich pork broth, chashu, soft egg' },
      { name: 'Edamame', price: '$6', description: 'Steamed, sea salt' },
      { name: 'Mochi Ice Cream', price: '$8', description: 'Assorted flavors' }
    ],
    heroImage: 'sushi-restaurant-hero.jpg',
    ambiance: 'Modern Japanese dining'
  },
  chinese: {
    keywords: ['chinese', 'dim sum', 'szechuan', 'cantonese', 'wok'],
    menuItems: [
      { name: 'General Tso Chicken', price: '$16', description: 'Crispy chicken, sweet-spicy sauce' },
      { name: 'Kung Pao Shrimp', price: '$18', description: 'Wok-tossed, peanuts, dried chilies' },
      { name: 'Beef & Broccoli', price: '$17', description: 'Tender beef, fresh broccoli, oyster sauce' },
      { name: 'Fried Rice', price: '$12', description: 'Egg, vegetables, choice of protein' },
      { name: 'Dim Sum Platter', price: '$22', description: 'Chef selection of dumplings' },
      { name: 'Egg Rolls', price: '$8', description: 'Crispy, vegetable-filled' }
    ],
    heroImage: 'chinese-restaurant-hero.jpg',
    ambiance: 'Authentic Chinese cuisine'
  },
  thai: {
    keywords: ['thai', 'thailand', 'pad thai', 'curry'],
    menuItems: [
      { name: 'Pad Thai', price: '$16', description: 'Rice noodles, shrimp, peanuts, lime' },
      { name: 'Green Curry', price: '$17', description: 'Coconut milk, Thai basil, vegetables' },
      { name: 'Tom Yum Soup', price: '$12', description: 'Spicy lemongrass, shrimp, mushrooms' },
      { name: 'Massaman Curry', price: '$18', description: 'Tender beef, potatoes, peanuts' },
      { name: 'Spring Rolls', price: '$8', description: 'Fresh vegetables, peanut sauce' },
      { name: 'Mango Sticky Rice', price: '$9', description: 'Sweet coconut rice, fresh mango' }
    ],
    heroImage: 'thai-restaurant-hero.jpg',
    ambiance: 'Authentic Thai flavors'
  },
  indian: {
    keywords: ['indian', 'curry', 'tandoori', 'masala', 'naan'],
    menuItems: [
      { name: 'Butter Chicken', price: '$18', description: 'Creamy tomato sauce, tender chicken' },
      { name: 'Lamb Vindaloo', price: '$22', description: 'Spicy curry, potatoes' },
      { name: 'Chicken Tikka Masala', price: '$19', description: 'Grilled chicken, rich sauce' },
      { name: 'Vegetable Biryani', price: '$16', description: 'Aromatic basmati, mixed vegetables' },
      { name: 'Garlic Naan', price: '$5', description: 'Fresh baked, garlic butter' },
      { name: 'Samosas', price: '$8', description: 'Crispy pastry, spiced potatoes' }
    ],
    heroImage: 'indian-restaurant-hero.jpg',
    ambiance: 'Rich Indian spices and flavors'
  },
  mediterranean: {
    keywords: ['mediterranean', 'greek', 'lebanese', 'falafel', 'hummus', 'gyro'],
    menuItems: [
      { name: 'Lamb Gyro Platter', price: '$18', description: 'Sliced lamb, tzatziki, pita' },
      { name: 'Falafel Wrap', price: '$14', description: 'Crispy falafel, tahini, vegetables' },
      { name: 'Chicken Shawarma', price: '$17', description: 'Marinated chicken, garlic sauce' },
      { name: 'Mezze Platter', price: '$22', description: 'Hummus, baba ganoush, falafel, pita' },
      { name: 'Greek Salad', price: '$12', description: 'Feta, olives, cucumbers, tomatoes' },
      { name: 'Baklava', price: '$8', description: 'Honey-soaked phyllo, pistachios' }
    ],
    heroImage: 'mediterranean-restaurant-hero.jpg',
    ambiance: 'Fresh Mediterranean cuisine'
  },
  french: {
    keywords: ['french', 'bistro', 'brasserie', 'parisian', 'cafe'],
    menuItems: [
      { name: 'Coq au Vin', price: '$32', description: 'Braised chicken, red wine, mushrooms' },
      { name: 'Beef Bourguignon', price: '$36', description: 'Slow-braised beef, red wine sauce' },
      { name: 'Duck Confit', price: '$34', description: 'Crispy leg, lentils, greens' },
      { name: 'French Onion Soup', price: '$14', description: 'Caramelized onions, gruyère crouton' },
      { name: 'Crème Brûlée', price: '$12', description: 'Vanilla custard, caramelized sugar' },
      { name: 'Escargot', price: '$16', description: 'Garlic herb butter, baguette' }
    ],
    heroImage: 'french-bistro-hero.jpg',
    ambiance: 'Classic French bistro'
  },
  bbq: {
    keywords: ['bbq', 'barbecue', 'smokehouse', 'brisket', 'ribs', 'smoked'],
    menuItems: [
      { name: 'Smoked Brisket', price: '$26', description: '12-hour smoked, house rub' },
      { name: 'Baby Back Ribs', price: '$28', description: 'Fall-off-the-bone, tangy sauce' },
      { name: 'Pulled Pork', price: '$18', description: 'Slow-smoked, Carolina style' },
      { name: 'BBQ Platter', price: '$34', description: 'Brisket, ribs, sausage, two sides' },
      { name: 'Mac & Cheese', price: '$8', description: 'Creamy, three-cheese blend' },
      { name: 'Cornbread', price: '$5', description: 'House-made, honey butter' }
    ],
    heroImage: 'bbq-smokehouse-hero.jpg',
    ambiance: 'Authentic smokehouse BBQ'
  },
  seafood: {
    keywords: ['seafood', 'fish', 'oyster', 'lobster', 'crab', 'shrimp', 'coastal'],
    menuItems: [
      { name: 'Lobster Roll', price: '$32', description: 'Fresh Maine lobster, butter, brioche' },
      { name: 'Fish & Chips', price: '$22', description: 'Beer-battered cod, tartar sauce' },
      { name: 'Grilled Salmon', price: '$28', description: 'Lemon dill, seasonal vegetables' },
      { name: 'Oysters on the Half Shell', price: '$24', description: 'Half dozen, mignonette' },
      { name: 'Clam Chowder', price: '$12', description: 'New England style, oyster crackers' },
      { name: 'Shrimp Cocktail', price: '$18', description: 'Jumbo shrimp, cocktail sauce' }
    ],
    heroImage: 'seafood-restaurant-hero.jpg',
    ambiance: 'Fresh coastal seafood'
  },
  cafe: {
    keywords: ['cafe', 'coffee', 'espresso', 'bakery', 'brunch'],
    menuItems: [
      { name: 'Avocado Toast', price: '$14', description: 'Sourdough, poached eggs, everything seasoning' },
      { name: 'Eggs Benedict', price: '$16', description: 'Hollandaise, Canadian bacon, English muffin' },
      { name: 'Açaí Bowl', price: '$13', description: 'Fresh berries, granola, honey' },
      { name: 'Belgian Waffle', price: '$12', description: 'Fresh fruit, whipped cream, maple' },
      { name: 'Latte', price: '$5', description: 'Double espresso, steamed milk' },
      { name: 'Fresh Pastries', price: '$4', description: 'Daily selection' }
    ],
    heroImage: 'cafe-brunch-hero.jpg',
    ambiance: 'Cozy cafe atmosphere'
  }
};

// ============================================
// FITNESS & WELLNESS TYPES
// ============================================
const FITNESS_KEYWORDS = {
  gym: {
    keywords: ['gym', 'fitness center', 'fitness club', 'athletic club'],
    services: [
      { name: 'Monthly Membership', price: '$49/mo', description: 'Full gym access, all equipment' },
      { name: 'Personal Training', price: '$75/session', description: 'One-on-one with certified trainer' },
      { name: 'Group Classes', price: 'Included', description: 'Spin, HIIT, strength, and more' },
      { name: 'Day Pass', price: '$15', description: 'Full access for 24 hours' },
      { name: 'Locker Rental', price: '$10/mo', description: 'Secure storage, towel service' },
      { name: 'Nutrition Coaching', price: '$99/mo', description: 'Personalized meal plans' }
    ],
    heroImage: 'gym-equipment-hero.jpg',
    ambiance: 'State-of-the-art fitness facility'
  },
  crossfit: {
    keywords: ['crossfit', 'cross fit', 'functional fitness', 'wod'],
    services: [
      { name: 'Unlimited Membership', price: '$175/mo', description: 'Unlimited classes, open gym' },
      { name: 'Foundations Course', price: '$199', description: '4-week intro program for beginners' },
      { name: 'Drop-In Class', price: '$25', description: 'Single class for visitors' },
      { name: 'Competition Training', price: '$250/mo', description: 'Advanced programming, extra coaching' },
      { name: 'Nutrition Challenge', price: '$149', description: '6-week guided nutrition program' },
      { name: 'Private Coaching', price: '$100/hr', description: 'One-on-one skill work' }
    ],
    heroImage: 'crossfit-box-hero.jpg',
    ambiance: 'Community-driven CrossFit box'
  },
  yoga: {
    keywords: ['yoga', 'yogastudio', 'vinyasa', 'hot yoga', 'bikram', 'meditation'],
    services: [
      { name: 'Unlimited Monthly', price: '$129/mo', description: 'All classes, all styles' },
      { name: 'Class Pack (10)', price: '$150', description: '10 classes, never expires' },
      { name: 'Drop-In Class', price: '$20', description: 'Single class attendance' },
      { name: 'Private Session', price: '$85/hr', description: 'Personalized instruction' },
      { name: 'Teacher Training', price: '$2,500', description: '200-hour certification' },
      { name: 'Meditation Workshop', price: '$45', description: '2-hour guided session' }
    ],
    heroImage: 'yoga-studio-hero.jpg',
    ambiance: 'Peaceful sanctuary for mind and body'
  },
  pilates: {
    keywords: ['pilates', 'reformer', 'barre', 'core'],
    services: [
      { name: 'Unlimited Reformer', price: '$199/mo', description: 'All reformer classes' },
      { name: 'Mat Classes', price: '$99/mo', description: 'Unlimited mat Pilates' },
      { name: 'Private Reformer', price: '$95/session', description: 'One-on-one instruction' },
      { name: 'Duet Session', price: '$130', description: 'Semi-private, 2 people' },
      { name: 'Intro Package', price: '$149', description: '3 private sessions for beginners' },
      { name: 'Barre Fusion', price: '$22/class', description: 'Pilates meets ballet' }
    ],
    heroImage: 'pilates-studio-hero.jpg',
    ambiance: 'Precision movement studio'
  },
  boxing: {
    keywords: ['boxing', 'mma', 'kickboxing', 'muay thai', 'martial arts', 'fight', 'combat'],
    services: [
      { name: 'Unlimited Classes', price: '$159/mo', description: 'All group classes' },
      { name: 'Private Coaching', price: '$80/session', description: 'One-on-one with trainer' },
      { name: 'Kids Program', price: '$99/mo', description: 'Ages 6-14, discipline & fitness' },
      { name: 'Competition Team', price: '$200/mo', description: 'Advanced fight training' },
      { name: 'Drop-In Class', price: '$25', description: 'Single class' },
      { name: 'Equipment Package', price: '$89', description: 'Gloves, wraps, bag' }
    ],
    heroImage: 'boxing-gym-hero.jpg',
    ambiance: 'Train like a fighter'
  },
  personaltraining: {
    keywords: ['personal training', 'personal trainer', 'pt studio', 'private training', 'one on one'],
    services: [
      { name: 'Single Session', price: '$85', description: '1-hour personal training' },
      { name: '10 Session Pack', price: '$750', description: 'Save $100, flexible scheduling' },
      { name: 'Monthly Unlimited', price: '$600/mo', description: '3x/week training' },
      { name: 'Couples Training', price: '$120/session', description: 'Train with a partner' },
      { name: 'Online Coaching', price: '$199/mo', description: 'Custom programs, weekly check-ins' },
      { name: 'Assessment', price: '$50', description: 'Body composition, movement screening' }
    ],
    heroImage: 'personal-training-hero.jpg',
    ambiance: 'Personalized fitness coaching'
  }
};

// ============================================
// SALON & BEAUTY TYPES
// ============================================
const SALON_KEYWORDS = {
  hairsalon: {
    keywords: ['hair salon', 'hair studio', 'hairdresser', 'hair stylist', 'salon', 'cuts', 'color'],
    services: [
      { name: "Women's Haircut", price: '$65+', description: 'Cut, wash, blowout' },
      { name: "Men's Haircut", price: '$35+', description: 'Cut, wash, style' },
      { name: 'Full Color', price: '$120+', description: 'Single process, all-over color' },
      { name: 'Highlights', price: '$150+', description: 'Partial or full foils' },
      { name: 'Balayage', price: '$200+', description: 'Hand-painted highlights' },
      { name: 'Blowout', price: '$45', description: 'Wash and style' }
    ],
    heroImage: 'hair-salon-hero.jpg',
    ambiance: 'Where style meets artistry'
  },
  barbershop: {
    keywords: ['barber', 'barbershop', 'barber shop', 'mens grooming', 'fade', 'shave'],
    services: [
      { name: 'Classic Haircut', price: '$30', description: 'Cut, hot towel, style' },
      { name: 'Haircut & Beard', price: '$45', description: 'Full grooming package' },
      { name: 'Hot Towel Shave', price: '$35', description: 'Traditional straight razor' },
      { name: 'Beard Trim', price: '$20', description: 'Shape and line up' },
      { name: 'Kids Cut', price: '$20', description: 'Ages 12 and under' },
      { name: 'The Works', price: '$65', description: 'Cut, shave, facial, massage' }
    ],
    heroImage: 'barbershop-hero.jpg',
    ambiance: 'Classic barbershop experience'
  },
  nailsalon: {
    keywords: ['nail salon', 'nails', 'manicure', 'pedicure', 'nail spa', 'nail bar'],
    services: [
      { name: 'Classic Manicure', price: '$25', description: 'Shape, cuticle care, polish' },
      { name: 'Gel Manicure', price: '$45', description: 'Long-lasting gel polish' },
      { name: 'Classic Pedicure', price: '$40', description: 'Soak, scrub, massage, polish' },
      { name: 'Mani-Pedi Combo', price: '$60', description: 'Both services, save $5' },
      { name: 'Nail Art', price: '$10+', description: 'Custom designs per nail' },
      { name: 'Acrylic Full Set', price: '$55', description: 'Full set with tips' }
    ],
    heroImage: 'nail-salon-hero.jpg',
    ambiance: 'Pamper yourself beautifully'
  },
  spa: {
    keywords: ['spa', 'day spa', 'med spa', 'wellness spa', 'massage', 'facial'],
    services: [
      { name: 'Swedish Massage', price: '$95/60min', description: 'Relaxation, light pressure' },
      { name: 'Deep Tissue', price: '$115/60min', description: 'Therapeutic, muscle relief' },
      { name: 'Signature Facial', price: '$120', description: 'Cleanse, extract, hydrate' },
      { name: 'Body Wrap', price: '$150', description: 'Detox and hydration' },
      { name: 'Couples Massage', price: '$190', description: 'Side-by-side relaxation' },
      { name: 'Spa Day Package', price: '$299', description: 'Massage, facial, lunch' }
    ],
    heroImage: 'spa-relaxation-hero.jpg',
    ambiance: 'Your escape to tranquility'
  },
  aesthetics: {
    keywords: ['aesthetics', 'medspa', 'botox', 'filler', 'laser', 'skincare', 'cosmetic', 'beauty clinic'],
    services: [
      { name: 'Botox', price: '$12/unit', description: 'Wrinkle relaxer, natural results' },
      { name: 'Dermal Fillers', price: '$650/syringe', description: 'Volume and contouring' },
      { name: 'Chemical Peel', price: '$150+', description: 'Skin resurfacing' },
      { name: 'Laser Hair Removal', price: '$200+', description: 'Per treatment area' },
      { name: 'Microneedling', price: '$300', description: 'Collagen stimulation' },
      { name: 'Hydrafacial', price: '$199', description: 'Deep cleanse and hydrate' }
    ],
    heroImage: 'aesthetics-clinic-hero.jpg',
    ambiance: 'Advanced beauty treatments'
  },
  lashbrow: {
    keywords: ['lash', 'lashes', 'brow', 'brows', 'microblading', 'extensions', 'wax'],
    services: [
      { name: 'Classic Lash Set', price: '$150', description: 'Natural look, 2-3 week fill' },
      { name: 'Volume Lash Set', price: '$200', description: 'Fuller, dramatic look' },
      { name: 'Lash Fill', price: '$75', description: '2-3 week maintenance' },
      { name: 'Brow Wax & Shape', price: '$25', description: 'Perfect arch' },
      { name: 'Microblading', price: '$400', description: 'Semi-permanent brows' },
      { name: 'Lash Lift & Tint', price: '$85', description: 'Natural curl enhancement' }
    ],
    heroImage: 'lash-brow-hero.jpg',
    ambiance: 'Perfect lashes, perfect brows'
  }
};

// ============================================
// HEALTHCARE TYPES
// ============================================
const HEALTHCARE_KEYWORDS = {
  dental: {
    keywords: ['dental', 'dentist', 'dentistry', 'orthodontic', 'teeth', 'smile'],
    services: [
      { name: 'Cleaning & Exam', price: '$150', description: 'Routine cleaning, X-rays, exam' },
      { name: 'Teeth Whitening', price: '$350', description: 'Professional in-office treatment' },
      { name: 'Dental Filling', price: '$200+', description: 'Composite restoration' },
      { name: 'Crown', price: '$1,200+', description: 'Porcelain or ceramic' },
      { name: 'Invisalign Consult', price: 'Free', description: 'Clear aligner assessment' },
      { name: 'Emergency Visit', price: '$100', description: 'Same-day urgent care' }
    ],
    heroImage: 'dental-office-hero.jpg',
    ambiance: 'Your smile is our priority'
  },
  chiropractic: {
    keywords: ['chiropractor', 'chiropractic', 'spine', 'adjustment', 'back pain'],
    services: [
      { name: 'Initial Consultation', price: '$75', description: 'Exam, X-rays, treatment plan' },
      { name: 'Adjustment', price: '$50', description: 'Spinal manipulation' },
      { name: 'Massage Therapy', price: '$80/hr', description: 'Therapeutic massage' },
      { name: 'Wellness Package', price: '$400', description: '10 adjustments' },
      { name: 'Decompression', price: '$75', description: 'Spinal decompression therapy' },
      { name: 'Sports Rehab', price: '$100', description: 'Athletic injury treatment' }
    ],
    heroImage: 'chiropractic-hero.jpg',
    ambiance: 'Align your body, elevate your life'
  },
  physicaltherapy: {
    keywords: ['physical therapy', 'pt', 'rehab', 'rehabilitation', 'sports medicine', 'recovery'],
    services: [
      { name: 'Initial Evaluation', price: '$150', description: 'Assessment and treatment plan' },
      { name: 'PT Session', price: '$125', description: 'One-on-one therapy' },
      { name: 'Dry Needling', price: '$50', description: 'Trigger point therapy' },
      { name: 'Manual Therapy', price: '$125', description: 'Hands-on techniques' },
      { name: 'Sports Rehab', price: '$150', description: 'Return to play program' },
      { name: 'Wellness Program', price: '$99/mo', description: 'Ongoing maintenance' }
    ],
    heroImage: 'physical-therapy-hero.jpg',
    ambiance: 'Move better, live better'
  },
  medical: {
    keywords: ['medical', 'doctor', 'physician', 'clinic', 'healthcare', 'primary care', 'family medicine'],
    services: [
      { name: 'Annual Physical', price: '$200', description: 'Comprehensive wellness exam' },
      { name: 'Sick Visit', price: '$125', description: 'Acute illness treatment' },
      { name: 'Lab Work', price: '$50+', description: 'Blood tests, screenings' },
      { name: 'Vaccination', price: '$30+', description: 'Immunizations' },
      { name: 'Telehealth Visit', price: '$75', description: 'Virtual consultation' },
      { name: 'Sports Physical', price: '$50', description: 'Clearance for athletics' }
    ],
    heroImage: 'medical-clinic-hero.jpg',
    ambiance: 'Compassionate care for your family'
  },
  dermatology: {
    keywords: ['dermatology', 'dermatologist', 'skin', 'acne', 'eczema'],
    services: [
      { name: 'Skin Exam', price: '$150', description: 'Full body screening' },
      { name: 'Acne Treatment', price: '$175', description: 'Consultation and treatment plan' },
      { name: 'Mole Removal', price: '$250+', description: 'Biopsy and removal' },
      { name: 'Cosmetic Consult', price: '$100', description: 'Anti-aging options' },
      { name: 'Phototherapy', price: '$100', description: 'Light treatment session' },
      { name: 'Patch Testing', price: '$200', description: 'Allergy diagnosis' }
    ],
    heroImage: 'dermatology-hero.jpg',
    ambiance: 'Healthy skin, confident you'
  },
  optometry: {
    keywords: ['optometry', 'optometrist', 'eye', 'vision', 'glasses', 'contacts', 'optical'],
    services: [
      { name: 'Eye Exam', price: '$100', description: 'Comprehensive vision test' },
      { name: 'Contact Fitting', price: '$75', description: 'Lens fitting and trial' },
      { name: 'Glasses Frame', price: '$150+', description: 'Designer and budget options' },
      { name: 'Lens Package', price: '$200+', description: 'Single vision or progressive' },
      { name: 'Retinal Imaging', price: '$40', description: 'Digital eye health scan' },
      { name: 'Dry Eye Treatment', price: '$150', description: 'Diagnosis and therapy' }
    ],
    heroImage: 'optometry-hero.jpg',
    ambiance: 'See life clearly'
  }
};

// ============================================
// PROFESSIONAL SERVICES TYPES
// ============================================
const PROFESSIONAL_KEYWORDS = {
  lawfirm: {
    keywords: ['law', 'lawyer', 'attorney', 'legal', 'law firm', 'litigation', 'counsel'],
    services: [
      { name: 'Initial Consultation', price: '$150', description: 'Case evaluation, legal advice' },
      { name: 'Document Review', price: '$300/hr', description: 'Contract and agreement review' },
      { name: 'Representation', price: 'Custom', description: 'Court representation' },
      { name: 'Estate Planning', price: '$1,500+', description: 'Wills, trusts, powers of attorney' },
      { name: 'Business Formation', price: '$800+', description: 'LLC, corporation setup' },
      { name: 'Legal Letter', price: '$500', description: 'Demand or cease and desist' }
    ],
    heroImage: 'law-firm-hero.jpg',
    ambiance: 'Experienced legal advocacy'
  },
  accounting: {
    keywords: ['accounting', 'accountant', 'cpa', 'bookkeeping', 'tax', 'financial'],
    services: [
      { name: 'Tax Preparation', price: '$300+', description: 'Individual or business returns' },
      { name: 'Monthly Bookkeeping', price: '$400/mo', description: 'Transaction categorization' },
      { name: 'Payroll Services', price: '$150/mo', description: 'Employee payroll processing' },
      { name: 'Tax Planning', price: '$500', description: 'Strategic tax optimization' },
      { name: 'Business Advisory', price: '$200/hr', description: 'Financial consulting' },
      { name: 'Audit Support', price: 'Custom', description: 'IRS or state audit assistance' }
    ],
    heroImage: 'accounting-hero.jpg',
    ambiance: 'Your financial success partner'
  },
  realestate: {
    keywords: ['real estate', 'realtor', 'realty', 'property', 'homes', 'broker'],
    services: [
      { name: 'Buyer Representation', price: '2.5-3%', description: 'Full-service home buying' },
      { name: 'Seller Listing', price: '5-6%', description: 'Marketing and sale' },
      { name: 'Market Analysis', price: 'Free', description: 'Home value assessment' },
      { name: 'Rental Search', price: '$500', description: 'Find your perfect rental' },
      { name: 'Investment Consult', price: '$200', description: 'Property investment advice' },
      { name: 'Relocation Services', price: 'Custom', description: 'Out-of-area assistance' }
    ],
    heroImage: 'real-estate-hero.jpg',
    ambiance: 'Finding your perfect home'
  },
  insurance: {
    keywords: ['insurance', 'insure', 'coverage', 'policy', 'agent', 'broker'],
    services: [
      { name: 'Free Quote', price: 'Free', description: 'No-obligation rate comparison' },
      { name: 'Auto Insurance', price: 'Custom', description: 'Vehicle coverage' },
      { name: 'Home Insurance', price: 'Custom', description: 'Property protection' },
      { name: 'Life Insurance', price: 'Custom', description: 'Term and whole life' },
      { name: 'Business Insurance', price: 'Custom', description: 'Commercial coverage' },
      { name: 'Policy Review', price: 'Free', description: 'Annual coverage checkup' }
    ],
    heroImage: 'insurance-hero.jpg',
    ambiance: 'Protection you can count on'
  },
  consulting: {
    keywords: ['consulting', 'consultant', 'advisory', 'strategy', 'management'],
    services: [
      { name: 'Discovery Session', price: '$500', description: 'Business assessment' },
      { name: 'Strategy Workshop', price: '$2,500', description: 'Full-day planning session' },
      { name: 'Monthly Retainer', price: '$3,000/mo', description: 'Ongoing advisory' },
      { name: 'Project Engagement', price: 'Custom', description: 'Defined scope work' },
      { name: 'Executive Coaching', price: '$400/hr', description: 'Leadership development' },
      { name: 'Team Training', price: '$5,000', description: 'Group workshop' }
    ],
    heroImage: 'consulting-hero.jpg',
    ambiance: 'Strategic solutions for growth'
  },
  marketing: {
    keywords: ['marketing', 'advertising', 'agency', 'digital', 'social media', 'branding', 'creative'],
    services: [
      { name: 'Brand Strategy', price: '$5,000+', description: 'Complete brand development' },
      { name: 'Social Media Mgmt', price: '$1,500/mo', description: 'Content and engagement' },
      { name: 'SEO Package', price: '$1,000/mo', description: 'Search optimization' },
      { name: 'PPC Management', price: '$500+/mo', description: 'Paid advertising' },
      { name: 'Website Design', price: '$5,000+', description: 'Custom web development' },
      { name: 'Content Creation', price: '$500/mo', description: 'Blog and media' }
    ],
    heroImage: 'marketing-agency-hero.jpg',
    ambiance: 'Creative strategies that convert'
  }
};

// ============================================
// TECH & SOFTWARE TYPES
// ============================================
const TECH_KEYWORDS = {
  saas: {
    keywords: ['saas', 'software', 'platform', 'app', 'cloud', 'solution'],
    services: [
      { name: 'Starter Plan', price: '$29/mo', description: 'Essential features, 3 users' },
      { name: 'Professional', price: '$99/mo', description: 'Advanced features, 10 users' },
      { name: 'Enterprise', price: 'Custom', description: 'Unlimited, dedicated support' },
      { name: 'Free Trial', price: 'Free', description: '14-day full access' },
      { name: 'Onboarding', price: '$500', description: 'Setup and training' },
      { name: 'API Access', price: '$199/mo', description: 'Developer integration' }
    ],
    heroImage: 'saas-platform-hero.jpg',
    ambiance: 'Software that scales with you'
  },
  development: {
    keywords: ['development', 'developer', 'web development', 'app development', 'coding', 'programming'],
    services: [
      { name: 'Website Build', price: '$5,000+', description: 'Custom web development' },
      { name: 'Mobile App', price: '$25,000+', description: 'iOS and Android' },
      { name: 'MVP Development', price: '$15,000+', description: 'Minimum viable product' },
      { name: 'Maintenance', price: '$500/mo', description: 'Ongoing support' },
      { name: 'Code Review', price: '$1,000', description: 'Technical assessment' },
      { name: 'Consulting', price: '$200/hr', description: 'Technical advisory' }
    ],
    heroImage: 'development-hero.jpg',
    ambiance: 'Building digital solutions'
  },
  itservices: {
    keywords: ['it services', 'it support', 'managed it', 'tech support', 'helpdesk', 'msp'],
    services: [
      { name: 'Managed IT', price: '$150/user/mo', description: 'Complete IT support' },
      { name: 'Helpdesk Support', price: '$99/mo', description: 'Remote assistance' },
      { name: 'Network Setup', price: '$2,000+', description: 'Infrastructure design' },
      { name: 'Cybersecurity', price: '$500/mo', description: 'Security monitoring' },
      { name: 'Cloud Migration', price: 'Custom', description: 'Move to the cloud' },
      { name: 'Break/Fix', price: '$125/hr', description: 'On-demand repairs' }
    ],
    heroImage: 'it-services-hero.jpg',
    ambiance: 'Technology that works for you'
  },
  startup: {
    keywords: ['startup', 'venture', 'incubator', 'accelerator', 'founder'],
    services: [
      { name: 'Seed Funding', price: '$50K-$500K', description: 'Early-stage investment' },
      { name: 'Accelerator Program', price: '6% equity', description: '12-week intensive' },
      { name: 'Mentorship', price: 'Included', description: 'Expert guidance' },
      { name: 'Pitch Coaching', price: '$1,000', description: 'Investor presentation prep' },
      { name: 'Co-working Space', price: '$300/mo', description: 'Desk and amenities' },
      { name: 'Demo Day', price: 'Included', description: 'Investor showcase' }
    ],
    heroImage: 'startup-hero.jpg',
    ambiance: 'Where ideas become reality'
  }
};

// ============================================
// EDUCATION TYPES
// ============================================
const EDUCATION_KEYWORDS = {
  tutoring: {
    keywords: ['tutoring', 'tutor', 'academic', 'learning center', 'test prep', 'sat', 'act'],
    services: [
      { name: '1-on-1 Tutoring', price: '$60/hr', description: 'Private instruction' },
      { name: 'Group Session', price: '$30/hr', description: '3-5 students' },
      { name: 'SAT/ACT Prep', price: '$1,200', description: '8-week course' },
      { name: 'Homework Help', price: '$40/hr', description: 'Assignment assistance' },
      { name: 'Subject Package', price: '$500', description: '10 sessions' },
      { name: 'College Counseling', price: '$2,000', description: 'Application guidance' }
    ],
    heroImage: 'tutoring-hero.jpg',
    ambiance: 'Unlock your potential'
  },
  musiclessons: {
    keywords: ['music', 'lessons', 'piano', 'guitar', 'violin', 'voice', 'singing', 'instrument'],
    services: [
      { name: '30-Min Lesson', price: '$40', description: 'Weekly private lesson' },
      { name: '60-Min Lesson', price: '$70', description: 'Extended session' },
      { name: 'Group Class', price: '$25', description: '4-6 students' },
      { name: 'Instrument Rental', price: '$30/mo', description: 'Quality instruments' },
      { name: 'Recital Fee', price: '$50', description: 'Semester performance' },
      { name: 'Summer Camp', price: '$400/week', description: 'Intensive program' }
    ],
    heroImage: 'music-lessons-hero.jpg',
    ambiance: 'Discover your musical voice'
  },
  dancestudio: {
    keywords: ['dance', 'ballet', 'hip hop', 'jazz', 'tap', 'contemporary', 'ballroom'],
    services: [
      { name: 'Drop-In Class', price: '$20', description: 'Single class' },
      { name: 'Monthly Unlimited', price: '$150', description: 'All classes' },
      { name: 'Private Lesson', price: '$80/hr', description: 'One-on-one' },
      { name: 'Competition Team', price: '$200/mo', description: 'Advanced training' },
      { name: 'Recital Fee', price: '$100', description: 'Annual showcase' },
      { name: 'Summer Intensive', price: '$600', description: 'Week-long program' }
    ],
    heroImage: 'dance-studio-hero.jpg',
    ambiance: 'Express yourself through movement'
  },
  artschool: {
    keywords: ['art', 'painting', 'drawing', 'sculpture', 'pottery', 'ceramics', 'creative'],
    services: [
      { name: 'Drop-In Class', price: '$35', description: 'Single session' },
      { name: 'Weekly Course', price: '$200/8wks', description: 'Structured learning' },
      { name: 'Private Instruction', price: '$75/hr', description: 'Personalized coaching' },
      { name: 'Kids Art Camp', price: '$250/wk', description: 'Ages 6-12' },
      { name: 'Open Studio', price: '$15/hr', description: 'Work independently' },
      { name: 'Supplies', price: '$50+', description: 'Materials package' }
    ],
    heroImage: 'art-school-hero.jpg',
    ambiance: 'Unleash your creativity'
  },
  driving: {
    keywords: ['driving', 'driving school', 'drivers ed', 'license', 'permit'],
    services: [
      { name: 'Classroom Course', price: '$350', description: '30-hour program' },
      { name: 'Behind the Wheel', price: '$400', description: '6 hours driving' },
      { name: 'Full Package', price: '$650', description: 'Classroom + driving' },
      { name: 'Extra Lesson', price: '$75/hr', description: 'Additional practice' },
      { name: 'License Test Prep', price: '$100', description: '2-hour session' },
      { name: 'Refresher Course', price: '$150', description: 'For licensed drivers' }
    ],
    heroImage: 'driving-school-hero.jpg',
    ambiance: 'Safe drivers start here'
  }
};

// ============================================
// HOME SERVICES TYPES
// ============================================
const HOME_SERVICES_KEYWORDS = {
  plumber: {
    keywords: ['plumber', 'plumbing', 'drain', 'pipe', 'water heater', 'leak'],
    services: [
      { name: 'Service Call', price: '$89', description: 'Diagnosis and estimate' },
      { name: 'Drain Cleaning', price: '$150', description: 'Unclog any drain' },
      { name: 'Faucet Repair', price: '$125', description: 'Fix or replace' },
      { name: 'Water Heater', price: '$1,200+', description: 'Installation' },
      { name: 'Leak Detection', price: '$200', description: 'Find hidden leaks' },
      { name: 'Emergency 24/7', price: '$150+', description: 'After-hours service' }
    ],
    heroImage: 'plumber-hero.jpg',
    ambiance: 'Fast, reliable plumbing solutions'
  },
  electrician: {
    keywords: ['electrician', 'electrical', 'wiring', 'panel', 'outlet', 'lighting'],
    services: [
      { name: 'Service Call', price: '$99', description: 'Troubleshooting' },
      { name: 'Outlet Install', price: '$150', description: 'New outlet or switch' },
      { name: 'Panel Upgrade', price: '$2,000+', description: '200-amp service' },
      { name: 'Ceiling Fan', price: '$200', description: 'Install or replace' },
      { name: 'EV Charger', price: '$800+', description: 'Home charging station' },
      { name: 'Generator Install', price: '$5,000+', description: 'Backup power' }
    ],
    heroImage: 'electrician-hero.jpg',
    ambiance: 'Trusted electrical experts'
  },
  hvac: {
    keywords: ['hvac', 'heating', 'cooling', 'air conditioning', 'ac', 'furnace'],
    services: [
      { name: 'AC Tune-Up', price: '$99', description: 'Seasonal maintenance' },
      { name: 'Furnace Repair', price: '$150+', description: 'Diagnosis and fix' },
      { name: 'New AC Install', price: '$5,000+', description: 'Complete system' },
      { name: 'Duct Cleaning', price: '$400', description: 'Whole home' },
      { name: 'Thermostat', price: '$200', description: 'Smart thermostat install' },
      { name: 'Emergency Service', price: '$200+', description: '24/7 available' }
    ],
    heroImage: 'hvac-hero.jpg',
    ambiance: 'Comfort in every season'
  },
  cleaning: {
    keywords: ['cleaning', 'maid', 'housekeeping', 'janitorial', 'house cleaning'],
    services: [
      { name: 'Standard Clean', price: '$150', description: 'Regular maintenance' },
      { name: 'Deep Clean', price: '$300', description: 'Thorough top-to-bottom' },
      { name: 'Move In/Out', price: '$400', description: 'Complete property clean' },
      { name: 'Weekly Service', price: '$120/visit', description: 'Recurring discount' },
      { name: 'Office Cleaning', price: '$200+', description: 'Commercial space' },
      { name: 'Carpet Cleaning', price: '$150+', description: 'Per room' }
    ],
    heroImage: 'cleaning-hero.jpg',
    ambiance: 'A cleaner home, a happier life'
  },
  landscaping: {
    keywords: ['landscaping', 'lawn', 'lawn care', 'garden', 'yard', 'mowing', 'tree'],
    services: [
      { name: 'Lawn Mowing', price: '$50', description: 'Weekly service' },
      { name: 'Full Maintenance', price: '$200/mo', description: 'Complete lawn care' },
      { name: 'Landscape Design', price: '$500+', description: 'Custom plans' },
      { name: 'Tree Trimming', price: '$300+', description: 'Per tree' },
      { name: 'Spring Cleanup', price: '$250', description: 'Seasonal prep' },
      { name: 'Irrigation Install', price: '$2,500+', description: 'Sprinkler system' }
    ],
    heroImage: 'landscaping-hero.jpg',
    ambiance: 'Beautiful outdoor spaces'
  },
  roofing: {
    keywords: ['roofing', 'roof', 'roofer', 'shingle', 'gutter'],
    services: [
      { name: 'Free Inspection', price: 'Free', description: 'Roof assessment' },
      { name: 'Roof Repair', price: '$400+', description: 'Leak and damage fix' },
      { name: 'Full Replacement', price: '$8,000+', description: 'Complete reroof' },
      { name: 'Gutter Install', price: '$1,000+', description: 'New gutters' },
      { name: 'Gutter Cleaning', price: '$150', description: 'Debris removal' },
      { name: 'Storm Damage', price: 'Insurance', description: 'Claim assistance' }
    ],
    heroImage: 'roofing-hero.jpg',
    ambiance: 'Protecting what matters most'
  },
  moving: {
    keywords: ['moving', 'movers', 'relocation', 'hauling', 'junk removal'],
    services: [
      { name: 'Local Move', price: '$400+', description: '2 movers, 3 hours' },
      { name: 'Long Distance', price: 'Custom', description: 'Interstate moving' },
      { name: 'Packing Service', price: '$50/hr', description: 'Per packer' },
      { name: 'Supplies', price: '$50+', description: 'Boxes and tape' },
      { name: 'Storage', price: '$100/mo', description: 'Climate-controlled' },
      { name: 'Junk Removal', price: '$150+', description: 'Haul away' }
    ],
    heroImage: 'moving-hero.jpg',
    ambiance: 'Stress-free moving experience'
  },
  pestcontrol: {
    keywords: ['pest', 'pest control', 'exterminator', 'termite', 'bug', 'rodent'],
    services: [
      { name: 'Initial Treatment', price: '$150', description: 'Comprehensive spray' },
      { name: 'Quarterly Service', price: '$100/visit', description: 'Preventive care' },
      { name: 'Termite Inspection', price: '$100', description: 'Full property scan' },
      { name: 'Termite Treatment', price: '$1,500+', description: 'Elimination' },
      { name: 'Rodent Control', price: '$200+', description: 'Trapping and exclusion' },
      { name: 'Bed Bug Treatment', price: '$500+', description: 'Heat treatment' }
    ],
    heroImage: 'pest-control-hero.jpg',
    ambiance: 'Protecting your home and family'
  }
};

// ============================================
// RETAIL TYPES
// ============================================
const RETAIL_KEYWORDS = {
  boutique: {
    keywords: ['boutique', 'clothing', 'fashion', 'apparel', 'dress', 'womens'],
    services: [
      { name: 'Personal Styling', price: 'Free', description: 'Complimentary consultations' },
      { name: 'Alterations', price: '$20+', description: 'In-house tailoring' },
      { name: 'Gift Wrapping', price: '$5', description: 'Beautiful presentation' },
      { name: 'Loyalty Program', price: 'Free', description: 'Earn points on purchases' },
      { name: 'Private Shopping', price: 'Free', description: 'After-hours appointment' },
      { name: 'Gift Cards', price: '$25+', description: 'Any amount' }
    ],
    heroImage: 'boutique-hero.jpg',
    ambiance: 'Curated style for every occasion'
  },
  jewelry: {
    keywords: ['jewelry', 'jeweler', 'diamond', 'engagement', 'ring', 'watch', 'gold'],
    services: [
      { name: 'Ring Sizing', price: '$40', description: 'Same-day service' },
      { name: 'Watch Battery', price: '$15', description: 'Most watches' },
      { name: 'Jewelry Repair', price: '$50+', description: 'Expert craftsmanship' },
      { name: 'Custom Design', price: 'Custom', description: 'One-of-a-kind pieces' },
      { name: 'Appraisal', price: '$75', description: 'Insurance documentation' },
      { name: 'Cleaning', price: 'Free', description: 'Complimentary polish' }
    ],
    heroImage: 'jewelry-hero.jpg',
    ambiance: 'Timeless elegance, expertly crafted'
  },
  petstore: {
    keywords: ['pet', 'pets', 'dog', 'cat', 'puppy', 'kitten', 'grooming'],
    services: [
      { name: 'Dog Grooming', price: '$50+', description: 'Bath, cut, nails' },
      { name: 'Cat Grooming', price: '$40+', description: 'Gentle handling' },
      { name: 'Nail Trim', price: '$15', description: 'Walk-in welcome' },
      { name: 'Loyalty Program', price: 'Free', description: 'Every 10th bag free' },
      { name: 'Self-Wash Station', price: '$20', description: 'DIY bathing' },
      { name: 'Delivery', price: '$5', description: 'Local delivery' }
    ],
    heroImage: 'pet-store-hero.jpg',
    ambiance: 'Everything for your furry family'
  },
  florist: {
    keywords: ['florist', 'flowers', 'floral', 'bouquet', 'wedding flowers', 'roses'],
    services: [
      { name: 'Everyday Bouquet', price: '$45+', description: 'Fresh arrangements' },
      { name: 'Wedding Package', price: '$1,500+', description: 'Full event florals' },
      { name: 'Sympathy Flowers', price: '$100+', description: 'Thoughtful tributes' },
      { name: 'Same-Day Delivery', price: '$15', description: 'Local area' },
      { name: 'Subscription', price: '$50/mo', description: 'Weekly fresh flowers' },
      { name: 'Event Decor', price: 'Custom', description: 'Corporate and parties' }
    ],
    heroImage: 'florist-hero.jpg',
    ambiance: 'Beautiful blooms for every moment'
  }
};

/**
 * All business type categories for detection
 */
const ALL_BUSINESS_TYPES = {
  // Food & Beverage
  ...Object.fromEntries(Object.entries(CUISINE_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'restaurant', contentType: 'menu' }])),
  // Fitness & Wellness
  ...Object.fromEntries(Object.entries(FITNESS_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'fitness', contentType: 'services' }])),
  // Salon & Beauty
  ...Object.fromEntries(Object.entries(SALON_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'salon', contentType: 'services' }])),
  // Healthcare
  ...Object.fromEntries(Object.entries(HEALTHCARE_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'healthcare', contentType: 'services' }])),
  // Professional Services
  ...Object.fromEntries(Object.entries(PROFESSIONAL_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'professional', contentType: 'services' }])),
  // Tech & Software
  ...Object.fromEntries(Object.entries(TECH_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'tech', contentType: 'services' }])),
  // Education
  ...Object.fromEntries(Object.entries(EDUCATION_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'education', contentType: 'services' }])),
  // Home Services
  ...Object.fromEntries(Object.entries(HOME_SERVICES_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'home-services', contentType: 'services' }])),
  // Retail
  ...Object.fromEntries(Object.entries(RETAIL_KEYWORDS).map(([k, v]) => [k, { ...v, industry: 'retail', contentType: 'services' }]))
};

/**
 * Detect business type from business name and tagline
 * Returns the modified fixture with business-specific content
 */
function applyCuisineDetection(fixture, customizations = {}) {
  const result = JSON.parse(JSON.stringify(fixture)); // Deep clone

  // Get text to scan
  const businessName = (customizations.businessName || fixture.business?.name || '').toLowerCase();
  const tagline = (customizations.tagline || fixture.business?.tagline || '').toLowerCase();
  const searchText = `${businessName} ${tagline}`;

  // Detect business type across all industries
  let detectedType = null;
  let typeData = null;

  for (const [typeName, data] of Object.entries(ALL_BUSINESS_TYPES)) {
    for (const keyword of data.keywords) {
      if (searchText.includes(keyword)) {
        detectedType = typeName;
        typeData = data;
        break;
      }
    }
    if (detectedType) break;
  }

  // If no type detected, return original fixture
  if (!detectedType || !typeData) {
    return result;
  }

  // Mark detected type
  result._detectedCuisine = detectedType; // Keep this name for backwards compatibility
  result._detectedBusinessType = detectedType;
  result._detectedIndustry = typeData.industry;
  result._businessAmbiance = typeData.ambiance;
  result._cuisineAmbiance = typeData.ambiance; // Backwards compatibility

  // Get items (could be menuItems or services depending on industry)
  const items = typeData.menuItems || typeData.services || [];

  // Update content based on content type
  if (typeData.contentType === 'menu') {
    // Restaurant/Food - update menu page
    if (result.pages?.menu) {
      result.pages.menu.menuItems = items;
      result.pages.menu.categories = [
        { name: 'Starters & Sides', items: items.slice(4) },
        { name: 'Main Dishes', items: items.slice(0, 4) }
      ];
    } else {
      result.pages = result.pages || {};
      result.pages.menu = {
        menuItems: items,
        categories: [
          { name: 'Starters & Sides', items: items.slice(4) },
          { name: 'Main Dishes', items: items.slice(0, 4) }
        ]
      };
    }
    result._cuisineMenuItems = items;
  } else {
    // Services-based business - update services page
    if (result.pages?.services) {
      result.pages.services.items = items;
      result.pages.services.categories = [
        { name: 'Popular Services', items: items.slice(0, 3) },
        { name: 'Additional Services', items: items.slice(3) }
      ];
    } else {
      result.pages = result.pages || {};
      result.pages.services = {
        items: items,
        categories: [
          { name: 'Popular Services', items: items.slice(0, 3) },
          { name: 'Additional Services', items: items.slice(3) }
        ]
      };
    }
    result._businessServices = items;

    // Also update pricing page if exists
    if (result.pages?.pricing) {
      result.pages.pricing.items = items;
    }
  }

  // Update home page hero with business-specific ambiance
  if (result.pages?.home?.hero) {
    if (!customizations.tagline) {
      result.pages.home.hero.subheadline = typeData.ambiance;
    }
  }

  // Store hero image reference
  result._businessHeroImage = typeData.heroImage;
  result._cuisineHeroImage = typeData.heroImage; // Backwards compatibility

  // Log detection
  const emoji = typeData.industry === 'restaurant' ? '🍽️' :
                typeData.industry === 'fitness' ? '💪' :
                typeData.industry === 'salon' ? '💇' :
                typeData.industry === 'healthcare' ? '🏥' :
                typeData.industry === 'professional' ? '💼' :
                typeData.industry === 'tech' ? '💻' :
                typeData.industry === 'education' ? '📚' :
                typeData.industry === 'home-services' ? '🏠' :
                typeData.industry === 'retail' ? '🛍️' : '🏪';

  console.log(`${emoji} Business type detected: ${detectedType} (${typeData.industry}) from "${searchText}"`);

  return result;
}

/**
 * Create test mode routes
 */
function createTestModeRoutes(deps) {
  const router = express.Router();
  const {
    GENERATED_PROJECTS,
    MODULE_LIBRARY,
    ASSEMBLE_SCRIPT,
    db
  } = deps;

  // ============================================
  // GET /api/test-mode/status
  // Check if test mode is enabled
  // ============================================
  router.get('/status', (req, res) => {
    const testModeEnabled = process.env.TEST_MODE === 'true';
    res.json({
      success: true,
      testModeEnabled,
      message: testModeEnabled
        ? '🧪 Test Mode is ACTIVE - Using mock data, no API costs'
        : 'Test Mode is OFF - Normal operation'
    });
  });

  // ============================================
  // POST /api/test-mode/toggle
  // Toggle test mode on/off (for current session)
  // ============================================
  let sessionTestMode = process.env.TEST_MODE === 'true';

  router.post('/toggle', (req, res) => {
    sessionTestMode = !sessionTestMode;
    console.log(`🧪 Test Mode ${sessionTestMode ? 'ENABLED' : 'DISABLED'}`);
    res.json({
      success: true,
      testModeEnabled: sessionTestMode,
      message: sessionTestMode
        ? '🧪 Test Mode ACTIVATED - Using mock data'
        : 'Test Mode DEACTIVATED - Normal operation'
    });
  });

  router.get('/enabled', (req, res) => {
    res.json({
      success: true,
      enabled: sessionTestMode
    });
  });

  // ============================================
  // GET /api/test-mode/fixtures
  // List available test fixtures
  // ============================================
  router.get('/fixtures', (req, res) => {
    try {
      const fixtures = getAvailableFixtures();
      res.json({
        success: true,
        fixtures
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // GET /api/test-mode/fixtures/:id
  // Load a specific fixture
  // ============================================
  router.get('/fixtures/:id', (req, res) => {
    try {
      const fixture = loadFixture(req.params.id);
      res.json({
        success: true,
        fixture
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // GET /api/test-mode/archetypes
  // List available layout archetypes for artisan food industries
  // ============================================
  router.get('/archetypes', (req, res) => {
    if (!archetypeSystem) {
      return res.json({ success: true, archetypes: [], message: 'Archetype system not available' });
    }

    const archetypes = archetypeSystem.getAllArchetypes().map(arch => ({
      id: arch.id,
      name: arch.name,
      description: arch.description,
      bestFor: arch.bestFor,
      realExamples: arch.realExamples,
      vibe: arch.style?.vibe
    }));

    res.json({
      success: true,
      archetypes,
      industries: archetypeSystem.ARTISAN_FOOD_INDUSTRIES,
      note: 'Pass archetype ID to /generate to override auto-detection'
    });
  });

  // ============================================
  // POST /api/test-mode/generate
  // Generate a test project using fixture data
  // ============================================
  router.post('/generate', async (req, res) => {
    const {
      fixtureId,
      customizations = {},
      websitePages = ['home', 'menu', 'about', 'contact', 'gallery'],
      appPages = ['dashboard', 'rewards', 'profile', 'wallet', 'earn', 'leaderboard'],
      deploy = false,
      captureScreenshots = true, // Auto-capture screenshots for gallery
      archetype = null // Optional: 'ecommerce', 'luxury', or 'local' - overrides auto-detection
    } = req.body;

    // Set up SSE for real-time progress
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendEvent = (type, data) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Log test mode start
      console.log('\n🧪 ====== TEST MODE ACTIVE ======');

      sendEvent('start', { message: '🧪 Test Mode generation starting...' });

      // Load fixture
      sendEvent('progress', { step: 'Loading fixture', message: `📁 Loading fixture: ${fixtureId}` });
      console.log(`📁 Loading fixture: ${fixtureId}`);

      let fixture;
      try {
        fixture = loadFixture(fixtureId);
      } catch (e) {
        sendEvent('error', { message: `Fixture not found: ${fixtureId}` });
        res.end();
        return;
      }

      // Apply customizations
      const customizedFixture = applyCustomizations(fixture, {
        ...customizations,
        websitePages,
        appPages
      });

      // Detect cuisine type from business name/tagline and adjust content
      const cuisineAdjusted = applyCuisineDetection(customizedFixture, customizations);

      const businessName = cuisineAdjusted.business.name;
      const location = cuisineAdjusted.business.location;

      sendEvent('progress', {
        step: 'Fixture loaded',
        message: `🏪 Business: ${businessName} (${location})`
      });
      console.log(`🏪 Business: ${businessName} (${location})`);

      // Log detected business type if any
      if (cuisineAdjusted._detectedBusinessType) {
        const industry = cuisineAdjusted._detectedIndustry || 'restaurant';
        const emoji = industry === 'restaurant' ? '🍽️' :
                      industry === 'fitness' ? '💪' :
                      industry === 'salon' ? '💇' :
                      industry === 'healthcare' ? '🏥' :
                      industry === 'professional' ? '💼' :
                      industry === 'tech' ? '💻' :
                      industry === 'education' ? '📚' :
                      industry === 'home-services' ? '🏠' :
                      industry === 'retail' ? '🛍️' : '🏪';
        const typeLabel = cuisineAdjusted._detectedBusinessType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        sendEvent('progress', {
          step: 'Business type detected',
          message: `${emoji} Detected: ${typeLabel} (${industry})`
        });
        console.log(`${emoji} Business type detected: ${typeLabel} (${industry})`);
      }

      // Log what's included
      const pageList = Object.keys(cuisineAdjusted.pages).join(', ');
      sendEvent('progress', {
        step: 'Pages configured',
        message: `📄 Pages: ${pageList}`
      });
      console.log(`📄 Pages: ${pageList}`);

      // Skip AI generation message
      sendEvent('progress', {
        step: 'Skipping AI',
        message: '⏭️  Skipping AI generation (using mock data)'
      });
      console.log('⏭️  Skipping AI generation (using mock data)');

      sendEvent('progress', {
        step: 'Skipping images',
        message: '⏭️  Skipping image generation (using placeholders)'
      });
      console.log('⏭️  Skipping image generation (using placeholders)');

      // Create project directory
      const projectName = businessName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
      const projectPath = path.join(GENERATED_PROJECTS, projectName);

      sendEvent('progress', {
        step: 'Creating project',
        message: `📁 Creating project: ${projectName}`
      });

      // Run the assemble script
      sendEvent('progress', {
        step: 'Assembling',
        message: '🔨 Assembling project structure...'
      });
      console.log('🔨 Assembling project structure...');

      // Use spawn to run the assemble script
      const assemblePromise = new Promise((resolve, reject) => {
        const args = [
          ASSEMBLE_SCRIPT,
          '--name', projectName,
          '--industry', customizedFixture.business.industry,
          '--test-mode', 'true'
        ];

        const child = spawn('node', args, {
          cwd: MODULE_LIBRARY,
          env: {
            ...process.env,
            TEST_MODE: 'true',
            TEST_FIXTURE: JSON.stringify(customizedFixture)
          }
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
          const lines = data.toString().split('\n').filter(l => l.trim());
          lines.forEach(line => {
            sendEvent('log', { message: line });
          });
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`Assembly failed with code ${code}: ${stderr}`));
          }
        });

        child.on('error', reject);
      });

      try {
        await assemblePromise;
        sendEvent('progress', {
          step: 'Assembly complete',
          message: '✅ Project assembled successfully'
        });
      } catch (err) {
        sendEvent('error', { message: `Assembly failed: ${err.message}` });
        console.error('Assembly failed:', err);
        res.end();
        return;
      }

      // Generate pages using mock data
      sendEvent('progress', {
        step: 'Generating pages',
        message: `📝 Generating ${websitePages.length} pages...`
      });
      console.log(`📝 Generating ${websitePages.length} pages from selection: ${websitePages.join(', ')}`);

      const pagesDir = path.join(projectPath, 'frontend', 'src', 'pages');
      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
      }

      // Generate each page from websitePages selection
      // Use fixture data if available, otherwise generate industry-appropriate template
      const generatedPages = [];
      for (const pageName of websitePages) {
        const componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Page';

        // Check if fixture has data for this page
        const pageData = customizedFixture.pages?.[pageName] || null;

        // Generate the page content (pass archetype override if specified)
        const pageContent = generateMockPage(pageName, pageData, customizedFixture, archetype);

        fs.writeFileSync(path.join(pagesDir, `${componentName}.jsx`), pageContent);
        sendEvent('log', { message: `   ✅ ${componentName}.jsx` });
        generatedPages.push({ name: pageName, component: componentName });
      }

      // Generate auth pages (Login, Register, Dashboard) for website
      sendEvent('log', { message: '   🔐 Generating auth pages...' });
      const authPages = generateAuthPages(customizedFixture);
      for (const [pageName, pageContent] of Object.entries(authPages)) {
        fs.writeFileSync(path.join(pagesDir, `${pageName}.jsx`), pageContent);
        sendEvent('log', { message: `   ✅ ${pageName}.jsx` });
      }

      // Generate App.jsx with routes to all pages (including auth)
      sendEvent('log', { message: '   📱 Generating App.jsx with routes...' });
      const appJsxContent = generateMockAppJsx(generatedPages, customizedFixture, true);
      fs.writeFileSync(path.join(projectPath, 'frontend', 'src', 'App.jsx'), appJsxContent);
      sendEvent('log', { message: `   ✅ App.jsx` });

      // Generate backend .env file
      const backendEnvPath = path.join(projectPath, 'backend', '.env');
      if (fs.existsSync(path.join(projectPath, 'backend'))) {
        sendEvent('log', { message: '   🔐 Generating backend .env...' });
        const envContent = `# ${projectName} Backend Environment
# Auto-generated by Test Mode

# Core Settings
PORT=5000
NODE_ENV=development

# JWT Secret (required for auth)
JWT_SECRET=${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dev-secret-key-12345678901234567890

# Database - Leave empty for test mode (uses local SQLite)
# Set to PostgreSQL URL for production: postgres://user:pass@host:5432/db
# DATABASE_URL=

# Admin Account
ADMIN_EMAIL=admin@${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
ADMIN_PASSWORD=admin123

# Stripe (test keys - replace with real keys for production)
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder

# CORS Origins (website:5173, app:5174, admin:5175)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000
`;
        fs.writeFileSync(backendEnvPath, envContent);
        sendEvent('log', { message: '   ✅ .env file created' });
      }

      // Generate Companion App
      sendEvent('progress', {
        step: 'Generating companion app',
        message: '📱 Generating companion app...'
      });
      console.log('📱 Generating companion app...');

      const companionAppPath = path.join(projectPath, 'companion-app');
      if (!fs.existsSync(companionAppPath)) {
        fs.mkdirSync(companionAppPath, { recursive: true });
      }

      // Create companion app directories
      const companionDirs = ['src', 'src/screens', 'src/components', 'src/services', 'src/hooks', 'public'];
      companionDirs.forEach(dir => {
        const dirPath = path.join(companionAppPath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      });

      // Generate companion app files
      const companionFiles = generateMockCompanionApp(customizedFixture, projectName);
      for (const [filePath, content] of Object.entries(companionFiles)) {
        const fullPath = path.join(companionAppPath, filePath);
        fs.writeFileSync(fullPath, content);
        sendEvent('log', { message: `   ✅ companion-app/${filePath}` });
      }

      sendEvent('progress', {
        step: 'Companion app generated',
        message: '✅ Companion app generated successfully'
      });

      // Build website
      sendEvent('progress', {
        step: 'Building website',
        message: '🔨 Building website...'
      });
      console.log('🔨 Building website...');

      // Run npm install and build for frontend
      const buildPromise = new Promise((resolve, reject) => {
        const child = spawn('npm', ['run', 'build'], {
          cwd: path.join(projectPath, 'frontend'),
          shell: true,
          env: process.env
        });

        child.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Build failed with code ${code}`));
        });

        child.on('error', reject);
      });

      try {
        await buildPromise;
        sendEvent('progress', {
          step: 'Build complete',
          message: '✅ Website built successfully'
        });
      } catch (err) {
        sendEvent('warning', { message: `Build had issues: ${err.message}` });
      }

      // Test sync endpoints
      sendEvent('progress', {
        step: 'Testing sync',
        message: '🔗 Testing sync endpoints...'
      });
      console.log('🔗 Testing sync endpoints...');

      const syncResults = [];
      for (const endpoint of customizedFixture.sync.endpoints) {
        // Mock sync test - in real scenario would actually hit endpoints
        syncResults.push({
          endpoint: endpoint.path,
          status: 'synced',
          description: endpoint.description
        });
        sendEvent('sync', {
          endpoint: endpoint.path,
          status: 'success',
          message: `   ✅ ${endpoint.path} - synced`
        });
        console.log(`   ✅ ${endpoint.path} - synced`);
      }

      // Deployment (if requested)
      let previewUrl = null;
      if (deploy) {
        sendEvent('progress', {
          step: 'Deploying',
          message: '🚀 Deploying to preview...'
        });
        console.log('🚀 Deploying to preview...');

        // Mock deployment URL
        previewUrl = `https://${projectName.toLowerCase()}.blink-preview.dev`;

        sendEvent('progress', {
          step: 'Deployed',
          message: `✅ DEPLOYED - Preview: ${previewUrl}`
        });
      }

      // Complete
      const result = {
        success: true,
        projectName,
        projectPath,
        previewUrl,
        pagesGenerated: Object.keys(customizedFixture.pages).length,
        syncResults,
        fixture: fixtureId,
        customizations
      };

      // Auto-capture screenshots in the background (non-blocking)
      if (captureScreenshots && screenshotService) {
        sendEvent('progress', {
          step: 'Capturing screenshots',
          message: '📸 Capturing screenshots for preview gallery...'
        });
        console.log('📸 Starting screenshot capture in background...');

        // Run screenshot capture asynchronously (don't block the response)
        screenshotService.quickCapture(projectPath)
          .then(screenshotResults => {
            console.log(`📸 Screenshots captured: ${screenshotResults.summary?.totalScreenshots || 0} images`);
          })
          .catch(err => {
            console.error('📸 Screenshot capture failed:', err.message);
          });

        result.screenshotsQueued = true;
      }

      sendEvent('complete', result);

      console.log(`✅ DONE${previewUrl ? ` - Preview: ${previewUrl}` : ''}`);
      console.log('🧪 ==============================\n');

      res.end();

    } catch (error) {
      console.error('Test mode generation error:', error);
      sendEvent('error', { message: error.message });
      res.end();
    }
  });

  // ============================================
  // POST /api/test-mode/sync-test
  // Test sync between website and companion app
  // ============================================
  router.post('/sync-test', async (req, res) => {
    const { projectPath, endpoints = [] } = req.body;

    const results = {
      success: true,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };

    const defaultEndpoints = [
      { path: '/api/auth/me', description: 'Auth state' },
      { path: '/api/loyalty', description: 'Rewards/points' },
      { path: '/api/wallet', description: 'Wallet balance' },
      { path: '/api/orders', description: 'Order history' }
    ];

    const endpointsToTest = endpoints.length > 0 ? endpoints : defaultEndpoints;

    for (const endpoint of endpointsToTest) {
      results.summary.total++;

      // In a real implementation, this would make actual HTTP requests
      // to both the website backend and companion app backend
      // and compare the responses

      const testResult = {
        endpoint: endpoint.path,
        description: endpoint.description,
        websiteResponse: { status: 200, data: {} },
        appResponse: { status: 200, data: {} },
        synced: true,
        diff: null
      };

      // Mock successful sync for now
      if (Math.random() > 0.9) {
        // Simulate occasional mismatch for testing UI
        testResult.synced = false;
        testResult.diff = {
          field: 'points',
          website: 850,
          app: 820
        };
        results.summary.failed++;
      } else {
        results.summary.passed++;
      }

      results.tests.push(testResult);
    }

    results.success = results.summary.failed === 0;

    res.json(results);
  });

  // ============================================
  // POST /api/test-mode/fixtures/save
  // Save a custom fixture
  // ============================================
  router.post('/fixtures/save', (req, res) => {
    const { fixtureId, data } = req.body;

    try {
      const customDir = path.join(__dirname, '..', '..', 'test-fixtures', 'custom');
      if (!fs.existsSync(customDir)) {
        fs.mkdirSync(customDir, { recursive: true });
      }

      const filePath = path.join(customDir, `${fixtureId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      res.json({
        success: true,
        message: `Fixture saved: ${fixtureId}`,
        path: filePath
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

/**
 * Generate App.jsx with routes to all generated pages
 * Includes auth pages (login/register/dashboard) when companion app exists
 */
function generateMockAppJsx(pages, fixture, hasCompanionApp = true) {
  const businessName = fixture.business.name;
  const colors = fixture.theme.colors;
  const accentColor = colors.accent || colors.primary;

  // Pages that require authentication (protected routes) - these go in portal dropdown
  const portalPageNames = ['dashboard', 'earn', 'rewards', 'wallet', 'profile', 'settings', 'account', 'leaderboard'];

  // Separate main site pages from portal/app pages
  const mainSitePages = pages.filter(p =>
    !portalPageNames.includes(p.name.toLowerCase()) &&
    !['login', 'register'].includes(p.name.toLowerCase())
  );
  const userPortalPages = pages.filter(p => portalPageNames.includes(p.name.toLowerCase()));
  const hasPortalPages = hasCompanionApp && userPortalPages.length > 0;

  // Generate imports for main pages
  const imports = pages.map(p =>
    `import ${p.component} from './pages/${p.component}';`
  ).join('\n');

  // Generate nav links for main site pages only (not portal pages)
  const navLinks = mainSitePages.map(p => {
    const path = p.name === 'home' ? '/' : `/${p.name}`;
    // Handle hyphenated names like 'gift-cards' -> 'Gift Cards'
    const label = p.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `            <Link to="${path}" style={styles.navLink}>${label}</Link>`;
  }).join('\n');

  // Generate portal dropdown items
  const portalDropdownItems = userPortalPages.map(p => {
    const path = `/${p.name}`;
    const label = p.name.charAt(0).toUpperCase() + p.name.slice(1);
    return `                    <Link to="${path}" style={styles.portalDropdownItem}>${label}</Link>`;
  }).join('\n');

  // Generate routes for all pages
  const routes = pages.map(p => {
    const path = p.name === 'home' ? '/' : `/${p.name}`;
    return `              <Route path="${path}" element={<${p.component} />} />`;
  }).join('\n');

  // Auth routes (always include when companion app exists)
  const authRoutes = hasCompanionApp ? `
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />` : '';

  // Auth imports
  const authImports = hasCompanionApp ? `
// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';` : '';

  // AuthContext and AuthButtons component for portal dropdown
  const authContextCode = hasCompanionApp ? `
// Simple auth context for demo
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext);
}

function AuthButtons() {
  const { user, logout } = useAuth();
  const [portalOpen, setPortalOpen] = React.useState(false);
  const portalRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (portalRef.current && !portalRef.current.contains(event.target)) {
        setPortalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (user) {
    return (
      <div style={styles.authButtons}>
        ${hasPortalPages ? `{/* Portal Dropdown */}
        <div ref={portalRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setPortalOpen(!portalOpen)}
            style={styles.portalButton}
          >
            <span>My Account</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {portalOpen && (
            <div style={styles.portalDropdown}>
${portalDropdownItems}
              <div style={styles.portalDivider} />
              <button onClick={logout} style={styles.portalDropdownItem}>Logout</button>
            </div>
          )}
        </div>` : `<button onClick={logout} style={styles.logoutButton}>Logout</button>`}
      </div>
    );
  }

  return (
    <div style={styles.authButtons}>
      <Link to="/login" style={styles.loginButton}>Login</Link>
      <Link to="/register" style={styles.registerButton}>Sign Up</Link>
    </div>
  );
}` : '';

  // Auth styles with portal dropdown
  const authStyles = hasCompanionApp ? `
  authButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  loginButton: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '8px 16px'
  },
  registerButton: {
    backgroundColor: '${colors.primary}',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px'
  },
  logoutButton: {
    background: 'transparent',
    border: '1px solid ${colors.primary}',
    color: '${colors.primary}',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  portalButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '${accentColor}',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  portalDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    minWidth: '200px',
    padding: '8px 0',
    zIndex: 1000
  },
  portalDropdownItem: {
    display: 'block',
    width: '100%',
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    color: '#1a1a2e',
    textDecoration: 'none',
    textAlign: 'left',
    fontSize: '14px',
    cursor: 'pointer'
  },
  portalDivider: {
    height: '1px',
    background: 'rgba(0,0,0,0.1)',
    margin: '8px 0'
  },` : '';

  return `/**
 * ${businessName} - Frontend App
 * Test Mode Generated (with Portal Dropdown)
 */
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Page imports
${imports}
${authImports}
${authContextCode}

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <Link to="/home" style={styles.brand}>${businessName}</Link>

      {/* Desktop Nav - Main Site Pages Only */}
      <div style={styles.desktopNav}>
${navLinks}
      </div>

      {/* Auth Buttons with Portal Dropdown */}
      ${hasCompanionApp ? '<AuthButtons />' : ''}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={styles.menuButton}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Nav */}
      {menuOpen && (
        <div style={styles.mobileNav}>
${navLinks.replace(/styles\.navLink/g, 'styles.mobileNavLink')}
          ${hasCompanionApp ? `<div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '8px' }}>
            <Link to="/login" style={styles.mobileNavLink}>Login</Link>
            <Link to="/register" style={styles.mobileNavLink}>Sign Up</Link>
          </div>` : ''}
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    ${hasCompanionApp ? '<AuthProvider>' : ''}
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}' }}>
        <Navigation />
        <main>
          <Routes>
${routes}${authRoutes}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    ${hasCompanionApp ? '</AuthProvider>' : ''}
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '${colors.background}',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    position: 'relative'
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '${colors.primary}',
    textDecoration: 'none'
  },
  desktopNav: {
    display: 'flex',
    gap: '24px',
    '@media (max-width: 768px)': {
      display: 'none'
    }
  },
  navLink: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '14px',
    opacity: 0.8,
    transition: 'opacity 0.2s'
  },${authStyles}
  menuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '${colors.text}',
    cursor: 'pointer',
    '@media (max-width: 768px)': {
      display: 'block'
    }
  },
  mobileNav: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '${colors.background}',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  mobileNavLink: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '8px 0'
  }
};

export default App;
`;
}

/**
 * Generate auth pages (Login, Register, Dashboard) for website
 * These allow users to manage their account from the web, syncing with companion app
 */
function generateAuthPages(fixture) {
  const businessName = fixture.business.name;
  const colors = fixture.theme.colors;

  const loginPage = `/**
 * LoginPage - Test Mode Generated
 * Login page for ${businessName}
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const API_URL = '/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(\`\${API_URL}/auth/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your ${businessName} account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
        </p>

        <div style={styles.testCreds}>
          <p>Test Mode Credentials:</p>
          <p>demo@test.com / demo123</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '${colors.background}'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: '${colors.cardBg || 'rgba(255,255,255,0.05)'}',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    textAlign: 'center',
    marginBottom: '32px'
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '${colors.textMuted || 'rgba(255,255,255,0.4)'}'
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 48px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '${colors.text}',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    backgroundColor: '${colors.primary}',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    fontSize: '14px'
  },
  link: {
    color: '${colors.primary}',
    textDecoration: 'none',
    fontWeight: '600'
  },
  testCreds: {
    marginTop: '24px',
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '12px',
    color: '${colors.textMuted || 'rgba(255,255,255,0.4)'}'
  }
};
`;

  const registerPage = `/**
 * RegisterPage - Test Mode Generated
 * Registration page for ${businessName}
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const API_URL = '/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(\`\${API_URL}/auth/register\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName: name })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join ${businessName} today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={18} style={styles.inputIcon} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              minLength={8}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '${colors.background}'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: '${colors.cardBg || 'rgba(255,255,255,0.05)'}',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    textAlign: 'center',
    marginBottom: '32px'
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '${colors.textMuted || 'rgba(255,255,255,0.4)'}'
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 48px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '${colors.text}',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    backgroundColor: '${colors.primary}',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    fontSize: '14px'
  },
  link: {
    color: '${colors.primary}',
    textDecoration: 'none',
    fontWeight: '600'
  }
};
`;

  const dashboardPage = `/**
 * DashboardPage - Test Mode Generated
 * User dashboard for ${businessName}
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Gift, Clock, Star, LogOut, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Profile Header */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 style={styles.name}>{user.fullName || 'User'}</h1>
            <p style={styles.email}>{user.email}</p>
          </div>
        </div>

        {/* Loyalty Card */}
        <div style={styles.loyaltyCard}>
          <div style={styles.loyaltyHeader}>
            <Star size={24} color="#fbbf24" />
            <span style={styles.tier}>Gold Member</span>
          </div>
          <div style={styles.pointsDisplay}>
            <span style={styles.pointsNumber}>850</span>
            <span style={styles.pointsLabel}>Points</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: '68%' }} />
          </div>
          <p style={styles.progressText}>150 points to Platinum</p>
        </div>

        {/* Quick Links */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Links</h2>

          <Link to="/menu" style={styles.menuItem}>
            <Gift size={20} />
            <span style={styles.menuItemText}>View Rewards</span>
            <ChevronRight size={18} style={styles.chevron} />
          </Link>

          <Link to="/menu" style={styles.menuItem}>
            <Clock size={20} />
            <span style={styles.menuItemText}>Order History</span>
            <ChevronRight size={18} style={styles.chevron} />
          </Link>

          <Link to="/menu" style={styles.menuItem}>
            <User size={20} />
            <span style={styles.menuItemText}>Edit Profile</span>
            <ChevronRight size={18} style={styles.chevron} />
          </Link>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} style={styles.logoutButton}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '${colors.background}',
    padding: '20px'
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: '${colors.text}'
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    backgroundColor: '${colors.cardBg || 'rgba(255,255,255,0.05)'}',
    borderRadius: '16px',
    marginBottom: '20px'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '${colors.primary}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  name: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '${colors.text}',
    margin: 0
  },
  email: {
    fontSize: '14px',
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    margin: '4px 0 0'
  },
  loyaltyCard: {
    padding: '24px',
    background: 'linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent || colors.primary} 100%)',
    borderRadius: '16px',
    marginBottom: '24px'
  },
  loyaltyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  tier: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600'
  },
  pointsDisplay: {
    marginBottom: '16px'
  },
  pointsNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  pointsLabel: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: '8px'
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '4px'
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    marginTop: '8px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '${colors.text}',
    marginBottom: '16px'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '${colors.cardBg || 'rgba(255,255,255,0.05)'}',
    borderRadius: '12px',
    marginBottom: '8px',
    textDecoration: 'none',
    color: '${colors.text}'
  },
  menuItemText: {
    flex: 1
  },
  chevron: {
    opacity: 0.5
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};
`;

  return {
    'LoginPage': loginPage,
    'RegisterPage': registerPage,
    'DashboardPage': dashboardPage
  };
}

/**
 * Generate a mock page component from fixture data
 * @param {string} pageName - The page name (e.g., 'home', 'menu')
 * @param {object} pageData - Page-specific data from fixture
 * @param {object} fixture - Full fixture data
 * @param {string|null} archetypeOverride - Optional archetype override ('ecommerce', 'luxury', 'local')
 */
function generateMockPage(pageName, pageData, fixture, archetypeOverride = null) {
  // Handle hyphenated page names like 'gift-cards' -> 'GiftCardsPage'
  const componentName = pageName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Page';
  const businessName = fixture.business.name;
  const colors = fixture.theme.colors;

  // Generate appropriate page based on type
  switch (pageName) {
    case 'home':
      return generateHomePage(componentName, pageData, fixture, archetypeOverride);
    case 'menu':
      return generateMenuPage(componentName, pageData, fixture, archetypeOverride);
    case 'about':
      return generateAboutPage(componentName, pageData, fixture);
    case 'contact':
      return generateContactPage(componentName, pageData, fixture);
    case 'gallery':
      return generateGalleryPage(componentName, pageData, fixture);
    case 'reservations':
      return generateReservationsPage(componentName, pageData, fixture);
    case 'events':
      return generateEventsPage(componentName, pageData, fixture);
    case 'catering':
      return generateCateringPage(componentName, pageData, fixture);
    case 'gift-cards':
      return generateGiftCardsPage(componentName, pageData, fixture);
    case 'careers':
      return generateCareersPage(componentName, pageData, fixture);
    case 'press':
      return generatePressPage(componentName, pageData, fixture);
    case 'faq':
      return generateFaqPage(componentName, pageData, fixture);
    case 'services':
      return generateServicesPage(componentName, pageData, fixture);
    case 'pricing':
      return generatePricingPage(componentName, pageData, fixture);
    case 'team':
      return generateTeamPage(componentName, pageData, fixture);
    case 'testimonials':
      return generateTestimonialsPage(componentName, pageData, fixture);
    case 'blog':
      return generateBlogPage(componentName, pageData, fixture);
    case 'location':
    case 'locations':
      return generateLocationPage(componentName, pageData, fixture);
    case 'specials':
    case 'promotions':
      return generateSpecialsPage(componentName, pageData, fixture);
    case 'online-order':
    case 'order':
      return generateOnlineOrderPage(componentName, pageData, fixture);
    default:
      return generateGenericPage(componentName, pageName, pageData, fixture);
  }
}

function generateHomePage(componentName, pageData, fixture, archetypeOverride = null) {
  const hero = pageData?.hero || {};
  const sections = pageData?.sections || [];
  const { name, tagline, location, phone, yearFounded } = fixture.business;
  const colors = fixture.theme.colors;
  // Prefer the specific business industry over the detected category (e.g., "bakery" > "restaurant")
  const industry = fixture.business.industry || fixture._detectedIndustry || 'restaurant';

  // Check if this is an artisan food industry and use archetype system
  if (archetypeSystem && archetypePages && (archetypeOverride || archetypeSystem.isArtisanFoodIndustry(industry))) {
    const businessData = {
      name,
      tagline,
      industry,
      description: fixture.business.description || tagline,
      website: fixture.business.website || '',
      phone: phone || '',
      address: location || ''
    };

    // Use override if provided, otherwise auto-detect
    const archetypeId = archetypeOverride || archetypeSystem.detectArchetype(businessData);
    const archetype = archetypeSystem.getArchetype(archetypeId);
    console.log(`[Archetype] Using ${archetype.name} archetype for ${industry} home page${archetypeOverride ? ' (manual override)' : ''}`);

    const archetypeResult = archetypePages.generateHomePage(
      archetypeId,
      businessData,
      colors
    );

    // Archetype generators return a string directly
    if (archetypeResult && typeof archetypeResult === 'string') {
      return archetypeResult;
    }
  }

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React from 'react';
import { ArrowRight, Star, Clock, Flame, Leaf } from 'lucide-react';

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '80vh',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${hero?.backgroundImage || 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1920'})',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px'
      }}>
        <div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            ${hero?.headline || name}
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px', maxWidth: '600px' }}>
            ${hero?.subheadline || tagline}
          </p>
          <button style={{
            backgroundColor: '${colors.primary}',
            color: 'white',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ${hero?.cta || 'Get Started'} <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '48px' }}>
          Why Choose Us
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <FeatureCard icon={<Flame />} title="Quality First" description="We never compromise on quality" color="${colors.primary}" />
          <FeatureCard icon={<Leaf />} title="Fresh Daily" description="Everything made fresh every day" color="${colors.primary}" />
          <FeatureCard icon={<Clock />} title="Fast Service" description="Quick service without sacrificing quality" color="${colors.primary}" />
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: '${colors.primary}',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Ready to Experience ${name}?</h2>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>Join thousands of satisfied customers</p>
        <button style={{
          backgroundColor: 'white',
          color: '${colors.primary}',
          padding: '14px 28px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Get Started Today
        </button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div style={{
      padding: '32px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: color + '20',
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h3>
      <p style={{ opacity: 0.7 }}>{description}</p>
    </div>
  );
}
`;
}

function generateMenuPage(componentName, pageData, fixture, archetypeOverride = null) {
  // Use cuisine-specific categories if available, otherwise fall back to pageData
  let categories = pageData?.categories || [];
  if (categories.length === 0 && fixture._cuisineMenuItems) {
    categories = [
      { name: 'Starters & Sides', items: fixture._cuisineMenuItems.slice(4) },
      { name: 'Main Dishes', items: fixture._cuisineMenuItems.slice(0, 4) }
    ];
  }
  const { name, tagline, location, phone } = fixture.business;
  const colors = fixture.theme.colors;
  // Prefer the specific business industry over the detected category (e.g., "bakery" > "restaurant")
  const industry = fixture.business.industry || fixture._detectedIndustry || 'restaurant';

  // Check if this is an artisan food industry and use archetype system
  if (archetypeSystem && archetypePages && (archetypeOverride || archetypeSystem.isArtisanFoodIndustry(industry))) {
    const businessData = {
      name,
      tagline,
      industry,
      description: fixture.business.description || tagline,
      website: fixture.business.website || '',
      phone: phone || '',
      address: location || '',
      menuItems: fixture._cuisineMenuItems || categories.flatMap(c => c.items) || []
    };

    // Use override if provided, otherwise auto-detect
    const archetypeId = archetypeOverride || archetypeSystem.detectArchetype(businessData);
    const archetype = archetypeSystem.getArchetype(archetypeId);
    console.log(`[Archetype] Using ${archetype.name} archetype for ${industry} menu page${archetypeOverride ? ' (manual override)' : ''}`);

    const archetypeResult = archetypePages.generateMenuPage(
      archetypeId,
      businessData,
      colors
    );

    // Archetype generators return a string directly
    if (archetypeResult && typeof archetypeResult === 'string') {
      return archetypeResult;
    }
  }

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React, { useState } from 'react';

const MENU_DATA = ${JSON.stringify(categories, null, 2)};

export default function ${componentName}() {
  const [activeCategory, setActiveCategory] = useState(MENU_DATA[0]?.name || '');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '48px' }}>Our Menu</h1>

        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
          {MENU_DATA.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeCategory === cat.name ? '${colors.primary}' : 'transparent',
                color: activeCategory === cat.name ? 'white' : '${colors.text}',
                border: '2px solid ${colors.primary}',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {MENU_DATA.find(c => c.name === activeCategory)?.items.map((item, idx) => (
            <div key={idx} style={{
              padding: '24px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.name}</h3>
                <span style={{ color: '${colors.primary}', fontWeight: 'bold' }}>\${item.price}</span>
              </div>
              <p style={{ opacity: 0.7, fontSize: '14px' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateAboutPage(componentName, pageData, fixture) {
  const story = pageData?.story || null;
  const team = pageData?.team || [];
  const values = pageData?.values || [];
  const { name, established } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React from 'react';

const TEAM = ${JSON.stringify(team, null, 2)};

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>About ${name}</h1>
        <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '48px' }}>Est. ${established || '2020'}</p>

        {/* Story */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Our Story</h2>
          <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.9 }}>
            ${story || `${name} was founded with a passion for excellence and a commitment to our community.`}
          </p>
        </section>

        {/* Team */}
        <section>
          <h2 style={{ fontSize: '28px', marginBottom: '32px', textAlign: 'center' }}>Meet Our Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {TEAM.map((member, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <img
                  src={member.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
                  alt={member.name}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto 16px',
                    border: '4px solid ${colors.primary}'
                  }}
                />
                <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{member.name}</h3>
                <p style={{ color: '${colors.primary}', marginBottom: '8px' }}>{member.role}</p>
                <p style={{ opacity: 0.7, fontSize: '14px' }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
`;
}

function generateContactPage(componentName, pageData, fixture) {
  const address = pageData?.address || fixture.business?.address || '123 Main Street';
  const phone = pageData?.phone || fixture.business?.phone || '(555) 123-4567';
  const email = pageData?.email || fixture.business?.email || 'hello@example.com';
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ${componentName}() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! (Test mode)');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '48px' }}>Contact Us</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Get in Touch</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <MapPin size={24} color="${colors.primary}" />
                <span>${address || '123 Main Street'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Phone size={24} color="${colors.primary}" />
                <span>${phone || '(555) 123-4567'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Mail size={24} color="${colors.primary}" />
                <span>${email || 'hello@example.com'}</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '${colors.text}'
              }}
            />
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '${colors.text}'
              }}
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '${colors.text}',
                resize: 'vertical'
              }}
            />
            <button type="submit" style={{
              padding: '14px 28px',
              backgroundColor: '${colors.primary}',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateGalleryPage(componentName, pageData, fixture) {
  const images = pageData?.images || [
    { url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600', caption: 'Our Space' },
    { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', caption: 'Training Session' },
    { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600', caption: 'Group Class' },
    { url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600', caption: 'Equipment' },
    { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600', caption: 'Facility' },
    { url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600', caption: 'Community' }
  ];
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React, { useState } from 'react';
import { X } from 'lucide-react';

const GALLERY_IMAGES = ${JSON.stringify(images, null, 2)};

export default function ${componentName}() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '48px' }}>Gallery</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img)}
              style={{
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img
                src={img.url}
                alt={img.caption || 'Gallery image'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '40px'
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

function generateReservationsPage(componentName, pageData, fixture) {
  const { name, phone } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Reservations Page
 */
import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

export default function ${componentName}() {
  const [formData, setFormData] = useState({ date: '', time: '', party: '2', name: '', phone: '', email: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px', textAlign: 'center' }}>
        <CheckCircle size={64} style={{ color: '${colors.primary}', margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Reservation Request Sent!</h1>
        <p style={{ opacity: 0.8 }}>We'll confirm your reservation shortly. Call us at ${phone || '(555) 123-4567'} for immediate assistance.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Make a Reservation</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Reserve your table at ${name}</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Date</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Time</label>
              <select required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }}>
                <option value="">Select time</option>
                {['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', opacity: 0.8 }}>Party Size</label>
            <select value={formData.party} onChange={(e) => setFormData({...formData, party: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }}>
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
              <option value="9+">Large Party (9+)</option>
            </select>
          </div>
          <input type="text" placeholder="Your Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
          <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
          <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
          <textarea placeholder="Special Requests (optional)" rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit', resize: 'vertical' }} />
          <button type="submit" style={{ padding: '16px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Request Reservation</button>
        </form>
      </div>
    </div>
  );
}
`;
}

function generateEventsPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Events Page
 */
import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const EVENTS = [
  { title: 'Live Music Night', date: 'Every Friday', time: '7:00 PM - 10:00 PM', description: 'Enjoy live performances while you dine', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600' },
  { title: 'Wine Tasting Evening', date: 'First Saturday', time: '6:00 PM - 9:00 PM', description: 'Sample our curated wine selection', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
  { title: 'Chef\\'s Table Experience', date: 'By Reservation', time: 'Various', description: 'Exclusive multi-course tasting menu', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
];

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Events at ${name}</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Join us for special occasions and experiences</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {EVENTS.map((event, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
              <img src={event.image} alt={event.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{event.title}</h2>
                <p style={{ opacity: 0.8, marginBottom: '16px' }}>{event.description}</p>
                <div style={{ display: 'flex', gap: '24px', fontSize: '14px', opacity: 0.7 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {event.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {event.time}</span>
                </div>
                <button style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Learn More</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateCateringPage(componentName, pageData, fixture) {
  const { name, phone, email } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Catering Page
 */
import React, { useState } from 'react';
import { Users, Calendar, UtensilsCrossed, CheckCircle } from 'lucide-react';

const PACKAGES = [
  { name: 'Basic Package', price: 'From $15/person', items: ['Choice of 2 entrees', 'Side dishes', 'Bread & butter', 'Disposable serviceware'] },
  { name: 'Premium Package', price: 'From $25/person', items: ['Choice of 3 entrees', 'Appetizer platter', 'Side dishes', 'Dessert selection', 'Real serviceware'] },
  { name: 'Deluxe Package', price: 'From $40/person', items: ['Full menu selection', 'Appetizer stations', 'Premium sides', 'Dessert bar', 'Full service staff'] },
];

export default function ${componentName}() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px', textAlign: 'center' }}>
      <CheckCircle size={64} style={{ color: '${colors.primary}', margin: '0 auto 24px' }} />
      <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Catering Request Received!</h1>
      <p>Our catering team will contact you within 24 hours. Questions? Call ${phone || '(555) 123-4567'}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Catering Services</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Let ${name} cater your next event</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {PACKAGES.map((pkg, idx) => (
            <div key={idx} style={{ padding: '32px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: idx === 1 ? '2px solid ' + '${colors.primary}' : 'none' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{pkg.name}</h3>
              <p style={{ fontSize: '20px', color: '${colors.primary}', fontWeight: 'bold', marginBottom: '16px' }}>{pkg.price}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {pkg.items.map((item, i) => <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>✓ {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '32px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Request a Quote</h2>
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input placeholder="Your Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
            <input placeholder="Phone" required type="tel" style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
            <input placeholder="Email" required type="email" style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
            <input placeholder="Event Date" required type="date" style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
            <input placeholder="Number of Guests" required type="number" style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
            <input placeholder="Event Type" style={{ padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
            <textarea placeholder="Additional Details" rows={4} style={{ gridColumn: '1 / -1', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }} />
            <button type="submit" style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Request</button>
          </form>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateGiftCardsPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Gift Cards Page
 */
import React, { useState } from 'react';
import { Gift, CreditCard, Mail, CheckCircle } from 'lucide-react';

const AMOUNTS = [25, 50, 75, 100, 150, 200];

export default function ${componentName}() {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [delivery, setDelivery] = useState('email');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Gift size={64} style={{ color: '${colors.primary}', marginBottom: '24px' }} />
          <h1 style={{ fontSize: '42px', marginBottom: '16px' }}>Gift Cards</h1>
          <p style={{ opacity: 0.8 }}>Give the gift of great food at ${name}</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '32px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Select Amount</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {AMOUNTS.map(a => (
              <button key={a} onClick={() => { setAmount(a); setCustomAmount(''); }} style={{ padding: '16px', backgroundColor: amount === a && !customAmount ? '${colors.primary}' : 'rgba(255,255,255,0.05)', color: amount === a && !customAmount ? 'white' : 'inherit', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>\${a}</button>
            ))}
          </div>
          <input type="number" placeholder="Or enter custom amount" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Delivery Method</h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => setDelivery('email')} style={{ flex: 1, padding: '16px', backgroundColor: delivery === 'email' ? '${colors.primary}' : 'rgba(255,255,255,0.05)', color: delivery === 'email' ? 'white' : 'inherit', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Mail size={20} /> Email</button>
            <button onClick={() => setDelivery('physical')} style={{ flex: 1, padding: '16px', backgroundColor: delivery === 'physical' ? '${colors.primary}' : 'rgba(255,255,255,0.05)', color: delivery === 'physical' ? 'white' : 'inherit', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><CreditCard size={20} /> Physical Card</button>
          </div>
          <input placeholder="Recipient's Name" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit', marginBottom: '12px' }} />
          <input placeholder={delivery === 'email' ? "Recipient's Email" : "Shipping Address"} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit', marginBottom: '12px' }} />
          <textarea placeholder="Personal Message (optional)" rows={3} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit', marginBottom: '24px' }} />
          <button style={{ width: '100%', padding: '18px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Purchase Gift Card - \${customAmount || amount}</button>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateCareersPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Careers Page
 */
import React from 'react';
import { Briefcase, Clock, MapPin, DollarSign } from 'lucide-react';

const POSITIONS = [
  { title: 'Line Cook', type: 'Full-time', location: 'On-site', salary: '$18-22/hr', description: 'Prepare dishes according to recipes and standards' },
  { title: 'Server', type: 'Part-time', location: 'On-site', salary: '$15/hr + tips', description: 'Provide excellent customer service to guests' },
  { title: 'Host/Hostess', type: 'Part-time', location: 'On-site', salary: '$14-16/hr', description: 'Welcome guests and manage reservations' },
  { title: 'Kitchen Manager', type: 'Full-time', location: 'On-site', salary: '$50-60k/yr', description: 'Oversee kitchen operations and staff' },
];

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Join Our Team</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Build your career at ${name}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {POSITIONS.map((job, idx) => (
            <div key={idx} style={{ padding: '28px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{job.title}</h2>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', opacity: 0.7 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {job.type}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> {job.salary}</span>
                  </div>
                </div>
                <button style={{ padding: '12px 24px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Apply Now</button>
              </div>
              <p style={{ opacity: 0.8 }}>{job.description}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '48px', padding: '32px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Don't See Your Role?</h2>
          <p style={{ opacity: 0.8, marginBottom: '24px' }}>We're always looking for talented people. Send us your resume!</p>
          <button style={{ padding: '14px 28px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Submit General Application</button>
        </div>
      </div>
    </div>
  );
}
`;
}

function generatePressPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Press Page
 */
import React from 'react';
import { Newspaper, Download, Mail } from 'lucide-react';

const PRESS_ITEMS = [
  { outlet: 'Local Food Magazine', title: '"Best New Restaurant of the Year"', date: '2024', quote: 'A dining experience that exceeds expectations...' },
  { outlet: 'City Times', title: '"Hidden Gem Worth Discovering"', date: '2024', quote: 'The flavors are authentic and the atmosphere is inviting...' },
  { outlet: 'Food Blog Weekly', title: '"Must-Try Menu Items"', date: '2023', quote: 'Every dish tells a story of passion and craftsmanship...' },
];

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>${name} in the Press</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>See what people are saying about us</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
          {PRESS_ITEMS.map((item, idx) => (
            <div key={idx} style={{ padding: '28px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.7 }}>
                <Newspaper size={16} />
                <span>{item.outlet}</span>
                <span>•</span>
                <span>{item.date}</span>
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '12px', color: '${colors.primary}' }}>{item.title}</h2>
              <p style={{ fontStyle: 'italic', opacity: 0.8 }}>"{item.quote}"</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ padding: '28px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', textAlign: 'center' }}>
            <Download size={32} style={{ marginBottom: '16px', color: '${colors.primary}' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Press Kit</h3>
            <p style={{ opacity: 0.7, marginBottom: '16px' }}>Download logos, photos, and company information</p>
            <button style={{ padding: '12px 24px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Download Kit</button>
          </div>
          <div style={{ padding: '28px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', textAlign: 'center' }}>
            <Mail size={32} style={{ marginBottom: '16px', color: '${colors.primary}' }} />
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Media Inquiries</h3>
            <p style={{ opacity: 0.7, marginBottom: '16px' }}>Contact our PR team for interviews and features</p>
            <button style={{ padding: '12px 24px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Contact PR</button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateFaqPage(componentName, pageData, fixture) {
  const { name, phone } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - FAQ Page
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q: 'Do you take reservations?', a: 'Yes! You can make reservations online or by calling us. We recommend booking in advance for weekends and special occasions.' },
  { q: 'Do you accommodate dietary restrictions?', a: 'Absolutely. We offer vegetarian, vegan, and gluten-free options. Please let your server know about any allergies or dietary needs.' },
  { q: 'Is there parking available?', a: 'Yes, we have a parking lot behind the building and street parking is also available.' },
  { q: 'Do you offer catering services?', a: 'Yes, we cater events of all sizes. Visit our catering page or contact us for more information.' },
  { q: 'What are your hours?', a: 'We are open Monday-Thursday 11am-9pm, Friday-Saturday 11am-10pm, and Sunday 12pm-8pm.' },
  { q: 'Do you have a private dining room?', a: 'Yes, our private room can accommodate up to 30 guests. Contact us for availability and pricing.' },
];

export default function ${componentName}() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Frequently Asked Questions</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Everything you need to know about ${name}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQS.map((faq, idx) => (
            <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
              <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} style={{ width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: '18px', fontWeight: '500' }}>{faq.q}</span>
                {openIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openIndex === idx && (
                <div style={{ padding: '0 20px 20px', opacity: 0.8 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '48px', textAlign: 'center', padding: '32px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Still have questions?</h2>
          <p style={{ opacity: 0.8, marginBottom: '16px' }}>We're happy to help!</p>
          <p style={{ fontSize: '20px', color: '${colors.primary}', fontWeight: 'bold' }}>${phone || '(555) 123-4567'}</p>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateServicesPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  // Use detected business services if available, otherwise default
  const services = fixture._businessServices || pageData?.items || [
    { name: 'Service One', price: 'From $99', description: 'Description of our first service offering' },
    { name: 'Service Two', price: 'From $149', description: 'Description of our second service offering' },
    { name: 'Service Three', price: 'From $199', description: 'Description of our third service offering' },
  ];

  return `/**
 * ${componentName} - Services Page
 * Business: ${name}
 * ${fixture._detectedBusinessType ? `Detected Type: ${fixture._detectedBusinessType}` : ''}
 */
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const SERVICES = ${JSON.stringify(services, null, 2)};

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Our Services</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
          ${fixture._businessAmbiance || `Quality services from ${name}`}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {SERVICES.map((service, idx) => (
            <div key={idx} style={{
              padding: '32px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{service.name}</h2>
                <span style={{
                  backgroundColor: '${colors.primary}',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>{service.price}</span>
              </div>
              <p style={{ opacity: 0.8, marginBottom: '20px', lineHeight: 1.6 }}>{service.description}</p>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '${colors.primary}',
                border: '2px solid ${colors.primary}',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                Book Now <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generatePricingPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  // Use detected business services for pricing if available
  const services = fixture._businessServices || [];
  const hasServices = services.length > 0;

  // Generate pricing items from services or use defaults
  const pricingItems = hasServices ? services : [
    { name: 'Basic', price: '$29', period: '/month', features: ['Feature one', 'Feature two', 'Feature three'], popular: false },
    { name: 'Pro', price: '$59', period: '/month', features: ['Everything in Basic', 'Feature four', 'Feature five', 'Priority support'], popular: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee'], popular: false },
  ];

  return `/**
 * ${componentName} - Pricing Page
 * Business: ${name}
 */
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

const PRICING = ${JSON.stringify(pricingItems, null, 2)};
const IS_SERVICE_PRICING = ${hasServices};

export default function ${componentName}() {
  if (IS_SERVICE_PRICING) {
    // Service-based pricing (fitness, salon, healthcare, etc.)
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Our Pricing</h1>
          <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Transparent pricing for all our services</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {PRICING.map((service, idx) => (
              <div key={idx} style={{
                padding: '24px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '4px' }}>{service.name}</h3>
                  <p style={{ opacity: 0.7, fontSize: '14px' }}>{service.description}</p>
                </div>
                <span style={{
                  backgroundColor: '${colors.primary}',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}>{service.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Plan-based pricing (SaaS, subscriptions)
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Pricing Plans</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Choose the plan that's right for you</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {PRICING.map((plan, idx) => (
            <div key={idx} style={{ padding: '32px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: plan.popular ? '2px solid ' + '${colors.primary}' : 'none', position: 'relative' }}>
              {plan.popular && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '${colors.primary}', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Most Popular</span>}
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{plan.name}</h2>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '${colors.primary}' }}>{plan.price}<span style={{ fontSize: '16px', opacity: 0.7 }}>{plan.period || ''}</span></p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0' }}>
                {(plan.features || []).map((f, i) => <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}><Check size={16} style={{ color: '${colors.primary}' }} /> {f}</li>)}
              </ul>
              <button style={{ width: '100%', padding: '14px', backgroundColor: plan.popular ? '${colors.primary}' : 'transparent', color: plan.popular ? 'white' : '${colors.primary}', border: plan.popular ? 'none' : '2px solid ' + '${colors.primary}', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Get Started</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateTeamPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Team Page
 */
import React from 'react';

const TEAM = [
  { name: 'John Smith', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300', bio: 'Leading our vision forward' },
  { name: 'Sarah Johnson', role: 'Head Chef', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', bio: 'Crafting memorable experiences' },
  { name: 'Mike Williams', role: 'Operations Manager', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', bio: 'Keeping everything running smoothly' },
];

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Meet Our Team</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>The people behind ${name}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          {TEAM.map((person, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <img src={person.image} alt={person.name} style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{person.name}</h2>
              <p style={{ color: '${colors.primary}', marginBottom: '12px' }}>{person.role}</p>
              <p style={{ opacity: 0.7 }}>{person.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateTestimonialsPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Testimonials Page
 */
import React from 'react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Emily R.', rating: 5, text: 'Absolutely amazing experience! The food was incredible and the service was top-notch.', date: '2 weeks ago' },
  { name: 'Michael T.', rating: 5, text: 'Best restaurant in town. We come here every week now. Highly recommend!', date: '1 month ago' },
  { name: 'Jessica L.', rating: 5, text: 'The atmosphere is perfect and the staff makes you feel like family.', date: '1 month ago' },
  { name: 'David K.', rating: 4, text: 'Great food, friendly staff. Will definitely be back!', date: '2 months ago' },
];

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>What Our Customers Say</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Real reviews from real customers</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} style={{ padding: '28px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <Quote size={32} style={{ color: '${colors.primary}', opacity: 0.5, marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', marginBottom: '20px', lineHeight: 1.6 }}>"{t.text}"</p>
              <div style={{ display: 'flex', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < t.rating ? '${colors.primary}' : 'transparent'} stroke="${colors.primary}" />)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{t.name}</span>
                <span style={{ opacity: 0.6, fontSize: '14px' }}>{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateBlogPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Blog Page
 */
import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

const POSTS = [
  { title: 'Behind the Scenes: Our Kitchen', excerpt: 'Take a peek at how we prepare your favorite dishes...', date: 'Jan 15, 2024', author: 'Chef Mike', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600' },
  { title: 'New Seasonal Menu Items', excerpt: 'We are excited to announce our new spring menu featuring...', date: 'Jan 10, 2024', author: 'Sarah', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600' },
  { title: 'Our Commitment to Local Sourcing', excerpt: 'Learn about our partnerships with local farmers and suppliers...', date: 'Jan 5, 2024', author: 'John', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600' },
];

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '48px' }}>Our Blog</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {POSTS.map((post, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
              <img src={post.image} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '24px 24px 24px 0' }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', opacity: 0.7, marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {post.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {post.author}</span>
                </div>
                <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{post.title}</h2>
                <p style={{ opacity: 0.8, marginBottom: '16px' }}>{post.excerpt}</p>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '${colors.primary}', cursor: 'pointer', fontWeight: 'bold' }}>Read More <ArrowRight size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateLocationPage(componentName, pageData, fixture) {
  const { name, address, phone, hours } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Location Page
 */
import React from 'react';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '48px' }}>Find Us</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          <div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>${name}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <MapPin size={24} style={{ color: '${colors.primary}', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>Address</h3>
                    <p style={{ opacity: 0.8 }}>${address || '123 Main Street, City, State 12345'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <Phone size={24} style={{ color: '${colors.primary}', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>Phone</h3>
                    <p style={{ opacity: 0.8 }}>${phone || '(555) 123-4567'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <Clock size={24} style={{ color: '${colors.primary}', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>Hours</h3>
                    <p style={{ opacity: 0.8 }}>Mon-Thu: 11am-9pm</p>
                    <p style={{ opacity: 0.8 }}>Fri-Sat: 11am-10pm</p>
                    <p style={{ opacity: 0.8 }}>Sunday: 12pm-8pm</p>
                  </div>
                </div>
              </div>
              <button style={{ marginTop: '24px', width: '100%', padding: '14px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Navigation size={18} /> Get Directions</button>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ opacity: 0.6 }}>Map would load here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateSpecialsPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Specials Page
 */
import React from 'react';
import { Tag, Clock, Percent } from 'lucide-react';

const SPECIALS = [
  { title: 'Happy Hour', description: '50% off appetizers and drinks', time: 'Mon-Fri 4-6pm', tag: 'Daily' },
  { title: 'Family Night', description: 'Kids eat free with adult entree', time: 'Every Tuesday', tag: 'Weekly' },
  { title: 'Date Night Special', description: 'Two entrees + dessert for $59', time: 'Thursday & Friday', tag: 'Weekly' },
  { title: 'Weekend Brunch', description: 'Special brunch menu with bottomless mimosas', time: 'Sat & Sun 10am-2pm', tag: 'Weekend' },
];

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>Specials & Promotions</h1>
        <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '48px' }}>Great deals at ${name}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {SPECIALS.map((special, idx) => (
            <div key={idx} style={{ padding: '28px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '${colors.primary}', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>{special.tag}</span>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{special.title}</h2>
              <p style={{ opacity: 0.8, marginBottom: '16px' }}>{special.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}>
                <Clock size={16} />
                <span>{special.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateOnlineOrderPage(componentName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;
  return `/**
 * ${componentName} - Online Order Page
 */
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

const MENU_ITEMS = [
  { id: 1, name: 'Signature Pizza', price: 18.99, description: 'Our house special' },
  { id: 2, name: 'Pasta Primavera', price: 15.99, description: 'Fresh vegetables in cream sauce' },
  { id: 3, name: 'Caesar Salad', price: 12.99, description: 'Crisp romaine with house dressing' },
  { id: 4, name: 'Garlic Bread', price: 6.99, description: 'Toasted with herb butter' },
];

export default function ${componentName}() {
  const [cart, setCart] = useState([]);
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    } else {
      setCart([...cart, {...item, qty: 1}]);
    }
  };
  const updateQty = (id, delta) => {
    setCart(cart.map(c => c.id === id ? {...c, qty: Math.max(0, c.qty + delta)} : c).filter(c => c.qty > 0));
  };
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '48px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Order Online</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {MENU_ITEMS.map(item => (
              <div key={item.id} style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{item.name}</h3>
                  <p style={{ opacity: 0.7, fontSize: '14px' }}>{item.description}</p>
                  <p style={{ color: '${colors.primary}', fontWeight: 'bold', marginTop: '8px' }}>\${item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => addToCart(item)} style={{ padding: '10px 20px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Add</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}><ShoppingCart size={24} /> Your Order</h2>
            {cart.length === 0 ? (
              <p style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <p style={{ fontWeight: '500' }}>{item.name}</p>
                      <p style={{ opacity: 0.7, fontSize: '14px' }}>\${item.price.toFixed(2)} each</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: 'inherit' }}><Minus size={14} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: 'inherit' }}><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontWeight: 'bold', fontSize: '20px' }}>
                  <span>Total</span>
                  <span>\${total.toFixed(2)}</span>
                </div>
                <button style={{ width: '100%', padding: '16px', backgroundColor: '${colors.primary}', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Checkout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateGenericPage(componentName, pageName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React from 'react';

export default function ${componentName}() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '${colors.background}',
      color: '${colors.text}',
      padding: '80px 20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', marginBottom: '24px' }}>${pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h1>
        <p style={{ opacity: 0.7, fontSize: '18px' }}>
          This is the ${pageName} page for ${name}.
        </p>
        <p style={{ marginTop: '24px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          🧪 Generated in Test Mode using mock fixture data.
        </p>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate complete companion app from fixture data
 * Matches structure of real AI-generated companion apps
 * NOW INDUSTRY-AWARE - generates appropriate screens per industry
 */
function generateMockCompanionApp(fixture, projectName) {
  const { business, theme, companionApp } = fixture;
  const colors = theme.colors;
  const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  // Get industry-specific configuration
  const industry = business.industry || 'default';
  const category = getIndustryCategory(industry);
  const industryConfig = getIndustryFixture(industry);
  const appConfig = industryConfig.app;
  const sampleData = industryConfig.data;
  const loyaltyConfig = industryConfig.loyalty;

  console.log(`📱 Generating ${category} companion app for industry: ${industry}`);

  // Build screens based on industry configuration
  const screens = {};

  // Always include core screens
  screens['src/screens/HomeScreen.jsx'] = generateHomeScreen(business, colors, companionApp, industryConfig);
  screens['src/screens/RewardsScreen.jsx'] = generateRewardsScreen(business, colors, companionApp, loyaltyConfig);
  screens['src/screens/ProfileScreen.jsx'] = generateProfileScreen(business, colors, companionApp);
  screens['src/screens/LoginScreen.jsx'] = generateLoginScreen(business, colors);

  // Add industry-specific screens based on category
  if (category === 'food-beverage') {
    screens['src/screens/MenuScreen.jsx'] = generateMenuScreen(business, colors, sampleData);
    screens['src/screens/OrderHistoryScreen.jsx'] = generateOrderHistoryScreen(business, colors);
  } else if (category === 'retail') {
    screens['src/screens/ShopScreen.jsx'] = generateShopScreen(business, colors, sampleData);
    screens['src/screens/CartScreen.jsx'] = generateCartScreen(business, colors);
    screens['src/screens/OrdersScreen.jsx'] = generateOrdersScreen(business, colors);
  } else if (category === 'health-wellness') {
    screens['src/screens/ClassesScreen.jsx'] = generateClassesScreen(business, colors, sampleData);
    screens['src/screens/ScheduleScreen.jsx'] = generateScheduleScreen(business, colors);
  } else if (category === 'healthcare' || category === 'creative' || category === 'professional-services') {
    screens['src/screens/ServicesScreen.jsx'] = generateServicesScreen(business, colors, sampleData);
    screens['src/screens/BookingScreen.jsx'] = generateBookingScreen(business, colors);
  } else if (category === 'hospitality') {
    screens['src/screens/RoomsScreen.jsx'] = generateRoomsScreen(business, colors, sampleData);
    screens['src/screens/BookingScreen.jsx'] = generateBookingScreen(business, colors);
  } else if (category === 'trade-services') {
    screens['src/screens/ServicesScreen.jsx'] = generateServicesScreen(business, colors, sampleData);
    screens['src/screens/QuoteScreen.jsx'] = generateQuoteScreen(business, colors);
  } else {
    // Default: add generic services and booking
    screens['src/screens/ServicesScreen.jsx'] = generateServicesScreen(business, colors, sampleData);
    screens['src/screens/BookingScreen.jsx'] = generateBookingScreen(business, colors);
  }

  // Optional extras for all: Wallet, Earn, Leaderboard
  screens['src/screens/WalletScreen.jsx'] = generateWalletScreen(business, colors, companionApp);
  screens['src/screens/EarnScreen.jsx'] = generateEarnScreen(business, colors, companionApp);
  screens['src/screens/LeaderboardScreen.jsx'] = generateLeaderboardScreen(business, colors, companionApp);

  return {
    // Package.json
    'package.json': JSON.stringify({
      name: `${safeName}-companion`,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0',
        'lucide-react': '^0.294.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.0',
        'vite': '^5.0.0'
      }
    }, null, 2),

    // Vite config
    'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 }
});`,

    // Index HTML
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="${colors.primary}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <link rel="manifest" href="/manifest.json" />
  <title>${business.name} App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,

    // Manifest
    'public/manifest.json': JSON.stringify({
      name: business.name,
      short_name: business.name.split(' ')[0],
      start_url: '/',
      display: 'standalone',
      background_color: colors.background,
      theme_color: colors.primary,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    }, null, 2),

    // Main entry
    'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

    // App.jsx with routes - now industry-aware
    'src/App.jsx': generateCompanionAppJsx(business, colors, category, appConfig),

    // Main styles
    'src/index.css': generateCompanionStyles(colors),

    // All screens (industry-specific + core)
    ...screens,

    // Components - now industry-aware bottom nav
    'src/components/BottomNav.jsx': generateBottomNav(colors, category, appConfig),
    'src/components/QuickActionCard.jsx': generateQuickActionCard(colors),

    // Services
    'src/services/api.js': generateApiService(safeName),

    // Hooks
    'src/hooks/useAuth.jsx': generateAuthHook()
  };
}

function generateCompanionAppJsx(business, colors, category, appConfig) {
  // Generate industry-specific imports and routes
  const screenImports = generateScreenImports(category);
  const screenRoutes = generateScreenRoutes(category);

  return `/**
 * ${business.name} Companion App
 * Test Mode Generated - Industry: ${category}
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
${screenImports}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
${screenRoutes}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;`;
}

/**
 * Generate industry-specific screen imports
 */
function generateScreenImports(category) {
  // Core screens always included
  const imports = [
    `import HomeScreen from './screens/HomeScreen';`,
    `import RewardsScreen from './screens/RewardsScreen';`,
    `import ProfileScreen from './screens/ProfileScreen';`,
    `import LoginScreen from './screens/LoginScreen';`,
    `import WalletScreen from './screens/WalletScreen';`,
    `import EarnScreen from './screens/EarnScreen';`,
    `import LeaderboardScreen from './screens/LeaderboardScreen';`
  ];

  // Add industry-specific screens
  if (category === 'food-beverage') {
    imports.push(`import MenuScreen from './screens/MenuScreen';`);
    imports.push(`import OrderHistoryScreen from './screens/OrderHistoryScreen';`);
  } else if (category === 'retail') {
    imports.push(`import ShopScreen from './screens/ShopScreen';`);
    imports.push(`import CartScreen from './screens/CartScreen';`);
    imports.push(`import OrdersScreen from './screens/OrdersScreen';`);
  } else if (category === 'health-wellness') {
    imports.push(`import ClassesScreen from './screens/ClassesScreen';`);
    imports.push(`import ScheduleScreen from './screens/ScheduleScreen';`);
  } else if (category === 'healthcare' || category === 'creative' || category === 'professional-services') {
    imports.push(`import ServicesScreen from './screens/ServicesScreen';`);
    imports.push(`import BookingScreen from './screens/BookingScreen';`);
  } else if (category === 'hospitality') {
    imports.push(`import RoomsScreen from './screens/RoomsScreen';`);
    imports.push(`import BookingScreen from './screens/BookingScreen';`);
  } else if (category === 'trade-services') {
    imports.push(`import ServicesScreen from './screens/ServicesScreen';`);
    imports.push(`import QuoteScreen from './screens/QuoteScreen';`);
  } else {
    imports.push(`import ServicesScreen from './screens/ServicesScreen';`);
    imports.push(`import BookingScreen from './screens/BookingScreen';`);
  }

  return imports.join('\n');
}

/**
 * Generate industry-specific routes
 */
function generateScreenRoutes(category) {
  // Core routes
  const routes = [
    `          <Route path="/" element={<HomeScreen user={user} />} />`,
    `          <Route path="/rewards" element={<RewardsScreen user={user} />} />`,
    `          <Route path="/wallet" element={<WalletScreen user={user} />} />`,
    `          <Route path="/earn" element={<EarnScreen user={user} />} />`,
    `          <Route path="/leaderboard" element={<LeaderboardScreen user={user} />} />`,
    `          <Route path="/profile" element={<ProfileScreen user={user} onLogout={handleLogout} />} />`
  ];

  // Add industry-specific routes
  if (category === 'food-beverage') {
    routes.splice(1, 0, `          <Route path="/menu" element={<MenuScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/history" element={<OrderHistoryScreen user={user} />} />`);
  } else if (category === 'retail') {
    routes.splice(1, 0, `          <Route path="/shop" element={<ShopScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/cart" element={<CartScreen user={user} />} />`);
    routes.splice(3, 0, `          <Route path="/orders" element={<OrdersScreen user={user} />} />`);
  } else if (category === 'health-wellness') {
    routes.splice(1, 0, `          <Route path="/classes" element={<ClassesScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/schedule" element={<ScheduleScreen user={user} />} />`);
  } else if (category === 'healthcare' || category === 'creative' || category === 'professional-services') {
    routes.splice(1, 0, `          <Route path="/services" element={<ServicesScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/book" element={<BookingScreen user={user} />} />`);
  } else if (category === 'hospitality') {
    routes.splice(1, 0, `          <Route path="/rooms" element={<RoomsScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/book" element={<BookingScreen user={user} />} />`);
  } else if (category === 'trade-services') {
    routes.splice(1, 0, `          <Route path="/services" element={<ServicesScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/quote" element={<QuoteScreen user={user} />} />`);
  } else {
    routes.splice(1, 0, `          <Route path="/services" element={<ServicesScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/book" element={<BookingScreen user={user} />} />`);
  }

  return routes.join('\n');
}

function generateCompanionStyles(colors) {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: ${colors.primary};
  --secondary: ${colors.secondary || colors.primary};
  --accent: ${colors.accent || '#10b981'};
  --background: ${colors.background};
  --text: ${colors.text};
  --card-bg: rgba(255, 255, 255, 0.05);
  --border: rgba(255, 255, 255, 0.1);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--background);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
  padding-bottom: 80px;
}

.screen {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.screen-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 24px;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}

.btn:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
}`;
}

function generateHomeScreen(business, colors, companionApp, industryConfig) {
  const dashboard = companionApp?.dashboard || {};
  // Use default widgets if not provided in companionApp
  const widgets = dashboard.widgets?.length ? dashboard.widgets : [
    { type: 'points', label: 'Reward Points', value: 850 },
    { type: 'tier', label: 'Member Tier', value: 'Gold' },
    { type: 'orders', label: 'Total Orders', value: 23 },
    { type: 'savings', label: 'Total Savings', value: '$47.50' }
  ];

  // Always use category-based quick actions with proper navigation paths
  const categoryActions = getQuickActionsForCategory(industryConfig?.category || 'default');
  // Merge custom actions with paths, fallback to category defaults
  const quickActions = dashboard.quickActions?.length
    ? dashboard.quickActions.map(action => ({
        ...action,
        path: action.path || categoryActions.find(ca => ca.id === action.id)?.path || '/profile'
      }))
    : categoryActions;

  const category = industryConfig?.category || 'default';

  return `/**
 * HomeScreen - Dashboard
 * Test Mode Generated - ${category} Industry
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Gift, Clock, Users, Star, Award, Wallet, TrendingUp } from 'lucide-react';
import QuickActionCard from '../components/QuickActionCard';

const WIDGETS = ${JSON.stringify(widgets, null, 2)};

const QUICK_ACTIONS = ${JSON.stringify(quickActions, null, 2)};

const ICON_MAP = {
  ShoppingBag, Gift, Clock, Users, Star, Award, Wallet, TrendingUp
};

export default function HomeScreen({ user }) {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <div style={{ marginBottom: '24px' }}>
        <p style={{ opacity: 0.7, marginBottom: '4px' }}>${dashboard.greeting || 'Welcome back!'}</p>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>{user?.fullName || 'Guest'}</h1>
      </div>

      {/* Stats Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {WIDGETS.map((widget, idx) => (
          <div key={idx} className="card" style={{ textAlign: 'center' }}>
            <p style={{ opacity: 0.7, fontSize: '12px', marginBottom: '4px' }}>{widget.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{widget.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {QUICK_ACTIONS.map((action, idx) => {
          const IconComponent = ICON_MAP[action.icon] || Gift;
          return (
            <QuickActionCard
              key={idx}
              icon={<IconComponent size={24} />}
              label={action.label}
              onClick={() => navigate(action.path)}
            />
          );
        })}
      </div>
    </div>
  );
}`;
}

function generateRewardsScreen(business, colors, companionApp, loyaltyConfig) {
  // Use loyalty config for default values if companionApp doesn't have rewards
  const rewards = companionApp?.rewards || {};
  const defaultTiers = loyaltyConfig?.tiers || [
    { name: 'Bronze', minPoints: 0, perks: ['Earn 1 point per $1', 'Member-only offers'] },
    { name: 'Silver', minPoints: 500, perks: ['Earn 1.25x points', 'Early access', 'Birthday reward'] },
    { name: 'Gold', minPoints: 1500, perks: ['Earn 1.5x points', 'Free shipping', 'Exclusive events'] },
    { name: 'Platinum', minPoints: 5000, perks: ['Earn 2x points', 'Priority support', 'VIP experiences'] }
  ];
  const defaultRewards = loyaltyConfig?.rewards || [
    { name: '$5 Off', cost: 100 },
    { name: '$10 Off', cost: 200 },
    { name: '$25 Off', cost: 450 },
    { name: 'Free Item', cost: 300 }
  ];

  const rewardsData = {
    currentPoints: rewards.currentPoints || 850,
    currentTier: rewards.currentTier || 'Gold',
    pointsToNextTier: rewards.pointsToNextTier || 650,
    availableRewards: rewards.availableRewards?.length ? rewards.availableRewards : defaultRewards,
    tiers: rewards.tiers?.length ? rewards.tiers : defaultTiers
  };

  return `/**
 * RewardsScreen - Universal Loyalty & Rewards
 * Test Mode Generated - Rewards in ALL industries
 */
import React from 'react';
import { Gift, ChevronRight, Star } from 'lucide-react';

const REWARDS_DATA = ${JSON.stringify(rewardsData, null, 2)};

export default function RewardsScreen({ user }) {
  const { currentPoints, currentTier, pointsToNextTier, availableRewards, tiers } = REWARDS_DATA;

  return (
    <div className="screen">
      <h1 className="screen-title">My Rewards</h1>

      {/* Points Summary */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Star size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
        <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)' }}>{currentPoints}</p>
        <p style={{ opacity: 0.7 }}>Points Available</p>
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px' }}>
            <strong>{currentTier}</strong> Member • {pointsToNextTier} points to next tier
          </p>
        </div>
      </div>

      {/* Available Rewards */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Redeem Rewards</h2>
      {availableRewards.map((reward, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: '600' }}>{reward.name}</p>
            <p style={{ opacity: 0.7, fontSize: '14px' }}>{reward.cost} points</p>
          </div>
          <button style={{
            background: currentPoints >= reward.cost ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: currentPoints >= reward.cost ? 'pointer' : 'not-allowed'
          }}>
            Redeem
          </button>
        </div>
      ))}

      {/* Tier Info */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px' }}>Membership Tiers</h2>
      {tiers.map((tier, idx) => (
        <div key={idx} className="card" style={{ opacity: tier.name === currentTier ? 1 : 0.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ fontWeight: '600' }}>{tier.name}</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>{tier.minPoints}+ points</p>
          </div>
          <ul style={{ paddingLeft: '16px', fontSize: '14px', opacity: 0.8 }}>
            {tier.perks.map((perk, i) => <li key={i}>{perk}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}`;
}

function generateWalletScreen(business, colors, companionApp) {
  const wallet = companionApp?.wallet || {};

  return `/**
 * WalletScreen
 * Test Mode Generated
 */
import React from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const WALLET_DATA = ${JSON.stringify(wallet, null, 2)};

export default function WalletScreen({ user }) {
  const { balance = 0, transactions = [] } = WALLET_DATA;

  return (
    <div className="screen">
      <h1 className="screen-title">My Wallet</h1>

      {/* Balance Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Wallet size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
        <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)' }}>\${balance.toFixed(2)}</p>
        <p style={{ opacity: 0.7 }}>Available Balance</p>
        <button className="btn" style={{ marginTop: '16px' }}>
          <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Add Funds
        </button>
      </div>

      {/* Transaction History */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Transactions</h2>
      {transactions.map((tx, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: tx.type === 'credit' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {tx.type === 'credit' ? <ArrowDownLeft color="#10b981" /> : <ArrowUpRight color="#ef4444" />}
            </div>
            <div>
              <p style={{ fontWeight: '500' }}>{tx.description}</p>
              <p style={{ fontSize: '12px', opacity: 0.6 }}>{tx.date}</p>
            </div>
          </div>
          <p style={{ fontWeight: '600', color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
            {tx.type === 'credit' ? '+' : ''}\${Math.abs(tx.amount).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}`;
}

function generateProfileScreen(business, colors, companionApp) {
  const profile = companionApp?.profile || {};

  return `/**
 * ProfileScreen
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Bell, LogOut, ChevronRight } from 'lucide-react';

const PROFILE_DATA = ${JSON.stringify(profile, null, 2)};

export default function ProfileScreen({ user, onLogout }) {
  const [preferences, setPreferences] = useState(PROFILE_DATA.preferences || {});

  return (
    <div className="screen">
      <h1 className="screen-title">Profile</h1>

      {/* User Info */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          {(user?.fullName || 'U')[0].toUpperCase()}
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{user?.fullName || 'Guest User'}</h2>
        <p style={{ opacity: 0.7 }}>{user?.email || 'guest@example.com'}</p>
      </div>

      {/* Profile Fields */}
      <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', opacity: 0.7 }}>Account Information</h2>
      {(PROFILE_DATA.fields || []).map((field, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', opacity: 0.6 }}>{field.label}</p>
            <p style={{ fontWeight: '500' }}>{field.value}</p>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </div>
      ))}

      {/* Preferences */}
      <h2 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '12px', opacity: 0.7 }}>Preferences</h2>
      <div className="card">
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span>Push Notifications</span>
          <input type="checkbox" checked={preferences.notifications} onChange={() => {}} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span>Email Deals</span>
          <input type="checkbox" checked={preferences.emailDeals} onChange={() => {}} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>SMS Alerts</span>
          <input type="checkbox" checked={preferences.smsAlerts} onChange={() => {}} />
        </label>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="btn btn-secondary"
        style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}`;
}

function generateEarnScreen(business, colors, companionApp) {
  const earn = companionApp?.earn || {};

  return `/**
 * EarnScreen
 * Test Mode Generated
 */
import React from 'react';
import { ShoppingBag, Users, Star, Gift, Heart } from 'lucide-react';

const EARN_METHODS = ${JSON.stringify(earn.methods || [], null, 2)};

const ICON_MAP = { ShoppingBag, Users, Star, Gift, Heart };

export default function EarnScreen({ user }) {
  return (
    <div className="screen">
      <h1 className="screen-title">Earn Points</h1>
      <p style={{ opacity: 0.7, marginBottom: '24px' }}>Complete activities to earn reward points!</p>

      {EARN_METHODS.map((method, idx) => {
        const IconComponent = ICON_MAP[method.icon] || Star;
        return (
          <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(var(--primary-rgb), 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconComponent size={24} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600' }}>{method.title}</p>
              <p style={{ opacity: 0.7, fontSize: '14px' }}>{method.points}</p>
            </div>
            <button style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Go
            </button>
          </div>
        );
      })}
    </div>
  );
}`;
}

function generateLeaderboardScreen(business, colors, companionApp) {
  const leaderboard = companionApp?.leaderboard || {};

  return `/**
 * LeaderboardScreen
 * Test Mode Generated
 */
import React from 'react';
import { Trophy, Medal } from 'lucide-react';

const LEADERBOARD_DATA = ${JSON.stringify(leaderboard, null, 2)};

export default function LeaderboardScreen({ user }) {
  const { topCustomers = [], currentUserRank = 0 } = LEADERBOARD_DATA;

  const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return 'transparent';
  };

  return (
    <div className="screen">
      <h1 className="screen-title">Leaderboard</h1>

      {/* Top 3 Podium */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
        {topCustomers.slice(0, 3).map((customer, idx) => (
          <div key={idx} style={{ textAlign: 'center', flex: idx === 0 ? 1.2 : 1, order: idx === 0 ? 1 : idx === 1 ? 0 : 2 }}>
            <div style={{
              width: idx === 0 ? '70px' : '60px',
              height: idx === 0 ? '70px' : '60px',
              borderRadius: '50%',
              background: getMedalColor(customer.rank),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              fontSize: idx === 0 ? '28px' : '24px',
              fontWeight: 'bold',
              border: '3px solid var(--border)'
            }}>
              {customer.avatar}
            </div>
            <p style={{ fontWeight: '600', fontSize: '14px' }}>{customer.name}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{customer.points}</p>
          </div>
        ))}
      </div>

      {/* Full Ranking */}
      <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Rankings</h2>
      {topCustomers.map((customer, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: customer.isCurrentUser ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--card-bg)',
            border: customer.isCurrentUser ? '2px solid var(--primary)' : '1px solid var(--border)'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: getMedalColor(customer.rank),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {customer.rank}
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {customer.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '600' }}>{customer.name} {customer.isCurrentUser && '(You)'}</p>
          </div>
          <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{customer.points}</p>
        </div>
      ))}
    </div>
  );
}`;
}

function generateLoginScreen(business, colors) {
  return `/**
 * LoginScreen
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate login - in real app would call API
    setTimeout(() => {
      // Mock successful login
      const mockUser = {
        id: 1,
        email: email || 'demo@example.com',
        fullName: 'Demo User',
        loyaltyPoints: 850,
        tier: 'Gold'
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      onLogin(mockUser, mockToken);
      setLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    const mockUser = {
      id: 1,
      email: 'demo@example.com',
      fullName: 'Demo User',
      loyaltyPoints: 850,
      tier: 'Gold'
    };
    onLogin(mockUser, 'mock-demo-token');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px'
          }}>
            🍕
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>${business.name}</h1>
          <p style={{ opacity: 0.7, marginTop: '8px' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '0 16px'
            }}>
              <User size={20} style={{ opacity: 0.5 }} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '16px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '0 16px'
            }}>
              <Lock size={20} style={{ opacity: 0.5 }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '16px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={handleDemoLogin}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Skip login (Demo Mode) →
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', opacity: 0.5 }}>
          🧪 Test Mode - Using mock authentication
        </p>
      </div>
    </div>
  );
}`;
}

function generateBottomNav(colors, category, appConfig) {
  // Generate industry-specific navigation items
  const navItems = getNavItemsForCategory(category);
  const iconImports = getIconImportsForNav(navItems);

  return `/**
 * BottomNav Component
 * Test Mode Generated - Industry: ${category}
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ${iconImports} } from 'lucide-react';

const NAV_ITEMS = ${JSON.stringify(navItems, null, 2).replace(/"icon": "(\w+)"/g, '"icon": $1')};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 24px',
      zIndex: 100
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              padding: '8px 16px'
            }}
          >
            <Icon size={24} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}`;
}

function generateQuickActionCard(colors) {
  return `/**
 * QuickActionCard Component
 * Test Mode Generated
 */
import React from 'react';

export default function QuickActionCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '20px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'transform 0.2s, background 0.2s'
      }}
    >
      <div style={{ color: 'var(--primary)' }}>{icon}</div>
      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>{label}</span>
    </button>
  );
}`;
}

/**
 * Get navigation items based on industry category
 */
function getNavItemsForCategory(category) {
  const navConfigs = {
    'food-beverage': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/menu', icon: 'UtensilsCrossed', label: 'Order' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/history', icon: 'Clock', label: 'Orders' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'retail': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/shop', icon: 'ShoppingBag', label: 'Shop' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/orders', icon: 'Package', label: 'Orders' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'health-wellness': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/classes', icon: 'Dumbbell', label: 'Classes' },
      { path: '/schedule', icon: 'Calendar', label: 'Schedule' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'healthcare': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Heart', label: 'Services' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'professional-services': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Briefcase', label: 'Services' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'creative': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Camera', label: 'Work' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'hospitality': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/rooms', icon: 'Bed', label: 'Rooms' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'trade-services': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Wrench', label: 'Services' },
      { path: '/quote', icon: 'FileText', label: 'Quote' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ]
  };

  return navConfigs[category] || [
    { path: '/', icon: 'Home', label: 'Home' },
    { path: '/services', icon: 'Grid', label: 'Services' },
    { path: '/book', icon: 'Calendar', label: 'Book' },
    { path: '/rewards', icon: 'Gift', label: 'Rewards' },
    { path: '/profile', icon: 'User', label: 'Profile' }
  ];
}

/**
 * Get icon imports for navigation items
 */
function getIconImportsForNav(navItems) {
  const icons = new Set(navItems.map(item => item.icon));
  return Array.from(icons).join(', ');
}

/**
 * Get quick actions based on industry category (with navigation paths)
 */
function getQuickActionsForCategory(category) {
  const actions = {
    'food-beverage': [
      { id: 'order', label: 'Order Now', icon: 'ShoppingBag', path: '/menu' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'history', label: 'Order History', icon: 'Clock', path: '/history' },
      { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
    ],
    'retail': [
      { id: 'shop', label: 'Shop Now', icon: 'ShoppingBag', path: '/shop' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'orders', label: 'My Orders', icon: 'Clock', path: '/orders' },
      { id: 'wishlist', label: 'Wishlist', icon: 'Star', path: '/profile' }
    ],
    'health-wellness': [
      { id: 'book', label: 'Book Class', icon: 'Award', path: '/classes' },
      { id: 'schedule', label: 'My Schedule', icon: 'Clock', path: '/schedule' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'progress', label: 'My Progress', icon: 'TrendingUp', path: '/profile' }
    ],
    'healthcare': [
      { id: 'book', label: 'Book Appt', icon: 'Award', path: '/book' },
      { id: 'records', label: 'My Records', icon: 'Clock', path: '/profile' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
    ],
    'professional-services': [
      { id: 'book', label: 'Book Meeting', icon: 'Award', path: '/book' },
      { id: 'documents', label: 'Documents', icon: 'Clock', path: '/profile' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
    ],
    'hospitality': [
      { id: 'book', label: 'Book Room', icon: 'Award', path: '/rooms' },
      { id: 'reservations', label: 'My Stays', icon: 'Clock', path: '/book' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'concierge', label: 'Concierge', icon: 'Users', path: '/profile' }
    ],
    'trade-services': [
      { id: 'quote', label: 'Get Quote', icon: 'Award', path: '/quote' },
      { id: 'appointments', label: 'My Appts', icon: 'Clock', path: '/services' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
    ]
  };

  return actions[category] || [
    { id: 'services', label: 'Services', icon: 'ShoppingBag', path: '/services' },
    { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
    { id: 'history', label: 'History', icon: 'Clock', path: '/book' },
    { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
  ];
}

function generateApiService(safeName) {
  return `/**
 * API Service
 * Test Mode Generated - Connects to parent website backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': \`Bearer \${token}\` })
    };
  }

  async get(endpoint) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Auth endpoints
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async register(data) {
    return this.post('/auth/register', data);
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  // Loyalty endpoints
  async getLoyalty() {
    return this.get('/loyalty');
  }

  async getRewards() {
    return this.get('/loyalty/rewards');
  }

  // Wallet endpoints
  async getWallet() {
    return this.get('/wallet');
  }

  async getTransactions() {
    return this.get('/wallet/transactions');
  }
}

export const api = new ApiService();
export default api;`;
}

function generateAuthHook() {
  return `/**
 * useAuth Hook
 * Test Mode Generated
 */
import { useState, useEffect, createContext, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default useAuth;`;
}

// ============================================
// INDUSTRY-SPECIFIC SCREEN GENERATORS
// ============================================

/**
 * MenuScreen for food-beverage industries
 */
function generateMenuScreen(business, colors, sampleData) {
  const categories = sampleData?.categories || [];

  return `/**
 * MenuScreen - Order food from the app
 * Test Mode Generated - Food & Beverage Industry
 */
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, Check, Loader2 } from 'lucide-react';
import api from '../services/api';

const MENU_DATA = ${JSON.stringify(categories, null, 2)};

export default function MenuScreen({ user }) {
  const [activeCategory, setActiveCategory] = useState(MENU_DATA[0]?.name || '');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [paymentType, setPaymentType] = useState('cash');

  const addToCart = (item) => {
    const existing = cart.find(c => c.name === item.name);
    if (existing) {
      setCart(cart.map(c => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemName) => {
    const existing = cart.find(c => c.name === itemName);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(c => c.name === itemName ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
      setCart(cart.filter(c => c.name !== itemName));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const data = await api.post('/orders', {
        items: cart,
        total: cartTotal,
        source: 'app',
        paymentType: paymentType
      });

      if (data.success) {
        setLastOrder(data.order);
        setOrderPlaced(true);
        setCart([]);
        setTimeout(() => {
          setOrderPlaced(false);
          setShowCart(false);
        }, 3000);
      } else {
        alert('Failed to place order: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="screen">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Order Food</h1>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        {MENU_DATA.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCategory === cat.name ? 'var(--primary)' : 'var(--card-bg)',
              color: activeCategory === cat.name ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {MENU_DATA.find(c => c.name === activeCategory)?.items?.map((item, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600' }}>{item.name}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>\${item.price}</span>
              </div>
              <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>{item.description}</p>
            </div>
            <button
              onClick={() => addToCart(item)}
              style={{
                marginLeft: '12px',
                padding: '8px 12px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            padding: '12px 20px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 50
          }}
        >
          <ShoppingCart size={18} />
          Cart ({cartCount}) - \${cartTotal}
        </button>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '20px 20px 0 0',
            padding: '24px',
            paddingBottom: '100px',
            width: '100%',
            maxHeight: '85vh',
            marginBottom: '70px',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Your Order</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {orderPlaced ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={30} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Order Placed!</h3>
                <p style={{ opacity: 0.7, fontSize: '14px' }}>Order #{lastOrder?.id}</p>
              </div>
            ) : (
              <>
                {cart.length === 0 ? (
                  <p style={{ textAlign: 'center', opacity: 0.6, padding: '40px 0' }}>Your cart is empty</p>
                ) : (
                  <>
                    {cart.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontWeight: '600', margin: 0 }}>{item.name}</p>
                          <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>\${item.price} each</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button onClick={() => removeFromCart(item.name)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => addToCart(item)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span>Total</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>\${cartTotal}</span>
                      </div>
                      {/* Payment Type Selection */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <button onClick={() => setPaymentType('cash')} style={{ flex: 1, padding: '12px', background: paymentType === 'cash' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)', border: paymentType === 'cash' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                          Cash on Pickup
                        </button>
                        <button onClick={() => setPaymentType('card')} style={{ flex: 1, padding: '12px', background: paymentType === 'card' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)', border: paymentType === 'card' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                          Pay with Card
                        </button>
                      </div>
                      <button onClick={placeOrder} disabled={placing} style={{ width: '100%', padding: '14px', backgroundColor: placing ? '#374151' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: placing ? 'not-allowed' : 'pointer' }}>
                        {placing ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}`;
}

/**
 * OrderHistoryScreen for food-beverage
 */
function generateOrderHistoryScreen(business, colors) {
  return `/**
 * OrderHistoryScreen - View past orders
 * Test Mode Generated
 */
import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function OrderHistoryScreen({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.get('/orders/my-orders');
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} color="#f59e0b" />;
      case 'preparing': return <Package size={16} color="#3b82f6" />;
      case 'completed': return <CheckCircle size={16} color="#10b981" />;
      case 'cancelled': return <XCircle size={16} color="#ef4444" />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return <div className="screen"><p>Loading orders...</p></div>;
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Order History</h1>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ opacity: 0.6 }}>No orders yet</p>
          <p style={{ fontSize: '14px', opacity: 0.4 }}>Your orders will appear here</p>
        </div>
      ) : (
        orders.map((order, idx) => (
          <div key={idx} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '600' }}>Order #{order.id}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getStatusIcon(order.status)}
                <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{order.status}</span>
              </div>
            </div>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>
              {order.items?.map(item => \`\${item.quantity}x \${item.name}\`).join(', ')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ opacity: 0.5 }}>{new Date(order.created_at).toLocaleDateString()}</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${order.total}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}`;
}

/**
 * ShopScreen for retail industries
 */
function generateShopScreen(business, colors, sampleData) {
  const categories = sampleData?.categories || [];

  return `/**
 * ShopScreen - Browse and shop products
 * Test Mode Generated - Retail Industry
 */
import React, { useState } from 'react';
import { ShoppingBag, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRODUCT_DATA = ${JSON.stringify(categories, null, 2)};

export default function ShopScreen({ user }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(PRODUCT_DATA[0]?.name || '');

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(c => c.name === item.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  return (
    <div className="screen">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Shop</h1>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        {PRODUCT_DATA.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCategory === cat.name ? 'var(--primary)' : 'var(--card-bg)',
              color: activeCategory === cat.name ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {PRODUCT_DATA.find(c => c.name === activeCategory)?.items?.map((item, idx) => (
          <div key={idx} className="card" style={{ padding: '12px' }}>
            <div style={{ height: '100px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={32} style={{ opacity: 0.3 }} />
            </div>
            <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.name}</p>
            <p style={{ fontSize: '11px', opacity: 0.6, marginBottom: '8px', lineHeight: '1.3' }}>{item.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${item.price}</span>
              <button
                onClick={() => addToCart(item)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Cart Button */}
      <button
        onClick={() => navigate('/cart')}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          padding: '12px 20px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        <ShoppingBag size={18} style={{ marginRight: '8px' }} />
        View Cart
      </button>
    </div>
  );
}`;
}

/**
 * CartScreen for retail
 */
function generateCartScreen(business, colors) {
  return `/**
 * CartScreen - Shopping cart
 * Test Mode Generated - Retail Industry
 */
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartScreen({ user }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(saved);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (name, delta) => {
    const newCart = cart.map(item => {
      if (item.name === name) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    updateCart(newCart);
  };

  const removeItem = (name) => {
    updateCart(cart.filter(item => item.name !== name));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="screen">
      <h1 className="screen-title">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ opacity: 0.6 }}>Your cart is empty</p>
          <button onClick={() => navigate('/shop')} style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {cart.map((item, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600' }}>{item.name}</p>
                <p style={{ fontSize: '14px', color: 'var(--primary)' }}>\${item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => updateQuantity(item.name, -1)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.name, 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Plus size={14} />
                </button>
                <button onClick={() => removeItem(item.name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${total.toFixed(2)}</span>
            </div>
            <button style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}`;
}

/**
 * OrdersScreen for retail
 */
function generateOrdersScreen(business, colors) {
  return `/**
 * OrdersScreen - View order history
 * Test Mode Generated - Retail Industry
 */
import React from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';

const SAMPLE_ORDERS = [
  { id: 1001, status: 'delivered', date: '2024-01-15', total: 149.99, items: ['Premium Headphones'] },
  { id: 1000, status: 'shipped', date: '2024-01-10', total: 79.99, items: ['Laptop Stand', 'Phone Case'] }
];

export default function OrdersScreen({ user }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'shipped': return <Truck size={16} color="#3b82f6" />;
      case 'delivered': return <CheckCircle size={16} color="#10b981" />;
      default: return <Package size={16} color="#f59e0b" />;
    }
  };

  return (
    <div className="screen">
      <h1 className="screen-title">My Orders</h1>

      {SAMPLE_ORDERS.map((order, idx) => (
        <div key={idx} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '600' }}>Order #{order.id}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {getStatusIcon(order.status)}
              <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{order.status}</span>
            </div>
          </div>
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>{order.items.join(', ')}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ opacity: 0.5 }}>{order.date}</span>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${order.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * ClassesScreen for health-wellness
 */
function generateClassesScreen(business, colors, sampleData) {
  const categories = sampleData?.categories || [];

  return `/**
 * ClassesScreen - Browse fitness classes
 * Test Mode Generated - Health & Wellness Industry
 */
import React, { useState } from 'react';
import { Clock, Users, Dumbbell } from 'lucide-react';

const CLASS_DATA = ${JSON.stringify(categories, null, 2)};

export default function ClassesScreen({ user }) {
  const [activeCategory, setActiveCategory] = useState(CLASS_DATA[0]?.name || '');

  return (
    <div className="screen">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Classes</h1>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {CLASS_DATA.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCategory === cat.name ? 'var(--primary)' : 'var(--card-bg)',
              color: activeCategory === cat.name ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Classes */}
      {CLASS_DATA.find(c => c.name === activeCategory)?.items?.map((item, idx) => (
        <div key={idx} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '16px' }}>{item.name}</p>
              <p style={{ fontSize: '12px', opacity: 0.6 }}>{item.description}</p>
            </div>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${item.price}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', opacity: 0.7 }}>
              <Clock size={14} /> 60 min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', opacity: 0.7 }}>
              <Users size={14} /> 12 spots
            </div>
          </div>
          <button style={{ width: '100%', marginTop: '12px', padding: '10px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Book Class
          </button>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * ScheduleScreen for health-wellness
 */
function generateScheduleScreen(business, colors) {
  return `/**
 * ScheduleScreen - View class schedule
 * Test Mode Generated - Health & Wellness Industry
 */
import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const SCHEDULE = [
  { time: '6:00 AM', class: 'Morning Yoga', instructor: 'Sarah', duration: '60 min', spots: 8 },
  { time: '7:30 AM', class: 'HIIT Bootcamp', instructor: 'Mike', duration: '45 min', spots: 5 },
  { time: '9:00 AM', class: 'Spin Class', instructor: 'Alex', duration: '45 min', spots: 3 },
  { time: '12:00 PM', class: 'Lunch Express', instructor: 'Sarah', duration: '30 min', spots: 10 },
  { time: '5:30 PM', class: 'Evening Flow Yoga', instructor: 'Emma', duration: '60 min', spots: 6 },
  { time: '7:00 PM', class: 'Strength Training', instructor: 'Mike', duration: '60 min', spots: 4 }
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleScreen({ user }) {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="screen">
      <h1 className="screen-title">Class Schedule</h1>

      {/* Day Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
        {DAYS.map((day, idx) => (
          <button
            key={day}
            onClick={() => setSelectedDay(idx)}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedDay === idx ? 'var(--primary)' : 'var(--card-bg)',
              color: selectedDay === idx ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '50px'
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      {SCHEDULE.map((item, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', gap: '16px' }}>
          <div style={{ minWidth: '70px' }}>
            <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{item.time}</p>
            <p style={{ fontSize: '12px', opacity: 0.6 }}>{item.duration}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '600' }}>{item.class}</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>with {item.instructor}</p>
            <p style={{ fontSize: '11px', color: item.spots <= 3 ? '#ef4444' : '#10b981', marginTop: '4px' }}>
              {item.spots} spots left
            </p>
          </div>
          <button style={{ padding: '8px 12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'center' }}>
            Book
          </button>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * ServicesScreen for professional services, healthcare, creative, trade
 */
function generateServicesScreen(business, colors, sampleData) {
  const categories = sampleData?.categories || [];

  return `/**
 * ServicesScreen - Browse services
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { ChevronRight, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SERVICE_DATA = ${JSON.stringify(categories, null, 2)};

export default function ServicesScreen({ user }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(SERVICE_DATA[0]?.name || '');

  return (
    <div className="screen">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Our Services</h1>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {SERVICE_DATA.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCategory === cat.name ? 'var(--primary)' : 'var(--card-bg)',
              color: activeCategory === cat.name ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services */}
      {SERVICE_DATA.find(c => c.name === activeCategory)?.items?.map((item, idx) => (
        <div
          key={idx}
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/book')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{item.name}</p>
              <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>{item.description}</p>
              {item.price && (
                <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  {typeof item.price === 'number' ? \`\$\${item.price}\` : item.price}
                </p>
              )}
            </div>
            <ChevronRight size={20} style={{ opacity: 0.5 }} />
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * BookingScreen for services that need appointments
 */
function generateBookingScreen(business, colors) {
  return `/**
 * BookingScreen - Book an appointment
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { Calendar, Clock, Check } from 'lucide-react';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

export default function BookingScreen({ user }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booked, setBooked] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleBook = () => {
    if (selectedDate && selectedTime) {
      setBooked(true);
    }
  };

  if (booked) {
    return (
      <div className="screen" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={40} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Booking Confirmed!</h2>
        <p style={{ opacity: 0.7, marginBottom: '24px' }}>
          {selectedDate?.toLocaleDateString()} at {selectedTime}
        </p>
        <p style={{ fontSize: '14px', opacity: 0.5 }}>You'll receive a confirmation email shortly.</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Book Appointment</h1>

      {/* Date Selection */}
      <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Select Date</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
        {dates.map((date, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDate(date)}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedDate?.toDateString() === date.toDateString() ? 'var(--primary)' : 'var(--card-bg)',
              color: selectedDate?.toDateString() === date.toDateString() ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              minWidth: '60px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{date.getDate()}</div>
          </button>
        ))}
      </div>

      {/* Time Selection */}
      <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Select Time</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
        {TIME_SLOTS.map((time, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTime(time)}
            style={{
              padding: '12px',
              backgroundColor: selectedTime === time ? 'var(--primary)' : 'var(--card-bg)',
              color: selectedTime === time ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {time}
          </button>
        ))}
      </div>

      {/* Book Button */}
      <button
        onClick={handleBook}
        disabled={!selectedDate || !selectedTime}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: selectedDate && selectedTime ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed'
        }}
      >
        Confirm Booking
      </button>
    </div>
  );
}`;
}

/**
 * RoomsScreen for hospitality
 */
function generateRoomsScreen(business, colors, sampleData) {
  return `/**
 * RoomsScreen - Browse available rooms
 * Test Mode Generated - Hospitality Industry
 */
import React from 'react';
import { Bed, Users, Wifi, Coffee, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROOMS = [
  { name: 'Standard Room', price: 149, capacity: 2, amenities: ['Free WiFi', 'Breakfast'], image: null },
  { name: 'Deluxe Suite', price: 249, capacity: 2, amenities: ['Free WiFi', 'Breakfast', 'Mini Bar'], image: null },
  { name: 'Family Room', price: 299, capacity: 4, amenities: ['Free WiFi', 'Breakfast', 'Kitchen'], image: null },
  { name: 'Presidential Suite', price: 499, capacity: 2, amenities: ['Free WiFi', 'Breakfast', 'Jacuzzi', 'Butler'], image: null }
];

export default function RoomsScreen({ user }) {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <h1 className="screen-title">Our Rooms</h1>

      {ROOMS.map((room, idx) => (
        <div
          key={idx}
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/book')}
        >
          <div style={{ height: '120px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bed size={40} style={{ opacity: 0.3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{room.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
                <Users size={14} /> Up to {room.capacity} guests
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {room.amenities.map((a, i) => (
                  <span key={i} style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--primary)' }}>\${room.price}</p>
              <p style={{ fontSize: '11px', opacity: 0.6 }}>per night</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * QuoteScreen for trade services
 */
function generateQuoteScreen(business, colors) {
  return `/**
 * QuoteScreen - Request a quote
 * Test Mode Generated - Trade Services Industry
 */
import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';

export default function QuoteScreen({ user }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    service: '',
    description: '',
    urgency: 'normal',
    preferredDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="screen" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={40} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Quote Request Sent!</h2>
        <p style={{ opacity: 0.7, marginBottom: '24px' }}>We'll get back to you within 24 hours.</p>
        <button onClick={() => setSubmitted(false)} style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Request Quote</h1>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Service Needed</span>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
            >
              <option value="">Select a service...</option>
              <option value="repair">Repair</option>
              <option value="installation">Installation</option>
              <option value="maintenance">Maintenance</option>
              <option value="consultation">Consultation</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Describe Your Needs</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', resize: 'vertical' }}
              placeholder="Please describe what you need help with..."
            />
          </label>

          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Urgency</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['normal', 'urgent', 'emergency'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, urgency: level })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: form.urgency === level ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: form.urgency === level ? 'white' : 'var(--text)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Preferred Date</span>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
              style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
            />
          </label>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px'
          }}
        >
          <Send size={18} /> Submit Quote Request
        </button>
      </form>
    </div>
  );
}`;
}

module.exports = { createTestModeRoutes };
