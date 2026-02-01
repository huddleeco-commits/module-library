/**
 * Portal Items Utility
 *
 * Provides industry-specific portal menu items for the ResponsiveHeader component.
 * AI can use these helpers to generate appropriate portal menus.
 *
 * @module layout-responsive/utils/portal-items
 */

/**
 * Portal type labels by industry
 */
const PORTAL_LABELS = {
  // Food & Beverage
  restaurant: 'My Account',
  pizzeria: 'My Account',
  pizza: 'My Account',
  cafe: 'My Account',
  coffee: 'My Account',
  bakery: 'My Account',
  bar: 'My Account',

  // Healthcare
  dental: 'Patient Portal',
  healthcare: 'Patient Portal',
  medical: 'Patient Portal',
  clinic: 'Patient Portal',
  veterinary: 'Pet Portal',

  // Professional Services
  'law-firm': 'Client Portal',
  legal: 'Client Portal',
  accounting: 'Client Portal',
  cpa: 'Client Portal',
  insurance: 'Policy Portal',
  consulting: 'Client Portal',
  agency: 'Client Portal',

  // Real Estate
  'real-estate': 'Client Portal',
  realtor: 'Client Portal',
  'property-management': 'Tenant Portal',

  // Fitness & Beauty
  fitness: 'Member Portal',
  gym: 'Member Portal',
  yoga: 'Member Portal',
  salon: 'My Account',
  spa: 'My Account',
  barbershop: 'My Account',

  // Home Services
  construction: 'Project Portal',
  contractor: 'Project Portal',
  plumbing: 'Service Portal',
  hvac: 'Service Portal',
  cleaning: 'My Account',

  // Automotive
  automotive: 'Service Portal',
  'auto-repair': 'Service Portal',
  mechanic: 'Service Portal',

  // Pet Services
  'pet-services': 'Pet Portal',
  'pet-grooming': 'Pet Portal',
  kennel: 'Pet Portal',

  // Default
  default: 'My Account'
};

/**
 * Get the portal label for an industry
 * @param {string} industry - Industry key
 * @returns {string} Portal label
 */
export function getPortalLabel(industry) {
  return PORTAL_LABELS[industry] || PORTAL_LABELS.default;
}

/**
 * Get portal menu items for an industry
 * @param {string} industry - Industry key
 * @param {Object} options - Options
 * @param {boolean} options.hasLoyalty - Whether loyalty/rewards is enabled
 * @param {boolean} options.hasOrdering - Whether ordering is enabled
 * @param {boolean} options.hasAppointments - Whether appointments is enabled
 * @param {boolean} options.hasReservations - Whether reservations is enabled
 * @returns {Array<{icon: string, label: string, href: string}>} Portal items
 */
export function getPortalItemsForIndustry(industry, options = {}) {
  const { hasLoyalty = false, hasOrdering = false, hasAppointments = false, hasReservations = false } = options;

  // Base item - always included
  const baseItems = [
    { icon: '👤', label: 'My Profile', href: '/profile' }
  ];

  // Industry-specific items
  const industryItems = {
    // Food & Beverage
    restaurant: [
      ...(hasOrdering ? [{ icon: '📦', label: 'My Orders', href: '/orders' }] : []),
      ...(hasReservations ? [{ icon: '📅', label: 'Reservations', href: '/reservations' }] : []),
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: '/rewards' }] : []),
      { icon: '❤️', label: 'Favorites', href: '/favorites' }
    ],

    pizzeria: [
      { icon: '📦', label: 'Order History', href: '/orders' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards Points', href: '/rewards' }] : []),
      { icon: '📍', label: 'Saved Addresses', href: '/addresses' }
    ],

    pizza: [
      { icon: '📦', label: 'Order History', href: '/orders' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards Points', href: '/rewards' }] : []),
      { icon: '📍', label: 'Saved Addresses', href: '/addresses' }
    ],

    cafe: [
      { icon: '📦', label: 'Order History', href: '/orders' },
      ...(hasLoyalty ? [{ icon: '☕', label: 'Coffee Club', href: '/rewards' }] : [])
    ],

    // Healthcare
    dental: [
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '🦷', label: 'Treatment History', href: '/treatments' },
      { icon: '📄', label: 'Forms', href: '/forms' },
      { icon: '💳', label: 'Billing', href: '/billing' },
      { icon: '💬', label: 'Messages', href: '/messages' }
    ],

    healthcare: [
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '📋', label: 'Medical Records', href: '/records' },
      { icon: '💊', label: 'Prescriptions', href: '/prescriptions' },
      { icon: '🧪', label: 'Lab Results', href: '/labs' },
      { icon: '💳', label: 'Billing', href: '/billing' },
      { icon: '💬', label: 'Messages', href: '/messages' }
    ],

    medical: [
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '📋', label: 'Medical Records', href: '/records' },
      { icon: '💊', label: 'Prescriptions', href: '/prescriptions' },
      { icon: '💳', label: 'Billing', href: '/billing' }
    ],

    // Professional Services
    'law-firm': [
      { icon: '📁', label: 'My Cases', href: '/cases' },
      { icon: '📄', label: 'Documents', href: '/documents' },
      { icon: '💬', label: 'Messages', href: '/messages' },
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '💳', label: 'Billing', href: '/billing' }
    ],

    accounting: [
      { icon: '📄', label: 'Tax Returns', href: '/returns' },
      { icon: '📁', label: 'Documents', href: '/documents' },
      { icon: '📊', label: 'Financial Reports', href: '/reports' },
      { icon: '💳', label: 'Invoices', href: '/invoices' },
      { icon: '📅', label: 'Deadlines', href: '/deadlines' }
    ],

    insurance: [
      { icon: '📋', label: 'My Policies', href: '/policies' },
      { icon: '📝', label: 'Claims', href: '/claims' },
      { icon: '🪪', label: 'ID Cards', href: '/cards' },
      { icon: '💳', label: 'Payments', href: '/payments' },
      { icon: '📄', label: 'Documents', href: '/documents' }
    ],

    consulting: [
      { icon: '📁', label: 'Projects', href: '/projects' },
      { icon: '📄', label: 'Deliverables', href: '/deliverables' },
      { icon: '📅', label: 'Meetings', href: '/meetings' },
      { icon: '📊', label: 'Reports', href: '/reports' },
      { icon: '💳', label: 'Invoices', href: '/invoices' }
    ],

    // Real Estate
    'real-estate': [
      { icon: '❤️', label: 'Saved Homes', href: '/saved' },
      { icon: '🔔', label: 'Search Alerts', href: '/alerts' },
      { icon: '📅', label: 'Showings', href: '/showings' },
      { icon: '📄', label: 'Documents', href: '/documents' },
      { icon: '💬', label: 'Messages', href: '/messages' }
    ],

    // Fitness
    fitness: [
      { icon: '📅', label: 'Class Schedule', href: '/schedule' },
      { icon: '💳', label: 'Membership', href: '/membership' },
      { icon: '📊', label: 'My Progress', href: '/progress' },
      ...(hasLoyalty ? [{ icon: '🏆', label: 'Rewards', href: '/rewards' }] : [])
    ],

    gym: [
      { icon: '📅', label: 'Class Schedule', href: '/schedule' },
      { icon: '💳', label: 'Membership', href: '/membership' },
      { icon: '📊', label: 'My Progress', href: '/progress' }
    ],

    // Beauty & Spa
    salon: [
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '📦', label: 'Purchase History', href: '/history' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: '/rewards' }] : [])
    ],

    spa: [
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '🎁', label: 'Gift Cards', href: '/gifts' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: '/rewards' }] : [])
    ],

    // Home Services
    construction: [
      { icon: '🏗️', label: 'My Projects', href: '/projects' },
      { icon: '📄', label: 'Documents', href: '/documents' },
      { icon: '📅', label: 'Schedule', href: '/schedule' },
      { icon: '📸', label: 'Progress Photos', href: '/photos' },
      { icon: '💳', label: 'Invoices', href: '/invoices' }
    ],

    // Automotive
    automotive: [
      { icon: '🚗', label: 'My Vehicles', href: '/vehicles' },
      { icon: '🔧', label: 'Service History', href: '/history' },
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '💳', label: 'Invoices', href: '/invoices' }
    ],

    'auto-repair': [
      { icon: '🚗', label: 'My Vehicles', href: '/vehicles' },
      { icon: '🔧', label: 'Service History', href: '/history' },
      { icon: '📅', label: 'Appointments', href: '/appointments' }
    ],

    // Pet Services
    'pet-services': [
      { icon: '🐕', label: 'My Pets', href: '/pets' },
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '📋', label: 'Vaccine Records', href: '/records' },
      { icon: '🏨', label: 'Boarding', href: '/boarding' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: '/rewards' }] : [])
    ],

    veterinary: [
      { icon: '🐕', label: 'My Pets', href: '/pets' },
      { icon: '📅', label: 'Appointments', href: '/appointments' },
      { icon: '📋', label: 'Medical Records', href: '/records' },
      { icon: '💊', label: 'Prescriptions', href: '/prescriptions' },
      { icon: '💳', label: 'Billing', href: '/billing' }
    ]
  };

  // Get industry-specific items or default
  const specificItems = industryItems[industry] || [
    ...(hasOrdering ? [{ icon: '📦', label: 'Orders', href: '/orders' }] : []),
    ...(hasAppointments ? [{ icon: '📅', label: 'Appointments', href: '/appointments' }] : []),
    ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: '/rewards' }] : []),
    { icon: '💬', label: 'Messages', href: '/messages' }
  ];

  // Always add settings at the end
  return [
    ...baseItems,
    ...specificItems,
    { icon: '⚙️', label: 'Settings', href: '/settings' }
  ];
}

export default {
  getPortalLabel,
  getPortalItemsForIndustry
};
