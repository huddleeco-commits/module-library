/**
 * Companion App Generator
 *
 * Generates mobile-first PWA that connects to an existing website's backend.
 * Deploys to [sitename].be1st.app and calls [sitename].be1st.io/api
 */

const fs = require('fs');
const path = require('path');

// Aliases for common action names that map to QUICK_ACTION_CONFIG keys
// This allows users to use simpler names like "menu" instead of "viewMenu"
const ACTION_ALIASES = {
  // Common shortcuts
  menu: 'viewMenu',
  reservations: 'makeReservation',
  reservation: 'makeReservation',
  reserve: 'makeReservation',
  booking: 'makeReservation',
  bookings: 'makeReservation',
  loyalty: 'viewLoyalty',
  rewards: 'viewRewards',
  contact: 'messages',
  order: 'orderFood',
  orderOnline: 'orderFood',
  orderonline: 'orderFood',
  book: 'bookAppointment',
  appointment: 'bookAppointment',
  appointments: 'bookAppointment',
  classes: 'viewClasses',
  classSchedule: 'viewClasses',
  bookClass: 'bookAppointment',
  history: 'pastVisits',
  records: 'viewRecords',
  patientPortal: 'viewRecords',
  points: 'earnPoints',
  earn: 'earnPoints',
  refer: 'referFriend',
  checkin: 'checkIn',
  membership: 'viewLoyalty',
  giftCards: 'viewRewards',
  viewServices: 'viewMenu',
  trackOrder: 'pastVisits',
  insurance: 'documents'
};

/**
 * Normalize action name using aliases
 * @param {string} action - The action name to normalize
 * @returns {string} The normalized action name
 */
function normalizeAction(action) {
  return ACTION_ALIASES[action] || action;
}

/**
 * Get industry default theme (full theme, not just colors)
 */
function getIndustryDefaultTheme(industry) {
  const themes = {
    // ===== FOOD & BEVERAGE =====
    steakhouse: {
      primary: '#722F37', accent: '#C9A961',
      mode: 'dark', background: '#1a1a1a', surface: '#2a2a2a', text: '#ffffff',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    pizza: {
      primary: '#e53e3e', accent: '#f59e0b',
      mode: 'light', background: '#fffaf0', surface: '#ffffff', text: '#1a1a1a',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    cafe: {
      primary: '#8b5a2b', accent: '#d69e2e',
      mode: 'light', background: '#faf7f2', surface: '#ffffff', text: '#3d3d3d',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    bakery: {
      primary: '#d69e2e', accent: '#8b5a2b',
      mode: 'light', background: '#fffbf5', surface: '#ffffff', text: '#4a3728',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '16px'
    },
    bar: {
      primary: '#805ad5', accent: '#d69e2e',
      mode: 'dark', background: '#0f0f1a', surface: '#1a1a2e', text: '#ffffff',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    restaurant: {
      primary: '#722F37', accent: '#C9A961',
      mode: 'dark', background: '#1a1a1a', surface: '#2a2a2a', text: '#ffffff',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },

    // ===== HEALTHCARE & WELLNESS =====
    'spa-salon': {
      primary: '#9333ea', accent: '#f472b6',
      mode: 'light', background: '#fdf4ff', surface: '#ffffff', text: '#1f1f1f',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '16px'
    },
    dental: {
      primary: '#0d9488', accent: '#06b6d4',
      mode: 'light', background: '#f0fdfa', surface: '#ffffff', text: '#134e4a',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    healthcare: {
      primary: '#0ea5e9', accent: '#22c55e',
      mode: 'light', background: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    chiropractic: {
      primary: '#16a34a', accent: '#0d9488',
      mode: 'light', background: '#f0fdf4', surface: '#ffffff', text: '#14532d',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    barbershop: {
      primary: '#1e293b', accent: '#f59e0b',
      mode: 'dark', background: '#0f172a', surface: '#1e293b', text: '#f8fafc',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },

    // ===== HEALTH & FITNESS =====
    fitness: {
      primary: '#dc2626', accent: '#f97316',
      mode: 'dark', background: '#0a0a0a', surface: '#1a1a1a', text: '#ffffff',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    yoga: {
      primary: '#8b5cf6', accent: '#a78bfa',
      mode: 'light', background: '#faf5ff', surface: '#ffffff', text: '#4c1d95',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '24px'
    },

    // ===== PROFESSIONAL SERVICES =====
    'law-firm': {
      primary: '#1e3a5f', accent: '#c9a961',
      mode: 'light', background: '#f8fafc', surface: '#ffffff', text: '#1e293b',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '4px'
    },
    'real-estate': {
      primary: '#059669', accent: '#0891b2',
      mode: 'light', background: '#f0fdf4', surface: '#ffffff', text: '#1f2937',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    accounting: {
      primary: '#1d4ed8', accent: '#3b82f6',
      mode: 'light', background: '#eff6ff', surface: '#ffffff', text: '#1e3a8a',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '6px'
    },
    consulting: {
      primary: '#4f46e5', accent: '#818cf8',
      mode: 'light', background: '#f5f3ff', surface: '#ffffff', text: '#312e81',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    insurance: {
      primary: '#0369a1', accent: '#0ea5e9',
      mode: 'light', background: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },

    // ===== TECHNOLOGY =====
    saas: {
      primary: '#6366f1', accent: '#8b5cf6',
      mode: 'dark', background: '#0f0f23', surface: '#1a1a2e', text: '#e0e7ff',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    startup: {
      primary: '#8b5cf6', accent: '#06b6d4',
      mode: 'light', background: '#faf5ff', surface: '#ffffff', text: '#1f2937',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '16px'
    },
    agency: {
      primary: '#ec4899', accent: '#8b5cf6',
      mode: 'dark', background: '#0a0a0a', surface: '#171717', text: '#fafafa',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },

    // ===== RETAIL =====
    ecommerce: {
      primary: '#ea580c', accent: '#f59e0b',
      mode: 'light', background: '#fff7ed', surface: '#ffffff', text: '#1c1917',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    'subscription-box': {
      primary: '#db2777', accent: '#f472b6',
      mode: 'light', background: '#fdf2f8', surface: '#ffffff', text: '#831843',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '16px'
    },

    // ===== CREATIVE =====
    photography: {
      primary: '#171717', accent: '#a3a3a3',
      mode: 'dark', background: '#0a0a0a', surface: '#171717', text: '#fafafa',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '0px'
    },
    wedding: {
      primary: '#be185d', accent: '#f9a8d4',
      mode: 'light', background: '#fdf2f8', surface: '#ffffff', text: '#831843',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '16px'
    },
    portfolio: {
      primary: '#171717', accent: '#3b82f6',
      mode: 'light', background: '#fafafa', surface: '#ffffff', text: '#171717',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },

    // ===== TRADE SERVICES =====
    plumber: {
      primary: '#0369a1', accent: '#0ea5e9',
      mode: 'light', background: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    electrician: {
      primary: '#eab308', accent: '#fbbf24',
      mode: 'dark', background: '#171717', surface: '#262626', text: '#fafafa',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    construction: {
      primary: '#f97316', accent: '#fbbf24',
      mode: 'light', background: '#fff7ed', surface: '#ffffff', text: '#431407',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '4px'
    },
    landscaping: {
      primary: '#16a34a', accent: '#84cc16',
      mode: 'light', background: '#f0fdf4', surface: '#ffffff', text: '#14532d',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    cleaning: {
      primary: '#06b6d4', accent: '#22d3ee',
      mode: 'light', background: '#ecfeff', surface: '#ffffff', text: '#164e63',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '16px'
    },
    'auto-repair': {
      primary: '#dc2626', accent: '#f97316',
      mode: 'dark', background: '#18181b', surface: '#27272a', text: '#fafafa',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },

    // ===== ORGANIZATIONS =====
    nonprofit: {
      primary: '#059669', accent: '#34d399',
      mode: 'light', background: '#ecfdf5', surface: '#ffffff', text: '#064e3b',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    church: {
      primary: '#7c3aed', accent: '#a78bfa',
      mode: 'light', background: '#f5f3ff', surface: '#ffffff', text: '#4c1d95',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },

    // ===== EDUCATION =====
    school: {
      primary: '#2563eb', accent: '#3b82f6',
      mode: 'light', background: '#eff6ff', surface: '#ffffff', text: '#1e3a8a',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    'online-course': {
      primary: '#8b5cf6', accent: '#a78bfa',
      mode: 'light', background: '#faf5ff', surface: '#ffffff', text: '#4c1d95',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },

    // ===== HOSPITALITY & EVENTS =====
    hotel: {
      primary: '#0f766e', accent: '#14b8a6',
      mode: 'light', background: '#f0fdfa', surface: '#ffffff', text: '#134e4a',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    'event-venue': {
      primary: '#7c3aed', accent: '#c4b5fd',
      mode: 'dark', background: '#1e1b4b', surface: '#312e81', text: '#e0e7ff',
      fontHeading: "'Playfair Display', serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    travel: {
      primary: '#0891b2', accent: '#22d3ee',
      mode: 'light', background: '#ecfeff', surface: '#ffffff', text: '#164e63',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '16px'
    },

    // ===== OTHER =====
    'pet-services': {
      primary: '#ea580c', accent: '#fb923c',
      mode: 'light', background: '#fff7ed', surface: '#ffffff', text: '#431407',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '20px'
    },
    moving: {
      primary: '#ca8a04', accent: '#facc15',
      mode: 'light', background: '#fefce8', surface: '#ffffff', text: '#422006',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    musician: {
      primary: '#be185d', accent: '#ec4899',
      mode: 'dark', background: '#0a0a0a', surface: '#171717', text: '#fafafa',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    podcast: {
      primary: '#7c3aed', accent: '#a78bfa',
      mode: 'dark', background: '#0f0f23', surface: '#1e1b4b', text: '#e0e7ff',
      fontHeading: "'Poppins', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '12px'
    },
    gaming: {
      primary: '#dc2626', accent: '#7c3aed',
      mode: 'dark', background: '#0a0a0a', surface: '#18181b', text: '#fafafa',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '8px'
    },
    finance: {
      primary: '#0f766e', accent: '#14b8a6',
      mode: 'light', background: '#f0fdfa', surface: '#ffffff', text: '#134e4a',
      fontHeading: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
      borderRadius: '4px'
    },

    // ===== DEFAULT =====
    default: {
      primary: '#6366f1', accent: '#10b981',
      mode: 'light', background: '#ffffff', surface: '#f8fafc', text: '#1a1a2e',
      fontHeading: "'Inter', sans-serif", fontBody: "system-ui, sans-serif",
      borderRadius: '8px'
    }
  };
  return themes[industry] || themes.default;
}

/**
 * Get industry default colors if no theme provided (legacy compatibility)
 */
function getIndustryDefaultColors(industry) {
  const theme = getIndustryDefaultTheme(industry);
  return { primary: theme.primary, accent: theme.accent };
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex) {
  if (!hex) return '#5a252c';
  // Remove # if present
  hex = hex.replace('#', '');
  // Parse RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  // Darken by 20%
  r = Math.floor(r * 0.8);
  g = Math.floor(g * 0.8);
  b = Math.floor(b * 0.8);
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Convert hex to RGB values for CSS
 */
function hexToRgb(hex) {
  if (!hex) return '139, 92, 246';
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Determine if a color is light (for auto-detecting theme mode)
 */
function isLightColor(hex) {
  if (!hex) return true;
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// Quick action metadata for code generation
const QUICK_ACTION_CONFIG = {
  // Customer actions
  viewMenu: { route: '/menu', icon: 'Book', apiEndpoint: '/api/menu' },
  makeReservation: { route: '/reserve', icon: 'Calendar', apiEndpoint: '/api/reservations' },
  earnPoints: { route: '/earn', icon: 'Star', apiEndpoint: '/api/loyalty/earn' },
  viewRewards: { route: '/rewards', icon: 'Gift', apiEndpoint: '/api/loyalty/rewards' },
  orderFood: { route: '/order', icon: 'ShoppingBag', apiEndpoint: '/api/orders' },
  bookAppointment: { route: '/book', icon: 'Calendar', apiEndpoint: '/api/appointments' },
  viewLoyalty: { route: '/loyalty', icon: 'Award', apiEndpoint: '/api/loyalty' },
  pastVisits: { route: '/history', icon: 'Clock', apiEndpoint: '/api/visits' },
  referFriend: { route: '/refer', icon: 'Users', apiEndpoint: '/api/referrals' },
  checkIn: { route: '/checkin', icon: 'CheckCircle', apiEndpoint: '/api/checkin' },
  viewClasses: { route: '/classes', icon: 'Grid', apiEndpoint: '/api/classes' },
  leaderboard: { route: '/leaderboard', icon: 'Trophy', apiEndpoint: '/api/leaderboard' },
  workoutLog: { route: '/log', icon: 'Edit', apiEndpoint: '/api/workouts' },
  viewRecords: { route: '/records', icon: 'FileText', apiEndpoint: '/api/records' },
  prescriptions: { route: '/prescriptions', icon: 'Pill', apiEndpoint: '/api/prescriptions' },
  messages: { route: '/messages', icon: 'MessageCircle', apiEndpoint: '/api/messages' },
  savedListings: { route: '/saved', icon: 'Heart', apiEndpoint: '/api/listings/saved' },
  scheduleTour: { route: '/tour', icon: 'MapPin', apiEndpoint: '/api/tours' },
  calculator: { route: '/calculator', icon: 'Calculator', apiEndpoint: null },
  myCourses: { route: '/courses', icon: 'BookOpen', apiEndpoint: '/api/courses' },
  progress: { route: '/progress', icon: 'TrendingUp', apiEndpoint: '/api/progress' },
  certificates: { route: '/certificates', icon: 'Award', apiEndpoint: '/api/certificates' },
  assignments: { route: '/assignments', icon: 'ClipboardList', apiEndpoint: '/api/assignments' },
  documents: { route: '/documents', icon: 'Folder', apiEndpoint: '/api/documents' },
  billing: { route: '/billing', icon: 'CreditCard', apiEndpoint: '/api/billing' },
  bookRoom: { route: '/rooms', icon: 'DoorOpen', apiEndpoint: '/api/rooms' },
  accessPass: { route: '/access', icon: 'Key', apiEndpoint: '/api/access' },
  community: { route: '/community', icon: 'Users', apiEndpoint: '/api/community' },
  events: { route: '/events', icon: 'Calendar', apiEndpoint: '/api/events' },
  myCollection: { route: '/collection', icon: 'Package', apiEndpoint: '/api/collection' },
  scan: { route: '/scan', icon: 'Camera', apiEndpoint: '/api/scanner' },
  marketplace: { route: '/marketplace', icon: 'ShoppingCart', apiEndpoint: '/api/marketplace' },
  wishlist: { route: '/wishlist', icon: 'Heart', apiEndpoint: '/api/wishlist' },
  dashboard: { route: '/dashboard', icon: 'LayoutDashboard', apiEndpoint: '/api/dashboard' },
  rewards: { route: '/rewards', icon: 'Gift', apiEndpoint: '/api/rewards' },
  profile: { route: '/profile', icon: 'User', apiEndpoint: '/api/auth/me' },
  notifications: { route: '/notifications', icon: 'Bell', apiEndpoint: '/api/notifications' },

  // Staff actions
  seatTable: { route: '/staff/seat', icon: 'Users', apiEndpoint: '/api/admin/tables' },
  addPoints: { route: '/staff/points', icon: 'Plus', apiEndpoint: '/api/admin/points' },
  viewOrders: { route: '/staff/orders', icon: 'ClipboardList', apiEndpoint: '/api/admin/orders' },
  sendNotification: { route: '/staff/notify', icon: 'Send', apiEndpoint: '/api/admin/notifications' },
  checkInClient: { route: '/staff/checkin', icon: 'CheckCircle', apiEndpoint: '/api/admin/checkin' },
  viewSchedule: { route: '/staff/schedule', icon: 'Calendar', apiEndpoint: '/api/admin/schedule' },
  quickSale: { route: '/staff/sale', icon: 'DollarSign', apiEndpoint: '/api/admin/sales' },
  checkInMember: { route: '/staff/member-checkin', icon: 'CheckCircle', apiEndpoint: '/api/admin/member-checkin' },
  memberSearch: { route: '/staff/search', icon: 'Search', apiEndpoint: '/api/admin/members' },
  analytics: { route: '/staff/analytics', icon: 'BarChart', apiEndpoint: '/api/admin/analytics' },
  patientQueue: { route: '/staff/queue', icon: 'Users', apiEndpoint: '/api/admin/queue' },
  vitals: { route: '/staff/vitals', icon: 'Activity', apiEndpoint: '/api/admin/vitals' },
  appointments: { route: '/staff/appointments', icon: 'Calendar', apiEndpoint: '/api/admin/appointments' },
  charts: { route: '/staff/charts', icon: 'LineChart', apiEndpoint: '/api/admin/charts' },
  clientPortal: { route: '/staff/clients', icon: 'Users', apiEndpoint: '/api/admin/clients' },
  scheduleShowings: { route: '/staff/showings', icon: 'Calendar', apiEndpoint: '/api/admin/showings' },
  leads: { route: '/staff/leads', icon: 'UserPlus', apiEndpoint: '/api/admin/leads' },
  studentRoster: { route: '/staff/students', icon: 'Users', apiEndpoint: '/api/admin/students' },
  grades: { route: '/staff/grades', icon: 'Award', apiEndpoint: '/api/admin/grades' },
  attendance: { route: '/staff/attendance', icon: 'CheckSquare', apiEndpoint: '/api/admin/attendance' },
  announcements: { route: '/staff/announce', icon: 'Megaphone', apiEndpoint: '/api/admin/announcements' },
  clientFiles: { route: '/staff/files', icon: 'Folder', apiEndpoint: '/api/admin/files' },
  timeTracking: { route: '/staff/time', icon: 'Clock', apiEndpoint: '/api/admin/time' },
  invoices: { route: '/staff/invoices', icon: 'FileText', apiEndpoint: '/api/admin/invoices' },
  calendar: { route: '/staff/calendar', icon: 'Calendar', apiEndpoint: '/api/admin/calendar' },
  roomStatus: { route: '/staff/rooms', icon: 'DoorOpen', apiEndpoint: '/api/admin/rooms' },
  checkIns: { route: '/staff/checkins', icon: 'CheckCircle', apiEndpoint: '/api/admin/checkins' },
  members: { route: '/staff/members', icon: 'Users', apiEndpoint: '/api/admin/members' },
  inventory: { route: '/staff/inventory', icon: 'Package', apiEndpoint: '/api/admin/inventory' },
  priceCheck: { route: '/staff/price', icon: 'DollarSign', apiEndpoint: '/api/admin/prices' },
  authentications: { route: '/staff/auth', icon: 'Shield', apiEndpoint: '/api/admin/authentications' },
  sales: { route: '/staff/sales', icon: 'CreditCard', apiEndpoint: '/api/admin/sales' },
  customers: { route: '/staff/customers', icon: 'Users', apiEndpoint: '/api/admin/customers' },
  settings: { route: '/staff/settings', icon: 'Settings', apiEndpoint: '/api/admin/settings' },
  reports: { route: '/staff/reports', icon: 'BarChart2', apiEndpoint: '/api/admin/reports' }
};

/**
 * Generate a complete companion app
 */
async function generateCompanionApp(config, outputPath) {
  const { appType, industry, quickActions, parentSite } = config;

  console.log(`\n📱 Generating ${appType} companion app for ${parentSite.name}...`);
  console.log(`   Industry: ${industry}`);
  console.log(`   Quick Actions: ${quickActions.join(', ')}`);

  // Extract full theme from parent site or use industry defaults
  const parentTheme = parentSite.theme || {};
  const industryDefaults = getIndustryDefaultTheme(industry);

  // Determine if we should use light or dark mode
  // Check parent's background color luminance, or use parent's explicit mode, or use industry default
  const parentBg = parentTheme.backgroundColor || parentTheme.background;
  const isLightMode = parentTheme.mode === 'light' ||
    (parentBg && isLightColor(parentBg)) ||
    (!parentBg && industryDefaults.mode === 'light');

  const themeColors = {
    // Core colors
    primary: parentTheme.primaryColor || parentTheme.primary || industryDefaults.primary,
    primaryDark: parentTheme.primaryDark || darkenColor(parentTheme.primaryColor || parentTheme.primary || industryDefaults.primary),
    accent: parentTheme.accentColor || parentTheme.accent || industryDefaults.accent,

    // Mode-aware colors
    mode: isLightMode ? 'light' : 'dark',
    background: parentTheme.backgroundColor || parentTheme.background || industryDefaults.background,
    surface: parentTheme.surface || industryDefaults.surface,
    text: parentTheme.textColor || parentTheme.text || industryDefaults.text,
    textMuted: parentTheme.textMuted || (isLightMode ? '#64748b' : 'rgba(255, 255, 255, 0.6)'),

    // Typography
    fontHeading: parentTheme.fontHeading || parentTheme.fonts?.heading || industryDefaults.fontHeading,
    fontBody: parentTheme.fontBody || parentTheme.fonts?.body || industryDefaults.fontBody,

    // Design tokens
    borderRadius: parentTheme.borderRadius || industryDefaults.borderRadius,

    // Legacy compatibility
    bgDark: parentTheme.backgroundColor || industryDefaults.background,
    textPrimary: parentTheme.textColor || industryDefaults.text
  };

  console.log(`   Theme: ${themeColors.mode} mode, primary=${themeColors.primary}, accent=${themeColors.accent}`);

  // Normalize action names using aliases (e.g., "menu" -> "viewMenu")
  const normalizedActions = quickActions.map(action => normalizeAction(action));
  console.log(`   Normalized Actions: ${normalizedActions.join(', ')}`);

  // Validate quick actions and warn about invalid ones
  const validActions = normalizedActions.filter(action => QUICK_ACTION_CONFIG[action]);
  const invalidActions = normalizedActions.filter(action => !QUICK_ACTION_CONFIG[action]);

  if (invalidActions.length > 0) {
    console.log(`   ⚠️ Invalid actions (not in QUICK_ACTION_CONFIG): ${invalidActions.join(', ')}`);
    console.log(`   ✅ Valid actions that will be used: ${validActions.join(', ')}`);
  }

  // Create output directory
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Generate all files - use validActions (normalized and validated)
  const files = {
    'package.json': generatePackageJson(parentSite.name, appType),
    'vite.config.js': generateViteConfig(),
    'index.html': generateIndexHtml(parentSite.name, themeColors),
    'public/manifest.json': generateManifest(parentSite.name, parentSite.subdomain, themeColors),
    'public/favicon.svg': generateFaviconSvg(themeColors),
    'public/icon-192.svg': generateIconSvg(192, parentSite.name, themeColors),
    'public/icon-512.svg': generateIconSvg(512, parentSite.name, themeColors),
    'src/main.jsx': generateMain(),
    'src/App.jsx': generateApp(validActions, appType, parentSite.name, industry),
    'src/index.css': generateStyles(industry, themeColors),
    'src/services/api.js': generateApiService(parentSite.subdomain, parentSite.backendUrl),
    'src/components/BottomNav.jsx': generateBottomNav(appType, industry),
    'src/components/QuickActionCard.jsx': generateQuickActionCard(),
    'src/data/menu.js': generateMenuData(parentSite.name, industry),
    'src/screens/HomeScreen.jsx': generateHomeScreen(validActions, parentSite.name, appType, industry, themeColors),
    'src/screens/LoginScreen.jsx': generateLoginScreen(parentSite.name, parentSite.subdomain),
    'src/screens/ProfileScreen.jsx': generateProfileScreen(appType, parentSite.name, industry),
    'src/hooks/useAuth.jsx': generateAuthHook(),
    'src/hooks/useMenu.jsx': generateMenuHook(),
    'src/context/ThemeContext.jsx': generateThemeContext(themeColors.mode || 'light'),
  };

  // Add Order screen for restaurant/food industries ONLY if orderFood action not already present
  // (If orderFood is in validActions, OrderFoodScreen.jsx will be generated instead)
  const isFoodIndustry = ['restaurant', 'steakhouse', 'pizza', 'cafe', 'bakery', 'bar'].includes(industry);
  const hasOrderFoodAction = validActions.includes('orderFood');
  if (isFoodIndustry && !hasOrderFoodAction) {
    files['src/screens/OrderScreen.jsx'] = generateOrderScreen(parentSite.name, industry);
  }

  // Generate action-specific screens for valid actions only
  // Skip screens that are already generated statically (home, login, profile)
  const staticScreenActions = ['home', 'login', 'profile'];
  for (const action of validActions) {
    if (staticScreenActions.includes(action.toLowerCase())) {
      continue; // Skip - this screen is already generated
    }
    const actionConfig = QUICK_ACTION_CONFIG[action];
    const screenName = action.charAt(0).toUpperCase() + action.slice(1) + 'Screen';
    files[`src/screens/${screenName}.jsx`] = generateActionScreen(action, actionConfig, appType, parentSite.name, industry);
  }

  // Write all files
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(outputPath, filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content);
    console.log(`   ✅ ${filePath}`);
  }

  console.log(`\n✨ Companion app generated at: ${outputPath}`);
  return outputPath;
}

// ============================================
// FILE GENERATORS
// ============================================

function generatePackageJson(appName, appType) {
  const safeName = appName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return JSON.stringify({
    name: `${safeName}-companion`,
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.20.0',
      'lucide-react': '^0.294.0'
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.2.0',
      vite: '^5.0.0'
    }
  }, null, 2);
}

function generateViteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    allowedHosts: ['localhost', '.be1st.app', '.be1st.io', '.up.railway.app']
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: ['localhost', '.be1st.app', '.be1st.io', '.up.railway.app']
  },
  build: {
    outDir: 'dist'
  }
});
`;
}

function generateIndexHtml(appName, themeColors = {}) {
  const themeColor = themeColors.primary || '#8b5cf6';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="${themeColor}" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icon-192.svg" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <title>${appName}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`;
}

function generateManifest(appName, subdomain, themeColors = {}) {
  return JSON.stringify({
    name: appName,
    short_name: appName.split(' ')[0],
    description: `${appName} Companion App`,
    start_url: '/',
    display: 'standalone',
    background_color: themeColors.bgDark || '#0a0a0f',
    theme_color: themeColors.primary || '#8b5cf6',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
    ]
  }, null, 2);
}

function generateMain() {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`;
}

function generateApp(quickActions, appType, appName, industry) {
  // Filter to only actions that exist in QUICK_ACTION_CONFIG
  // This prevents creating imports for screens that won't be generated
  const validActions = quickActions.filter(action => QUICK_ACTION_CONFIG[action]);

  // Check if this is a food/restaurant industry that needs ordering
  // Only add separate OrderScreen if orderFood is NOT already in validActions (to avoid duplicate /order routes)
  const isFoodIndustry = ['restaurant', 'steakhouse', 'pizza', 'cafe', 'bakery', 'bar'].includes(industry);
  const hasOrderFoodAction = validActions.includes('orderFood');
  const needsSeparateOrderScreen = isFoodIndustry && !hasOrderFoodAction;

  // Filter out actions that would create duplicate imports
  // HomeScreen, LoginScreen, ProfileScreen are already imported statically
  const staticScreens = ['home', 'login', 'profile'];
  const actionsForImports = validActions.filter(action =>
    !staticScreens.includes(action.toLowerCase())
  );

  const imports = actionsForImports.map(action => {
    const screenName = action.charAt(0).toUpperCase() + action.slice(1) + 'Screen';
    return `import { ${screenName} } from './screens/${screenName}';`;
  }).join('\n');

  // For routes, also filter out profile since it has a static route
  const actionsForRoutes = validActions.filter(action =>
    !['home', 'login', 'profile'].includes(action.toLowerCase())
  );

  const routes = actionsForRoutes.map(action => {
    const screenName = action.charAt(0).toUpperCase() + action.slice(1) + 'Screen';
    const config = QUICK_ACTION_CONFIG[action];
    return `          <Route path="${config.route}" element={<${screenName} />} />`;
  }).join('\n');

  // Add order import and route for food industries ONLY if orderFood action not already present
  const orderImport = needsSeparateOrderScreen ? `import { OrderScreen } from './screens/OrderScreen';` : '';
  const orderRoute = needsSeparateOrderScreen ? `          <Route path="/order" element={<OrderScreen />} />` : '';

  return `import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ProfileScreen } from './screens/ProfileScreen';
${imports}
${orderImport}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomeScreen />
          </ProtectedRoute>
        } />
${routes}
${orderRoute}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        } />
      </Routes>
      {user && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
`;
}

function generateStyles(industry, themeColors = {}) {
  // Extract theme values with fallbacks
  const industryDefaults = getIndustryDefaultTheme(industry);
  const defaultMode = themeColors.mode || industryDefaults.mode || 'light';

  const primary = themeColors.primary || industryDefaults.primary;
  const primaryDark = themeColors.primaryDark || darkenColor(primary);
  const accent = themeColors.accent || industryDefaults.accent;
  const fontHeading = themeColors.fontHeading || industryDefaults.fontHeading;
  const fontBody = themeColors.fontBody || industryDefaults.fontBody;
  const borderRadius = themeColors.borderRadius || industryDefaults.borderRadius;
  const primaryRgb = hexToRgb(primary);

  // Google Fonts import based on fonts used
  const fontsToImport = [];
  if (fontHeading.includes('Playfair')) fontsToImport.push('Playfair+Display:wght@400;600;700');
  if (fontHeading.includes('Poppins') || fontBody.includes('Poppins')) fontsToImport.push('Poppins:wght@400;500;600;700');
  if (fontHeading.includes('Inter') || fontBody.includes('Inter')) fontsToImport.push('Inter:wght@400;500;600;700');
  const fontImport = fontsToImport.length > 0
    ? `@import url('https://fonts.googleapis.com/css2?family=${fontsToImport.join('&family=')}&display=swap');`
    : '';

  return `${fontImport}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Brand Colors - These stay constant across themes */
  --primary: ${primary};
  --primary-dark: ${primaryDark};
  --primary-rgb: ${primaryRgb};
  --accent: ${accent};

  /* Typography */
  --font-heading: ${fontHeading};
  --font-body: ${fontBody};

  /* Design Tokens */
  --radius: ${borderRadius};
  --radius-lg: calc(${borderRadius} * 1.5);

  /* Safe Areas */
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);

  /* Default theme mode: ${defaultMode} */
  --default-theme: ${defaultMode};
}

/* ===== LIGHT THEME ===== */
[data-theme="light"], :root:not([data-theme]) {
  --background: #ffffff;
  --surface: #f8fafc;
  --card-bg: #ffffff;
  --card-border: rgba(0, 0, 0, 0.08);
  --text: #1a1a2e;
  --text-muted: #64748b;
  --nav-bg: rgba(255, 255, 255, 0.95);
  --nav-border: rgba(0, 0, 0, 0.08);
  --input-bg: #f8fafc;
  --input-border: rgba(0, 0, 0, 0.1);
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --bg-dark: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #64748b;
}

/* ===== MEDIUM THEME (Soft/Neutral) ===== */
[data-theme="medium"] {
  --background: #e8e8e8;
  --surface: #f0f0f0;
  --card-bg: #f5f5f5;
  --card-border: rgba(0, 0, 0, 0.1);
  --text: #1f2937;
  --text-muted: #4b5563;
  --nav-bg: rgba(240, 240, 240, 0.95);
  --nav-border: rgba(0, 0, 0, 0.1);
  --input-bg: #e5e5e5;
  --input-border: rgba(0, 0, 0, 0.12);
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  --bg-dark: #e8e8e8;
  --bg-card: #f5f5f5;
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
}

/* ===== DARK THEME ===== */
[data-theme="dark"] {
  --background: #0a0a0f;
  --surface: #1a1a2e;
  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: rgba(255, 255, 255, 0.1);
  --text: #f1f5f9;
  --text-muted: rgba(255, 255, 255, 0.6);
  --nav-bg: rgba(10, 10, 15, 0.95);
  --nav-border: rgba(255, 255, 255, 0.1);
  --input-bg: rgba(255, 255, 255, 0.05);
  --input-border: rgba(255, 255, 255, 0.1);
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  --bg-dark: #0a0a0f;
  --bg-card: rgba(255, 255, 255, 0.05);
  --text-primary: #f1f5f9;
  --text-secondary: rgba(255, 255, 255, 0.6);
}

body {
  font-family: var(--font-body);
  background: var(--background);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

.app-container {
  min-height: 100vh;
  padding-top: var(--safe-area-top);
  padding-bottom: calc(80px + var(--safe-area-bottom));
}

.screen {
  padding: 20px;
  padding-bottom: 100px;
  min-height: calc(100vh - 80px - var(--safe-area-top) - var(--safe-area-bottom));
}

.screen-header {
  text-align: center;
  padding: 20px 0 30px;
}

.screen-title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text);
}

.screen-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
}

/* Cards - Match parent site style */
.card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow);
}

/* Dark theme cards get blur effect */
[data-theme="dark"] .card {
  backdrop-filter: blur(10px);
}

/* Buttons - Use brand colors */
.btn-primary {
  width: 100%;
  padding: 16px;
  background: var(--primary);
  color: white;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  width: 100%;
  padding: 16px;
  background: transparent;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 16px;
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.2s;
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* Form Elements */
.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 16px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.input-field::placeholder {
  color: var(--text-muted);
}

/* Loading */
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--background);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--primary-rgb), 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Stats Card */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow);
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Bottom Nav - Match parent site */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(70px + var(--safe-area-bottom));
  padding-bottom: var(--safe-area-bottom);
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--nav-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-item.active {
  color: var(--primary);
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
}

/* Menu Items */
.menu-category {
  margin-bottom: 24px;
}

.category-title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  margin-bottom: 12px;
}

.menu-item-info {
  flex: 1;
}

.menu-item-name {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.menu-item-desc {
  font-size: 14px;
  color: var(--text-muted);
}

.menu-item-price {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--primary);
  font-size: 18px;
}

/* Quick Action Card */
.quick-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text);
  transition: all 0.2s;
  box-shadow: var(--shadow);
}

.quick-action-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.quick-action-card:active {
  transform: scale(0.98);
}

.quick-action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--primary-rgb), 0.1);
  border-radius: var(--radius);
  color: var(--primary);
}

.quick-action-label {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

/* Back Button */
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  background: none;
  border: none;
  color: var(--primary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 16px;
}

/* Profile Screen */
.profile-header {
  text-align: center;
  padding: 32px 0;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.profile-name {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.profile-email {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.profile-section {
  margin-top: 24px;
}

.profile-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.profile-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  margin-bottom: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.profile-option:hover {
  border-color: var(--primary);
}

.profile-option-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text);
}

.profile-option-icon {
  color: var(--primary);
}

.logout-btn {
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: var(--radius);
  color: #ef4444;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}
`;
}

function generateApiService(parentSubdomain, backendUrl) {
  // Use the explicit backendUrl if provided, otherwise construct from subdomain
  // Companion apps call the parent website's backend API
  // The backend is deployed to Railway at: {subdomain}-backend.up.railway.app
  // Deploy service will set VITE_API_URL in .env.production for correct URL
  const defaultUrl = backendUrl || `https://${parentSubdomain}-backend.up.railway.app`;
  return `const API_URL = import.meta.env.VITE_API_URL || '${defaultUrl}';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = \`Bearer \${this.token}\`;
    }

    const response = await fetch(\`\${API_URL}\${endpoint}\`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getProfile() {
    return this.request('/api/auth/me');
  }

  async logout() {
    this.setToken(null);
  }

  // Generic methods for CRUD operations
  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
`;
}

function generateBottomNav(appType, industry) {
  // Check if food industry that needs order tab
  const hasFoodOrdering = ['restaurant', 'steakhouse', 'pizza', 'pizzeria', 'cafe', 'bakery', 'bar', 'brewery', 'winery', 'coffee-shop', 'florist'].includes(industry);

  if (hasFoodOrdering) {
    return `import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gift, User, ShoppingBag } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
        <Home size={24} />
        <span className="nav-label">Home</span>
      </NavLink>
      <NavLink to="/order" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
        <ShoppingBag size={24} />
        <span className="nav-label">Order</span>
      </NavLink>
      <NavLink to="/loyalty" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
        <Gift size={24} />
        <span className="nav-label">Rewards</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
        <User size={24} />
        <span className="nav-label">Profile</span>
      </NavLink>
    </nav>
  );
}
`;
  }

  return `import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gift, User } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
        <Home size={24} />
        <span className="nav-label">Home</span>
      </NavLink>
      <NavLink to="/loyalty" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
        <Gift size={24} />
        <span className="nav-label">Rewards</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => \`nav-item \${isActive ? 'active' : ''}\`}>
        <User size={24} />
        <span className="nav-label">Profile</span>
      </NavLink>
    </nav>
  );
}
`;
}

function generateQuickActionCard() {
  return `import React from 'react';
import { useNavigate } from 'react-router-dom';

export function QuickActionCard({ icon, label, route, color }) {
  const navigate = useNavigate();

  return (
    <button
      className="card"
      onClick={() => navigate(route)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        cursor: 'pointer',
        border: 'none',
        transition: 'transform 0.2s',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{label}</span>
    </button>
  );
}
`;
}

function generateHomeScreen(quickActions, appName, appType, industry, themeColors = {}) {
  // Filter to only actions that exist in QUICK_ACTION_CONFIG
  const validActions = quickActions.filter(action => QUICK_ACTION_CONFIG[action]);

  // Check if this is a food/restaurant industry that needs ordering
  // Only add separate "Order Online" button if orderFood is NOT already in validActions (to avoid duplicates)
  const isFoodIndustry = ['restaurant', 'steakhouse', 'pizza', 'pizzeria', 'cafe', 'bakery', 'bar', 'brewery', 'winery', 'coffee-shop', 'florist'].includes(industry);
  const hasOrderFoodAction = validActions.includes('orderFood');
  const needsSeparateOrderButton = isFoodIndustry && !hasOrderFoodAction;

  // Use theme colors for action buttons
  const primaryColor = themeColors.primary || '#8b5cf6';
  const accentColor = themeColors.accent || '#10b981';

  // Generate icon imports based on actions
  const iconImports = new Set(['Calendar', 'Book', 'Gift', 'Phone']);
  if (needsSeparateOrderButton || hasOrderFoodAction) iconImports.add('ShoppingBag');

  const actionButtons = [];

  // Add Order Online first for food industries ONLY if orderFood action not already present
  if (needsSeparateOrderButton) {
    actionButtons.push(`    { icon: <ShoppingBag size={28} />, label: 'Order Online', route: '/order', color: '${accentColor}' }`);
  }

  // Add other actions - alternate between primary and accent colors
  let colorToggle = false;
  validActions.forEach(action => {
    const config = QUICK_ACTION_CONFIG[action];
    const iconMap = {
      viewMenu: 'Book',
      makeReservation: 'Calendar',
      viewLoyalty: 'Gift',
      viewRewards: 'Gift',
      bookAppointment: 'Calendar',
      checkIn: 'CheckCircle',
      messages: 'MessageCircle',
      orderFood: 'ShoppingBag',
      dashboard: 'LayoutDashboard',
    };
    const icon = iconMap[action] || 'Star';
    iconImports.add(icon);
    const label = action.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace('View ', '').replace('Make ', '');
    const color = colorToggle ? accentColor : primaryColor;
    colorToggle = !colorToggle;
    actionButtons.push(`    { icon: <${icon} size={28} />, label: '${label}', route: '${config.route}', color: '${color}' }`);
  });

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ${Array.from(iconImports).join(', ')} } from 'lucide-react';
import { BUSINESS_NAME } from '../data/menu';

export function HomeScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
${actionButtons.join(',\n')}
  ];

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 className="screen-title">Welcome to {BUSINESS_NAME}</h1>
        <p className="screen-subtitle">{user?.name || 'Guest'}</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{user?.points?.toLocaleString() || 0}</div>
          <div className="stat-label">Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user?.tier || 'Bronze'}</div>
          <div className="stat-label">Tier</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user?.visits || 0}</div>
          <div className="stat-label">Visits</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Quick Actions</h3>
      <div className="quick-actions-grid">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="card"
            onClick={() => navigate(action.route)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              cursor: 'pointer',
              border: 'none',
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ color: action.color, marginBottom: '8px' }}>{action.icon}</div>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
`;
}

function generateLoginScreen(appName, subdomain) {
  const mainSiteUrl = `https://${subdomain}.be1st.io`;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ExternalLink } from 'lucide-react';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="screen-header">
        <h1 className="screen-title">${appName}</h1>
        <p className="screen-subtitle">Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            color: '#ef4444',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Demo Account Quick Login */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '12px'
      }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Quick Demo Login
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => { setEmail('demo@demo.com'); setPassword('demo1234'); }}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            👤 Customer
          </button>
          <button
            type="button"
            onClick={() => { setEmail('admin@demo.com'); setPassword('admin1234'); }}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '8px',
              color: '#eab308',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            👑 Admin
          </button>
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        padding: '16px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '12px' }}>
          Don't have an account?
        </p>
        <a
          href="${mainSiteUrl}/register"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Create Account on Website <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
`;
}

function generateProfileScreen(appType, businessName, industry) {
  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Settings, HelpCircle, CreditCard, Bell, Shield, ChevronRight, Trophy, Calendar, MapPin, Star, Sun, Moon, Palette } from 'lucide-react';
import { BUSINESS_NAME } from '../data/menu';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Accent color from CSS variables
  const accentColor = 'var(--primary)';
  const accentGradient = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';

  return (
    <div className="screen">
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(var(--primary-rgb, 139, 92, 246), 0.15) 0%, transparent 100%)',
        margin: '-20px -20px 0',
        padding: '30px 20px 40px',
        textAlign: 'center'
      }}>
        {/* Avatar */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: accentGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '3px solid rgba(var(--primary-rgb, 139, 92, 246), 0.3)',
          fontSize: '36px',
          fontWeight: '700',
          color: 'white',
          textTransform: 'uppercase'
        }}>
          {user?.name?.charAt(0) || 'G'}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{user?.name || 'Guest'}</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>{user?.email}</p>

        {/* Member Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(var(--primary-rgb, 139, 92, 246), 0.2)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(var(--primary-rgb, 139, 92, 246), 0.3)'
        }}>
          <Trophy size={14} color={accentColor} />
          <span style={{ color: accentColor, fontSize: '13px', fontWeight: '600' }}>{user?.tier || 'Gold'} Member</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '20px 0' }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: accentColor }}>{user?.points?.toLocaleString() || '2,500'}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>POINTS</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: accentColor }}>{user?.visits || 12}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>VISITS</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: accentColor }}>$1,240</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>SAVED</div>
        </div>
      </div>

      {/* Member Info */}
      <div className="card" style={{ padding: '0', marginBottom: '16px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '0.5px' }}>MEMBER DETAILS</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Calendar size={18} color="rgba(255,255,255,0.4)" />
            <div>
              <div style={{ fontSize: '14px' }}>Member Since</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>January 2024</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={18} color="rgba(255,255,255,0.4)" />
            <div>
              <div style={{ fontSize: '14px' }}>Favorite Location</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{BUSINESS_NAME}</div>
            </div>
          </div>
        </div>

        {/* Favorite Item */}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Star size={18} color={accentColor} fill={accentColor} />
            <div>
              <div style={{ fontSize: '14px' }}>Favorite Order</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>House Special</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: '0', marginBottom: '16px' }}>
        <MenuItem icon={<CreditCard size={20} />} label="Payment Methods" chevron />
        <MenuItem icon={<Bell size={20} />} label="Notifications" chevron />
        <MenuItem icon={<Shield size={20} />} label="Privacy & Security" chevron />
      </div>

      {/* Theme Selector */}
      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Palette size={20} color="var(--primary)" />
          <span style={{ fontSize: '15px', color: 'var(--text)' }}>Display Theme</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'light', label: 'Light', icon: <Sun size={16} /> },
            { id: 'medium', label: 'Medium', icon: <Palette size={16} /> },
            { id: 'dark', label: 'Dark', icon: <Moon size={16} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: theme === t.id ? 'var(--primary)' : 'var(--input-bg)',
                border: theme === t.id ? 'none' : '1px solid var(--card-border)',
                borderRadius: 'var(--radius)',
                color: theme === t.id ? 'white' : 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: theme === t.id ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="card" style={{ padding: '0', marginBottom: '16px' }}>
        <MenuItem icon={<Settings size={20} />} label="App Settings" chevron />
        <MenuItem icon={<HelpCircle size={20} />} label="Help & Support" chevron />
      </div>

      {/* Sign Out */}
      <div className="card" style={{ padding: '0', marginBottom: '24px' }}>
        <MenuItem
          icon={<LogOut size={20} />}
          label="Sign Out"
          onClick={handleLogout}
          danger
        />
      </div>

      {/* App Version */}
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
        {BUSINESS_NAME} App v1.0.0
      </p>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger, chevron }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '16px',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        color: danger ? '#ef4444' : 'rgba(255,255,255,0.8)',
        fontSize: '15px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ color: danger ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {chevron && <ChevronRight size={18} color="rgba(255,255,255,0.3)" />}
    </button>
  );
}
`;
}

function generateAuthHook() {
  return `import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getProfile();
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
`;
}

function generateThemeContext(defaultTheme = 'light') {
  return `import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEMES = ['light', 'medium', 'dark'];

export function ThemeProvider({ children, defaultTheme = '${defaultTheme}' }) {
  const [theme, setThemeState] = useState(() => {
    // Check localStorage first, then use default
    const saved = localStorage.getItem('app-theme');
    return saved && THEMES.includes(saved) ? saved : defaultTheme;
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
`;
}

function generateActionScreen(actionId, config, appType, businessName, industry) {
  const screenName = actionId.charAt(0).toUpperCase() + actionId.slice(1) + 'Screen';
  const title = actionId.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace('View ', '').replace('Make ', '');

  // Generate specialized screens for common actions
  // IMPORTANT: Pass screenName to ensure export name matches filename
  if (actionId === 'viewMenu') {
    return generateMenuScreen(businessName, industry, screenName);
  }
  if (actionId === 'makeReservation') {
    return generateReservationScreen(businessName, industry, screenName);
  }
  if (actionId === 'viewLoyalty' || actionId === 'viewRewards') {
    return generateLoyaltyScreen(businessName, industry, screenName);
  }

  // Generic action screen for other actions
  return `import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const BUSINESS_NAME = "${businessName}";

export function ${screenName}() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="screen">
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '14px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="screen-header">
        <h1 className="screen-title">${title}</h1>
        <p className="screen-subtitle">at {BUSINESS_NAME}</p>
      </div>

      <div className="card">
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          ${title} content syncs with {BUSINESS_NAME}.
        </p>
      </div>
    </div>
  );
}
`;
}

// Generate a proper menu screen that fetches from API with fallback
function generateMenuScreen(businessName, industry, screenName = 'ViewMenuScreen') {
  return `import React, { useState } from 'react';
import { ArrowLeft, Star, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';

export function ${screenName}() {
  const navigate = useNavigate();
  const { menuData, businessName, loading, error } = useMenu();
  const [activeCategory, setActiveCategory] = useState(0);

  if (loading) {
    return (
      <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader size={32} className="animate-spin" style={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  if (!menuData || !menuData.categories || menuData.categories.length === 0) {
    return (
      <div className="screen">
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Menu not available yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="screen-header">
        <h1 className="screen-title">{businessName} Menu</h1>
        <p className="screen-subtitle">Fresh daily selections</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '8px' }}>
        {menuData.categories.map((cat, idx) => (
          <button key={idx} onClick={() => setActiveCategory(idx)}
            style={{ padding: '10px 16px', borderRadius: '20px', border: 'none', background: activeCategory === idx ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: activeCategory === idx ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            {cat.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuData.categories[activeCategory]?.items?.map((item) => (
          <div key={item.id} className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>{item.name}</span>
                  {item.popular && <Star size={14} fill="#f59e0b" color="#f59e0b" />}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>{item.description}</p>
              </div>
              <span style={{ fontWeight: '600', color: '#10b981', fontSize: '16px' }}>\${item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
}

// Generate reservation screen
function generateReservationScreen(businessName, industry, screenName = 'MakeReservationScreen') {
  return `import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Users, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BUSINESS_NAME = "${businessName}";
const TIME_SLOTS = ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

export function ${screenName}() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [booked, setBooked] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { value: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
  });

  if (booked) {
    return (
      <div className="screen">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Reservation Confirmed!</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>{BUSINESS_NAME} • {dates.find(d => d.value === selectedDate)?.label}<br />{selectedTime} • Party of {partySize}</p>
          <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '32px' }}>+150 loyalty points earned!</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        <ArrowLeft size={20} /> Back
      </button>
      <div className="screen-header">
        <h1 className="screen-title">Book a Table</h1>
        <p className="screen-subtitle">at {BUSINESS_NAME}</p>
      </div>

      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}><Users size={20} color="#8b5cf6" /><span style={{ fontWeight: '500' }}>Party Size</span></div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PARTY_SIZES.map(size => (
            <button key={size} onClick={() => setPartySize(size)} style={{ width: '44px', height: '44px', borderRadius: '12px', border: partySize === size ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.2)', background: partySize === size ? 'rgba(139,92,246,0.2)' : 'transparent', color: 'white', fontSize: '16px', cursor: 'pointer' }}>{size}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}><Calendar size={20} color="#8b5cf6" /><span style={{ fontWeight: '500' }}>Select Date</span></div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {dates.map(date => (
            <button key={date.value} onClick={() => setSelectedDate(date.value)} style={{ padding: '12px 16px', borderRadius: '12px', minWidth: '80px', border: selectedDate === date.value ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.2)', background: selectedDate === date.value ? 'rgba(139,92,246,0.2)' : 'transparent', color: 'white', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>{date.label.split(', ')[0]}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}><Clock size={20} color="#8b5cf6" /><span style={{ fontWeight: '500' }}>Select Time</span></div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {TIME_SLOTS.map(time => (
            <button key={time} onClick={() => setSelectedTime(time)} style={{ padding: '10px 16px', borderRadius: '12px', border: selectedTime === time ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.2)', background: selectedTime === time ? 'rgba(139,92,246,0.2)' : 'transparent', color: 'white', fontSize: '14px', cursor: 'pointer' }}>{time}</button>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={() => setBooked(true)} disabled={!selectedDate || !selectedTime} style={{ opacity: (!selectedDate || !selectedTime) ? 0.5 : 1 }}>Book Reservation</button>
    </div>
  );
}
`;
}

// Generate loyalty screen
function generateLoyaltyScreen(businessName, industry, screenName = 'ViewLoyaltyScreen') {
  return `import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, Star, Trophy, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

const BUSINESS_NAME = "${businessName}";

// Default rewards (used as fallback if API unavailable)
const DEFAULT_REWARDS = [
  { id: 1, name: 'Free Appetizer', points: 500, description: 'Any starter from our menu' },
  { id: 2, name: 'Free Dessert', points: 750, description: "Chef's selection dessert" },
  { id: 3, name: '$25 Off', points: 1500, description: 'On orders $75+' },
  { id: 4, name: 'Free Entrée', points: 3000, description: 'Up to $50 value' },
];
const DEFAULT_TIERS = [
  { name: 'Bronze', minPoints: 0, perks: ['Earn 1pt per $1', 'Birthday reward'] },
  { name: 'Silver', minPoints: 1000, perks: ['Earn 1.25pt per $1', 'Priority seating'] },
  { name: 'Gold', minPoints: 2500, perks: ['Earn 1.5pt per $1', 'Complimentary valet'] },
  { name: 'Platinum', minPoints: 5000, perks: ['Earn 2pt per $1', 'Exclusive events'] },
];

export function ${screenName}() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  // Fetch loyalty data from API
  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const data = await api.get('/api/loyalty');
        if (data.rewards?.length > 0) setRewards(data.rewards);
        if (data.tiers?.length > 0) setTiers(data.tiers);
      } catch (err) {
        // API unavailable, use defaults
        console.log('Using default loyalty data');
      } finally {
        setLoading(false);
      }
    };
    fetchLoyaltyData();
  }, []);

  const handleRedeem = async (reward) => {
    if (currentPoints < reward.points) return;
    setRedeeming(reward.id);
    try {
      await api.post('/api/loyalty/redeem', { rewardId: reward.id });
      alert(\`Redeemed: \${reward.name}! Check your email for details.\`);
    } catch (err) {
      alert('Redemption successful! (Demo mode)');
    } finally {
      setRedeeming(null);
    }
  };

  const currentPoints = user?.points || 0;
  const currentTier = user?.tier || 'Bronze';
  const currentTierData = tiers.find(t => t.name === currentTier) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTierData) + 1];
  const progressToNext = nextTier ? ((currentPoints - currentTierData.minPoints) / (nextTier.minPoints - currentTierData.minPoints)) * 100 : 100;

  return (
    <div className="screen">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        <ArrowLeft size={20} /> Back
      </button>
      <div className="screen-header">
        <h1 className="screen-title">{BUSINESS_NAME} Rewards</h1>
        <p className="screen-subtitle">Your loyalty benefits</p>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', marginBottom: '20px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>AVAILABLE POINTS</div>
            <div style={{ fontSize: '36px', fontWeight: '700' }}>{currentPoints.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={16} /><span style={{ fontWeight: '600' }}>{currentTier}</span>
          </div>
        </div>
        {nextTier && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
              <span>{nextTier.minPoints - currentPoints} pts to {nextTier.name}</span>
              <span>{Math.round(progressToNext)}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: \`\${progressToNext}%\`, background: 'white', borderRadius: '3px' }} />
            </div>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255,255,255,0.6)' }}>YOUR {currentTier.toUpperCase()} PERKS</h3>
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        {currentTierData.perks.map((perk, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: idx < currentTierData.perks.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" /><span>{perk}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'rgba(255,255,255,0.6)' }}>REDEEM REWARDS</h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader className="spin" size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.5)' }}>Loading rewards...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rewards.map(reward => {
            const canRedeem = currentPoints >= reward.points;
            const isRedeeming = redeeming === reward.id;
            return (
              <div key={reward.id} className="card" style={{ padding: '16px', opacity: canRedeem ? 1 : 0.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Gift size={18} color="#8b5cf6" /><span style={{ fontWeight: '600' }}>{reward.name}</span></div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{reward.description}</p>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem || isRedeeming}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: canRedeem ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: canRedeem && !isRedeeming ? 'pointer' : 'not-allowed' }}
                  >
                    {isRedeeming ? 'Redeeming...' : \`\${reward.points.toLocaleString()} pts\`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
`;
}

// Get industry-specific menu items
function getIndustryMenuItems(industry) {
  const menus = {
    steakhouse: {
      categories: [
        { name: 'Signature Steaks', items: [
          { id: 1, name: 'Filet Mignon', description: '8oz center-cut, butter-basted', price: 52, popular: true },
          { id: 2, name: 'Ribeye', description: '14oz bone-in, dry-aged 28 days', price: 58, popular: true },
          { id: 3, name: 'NY Strip', description: '12oz prime cut, herb-crusted', price: 48 },
        ]},
        { name: 'Starters', items: [
          { id: 4, name: 'Shrimp Cocktail', description: 'Jumbo gulf shrimp, house cocktail sauce', price: 18 },
          { id: 5, name: 'French Onion Soup', description: 'Gruyère crouton, caramelized onions', price: 14 },
        ]},
        { name: 'Sides', items: [
          { id: 6, name: 'Truffle Mac & Cheese', description: 'Black truffle, aged cheddar', price: 16 },
          { id: 7, name: 'Creamed Spinach', description: 'House recipe, nutmeg cream', price: 12 },
        ]}
      ]
    },
    pizza: {
      categories: [
        { name: 'Pizzas', items: [
          { id: 1, name: 'Margherita', description: 'San Marzano tomatoes, fresh mozzarella, basil', price: 18, popular: true },
          { id: 2, name: 'Pepperoni', description: 'Cup & char pepperoni, mozzarella', price: 20, popular: true },
          { id: 3, name: 'Supreme', description: 'Pepperoni, sausage, peppers, onions, olives', price: 24 },
        ]},
        { name: 'Appetizers', items: [
          { id: 4, name: 'Garlic Knots', description: 'Fresh baked, garlic butter, parmesan', price: 8 },
          { id: 5, name: 'Mozzarella Sticks', description: 'Hand-breaded, marinara sauce', price: 10 },
        ]}
      ]
    },
    default: {
      categories: [
        { name: 'Main Dishes', items: [
          { id: 1, name: 'House Special', description: 'Chef\'s signature dish', price: 28, popular: true },
          { id: 2, name: 'Daily Feature', description: 'Ask your server for today\'s selection', price: 24 },
        ]},
        { name: 'Starters', items: [
          { id: 3, name: 'Soup of the Day', description: 'Made fresh daily', price: 8 },
          { id: 4, name: 'House Salad', description: 'Mixed greens, house dressing', price: 10 },
        ]}
      ]
    }
  };
  return menus[industry] || menus.default;
}

// Generate shared menu data file
function generateMenuData(businessName, industry) {
  const menuItems = getIndustryMenuItems(industry);
  return `// Shared menu data - synced across Menu and Order screens
export const MENU_DATA = ${JSON.stringify(menuItems, null, 2)};

export const BUSINESS_NAME = "${businessName}";
`;
}

// Generate Order screen with cart functionality and API integration
function generateOrderScreen(businessName, industry) {
  return `import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingBag, Check, Star, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { api } from '../services/api';

export function OrderScreen() {
  const navigate = useNavigate();
  const { menuData, businessName, loading: menuLoading } = useMenu();
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentType, setPaymentType] = useState('cash'); // 'cash' or 'card'

  const addToCart = (item) => setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  const removeFromCart = (item) => setCart(prev => {
    const newCart = { ...prev };
    if (newCart[item.id] > 1) newCart[item.id]--;
    else delete newCart[item.id];
    return newCart;
  });

  const getCartCount = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const getCartTotal = () => {
    let total = 0;
    if (menuData?.categories) {
      menuData.categories.forEach(cat => cat.items?.forEach(item => {
        if (cart[item.id]) total += item.price * cart[item.id];
      }));
    }
    return total;
  };
  const getCartItems = () => {
    const items = [];
    if (menuData?.categories) {
      menuData.categories.forEach(cat => cat.items?.forEach(item => {
        if (cart[item.id]) items.push({ ...item, qty: cart[item.id], quantity: cart[item.id] });
      }));
    }
    return items;
  };

  // Place order via API
  const placeOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const orderData = {
        items: getCartItems(),
        total: getCartTotal(),
        source: 'app',
        paymentType: paymentType
      };
      const result = await api.post('/api/orders', orderData);
      if (result.success) {
        setOrderId(result.order?.id || 'NEW');
        setOrderPlaced(true);
      } else {
        setError(result.error || 'Failed to place order');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while fetching menu
  if (menuLoading) {
    return (
      <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader size={32} className="animate-spin" style={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  // Handle no menu data
  if (!menuData || !menuData.categories || menuData.categories.length === 0) {
    return (
      <div className="screen">
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Online ordering not available yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    const pointsEarned = Math.floor(getCartTotal());
    return (
      <div className="screen">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Order Placed!</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Your order from {businessName} is being prepared</p>
          <div className="card" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>ORDER SUMMARY</h4>
            {getCartItems().map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span>{item.qty}x {item.name}</span>
                <span>\${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: '600', fontSize: '18px' }}>
              <span>Total</span>
              <span>\${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
          <p style={{ color: '#10b981', fontSize: '16px', fontWeight: '600', marginBottom: '32px' }}>+{pointsEarned} loyalty points earned!</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingBottom: getCartCount() > 0 ? '140px' : '20px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        <ArrowLeft size={20} /> Back
      </button>
      <div className="screen-header">
        <h1 className="screen-title">Order Online</h1>
        <p className="screen-subtitle">from {businessName}</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '8px' }}>
        {menuData.categories.map((cat, idx) => (
          <button key={idx} onClick={() => setActiveCategory(idx)}
            style={{ padding: '10px 16px', borderRadius: '20px', border: 'none', background: activeCategory === idx ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: activeCategory === idx ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            {cat.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuData.categories[activeCategory]?.items?.map((item) => (
          <div key={item.id} className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>{item.name}</span>
                  {item.popular && <Star size={14} fill="#f59e0b" color="#f59e0b" />}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>{item.description}</p>
                <span style={{ fontWeight: '600', color: '#10b981', fontSize: '16px', display: 'block', marginTop: '8px' }}>\${item.price}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {cart[item.id] > 0 ? (
                  <>
                    <button onClick={() => removeFromCart(item)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={16} /></button>
                    <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{cart[item.id]}</span>
                    <button onClick={() => addToCart(item)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={16} /></button>
                  </>
                ) : (
                  <button onClick={() => addToCart(item)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: '#8b5cf6', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Add</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {getCartCount() > 0 && (
        <div style={{ position: 'fixed', bottom: '80px', left: '0', right: '0', padding: '16px 20px', background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 100 }}>
          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px', textAlign: 'center' }}>{error}</p>}
          {/* Payment Type Selection */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <button onClick={() => setPaymentType('cash')} style={{ flex: 1, padding: '12px', background: paymentType === 'cash' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)', border: paymentType === 'cash' ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              Cash on Pickup
            </button>
            <button onClick={() => setPaymentType('card')} style={{ flex: 1, padding: '12px', background: paymentType === 'card' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)', border: paymentType === 'card' ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              Pay with Card
            </button>
          </div>
          <button onClick={placeOrder} disabled={loading} style={{ width: '100%', padding: '16px', background: loading ? 'rgba(139, 92, 246, 0.5)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontSize: '16px', fontWeight: '600', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {loading ? <><Loader size={20} className="animate-spin" /> Placing Order...</> : <><ShoppingBag size={20} /> Place Order • \${getCartTotal().toFixed(2)}<span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '14px' }}>{getCartCount()} items</span></>}
          </button>
        </div>
      )}
    </div>
  );
}
`;
}

// Generate useMenu hook for API-driven menu
function generateMenuHook() {
  return `import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MENU_DATA as FALLBACK_MENU, BUSINESS_NAME as FALLBACK_NAME } from '../data/menu';

export function useMenu() {
  const [menuData, setMenuData] = useState(null);
  const [businessName, setBusinessName] = useState(FALLBACK_NAME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get('/api/menu');
        if (response.success && response.menu) {
          setMenuData(response.menu);
          if (response.business?.name) {
            setBusinessName(response.business.name);
          }
        } else {
          setMenuData(FALLBACK_MENU);
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err.message);
        setMenuData(FALLBACK_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  return { menuData, businessName, loading, error };
}
`;
}

/**
 * Generate a simple SVG favicon
 */
function generateFaviconSvg(themeColors = {}) {
  const primaryColor = themeColors.primary || '#8b5cf6';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${primaryColor}"/>
  <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
</svg>`;
}

/**
 * Generate an SVG app icon
 */
function generateIconSvg(size, appName, themeColors = {}) {
  const primaryColor = themeColors.primary || '#8b5cf6';
  const initial = (appName || 'A').charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="${primaryColor}"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-weight="bold" font-size="${size * 0.5}">${initial}</text>
</svg>`;
}

// ============================================
// COMPANION APP PREVIEW GENERATOR
// Zero-cost visual testing in Style Preview Admin
// ============================================

/**
 * Generate companion app preview HTML for zero-cost testing
 * @param {Object} config - Preview configuration
 * @param {string} config.industry - Industry key
 * @param {string} config.businessName - Business name
 * @param {Object} config.moodSliders - Mood slider values
 * @param {Object} config.colors - Industry colors
 * @returns {Object} Screen HTML keyed by screen name
 */
function generateCompanionPreview(config) {
  const { industry, businessName, moodSliders = {}, colors = {} } = config;

  // Get industry theme
  const industryTheme = getIndustryDefaultTheme(industry);
  const theme = moodSliders?.theme || industryTheme.mode || 'light';

  // Determine colors based on theme
  const primary = colors.primary || industryTheme.primary;
  const accent = colors.accent || industryTheme.accent;
  const primaryRgb = hexToRgb(primary);

  // Theme-specific colors
  const themeColors = {
    light: {
      background: '#ffffff',
      surface: '#f8fafc',
      cardBg: '#ffffff',
      cardBorder: 'rgba(0,0,0,0.08)',
      text: '#1a1a2e',
      textMuted: '#64748b',
      navBg: 'rgba(255,255,255,0.95)',
      inputBg: '#f8fafc'
    },
    medium: {
      background: '#e8e8e8',
      surface: '#f0f0f0',
      cardBg: '#f5f5f5',
      cardBorder: 'rgba(0,0,0,0.1)',
      text: '#1f2937',
      textMuted: '#4b5563',
      navBg: 'rgba(240,240,240,0.95)',
      inputBg: '#e5e5e5'
    },
    dark: {
      background: '#0a0a0f',
      surface: '#1a1a2e',
      cardBg: 'rgba(255,255,255,0.05)',
      cardBorder: 'rgba(255,255,255,0.1)',
      text: '#f1f5f9',
      textMuted: 'rgba(255,255,255,0.6)',
      navBg: 'rgba(10,10,15,0.95)',
      inputBg: 'rgba(255,255,255,0.05)'
    }
  };

  const tc = themeColors[theme] || themeColors.light;
  const borderRadius = industryTheme.borderRadius || '12px';

  // Common CSS for all screens
  const commonCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --primary: ${primary};
      --primary-rgb: ${primaryRgb};
      --accent: ${accent};
      --background: ${tc.background};
      --surface: ${tc.surface};
      --card-bg: ${tc.cardBg};
      --card-border: ${tc.cardBorder};
      --text: ${tc.text};
      --text-muted: ${tc.textMuted};
      --nav-bg: ${tc.navBg};
      --input-bg: ${tc.inputBg};
      --radius: ${borderRadius};
    }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--background);
      color: var(--text);
      min-height: 100vh;
      padding-bottom: 80px;
    }

    .screen { padding: 20px; }
    .screen-header { text-align: center; padding: 20px 0 30px; }
    .screen-title { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .screen-subtitle { font-size: 14px; color: var(--text-muted); }

    .card {
      background: var(--card-bg);
      border-radius: var(--radius);
      padding: 20px;
      border: 1px solid var(--card-border);
      margin-bottom: 16px;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 20px;
    }

    .quick-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      text-decoration: none;
      color: var(--text);
    }

    .quick-action-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(${primaryRgb}, 0.1);
      border-radius: calc(var(--radius) * 0.7);
      color: var(--primary);
      font-size: 20px;
    }

    .quick-action-label { font-size: 13px; font-weight: 500; }

    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: var(--nav-bg);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--card-border);
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 10px;
    }

    .nav-item.active { color: var(--primary); }

    .stats-row {
      display: flex;
      gap: 12px;
      margin: 20px 0;
    }

    .stat-card {
      flex: 1;
      text-align: center;
      padding: 16px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
    }

    .stat-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .theme-toggle {
      padding: 16px;
      margin-bottom: 16px;
    }

    .theme-toggle-label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      font-size: 15px;
    }

    .theme-buttons {
      display: flex;
      gap: 8px;
    }

    .theme-btn {
      flex: 1;
      padding: 12px 8px;
      background: var(--input-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      color: var(--text-muted);
      font-size: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .theme-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), ${darkenColor(primary)});
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 32px;
      font-weight: 700;
      color: white;
    }
  `;

  // Generate Home screen
  const homeScreen = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${commonCSS}</style></head>
<body>
  <div class="screen">
    <div class="screen-header">
      <h1 class="screen-title">Welcome back!</h1>
      <p class="screen-subtitle">${businessName}</p>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">2,450</div>
        <div class="stat-label">POINTS</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">12</div>
        <div class="stat-label">VISITS</div>
      </div>
    </div>

    <div class="quick-actions">
      <a class="quick-action">
        <div class="quick-action-icon">📋</div>
        <span class="quick-action-label">View Menu</span>
      </a>
      <a class="quick-action">
        <div class="quick-action-icon">📅</div>
        <span class="quick-action-label">Reservations</span>
      </a>
      <a class="quick-action">
        <div class="quick-action-icon">🎁</div>
        <span class="quick-action-label">Rewards</span>
      </a>
      <a class="quick-action">
        <div class="quick-action-icon">⭐</div>
        <span class="quick-action-label">Loyalty</span>
      </a>
    </div>
  </div>

  <nav class="bottom-nav">
    <a class="nav-item active">
      <span style="font-size: 20px">🏠</span>
      <span>Home</span>
    </a>
    <a class="nav-item">
      <span style="font-size: 20px">🎁</span>
      <span>Rewards</span>
    </a>
    <a class="nav-item">
      <span style="font-size: 20px">👤</span>
      <span>Profile</span>
    </a>
  </nav>
</body></html>`;

  // Generate Profile screen with theme toggle
  const profileScreen = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${commonCSS}</style></head>
<body>
  <div class="screen">
    <div class="screen-header">
      <div class="profile-avatar">J</div>
      <h1 class="screen-title">John Doe</h1>
      <p class="screen-subtitle">john@example.com</p>
      <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(${primaryRgb}, 0.2); padding: 6px 14px; border-radius: 20px; margin-top: 12px;">
        <span style="color: var(--primary); font-size: 13px; font-weight: 600;">⭐ Gold Member</span>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">2,450</div>
        <div class="stat-label">POINTS</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">12</div>
        <div class="stat-label">VISITS</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">$240</div>
        <div class="stat-label">SAVED</div>
      </div>
    </div>

    <!-- Theme Toggle -->
    <div class="card theme-toggle">
      <div class="theme-toggle-label">
        <span style="color: var(--primary);">🎨</span>
        <span>Display Theme</span>
      </div>
      <div class="theme-buttons">
        <button class="theme-btn ${theme === 'light' ? 'active' : ''}" onclick="setTheme('light')">
          <span>☀️</span>
          <span>Light</span>
        </button>
        <button class="theme-btn ${theme === 'medium' ? 'active' : ''}" onclick="setTheme('medium')">
          <span>🎨</span>
          <span>Medium</span>
        </button>
        <button class="theme-btn ${theme === 'dark' ? 'active' : ''}" onclick="setTheme('dark')">
          <span>🌙</span>
          <span>Dark</span>
        </button>
      </div>
    </div>

    <div class="card" style="padding: 0;">
      <div style="padding: 14px 16px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; gap: 12px;">
        <span style="color: var(--primary);">💳</span>
        <span>Payment Methods</span>
      </div>
      <div style="padding: 14px 16px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; gap: 12px;">
        <span style="color: var(--primary);">🔔</span>
        <span>Notifications</span>
      </div>
      <div style="padding: 14px 16px; display: flex; align-items: center; gap: 12px;">
        <span style="color: var(--primary);">🔒</span>
        <span>Privacy & Security</span>
      </div>
    </div>

    <button class="btn-primary" style="background: transparent; border: 1px solid #ef4444; color: #ef4444;">
      Sign Out
    </button>
  </div>

  <nav class="bottom-nav">
    <a class="nav-item">
      <span style="font-size: 20px">🏠</span>
      <span>Home</span>
    </a>
    <a class="nav-item">
      <span style="font-size: 20px">🎁</span>
      <span>Rewards</span>
    </a>
    <a class="nav-item active">
      <span style="font-size: 20px">👤</span>
      <span>Profile</span>
    </a>
  </nav>

  <script>
    function setTheme(theme) {
      // In preview, just show visual feedback
      document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
      event.target.closest('.theme-btn').classList.add('active');
    }
  </script>
</body></html>`;

  // Generate Rewards screen
  const rewardsScreen = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${commonCSS}</style></head>
<body>
  <div class="screen">
    <div class="screen-header">
      <h1 class="screen-title">Rewards</h1>
      <p class="screen-subtitle">Redeem your points for exclusive rewards</p>
    </div>

    <div class="card" style="text-align: center; padding: 24px;">
      <div style="font-size: 36px; font-weight: 700; color: var(--primary);">2,450</div>
      <div style="font-size: 13px; color: var(--text-muted);">Available Points</div>
      <div style="margin-top: 16px; padding: 10px 20px; background: rgba(${primaryRgb}, 0.1); border-radius: 20px; display: inline-block;">
        <span style="color: var(--primary); font-weight: 600;">550 points until next reward</span>
      </div>
    </div>

    <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin: 20px 0 12px;">Available Rewards</div>

    <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 600;">Free Appetizer</div>
        <div style="font-size: 13px; color: var(--text-muted);">Any appetizer on the menu</div>
      </div>
      <button style="padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-weight: 600; font-size: 13px;">500 pts</button>
    </div>

    <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 600;">$10 Off</div>
        <div style="font-size: 13px; color: var(--text-muted);">Your next order</div>
      </div>
      <button style="padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-weight: 600; font-size: 13px;">1,000 pts</button>
    </div>

    <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 600;">Free Dessert</div>
        <div style="font-size: 13px; color: var(--text-muted);">Chef's selection</div>
      </div>
      <button style="padding: 8px 16px; background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text-muted); border-radius: var(--radius); font-weight: 600; font-size: 13px;">2,500 pts</button>
    </div>
  </div>

  <nav class="bottom-nav">
    <a class="nav-item">
      <span style="font-size: 20px">🏠</span>
      <span>Home</span>
    </a>
    <a class="nav-item active">
      <span style="font-size: 20px">🎁</span>
      <span>Rewards</span>
    </a>
    <a class="nav-item">
      <span style="font-size: 20px">👤</span>
      <span>Profile</span>
    </a>
  </nav>
</body></html>`;

  return {
    home: homeScreen,
    profile: profileScreen,
    rewards: rewardsScreen
  };
}

/**
 * Generate SANDBOX companion app preview with Mock API and real fixture data
 * This is the full interactive version for demo purposes
 */
function generateCompanionPreviewSandbox(config) {
  const { industry, businessName, moodSliders = {}, colors = {}, sandboxMode, fixture } = config;

  // If not sandbox mode, just use the regular generator
  if (!sandboxMode || !fixture) {
    return generateCompanionPreview(config);
  }

  // Get industry theme
  const industryTheme = getIndustryDefaultTheme(industry);
  const theme = moodSliders?.theme || industryTheme.mode || 'light';

  const primary = colors.primary || industryTheme.primary;
  const accent = colors.accent || industryTheme.accent;
  const primaryRgb = hexToRgb(primary);

  // Theme-specific colors
  const themeColors = {
    light: { background: '#ffffff', surface: '#f8fafc', cardBg: '#ffffff', cardBorder: 'rgba(0,0,0,0.08)', text: '#1a1a2e', textMuted: '#64748b', navBg: 'rgba(255,255,255,0.95)', inputBg: '#f8fafc' },
    medium: { background: '#e8e8e8', surface: '#f0f0f0', cardBg: '#f5f5f5', cardBorder: 'rgba(0,0,0,0.1)', text: '#1f2937', textMuted: '#4b5563', navBg: 'rgba(240,240,240,0.95)', inputBg: '#e5e5e5' },
    dark: { background: '#0a0a0f', surface: '#1a1a2e', cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.1)', text: '#f1f5f9', textMuted: 'rgba(255,255,255,0.6)', navBg: 'rgba(10,10,15,0.95)', inputBg: 'rgba(255,255,255,0.05)' }
  };

  const tc = themeColors[theme] || themeColors.light;
  const borderRadius = industryTheme.borderRadius || '12px';

  // Menu/Services from fixture
  const menuData = fixture.menu || fixture.services || [];
  const loyaltyData = fixture.loyalty || { rewards: [], pointsPerDollar: 10 };
  const businessData = fixture.business || { name: businessName };

  // Common CSS
  const commonCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: ${primary}; --primary-rgb: ${primaryRgb}; --accent: ${accent};
      --background: ${tc.background}; --surface: ${tc.surface}; --card-bg: ${tc.cardBg};
      --card-border: ${tc.cardBorder}; --text: ${tc.text}; --text-muted: ${tc.textMuted};
      --nav-bg: ${tc.navBg}; --input-bg: ${tc.inputBg}; --radius: ${borderRadius};
    }
    body { font-family: 'Inter', system-ui, sans-serif; background: var(--background); color: var(--text); min-height: 100vh; padding-bottom: 80px; }
    .screen { padding: 20px; }
    .screen-header { text-align: center; padding: 20px 0 30px; }
    .screen-title { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .screen-subtitle { font-size: 14px; color: var(--text-muted); }
    .card { background: var(--card-bg); border-radius: var(--radius); padding: 20px; border: 1px solid var(--card-border); margin-bottom: 16px; }
    .btn-primary { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-size: 16px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }
    .quick-action { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 16px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); text-decoration: none; color: var(--text); cursor: pointer; }
    .quick-action:hover { border-color: var(--primary); }
    .quick-action-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(${primaryRgb}, 0.1); border-radius: calc(var(--radius) * 0.7); color: var(--primary); font-size: 20px; }
    .quick-action-label { font-size: 13px; font-weight: 500; }
    .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 70px; background: var(--nav-bg); backdrop-filter: blur(20px); border-top: 1px solid var(--card-border); display: flex; justify-content: space-around; align-items: center; }
    .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 16px; color: var(--text-muted); text-decoration: none; font-size: 10px; cursor: pointer; }
    .nav-item.active { color: var(--primary); }
    .stats-row { display: flex; gap: 12px; margin: 20px 0; }
    .stat-card { flex: 1; text-align: center; padding: 16px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); }
    .stat-value { font-size: 24px; font-weight: 700; color: var(--primary); }
    .stat-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .menu-item { display: flex; gap: 12px; padding: 16px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius); margin-bottom: 12px; }
    .menu-item-image { width: 80px; height: 80px; border-radius: calc(var(--radius) * 0.7); object-fit: cover; }
    .menu-item-info { flex: 1; }
    .menu-item-name { font-weight: 600; margin-bottom: 4px; }
    .menu-item-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
    .menu-item-price { font-weight: 700; color: var(--primary); }
    .add-btn { padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-weight: 600; font-size: 13px; cursor: pointer; }
    .cart-badge { position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; background: #ef4444; color: white; border-radius: 50%; font-size: 11px; display: flex; align-items: center; justify-content: center; }
    .category-title { font-size: 18px; font-weight: 700; margin: 24px 0 16px; padding-bottom: 8px; border-bottom: 2px solid var(--primary); }
    .toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: #1a1a2e; color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; z-index: 1000; animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    .sandbox-indicator { position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(90deg, #f59e0b, #d97706); color: #000; text-align: center; padding: 4px; font-size: 11px; font-weight: 600; z-index: 9999; }
  `;

  // Generate menu items HTML from fixture
  const menuItemsHtml = menuData.map((category, catIdx) => `
    <div class="category-title">${category.category}</div>
    ${(category.items || []).map((item, itemIdx) => `
      <div class="menu-item" data-item-id="${item.id}">
        ${item.image ? `<img src="${item.image}" class="menu-item-image" alt="${item.name}" onerror="this.style.display='none'">` : ''}
        <div class="menu-item-info">
          <div class="menu-item-name">${item.name}</div>
          <div class="menu-item-desc">${item.description || ''}</div>
          <div class="menu-item-price">$${(item.price || 0).toFixed(2)}</div>
        </div>
        <button class="add-btn" onclick="addToCart('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price || 0})">Add</button>
      </div>
    `).join('')}
  `).join('');

  // Generate rewards HTML from fixture
  const rewardsHtml = (loyaltyData.rewards || []).map(reward => `
    <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 600;">${reward.name}</div>
        <div style="font-size: 13px; color: var(--text-muted);">${reward.description || ''}</div>
      </div>
      <button class="add-btn" onclick="redeemReward('${reward.id}', '${reward.name.replace(/'/g, "\\'")}', ${reward.points})">${reward.points} pts</button>
    </div>
  `).join('');

  // Home screen with working menu
  const homeScreen = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${commonCSS}</style></head>
<body>
  <div class="sandbox-indicator">🧪 SANDBOX MODE - ${businessData.name}</div>
  <div class="screen" style="padding-top: 30px;">
    <div class="screen-header">
      <h1 class="screen-title">Welcome back!</h1>
      <p class="screen-subtitle">${businessData.name}</p>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value" id="points-display">2,450</div>
        <div class="stat-label">POINTS</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="visits-display">12</div>
        <div class="stat-label">VISITS</div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="quick-action" onclick="showScreen('menu')">
        <div class="quick-action-icon">📋</div>
        <span class="quick-action-label">View Menu</span>
      </div>
      <div class="quick-action" onclick="showScreen('cart')" style="position: relative;">
        <div class="quick-action-icon">🛒</div>
        <span class="quick-action-label">Cart</span>
        <span class="cart-badge" id="cart-count" style="display: none;">0</span>
      </div>
      <div class="quick-action" onclick="showScreen('rewards')">
        <div class="quick-action-icon">🎁</div>
        <span class="quick-action-label">Rewards</span>
      </div>
      <div class="quick-action" onclick="showScreen('orders')">
        <div class="quick-action-icon">📦</div>
        <span class="quick-action-label">Orders</span>
      </div>
    </div>
  </div>

  <nav class="bottom-nav">
    <a class="nav-item active"><span style="font-size: 20px">🏠</span><span>Home</span></a>
    <a class="nav-item" onclick="showScreen('menu')"><span style="font-size: 20px">📋</span><span>Menu</span></a>
    <a class="nav-item" onclick="showScreen('profile')"><span style="font-size: 20px">👤</span><span>Profile</span></a>
  </nav>

  <script>
    // Simple localStorage-based state
    let cart = JSON.parse(localStorage.getItem('demo_cart') || '{"items":[],"total":0}');
    let userPoints = 2450;

    function updateCartBadge() {
      const badge = document.getElementById('cart-count');
      const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    function addToCart(id, name, price) {
      const existing = cart.items.find(i => i.id === id);
      if (existing) {
        existing.quantity++;
      } else {
        cart.items.push({ id, name, price, quantity: 1 });
      }
      cart.total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      localStorage.setItem('demo_cart', JSON.stringify(cart));
      updateCartBadge();
      showToast('Added ' + name + ' to cart!');
    }

    function showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    function showScreen(screen) {
      showToast('Navigate to ' + screen + ' screen');
    }

    updateCartBadge();
  </script>
</body></html>`;

  // Menu screen with real items
  const menuScreen = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${commonCSS}</style></head>
<body>
  <div class="sandbox-indicator">🧪 SANDBOX MODE - ${businessData.name}</div>
  <div class="screen" style="padding-top: 30px;">
    <div class="screen-header">
      <h1 class="screen-title">Menu</h1>
      <p class="screen-subtitle">${businessData.tagline || 'Order your favorites'}</p>
    </div>

    ${menuItemsHtml || '<p style="text-align: center; color: var(--text-muted);">No menu items available</p>'}
  </div>

  <nav class="bottom-nav">
    <a class="nav-item" onclick="showScreen('home')"><span style="font-size: 20px">🏠</span><span>Home</span></a>
    <a class="nav-item active"><span style="font-size: 20px">📋</span><span>Menu</span></a>
    <a class="nav-item" onclick="showScreen('profile')"><span style="font-size: 20px">👤</span><span>Profile</span></a>
  </nav>

  <script>
    let cart = JSON.parse(localStorage.getItem('demo_cart') || '{"items":[],"total":0}');

    function addToCart(id, name, price) {
      const existing = cart.items.find(i => i.id === id);
      if (existing) {
        existing.quantity++;
      } else {
        cart.items.push({ id, name, price, quantity: 1 });
      }
      cart.total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      localStorage.setItem('demo_cart', JSON.stringify(cart));
      showToast('Added ' + name + ' to cart!');
    }

    function showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    function showScreen(screen) { showToast('Navigate to ' + screen); }
  </script>
</body></html>`;

  // Rewards screen
  const rewardsScreen = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${commonCSS}</style></head>
<body>
  <div class="sandbox-indicator">🧪 SANDBOX MODE - ${businessData.name}</div>
  <div class="screen" style="padding-top: 30px;">
    <div class="screen-header">
      <h1 class="screen-title">Rewards</h1>
      <p class="screen-subtitle">Redeem your points</p>
    </div>

    <div class="card" style="text-align: center; padding: 24px;">
      <div style="font-size: 36px; font-weight: 700; color: var(--primary);" id="points-display">2,450</div>
      <div style="font-size: 13px; color: var(--text-muted);">Available Points</div>
    </div>

    <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin: 20px 0 12px;">Available Rewards</div>
    ${rewardsHtml || '<p style="text-align: center; color: var(--text-muted);">No rewards available</p>'}
  </div>

  <nav class="bottom-nav">
    <a class="nav-item" onclick="showScreen('home')"><span style="font-size: 20px">🏠</span><span>Home</span></a>
    <a class="nav-item active"><span style="font-size: 20px">🎁</span><span>Rewards</span></a>
    <a class="nav-item" onclick="showScreen('profile')"><span style="font-size: 20px">👤</span><span>Profile</span></a>
  </nav>

  <script>
    let userPoints = 2450;

    function redeemReward(id, name, cost) {
      if (userPoints >= cost) {
        userPoints -= cost;
        document.getElementById('points-display').textContent = userPoints.toLocaleString();
        showToast('Redeemed: ' + name + '!');
      } else {
        showToast('Not enough points');
      }
    }

    function showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    function showScreen(screen) { showToast('Navigate to ' + screen); }
  </script>
</body></html>`;

  // Profile screen with theme toggle
  const profileScreen = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${commonCSS}
  .theme-buttons { display: flex; gap: 8px; }
  .theme-btn { flex: 1; padding: 12px 8px; background: var(--input-bg); border: 1px solid var(--card-border); border-radius: var(--radius); color: var(--text-muted); font-size: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .theme-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
  .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), ${darkenColor(primary)}); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; font-weight: 700; color: white; }
</style></head>
<body>
  <div class="sandbox-indicator">🧪 SANDBOX MODE - ${businessData.name}</div>
  <div class="screen" style="padding-top: 30px;">
    <div class="screen-header">
      <div class="profile-avatar">J</div>
      <h1 class="screen-title">John Demo</h1>
      <p class="screen-subtitle">demo@test.com</p>
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">2,450</div><div class="stat-label">POINTS</div></div>
      <div class="stat-card"><div class="stat-value">12</div><div class="stat-label">VISITS</div></div>
      <div class="stat-card"><div class="stat-value">$240</div><div class="stat-label">SAVED</div></div>
    </div>

    <div class="card">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span style="color: var(--primary);">🎨</span>
        <span style="font-size: 15px;">Display Theme</span>
      </div>
      <div class="theme-buttons">
        <button class="theme-btn ${theme === 'light' ? 'active' : ''}" onclick="setTheme('light')"><span>☀️</span><span>Light</span></button>
        <button class="theme-btn ${theme === 'medium' ? 'active' : ''}" onclick="setTheme('medium')"><span>🎨</span><span>Medium</span></button>
        <button class="theme-btn ${theme === 'dark' ? 'active' : ''}" onclick="setTheme('dark')"><span>🌙</span><span>Dark</span></button>
      </div>
    </div>

    <div class="card" style="padding: 0;">
      <div style="padding: 14px 16px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; gap: 12px;"><span style="color: var(--primary);">💳</span><span>Payment Methods</span></div>
      <div style="padding: 14px 16px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; gap: 12px;"><span style="color: var(--primary);">🔔</span><span>Notifications</span></div>
      <div style="padding: 14px 16px; display: flex; align-items: center; gap: 12px;"><span style="color: var(--primary);">🔒</span><span>Privacy & Security</span></div>
    </div>
  </div>

  <nav class="bottom-nav">
    <a class="nav-item" onclick="showScreen('home')"><span style="font-size: 20px">🏠</span><span>Home</span></a>
    <a class="nav-item" onclick="showScreen('rewards')"><span style="font-size: 20px">🎁</span><span>Rewards</span></a>
    <a class="nav-item active"><span style="font-size: 20px">👤</span><span>Profile</span></a>
  </nav>

  <script>
    function setTheme(theme) {
      document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
      event.target.closest('.theme-btn').classList.add('active');
      showToast('Theme set to ' + theme);
    }
    function showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
    function showScreen(screen) { showToast('Navigate to ' + screen); }
  </script>
</body></html>`;

  return {
    home: homeScreen,
    menu: menuScreen,
    rewards: rewardsScreen,
    profile: profileScreen
  };
}

module.exports = {
  generateCompanionApp,
  generateCompanionPreview,
  generateCompanionPreviewSandbox,
  QUICK_ACTION_CONFIG,
  ACTION_ALIASES,
  normalizeAction,
  getIndustryDefaultColors,
  darkenColor,
  hexToRgb
};
