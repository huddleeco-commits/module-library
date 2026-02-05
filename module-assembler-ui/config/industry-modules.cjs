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
  getIndustryModules,
  getModuleType,
  getModuleTypeDefinition,
  getModuleLabel,
  getModuleNames,
  industryUsesModuleType,
  getAdminComponent,
  moduleHasSSE
};
