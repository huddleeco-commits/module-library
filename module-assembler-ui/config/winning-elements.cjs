/**
 * Industry-Specific Winning Elements Library
 *
 * Based on comprehensive design research, these elements represent
 * proven conversion and engagement drivers for each industry type.
 *
 * Each element includes:
 * - industries: Array of industry keys where this element applies
 * - sectionType: The type of section/component to render
 * - placement: Where in the page layout this element should appear
 * - template: The component template name to use
 * - priority: How important this element is (high, medium, low)
 */

const winningElements = {
  // ============================================
  // FOOD & BEVERAGE ELEMENTS
  // ============================================

  'online-ordering': {
    industries: ['coffee-shop', 'cafe', 'restaurant', 'bakery', 'pizza', 'food-truck', 'steakhouse'],
    sectionType: 'cta-banner',
    placement: 'after-hero',
    template: 'OrderOnlineBanner',
    priority: 'high',
    description: 'Prominent CTA for online ordering with pickup/delivery options',
    features: ['floating-order-button', 'sticky-mobile-cta', 'order-status-tracking']
  },

  'loyalty-program': {
    industries: ['coffee-shop', 'cafe', 'restaurant', 'bakery', 'pizza', 'retail', 'salon', 'spa', 'fitness', 'gym'],
    sectionType: 'feature-card',
    placement: 'before-footer',
    template: 'LoyaltyPromoSection',
    priority: 'high',
    description: 'Rewards program promotion with points/perks preview',
    features: ['points-display', 'tier-preview', 'signup-cta']
  },

  'seasonal-highlights': {
    industries: ['coffee-shop', 'cafe', 'restaurant', 'bakery', 'steakhouse'],
    sectionType: 'featured-grid',
    placement: 'after-hero',
    template: 'SeasonalSpecialsGrid',
    priority: 'medium',
    description: 'Rotating seasonal menu items or limited-time offers',
    features: ['countdown-timer', 'image-carousel', 'quick-add-to-order']
  },

  'menu-preview': {
    industries: ['coffee-shop', 'cafe', 'restaurant', 'bakery', 'pizza', 'food-truck', 'steakhouse'],
    sectionType: 'menu-cards',
    placement: 'homepage-featured',
    template: 'MenuPreviewSection',
    priority: 'high',
    description: 'Featured menu items with prices and quick ordering',
    features: ['category-tabs', 'dietary-filters', 'hover-details']
  },

  'reservation-system': {
    industries: ['restaurant', 'steakhouse'],
    sectionType: 'cta-prominent',
    placement: 'hero-secondary',
    template: 'ReservationWidget',
    priority: 'high',
    description: 'Integrated reservation booking widget',
    features: ['date-time-picker', 'party-size', 'special-requests', 'confirmation-email']
  },

  'chef-story': {
    industries: ['restaurant', 'steakhouse', 'bakery'],
    sectionType: 'about-feature',
    placement: 'mid-page',
    template: 'ChefStorySection',
    priority: 'medium',
    description: 'Chef background, philosophy, and credentials',
    features: ['portrait-image', 'credentials-list', 'philosophy-quote']
  },

  'custom-orders': {
    industries: ['bakery', 'pizza'],
    sectionType: 'cta-card',
    placement: 'services-section',
    template: 'CustomOrderCTA',
    priority: 'medium',
    description: 'Custom cake/catering order request form',
    features: ['inquiry-form', 'gallery-preview', 'lead-time-info']
  },

  'delivery-tracking': {
    industries: ['pizza', 'food-truck', 'restaurant'],
    sectionType: 'status-widget',
    placement: 'order-flow',
    template: 'DeliveryTracker',
    priority: 'high',
    description: 'Real-time order and delivery status tracking',
    features: ['order-stages', 'eta-display', 'driver-contact']
  },

  'location-finder': {
    industries: ['food-truck', 'coffee-shop', 'restaurant'],
    sectionType: 'map-widget',
    placement: 'homepage-section',
    template: 'LocationFinderMap',
    priority: 'high',
    description: 'Interactive map showing current/upcoming locations',
    features: ['live-map', 'schedule-calendar', 'notifications-signup']
  },

  'tap-list': {
    industries: ['bar-brewery', 'restaurant'],
    sectionType: 'live-menu',
    placement: 'menu-page',
    template: 'TapListSection',
    priority: 'high',
    description: 'Real-time tap list with beer details',
    features: ['abv-display', 'tasting-notes', 'untappd-integration']
  },

  'events-calendar': {
    industries: ['bar-brewery', 'restaurant', 'fitness', 'gym', 'yoga'],
    sectionType: 'calendar-widget',
    placement: 'homepage-section',
    template: 'EventsCalendarPreview',
    priority: 'medium',
    description: 'Upcoming events with booking/RSVP',
    features: ['calendar-view', 'event-cards', 'rsvp-button']
  },

  // ============================================
  // SERVICE BUSINESS ELEMENTS
  // ============================================

  'online-booking': {
    industries: ['salon', 'spa', 'barbershop', 'dental', 'medical', 'healthcare', 'vet', 'yoga', 'fitness', 'gym'],
    sectionType: 'cta-prominent',
    placement: 'hero-overlay',
    template: 'BookNowOverlay',
    priority: 'high',
    description: 'Prominent appointment booking widget',
    features: ['service-selection', 'provider-selection', 'time-slots', 'confirmation']
  },

  'service-pricing': {
    industries: ['salon', 'spa', 'barbershop', 'plumber', 'hvac', 'electrician', 'cleaning', 'auto-shop'],
    sectionType: 'pricing-table',
    placement: 'services-page',
    template: 'ServicePricingTable',
    priority: 'high',
    description: 'Transparent service pricing with descriptions',
    features: ['category-tabs', 'duration-display', 'book-now-buttons']
  },

  'before-after-gallery': {
    industries: ['salon', 'spa', 'barbershop', 'dental'],
    sectionType: 'gallery-slider',
    placement: 'services-section',
    template: 'BeforeAfterGallery',
    priority: 'medium',
    description: 'Before/after transformation photos',
    features: ['slider-comparison', 'category-filter', 'lightbox']
  },

  'team-profiles': {
    industries: ['salon', 'spa', 'barbershop', 'dental', 'medical', 'healthcare', 'law-firm'],
    sectionType: 'team-grid',
    placement: 'about-section',
    template: 'TeamProfileCards',
    priority: 'medium',
    description: 'Staff bios with specialties and booking links',
    features: ['headshots', 'specialties', 'book-with-provider']
  },

  'walk-in-status': {
    industries: ['barbershop', 'salon'],
    sectionType: 'status-badge',
    placement: 'header-banner',
    template: 'WalkInStatusBadge',
    priority: 'medium',
    description: 'Real-time walk-in availability status',
    features: ['wait-time', 'live-update', 'join-waitlist']
  },

  'package-builder': {
    industries: ['spa', 'salon'],
    sectionType: 'interactive-builder',
    placement: 'services-page',
    template: 'ServicePackageBuilder',
    priority: 'medium',
    description: 'Build-your-own spa/service package',
    features: ['service-selection', 'total-calculator', 'save-package']
  },

  'gift-cards': {
    industries: ['spa', 'salon', 'restaurant', 'coffee-shop'],
    sectionType: 'cta-card',
    placement: 'homepage-section',
    template: 'GiftCardPromo',
    priority: 'medium',
    description: 'Gift card purchase with delivery options',
    features: ['amount-selector', 'digital-physical-toggle', 'personalization']
  },

  'virtual-tour': {
    industries: ['spa', 'salon', 'fitness', 'gym', 'real-estate'],
    sectionType: 'media-embed',
    placement: 'about-section',
    template: 'VirtualTourEmbed',
    priority: 'low',
    description: '360° virtual tour of facility',
    features: ['360-viewer', 'hotspots', 'room-navigation']
  },

  // ============================================
  // EMERGENCY & HOME SERVICE ELEMENTS
  // ============================================

  'emergency-contact': {
    industries: ['plumber', 'hvac', 'electrician', 'vet', 'medical'],
    sectionType: 'sticky-banner',
    placement: 'top-of-page',
    template: 'EmergencyContactBanner',
    priority: 'high',
    description: 'Always-visible emergency contact information',
    features: ['click-to-call', 'sticky-header', '24-7-badge']
  },

  'service-area-map': {
    industries: ['plumber', 'hvac', 'electrician', 'cleaning', 'auto-shop'],
    sectionType: 'map-widget',
    placement: 'contact-section',
    template: 'ServiceAreaMap',
    priority: 'medium',
    description: 'Interactive map showing service coverage area',
    features: ['zip-code-check', 'city-list', 'coverage-boundary']
  },

  'pricing-transparency': {
    industries: ['plumber', 'hvac', 'electrician', 'auto-shop'],
    sectionType: 'pricing-guide',
    placement: 'services-page',
    template: 'PricingGuideSection',
    priority: 'high',
    description: 'Upfront pricing guide with common services',
    features: ['price-ranges', 'whats-included', 'no-surprises-guarantee']
  },

  'instant-quote': {
    industries: ['plumber', 'hvac', 'electrician', 'cleaning', 'auto-shop'],
    sectionType: 'form-widget',
    placement: 'hero-sidebar',
    template: 'InstantQuoteForm',
    priority: 'high',
    description: 'Quick quote request form',
    features: ['service-selector', 'description-field', 'photo-upload', 'urgency-toggle']
  },

  'maintenance-plans': {
    industries: ['hvac', 'plumber', 'auto-shop'],
    sectionType: 'pricing-cards',
    placement: 'services-section',
    template: 'MaintenancePlanCards',
    priority: 'medium',
    description: 'Subscription maintenance plan options',
    features: ['tier-comparison', 'savings-calculator', 'signup-cta']
  },

  'financing-options': {
    industries: ['hvac', 'plumber', 'electrician', 'dental', 'auto-shop'],
    sectionType: 'info-banner',
    placement: 'pricing-section',
    template: 'FinancingBanner',
    priority: 'medium',
    description: 'Financing and payment plan information',
    features: ['monthly-payment-calc', 'apply-now-cta', 'partner-logos']
  },

  'licensing-credentials': {
    industries: ['plumber', 'hvac', 'electrician', 'dental', 'medical', 'law-firm'],
    sectionType: 'trust-badges',
    placement: 'footer-above',
    template: 'LicensingCredentialsBadges',
    priority: 'high',
    description: 'Professional licenses and certifications display',
    features: ['license-numbers', 'certification-logos', 'verification-links']
  },

  // ============================================
  // FITNESS & WELLNESS ELEMENTS
  // ============================================

  'class-schedule': {
    industries: ['gym', 'fitness', 'yoga'],
    sectionType: 'schedule-grid',
    placement: 'homepage-section',
    template: 'ClassSchedulePreview',
    priority: 'high',
    description: 'Interactive class schedule with filtering',
    features: ['day-filter', 'class-type-filter', 'instructor-filter', 'quick-book']
  },

  'membership-tiers': {
    industries: ['gym', 'fitness', 'yoga', 'spa'],
    sectionType: 'pricing-cards',
    placement: 'pricing-page',
    template: 'MembershipTiersSection',
    priority: 'high',
    description: 'Membership options comparison',
    features: ['feature-comparison', 'monthly-annual-toggle', 'popular-badge']
  },

  'free-trial-cta': {
    industries: ['gym', 'fitness', 'yoga'],
    sectionType: 'cta-prominent',
    placement: 'hero-secondary',
    template: 'FreeTrialCTA',
    priority: 'high',
    description: 'Free trial or first-class-free offer',
    features: ['no-commitment-badge', 'signup-form', 'what-to-expect']
  },

  'instructor-bios': {
    industries: ['yoga', 'fitness', 'gym'],
    sectionType: 'team-carousel',
    placement: 'about-section',
    template: 'InstructorCarousel',
    priority: 'medium',
    description: 'Instructor profiles with certifications',
    features: ['headshots', 'certifications', 'class-types', 'schedule-link']
  },

  'transformation-stories': {
    industries: ['gym', 'fitness'],
    sectionType: 'testimonial-cards',
    placement: 'social-proof-section',
    template: 'TransformationStories',
    priority: 'medium',
    description: 'Member transformation testimonials with photos',
    features: ['before-after-photos', 'journey-story', 'results-metrics']
  },

  // ============================================
  // HEALTHCARE ELEMENTS
  // ============================================

  'patient-portal-cta': {
    industries: ['dental', 'medical', 'healthcare', 'vet'],
    sectionType: 'cta-card',
    placement: 'hero-secondary',
    template: 'PatientPortalCTA',
    priority: 'high',
    description: 'Patient portal access/registration CTA',
    features: ['login-button', 'register-link', 'features-list']
  },

  'insurance-accepted': {
    industries: ['dental', 'medical', 'healthcare'],
    sectionType: 'logo-grid',
    placement: 'footer-above',
    template: 'InsuranceLogosGrid',
    priority: 'high',
    description: 'Accepted insurance providers display',
    features: ['logo-grid', 'search-tool', 'verification-link']
  },

  'patient-forms': {
    industries: ['dental', 'medical', 'healthcare', 'vet'],
    sectionType: 'resource-links',
    placement: 'new-patient-section',
    template: 'PatientFormsDownload',
    priority: 'medium',
    description: 'Downloadable new patient forms',
    features: ['pdf-downloads', 'online-form-links', 'checklist']
  },

  'provider-bios': {
    industries: ['dental', 'medical', 'healthcare'],
    sectionType: 'team-detailed',
    placement: 'about-section',
    template: 'ProviderProfilesDetailed',
    priority: 'high',
    description: 'Detailed provider credentials and specialties',
    features: ['education', 'certifications', 'specialties', 'philosophy']
  },

  'telehealth-badge': {
    industries: ['medical', 'healthcare', 'dental', 'vet'],
    sectionType: 'feature-badge',
    placement: 'hero-badge',
    template: 'TelehealthBadge',
    priority: 'medium',
    description: 'Telehealth/virtual visit availability indicator',
    features: ['video-icon', 'availability-status', 'start-visit-cta']
  },

  'pet-portal': {
    industries: ['vet'],
    sectionType: 'cta-card',
    placement: 'hero-secondary',
    template: 'PetPortalCTA',
    priority: 'high',
    description: 'Pet owner portal for records and appointments',
    features: ['login-button', 'pet-profiles', 'vaccination-records']
  },

  // ============================================
  // PROFESSIONAL SERVICES ELEMENTS
  // ============================================

  'case-studies': {
    industries: ['law-firm', 'professional', 'saas'],
    sectionType: 'case-study-grid',
    placement: 'social-proof-section',
    template: 'CaseStudyCards',
    priority: 'high',
    description: 'Client success stories and case results',
    features: ['outcome-stats', 'client-quote', 'industry-tags']
  },

  'consultation-booking': {
    industries: ['law-firm', 'professional', 'real-estate'],
    sectionType: 'cta-prominent',
    placement: 'hero-primary',
    template: 'ConsultationBookingCTA',
    priority: 'high',
    description: 'Free consultation booking CTA',
    features: ['calendar-widget', 'phone-option', 'video-option']
  },

  'practice-areas': {
    industries: ['law-firm'],
    sectionType: 'services-grid',
    placement: 'services-section',
    template: 'PracticeAreasGrid',
    priority: 'high',
    description: 'Legal practice areas with descriptions',
    features: ['icon-cards', 'learn-more-links', 'case-type-matching']
  },

  'results-stats': {
    industries: ['law-firm', 'professional', 'real-estate'],
    sectionType: 'stats-bar',
    placement: 'after-hero',
    template: 'ResultsStatsBar',
    priority: 'high',
    description: 'Key achievement statistics',
    features: ['animated-counters', 'success-metrics', 'trust-building']
  },

  // ============================================
  // REAL ESTATE ELEMENTS
  // ============================================

  'property-search': {
    industries: ['real-estate'],
    sectionType: 'search-widget',
    placement: 'hero-overlay',
    template: 'PropertySearchWidget',
    priority: 'high',
    description: 'Advanced property search form',
    features: ['location-search', 'price-range', 'beds-baths', 'property-type']
  },

  'featured-listings': {
    industries: ['real-estate'],
    sectionType: 'property-grid',
    placement: 'homepage-section',
    template: 'FeaturedListingsGrid',
    priority: 'high',
    description: 'Featured property listings carousel',
    features: ['property-cards', 'quick-view', 'save-favorite', 'schedule-tour']
  },

  'home-valuation': {
    industries: ['real-estate'],
    sectionType: 'cta-form',
    placement: 'hero-secondary',
    template: 'HomeValuationCTA',
    priority: 'high',
    description: 'Free home valuation request form',
    features: ['address-input', 'instant-estimate', 'agent-contact']
  },

  'market-stats': {
    industries: ['real-estate'],
    sectionType: 'stats-grid',
    placement: 'homepage-section',
    template: 'MarketStatsSection',
    priority: 'medium',
    description: 'Local real estate market statistics',
    features: ['median-price', 'days-on-market', 'inventory', 'trend-arrows']
  },

  // ============================================
  // RETAIL & ECOMMERCE ELEMENTS
  // ============================================

  'product-showcase': {
    industries: ['retail', 'ecommerce'],
    sectionType: 'product-grid',
    placement: 'homepage-featured',
    template: 'ProductShowcaseGrid',
    priority: 'high',
    description: 'Featured products with quick add-to-cart',
    features: ['product-cards', 'quick-view', 'add-to-cart', 'wishlist']
  },

  'promotions-banner': {
    industries: ['retail', 'ecommerce'],
    sectionType: 'announcement-bar',
    placement: 'top-of-page',
    template: 'PromotionsBanner',
    priority: 'high',
    description: 'Sale/promotion announcement bar',
    features: ['countdown-timer', 'promo-code', 'shop-now-cta']
  },

  'category-navigation': {
    industries: ['retail', 'ecommerce'],
    sectionType: 'category-grid',
    placement: 'after-hero',
    template: 'CategoryNavGrid',
    priority: 'high',
    description: 'Shop by category visual navigation',
    features: ['category-images', 'hover-effects', 'subcategory-dropdown']
  },

  'trust-guarantees': {
    industries: ['retail', 'ecommerce'],
    sectionType: 'trust-strip',
    placement: 'below-hero',
    template: 'TrustGuaranteesStrip',
    priority: 'high',
    description: 'Free shipping, returns, and guarantee badges',
    features: ['free-shipping', 'easy-returns', 'satisfaction-guarantee', 'secure-checkout']
  },

  // ============================================
  // SAAS & SOFTWARE ELEMENTS
  // ============================================

  'social-proof-logos': {
    industries: ['saas', 'professional'],
    sectionType: 'logo-carousel',
    placement: 'after-hero',
    template: 'SocialProofLogos',
    priority: 'high',
    description: 'Client/partner logo carousel',
    features: ['logo-slider', 'customer-count', 'industry-diversity']
  },

  'feature-comparison': {
    industries: ['saas'],
    sectionType: 'comparison-table',
    placement: 'pricing-page',
    template: 'FeatureComparisonTable',
    priority: 'high',
    description: 'Plan feature comparison matrix',
    features: ['tier-columns', 'feature-rows', 'checkmarks', 'tooltips']
  },

  'demo-cta': {
    industries: ['saas', 'professional'],
    sectionType: 'cta-prominent',
    placement: 'hero-secondary',
    template: 'DemoCTA',
    priority: 'high',
    description: 'Request demo or watch video CTA',
    features: ['video-modal', 'calendar-booking', 'contact-form']
  },

  'integration-showcase': {
    industries: ['saas'],
    sectionType: 'logo-grid',
    placement: 'features-section',
    template: 'IntegrationShowcase',
    priority: 'medium',
    description: 'Supported integrations display',
    features: ['integration-logos', 'category-filter', 'search', 'learn-more']
  }
};

/**
 * Get winning elements applicable to a specific industry
 * @param {string} industry - Industry key (e.g., 'coffee-shop', 'dental')
 * @returns {Array} Array of winning element objects with their keys
 */
function getWinningElementsForIndustry(industry) {
  return Object.entries(winningElements)
    .filter(([key, config]) => config.industries.includes(industry))
    .map(([key, config]) => ({
      elementKey: key,
      ...config
    }))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Get winning elements by placement location
 * @param {string} industry - Industry key
 * @param {string} placement - Placement location (e.g., 'hero-secondary', 'after-hero')
 * @returns {Array} Array of winning elements for that placement
 */
function getElementsByPlacement(industry, placement) {
  return getWinningElementsForIndustry(industry)
    .filter(element => element.placement === placement);
}

/**
 * Get high-priority winning elements for an industry
 * @param {string} industry - Industry key
 * @returns {Array} Array of high-priority winning elements
 */
function getHighPriorityElements(industry) {
  return getWinningElementsForIndustry(industry)
    .filter(element => element.priority === 'high');
}

/**
 * Check if an industry supports a specific winning element
 * @param {string} industry - Industry key
 * @param {string} elementKey - Winning element key
 * @returns {boolean} True if the industry supports this element
 */
function industrySupportsElement(industry, elementKey) {
  const element = winningElements[elementKey];
  return element ? element.industries.includes(industry) : false;
}

/**
 * Get all unique placements used by winning elements
 * @returns {Array} Array of unique placement strings
 */
function getAllPlacements() {
  const placements = new Set();
  Object.values(winningElements).forEach(element => {
    placements.add(element.placement);
  });
  return Array.from(placements).sort();
}

/**
 * Get element template name
 * @param {string} elementKey - Winning element key
 * @returns {string|null} Template name or null if not found
 */
function getElementTemplate(elementKey) {
  return winningElements[elementKey]?.template || null;
}

module.exports = {
  winningElements,
  getWinningElementsForIndustry,
  getElementsByPlacement,
  getHighPriorityElements,
  industrySupportsElement,
  getAllPlacements,
  getElementTemplate
};
