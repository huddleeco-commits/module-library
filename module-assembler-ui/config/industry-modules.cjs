/**
 * Industry Module Configuration
 *
 * Maps each industry to its appropriate module types (catalog, booking, listings, inquiries)
 * Used by launchpad-engine.cjs and admin-dashboard-generator.cjs to generate
 * industry-appropriate backend routes and admin pages.
 */

// ============================================
// MODULE TYPE DEFINITIONS
// ============================================

/**
 * Module types define the behavior and UI for each type of business data
 */
const MODULE_TYPES = {
  catalog: {
    description: 'Categorized items with names, prices, descriptions, images',
    adminComponent: 'CatalogEditor',
    hasCategories: true,
    hasSSE: true,
    features: ['drag-drop reorder', 'availability toggles', 'category management', 'image upload']
  },
  booking: {
    description: 'Time-based appointments/reservations with customer info',
    adminComponent: 'BookingCalendar',
    hasSSE: true,
    features: ['day/week/month views', 'confirm/cancel', 'reminders', 'capacity management']
  },
  listings: {
    description: 'Property/product listings with specs, images, status workflow',
    adminComponent: 'ListingsManager',
    hasFilters: true,
    hasSSE: true,
    features: ['grid/list view', 'status workflow', 'image gallery', 'filtering']
  },
  inquiries: {
    description: 'Lead/inquiry management with status pipeline',
    adminComponent: 'InquiriesManager',
    hasSSE: true,
    features: ['table view', 'status pipeline', 'quick respond', 'convert/archive']
  }
};

// ============================================
// INDUSTRY → MODULE MAPPING
// ============================================

/**
 * Maps each industry to its primary and secondary modules
 * Format: { moduleName: moduleType }
 *
 * Module names become API endpoints: /api/[moduleName]
 * Module types determine which generator and admin component to use
 */
const INDUSTRY_MODULES = {
  // ========== FOOD & BEVERAGE ==========
  'pizza-restaurant': {
    menu: 'catalog',
    orders: 'inquiries'
  },
  'steakhouse': {
    menu: 'catalog',
    reservations: 'booking'
  },
  'coffee-cafe': {
    menu: 'catalog',
    orders: 'inquiries',
    reservations: 'booking'
  },
  'restaurant': {
    menu: 'catalog',
    reservations: 'booking'
  },
  'bakery': {
    menu: 'catalog',
    orders: 'inquiries'
  },

  // ========== PERSONAL SERVICES ==========
  'salon-spa': {
    services: 'catalog',
    appointments: 'booking'
  },
  'barbershop': {
    services: 'catalog',
    appointments: 'booking'
  },
  'dental': {
    services: 'catalog',
    appointments: 'booking'
  },
  'yoga': {
    classes: 'catalog',
    bookings: 'booking'
  },
  'fitness-gym': {
    classes: 'catalog',
    memberships: 'inquiries'
  },

  // ========== PROFESSIONAL SERVICES ==========
  'law-firm': {
    services: 'catalog',
    consultations: 'booking'
  },
  'healthcare': {
    services: 'catalog',
    appointments: 'booking'
  },
  'real-estate': {
    listings: 'listings',
    inquiries: 'inquiries'
  },

  // ========== TRADE SERVICES ==========
  'plumber': {
    services: 'catalog',
    quotes: 'inquiries'
  },
  'cleaning': {
    services: 'catalog',
    quotes: 'inquiries'
  },
  'auto-shop': {
    services: 'catalog',
    appointments: 'booking'
  },

  // ========== BUSINESS & TECH ==========
  'saas': {
    features: 'catalog',
    demos: 'booking'
  },
  'ecommerce': {
    products: 'catalog',
    orders: 'inquiries'
  },
  'school': {
    programs: 'catalog',
    enrollments: 'inquiries'
  }
};

// ============================================
// MODULE DISPLAY CONFIGURATION
// ============================================

/**
 * Human-readable labels and icons for each module name
 * Used in admin sidebar and page titles
 */
const MODULE_LABELS = {
  // Catalog types
  menu: { label: 'Menu', icon: 'UtensilsCrossed', singular: 'Item', plural: 'Items' },
  services: { label: 'Services', icon: 'Wrench', singular: 'Service', plural: 'Services' },
  classes: { label: 'Classes', icon: 'Users', singular: 'Class', plural: 'Classes' },
  features: { label: 'Features', icon: 'Sparkles', singular: 'Feature', plural: 'Features' },
  products: { label: 'Products', icon: 'Package', singular: 'Product', plural: 'Products' },
  programs: { label: 'Programs', icon: 'GraduationCap', singular: 'Program', plural: 'Programs' },

  // Booking types
  reservations: { label: 'Reservations', icon: 'Calendar', singular: 'Reservation', plural: 'Reservations' },
  appointments: { label: 'Appointments', icon: 'CalendarCheck', singular: 'Appointment', plural: 'Appointments' },
  consultations: { label: 'Consultations', icon: 'MessageSquare', singular: 'Consultation', plural: 'Consultations' },
  bookings: { label: 'Bookings', icon: 'CalendarDays', singular: 'Booking', plural: 'Bookings' },
  demos: { label: 'Demo Requests', icon: 'Presentation', singular: 'Demo', plural: 'Demos' },

  // Listings types
  listings: { label: 'Listings', icon: 'Home', singular: 'Listing', plural: 'Listings' },

  // Inquiry types
  orders: { label: 'Orders', icon: 'ShoppingBag', singular: 'Order', plural: 'Orders' },
  quotes: { label: 'Quote Requests', icon: 'FileText', singular: 'Quote', plural: 'Quotes' },
  memberships: { label: 'Memberships', icon: 'CreditCard', singular: 'Membership', plural: 'Memberships' },
  enrollments: { label: 'Enrollments', icon: 'ClipboardList', singular: 'Enrollment', plural: 'Enrollments' },
  inquiries: { label: 'Inquiries', icon: 'Mail', singular: 'Inquiry', plural: 'Inquiries' }
};

// ============================================
// VARIANT COLOR PALETTES
// ============================================

/**
 * Each industry gets 3 distinct color palettes (A, B, C).
 * Variant A = warm/classic, B = cool/modern, C = bold/distinctive.
 * These are the base — mood sliders and trend overrides can still override.
 */
const VARIANT_PALETTES = {
  // ========== FOOD & BEVERAGE ==========
  'pizza-restaurant': {
    A: { primary: '#C62828', accent: '#FF8F00', secondary: '#4E342E' },  // Classic red/gold
    B: { primary: '#1B5E20', accent: '#F9A825', secondary: '#3E2723' },  // Italian green/gold
    C: { primary: '#E65100', accent: '#1B5E20', secondary: '#BF360C' }   // Bold orange/green
  },
  'steakhouse': {
    A: { primary: '#4E342E', accent: '#C9A227', secondary: '#1B1B1B' },  // Dark leather/gold
    B: { primary: '#7B1F1F', accent: '#D4AF37', secondary: '#2C1810' },  // Burgundy/gold
    C: { primary: '#1A1A2E', accent: '#C9A227', secondary: '#16213E' }   // Midnight/gold
  },
  'coffee-cafe': {
    A: { primary: '#5D4037', accent: '#FF8F00', secondary: '#3E2723' },  // Espresso/amber
    B: { primary: '#2E7D32', accent: '#795548', secondary: '#1B5E20' },  // Botanical/earth
    C: { primary: '#1565C0', accent: '#FF6F00', secondary: '#0D47A1' }   // Modern blue/orange
  },
  'restaurant': {
    A: { primary: '#B71C1C', accent: '#F57F17', secondary: '#3E2723' },  // Classic red/gold
    B: { primary: '#004D40', accent: '#FF8F00', secondary: '#00251A' },  // Emerald/amber
    C: { primary: '#311B92', accent: '#00BFA5', secondary: '#1A237E' }   // Royal purple/teal
  },
  'bakery': {
    A: { primary: '#8B4513', accent: '#D4A574', secondary: '#5D3A1A' },  // Warm cinnamon
    B: { primary: '#AD1457', accent: '#F8BBD0', secondary: '#880E4F' },  // Berry pink
    C: { primary: '#00695C', accent: '#FFD54F', secondary: '#004D40' }   // Sage/honey
  },

  // ========== PERSONAL SERVICES ==========
  'salon-spa': {
    A: { primary: '#6A1B9A', accent: '#E1BEE7', secondary: '#4A148C' },  // Luxe plum
    B: { primary: '#00796B', accent: '#B2DFDB', secondary: '#004D40' },  // Spa teal
    C: { primary: '#C2185B', accent: '#FCE4EC', secondary: '#880E4F' }   // Rose
  },
  'barbershop': {
    A: { primary: '#1A1A2E', accent: '#C9A227', secondary: '#16213E' },  // Classic dark/gold
    B: { primary: '#1B5E20', accent: '#FFAB00', secondary: '#2E7D32' },  // Heritage green
    C: { primary: '#4A148C', accent: '#CE93D8', secondary: '#311B92' }   // Modern purple
  },
  'dental': {
    A: { primary: '#0277BD', accent: '#4FC3F7', secondary: '#01579B' },  // Clean blue
    B: { primary: '#00695C', accent: '#80CBC4', secondary: '#004D40' },  // Calming teal
    C: { primary: '#1565C0', accent: '#E8F5E9', secondary: '#0D47A1' }   // Trust blue/mint
  },
  'yoga': {
    A: { primary: '#6A1B9A', accent: '#CE93D8', secondary: '#4A148C' },  // Spiritual purple
    B: { primary: '#00695C', accent: '#A5D6A7', secondary: '#004D40' },  // Earth green
    C: { primary: '#E65100', accent: '#FFCC80', secondary: '#BF360C' }   // Sunset warm
  },
  'fitness-gym': {
    A: { primary: '#D32F2F', accent: '#FF8A80', secondary: '#B71C1C' },  // Energy red
    B: { primary: '#1565C0', accent: '#42A5F5', secondary: '#0D47A1' },  // Power blue
    C: { primary: '#2E7D32', accent: '#81C784', secondary: '#1B5E20' }   // Vital green
  },

  // ========== PROFESSIONAL SERVICES ==========
  'law-firm': {
    A: { primary: '#1B365D', accent: '#C9A227', secondary: '#0D1B2A' },  // Navy/gold classic
    B: { primary: '#2E4057', accent: '#90A4AE', secondary: '#1A2639' },  // Slate/silver modern
    C: { primary: '#3E2723', accent: '#D4AF37', secondary: '#1B0F0A' }   // Mahogany/gold
  },
  'healthcare': {
    A: { primary: '#0277BD', accent: '#4FC3F7', secondary: '#01579B' },  // Medical blue
    B: { primary: '#00695C', accent: '#80CBC4', secondary: '#004D40' },  // Healing teal
    C: { primary: '#1565C0', accent: '#7C4DFF', secondary: '#283593' }   // Modern blue/violet
  },
  'real-estate': {
    A: { primary: '#1B365D', accent: '#D4AF37', secondary: '#0D1B2A' },  // Classic navy/gold
    B: { primary: '#004D40', accent: '#26A69A', secondary: '#00251A' },  // Green trust
    C: { primary: '#37474F', accent: '#FF8F00', secondary: '#263238' }   // Modern slate/amber
  },

  // ========== TRADE SERVICES ==========
  'plumber': {
    A: { primary: '#0D47A1', accent: '#42A5F5', secondary: '#1565C0' },  // Reliable blue
    B: { primary: '#2E7D32', accent: '#66BB6A', secondary: '#1B5E20' },  // Eco green
    C: { primary: '#E65100', accent: '#FFB74D', secondary: '#BF360C' }   // Visible orange
  },
  'cleaning': {
    A: { primary: '#00838F', accent: '#4DD0E1', secondary: '#006064' },  // Fresh teal
    B: { primary: '#2E7D32', accent: '#A5D6A7', secondary: '#1B5E20' },  // Natural green
    C: { primary: '#6A1B9A', accent: '#CE93D8', secondary: '#4A148C' }   // Clean purple
  },
  'auto-shop': {
    A: { primary: '#C62828', accent: '#FF5252', secondary: '#B71C1C' },  // Garage red
    B: { primary: '#1565C0', accent: '#42A5F5', secondary: '#0D47A1' },  // Mechanic blue
    C: { primary: '#FF6F00', accent: '#FFB300', secondary: '#E65100' }   // High-vis orange
  },

  // ========== BUSINESS & TECH ==========
  'saas': {
    A: { primary: '#5C6BC0', accent: '#7C4DFF', secondary: '#3949AB' },  // Indigo/violet
    B: { primary: '#00897B', accent: '#26A69A', secondary: '#00695C' },  // Growth teal
    C: { primary: '#E91E63', accent: '#F48FB1', secondary: '#C2185B' }   // Bold pink
  },
  'ecommerce': {
    A: { primary: '#1565C0', accent: '#FF6F00', secondary: '#0D47A1' },  // Trust blue/orange
    B: { primary: '#2E7D32', accent: '#FFAB00', secondary: '#1B5E20' },  // Fresh green/gold
    C: { primary: '#6A1B9A', accent: '#FFD600', secondary: '#4A148C' }   // Purple/gold
  },
  'school': {
    A: { primary: '#1565C0', accent: '#FFA726', secondary: '#0D47A1' },  // Academic blue
    B: { primary: '#2E7D32', accent: '#81C784', secondary: '#1B5E20' },  // Growth green
    C: { primary: '#6A1B9A', accent: '#FFD54F', secondary: '#4A148C' }   // Creative purple
  }
};

/**
 * Get the color palette for an industry + variant combination
 * @param {string} industry - Industry ID
 * @param {string} variant - 'A', 'B', or 'C'
 * @returns {object|null} - { primary, accent, secondary } or null if no custom palette
 */
function getVariantPalette(industry, variant) {
  const palettes = VARIANT_PALETTES[industry];
  if (!palettes) return null;
  return palettes[variant.toUpperCase()] || palettes.A;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get modules for an industry
 * @param {string} industry - Industry ID (e.g., 'law-firm')
 * @returns {object} - Module mapping { moduleName: moduleType }
 */
function getIndustryModules(industry) {
  return INDUSTRY_MODULES[industry] || { services: 'catalog' };
}

/**
 * Get module type for a specific module name
 * @param {string} moduleName - Module name (e.g., 'menu', 'services')
 * @param {string} industry - Industry ID
 * @returns {string} - Module type (catalog, booking, listings, inquiries)
 */
function getModuleType(moduleName, industry) {
  const modules = getIndustryModules(industry);
  return modules[moduleName] || 'catalog';
}

/**
 * Get module type definition
 * @param {string} type - Module type (catalog, booking, listings, inquiries)
 * @returns {object} - Module type definition
 */
function getModuleTypeDefinition(type) {
  return MODULE_TYPES[type] || MODULE_TYPES.catalog;
}

/**
 * Get label configuration for a module
 * @param {string} moduleName - Module name
 * @returns {object} - Label config { label, icon, singular, plural }
 */
function getModuleLabel(moduleName) {
  return MODULE_LABELS[moduleName] || {
    label: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
    icon: 'FileText',
    singular: 'Item',
    plural: 'Items'
  };
}

/**
 * Get all module names for an industry (array)
 * @param {string} industry - Industry ID
 * @returns {string[]} - Array of module names
 */
function getModuleNames(industry) {
  const modules = getIndustryModules(industry);
  return Object.keys(modules);
}

/**
 * Check if an industry uses a specific module type
 * @param {string} industry - Industry ID
 * @param {string} type - Module type to check
 * @returns {boolean}
 */
function industryUsesModuleType(industry, type) {
  const modules = getIndustryModules(industry);
  return Object.values(modules).includes(type);
}

/**
 * Get admin component name for a module
 * @param {string} moduleName - Module name
 * @param {string} industry - Industry ID
 * @returns {string} - Admin component name
 */
function getAdminComponent(moduleName, industry) {
  const type = getModuleType(moduleName, industry);
  const typeDef = getModuleTypeDefinition(type);
  return typeDef.adminComponent;
}

/**
 * Check if module has SSE support
 * @param {string} moduleName - Module name
 * @param {string} industry - Industry ID
 * @returns {boolean}
 */
function moduleHasSSE(moduleName, industry) {
  const type = getModuleType(moduleName, industry);
  const typeDef = getModuleTypeDefinition(type);
  return typeDef.hasSSE || false;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  MODULE_TYPES,
  INDUSTRY_MODULES,
  MODULE_LABELS,
  VARIANT_PALETTES,
  getIndustryModules,
  getModuleType,
  getModuleTypeDefinition,
  getModuleLabel,
  getModuleNames,
  industryUsesModuleType,
  getAdminComponent,
  moduleHasSSE,
  getVariantPalette
};
