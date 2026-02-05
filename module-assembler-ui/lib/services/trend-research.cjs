/**
 * TREND RESEARCH SERVICE
 *
 * Researches current design trends for industries using web search.
 * Returns structured trend data for colors, features, trust signals, and hero sections.
 */

// In-memory cache for trend data (24-hour TTL)
const TREND_CACHE = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Industry-specific search query templates
 */
const INDUSTRY_QUERY_TEMPLATES = {
  'pizza-restaurant': {
    type: 'restaurant',
    terms: ['pizza', 'pizzeria', 'italian restaurant']
  },
  'steakhouse': {
    type: 'restaurant',
    terms: ['steakhouse', 'fine dining', 'upscale restaurant']
  },
  'coffee-cafe': {
    type: 'cafe',
    terms: ['coffee shop', 'cafe', 'specialty coffee']
  },
  'restaurant': {
    type: 'restaurant',
    terms: ['restaurant', 'dining', 'eatery']
  },
  'bakery': {
    type: 'retail',
    terms: ['bakery', 'artisan bakery', 'pastry shop']
  },
  'salon-spa': {
    type: 'service',
    terms: ['salon', 'spa', 'beauty salon', 'wellness']
  },
  'fitness-gym': {
    type: 'fitness',
    terms: ['gym', 'fitness center', 'fitness studio']
  },
  'dental': {
    type: 'healthcare',
    terms: ['dental practice', 'dentist', 'dental clinic']
  },
  'healthcare': {
    type: 'healthcare',
    terms: ['medical practice', 'healthcare', 'clinic']
  },
  'yoga': {
    type: 'wellness',
    terms: ['yoga studio', 'wellness center', 'mindfulness']
  },
  'barbershop': {
    type: 'service',
    terms: ['barbershop', 'mens grooming', 'barber']
  },
  'law-firm': {
    type: 'professional',
    terms: ['law firm', 'attorney', 'legal services']
  },
  'real-estate': {
    type: 'professional',
    terms: ['real estate', 'realtor', 'property']
  },
  'plumber': {
    type: 'home-services',
    terms: ['plumber', 'plumbing service', 'home services']
  },
  'cleaning': {
    type: 'home-services',
    terms: ['cleaning service', 'house cleaning', 'maid service']
  },
  'auto-shop': {
    type: 'automotive',
    terms: ['auto repair', 'mechanic', 'auto shop']
  },
  'saas': {
    type: 'tech',
    terms: ['SaaS', 'software', 'tech startup']
  },
  'ecommerce': {
    type: 'ecommerce',
    terms: ['ecommerce', 'online store', 'retail']
  },
  'school': {
    type: 'education',
    terms: ['school', 'academy', 'education']
  }
};

/**
 * Default trends by industry type (fallback when search unavailable)
 */
const DEFAULT_TRENDS = {
  restaurant: {
    colors: [
      'Warm earth tones (terracotta, amber)',
      'Natural greens for freshness',
      'Rich burgundy accents',
      'Cream and ivory backgrounds'
    ],
    features: [
      'Online ordering integration',
      'Interactive menu with photos',
      'Reservation system',
      'Loyalty/rewards program'
    ],
    trust: [
      'Google reviews prominently displayed',
      'Local sourcing callouts',
      'Chef/owner story section',
      'Food safety certifications'
    ],
    hero: [
      'Full-screen food photography',
      'Video background of kitchen',
      'Animated text overlays',
      'Clear CTA above the fold'
    ],
    stats: [
      { value: '69%', label: 'use website to decide where to eat' },
      { value: '43%', label: 'influenced by food photos' },
      { value: '82%', label: 'check menu before visiting' }
    ]
  },
  cafe: {
    colors: [
      'Warm browns and coffee tones',
      'Cream and latte colors',
      'Sage green accents',
      'Natural wood textures'
    ],
    features: [
      'Mobile ordering ahead',
      'Subscription coffee programs',
      'Loyalty points system',
      'Menu with dietary filters'
    ],
    trust: [
      'Coffee sourcing transparency',
      'Barista certifications shown',
      'Customer testimonials',
      'Sustainability badges'
    ],
    hero: [
      'Artisan latte art close-ups',
      'Cozy interior atmosphere shots',
      'Morning light aesthetics',
      'Minimal text, strong imagery'
    ],
    stats: [
      { value: '65%', label: 'visit cafes for ambiance' },
      { value: '78%', label: 'prefer mobile ordering' },
      { value: '54%', label: 'join loyalty programs' }
    ]
  },
  service: {
    colors: [
      'Soft pastels and neutrals',
      'Rose gold and blush accents',
      'Clean whites and creams',
      'Subtle lavender tones'
    ],
    features: [
      'Online booking calendar',
      'Service menu with pricing',
      'Staff portfolio galleries',
      'Gift card purchasing'
    ],
    trust: [
      'Before/after galleries',
      'Client testimonials',
      'Certifications displayed',
      'Social proof integrations'
    ],
    hero: [
      'Lifestyle transformation imagery',
      'Clean, aspirational photography',
      'Team/stylist spotlights',
      'Video walkthroughs'
    ],
    stats: [
      { value: '72%', label: 'book services online' },
      { value: '85%', label: 'check reviews first' },
      { value: '67%', label: 'influenced by photos' }
    ]
  },
  fitness: {
    colors: [
      'Energetic oranges and reds',
      'Deep navy and black',
      'Electric blue accents',
      'High contrast combinations'
    ],
    features: [
      'Class schedule with filters',
      'Online membership signup',
      'Trainer profiles',
      'Progress tracking integration'
    ],
    trust: [
      'Transformation stories',
      'Trainer certifications',
      'Community photos',
      'Trial offer prominently shown'
    ],
    hero: [
      'Action shots of workouts',
      'Video autoplay of classes',
      'Bold motivational headlines',
      'Immediate CTA for trial'
    ],
    stats: [
      { value: '81%', label: 'research gyms online first' },
      { value: '64%', label: 'want class schedules online' },
      { value: '73%', label: 'influenced by member reviews' }
    ]
  },
  healthcare: {
    colors: [
      'Calming blues and teals',
      'Clean whites and grays',
      'Soft green accents',
      'Professional navy tones'
    ],
    features: [
      'Online appointment booking',
      'Patient portal access',
      'Service/treatment listings',
      'Insurance information section'
    ],
    trust: [
      'Doctor credentials displayed',
      'Patient testimonials',
      'Certifications and affiliations',
      'Privacy/HIPAA compliance notes'
    ],
    hero: [
      'Friendly staff photography',
      'Modern facility images',
      'Patient-focused messaging',
      'Easy appointment CTA'
    ],
    stats: [
      { value: '77%', label: 'research providers online' },
      { value: '89%', label: 'want online booking' },
      { value: '68%', label: 'check credentials first' }
    ]
  },
  wellness: {
    colors: [
      'Soft sage and eucalyptus',
      'Warm sand and cream',
      'Lavender and lilac',
      'Natural, organic palette'
    ],
    features: [
      'Class booking system',
      'Virtual class options',
      'Membership packages',
      'Workshop/event calendar'
    ],
    trust: [
      'Instructor bios and certs',
      'Student testimonials',
      'Community gallery',
      'Mindfulness approach messaging'
    ],
    hero: [
      'Serene studio photography',
      'Natural light aesthetics',
      'Peaceful, minimal design',
      'Calming video backgrounds'
    ],
    stats: [
      { value: '71%', label: 'prefer studios with online booking' },
      { value: '59%', label: 'interested in virtual classes' },
      { value: '83%', label: 'value instructor experience' }
    ]
  },
  professional: {
    colors: [
      'Deep navy and charcoal',
      'Gold and bronze accents',
      'Classic burgundy tones',
      'Crisp white backgrounds'
    ],
    features: [
      'Consultation scheduling',
      'Practice area listings',
      'Team/attorney profiles',
      'Resource library/blog'
    ],
    trust: [
      'Case results/outcomes',
      'Client testimonials',
      'Awards and recognitions',
      'Bar associations/credentials'
    ],
    hero: [
      'Professional team photography',
      'Office/building imagery',
      'Confident, authoritative headlines',
      'Clear contact CTA'
    ],
    stats: [
      { value: '74%', label: 'research firms online' },
      { value: '91%', label: 'value credentials display' },
      { value: '66%', label: 'read client testimonials' }
    ]
  },
  'home-services': {
    colors: [
      'Trust-building blues',
      'Clean whites and grays',
      'Safety orange accents',
      'Professional navy'
    ],
    features: [
      'Instant quote calculator',
      'Service area map',
      'Emergency contact option',
      'Before/after galleries'
    ],
    trust: [
      'License and insurance badges',
      'Customer reviews featured',
      'Years in business callout',
      'Satisfaction guarantees'
    ],
    hero: [
      'Technician at work photos',
      'Before/after transformations',
      'Emergency availability messaging',
      'Phone number prominently displayed'
    ],
    stats: [
      { value: '87%', label: 'check reviews before hiring' },
      { value: '79%', label: 'want online quotes' },
      { value: '92%', label: 'value license verification' }
    ]
  },
  automotive: {
    colors: [
      'Industrial grays and blacks',
      'Racing red accents',
      'Chrome and metallic tones',
      'Trust-building blues'
    ],
    features: [
      'Online appointment scheduling',
      'Service menu with pricing',
      'Vehicle lookup/history',
      'Repair status tracking'
    ],
    trust: [
      'ASE certifications displayed',
      'Customer reviews',
      'Warranty information',
      'Years of experience'
    ],
    hero: [
      'Clean shop facility photos',
      'Technicians at work',
      'Vehicle transformation shots',
      'Clear service CTA'
    ],
    stats: [
      { value: '76%', label: 'research shops online' },
      { value: '84%', label: 'check reviews first' },
      { value: '69%', label: 'want transparent pricing' }
    ]
  },
  tech: {
    colors: [
      'Modern gradients (purple to blue)',
      'Clean white backgrounds',
      'Accent colors (electric blue, green)',
      'Dark mode option'
    ],
    features: [
      'Interactive product demos',
      'Pricing comparison tables',
      'Free trial signup',
      'Integration showcases'
    ],
    trust: [
      'Customer logos/social proof',
      'Case studies featured',
      'Security certifications',
      'Uptime/performance stats'
    ],
    hero: [
      'Product screenshots/mockups',
      'Animated feature demos',
      'Bold value proposition headline',
      'Trial CTA above fold'
    ],
    stats: [
      { value: '94%', label: 'want free trials' },
      { value: '71%', label: 'check integrations first' },
      { value: '88%', label: 'influenced by case studies' }
    ]
  },
  ecommerce: {
    colors: [
      'Brand-specific accent colors',
      'Clean white backgrounds',
      'Sale/urgency red',
      'Trust-building greens'
    ],
    features: [
      'Smart product filtering',
      'Quick-view product cards',
      'Wishlist functionality',
      'Easy checkout flow'
    ],
    trust: [
      'Customer reviews per product',
      'Shipping/return policies',
      'Secure payment badges',
      'Money-back guarantees'
    ],
    hero: [
      'Lifestyle product photography',
      'Promotional banners',
      'Featured collection grids',
      'Video product showcases'
    ],
    stats: [
      { value: '79%', label: 'abandon cart for surprise costs' },
      { value: '93%', label: 'read reviews before buying' },
      { value: '67%', label: 'influenced by free shipping' }
    ]
  },
  education: {
    colors: [
      'Trustworthy blues and navies',
      'Academic greens',
      'Warm, welcoming oranges',
      'Clean white backgrounds'
    ],
    features: [
      'Program/course browser',
      'Online enrollment forms',
      'Virtual tour option',
      'Event calendar integration'
    ],
    trust: [
      'Accreditation badges',
      'Alumni success stories',
      'Faculty credentials',
      'Test scores/rankings'
    ],
    hero: [
      'Campus/facility photography',
      'Student life imagery',
      'Video campus tours',
      'Clear enrollment CTA'
    ],
    stats: [
      { value: '86%', label: 'research schools online' },
      { value: '72%', label: 'want virtual tours' },
      { value: '91%', label: 'check accreditation' }
    ]
  },
  retail: {
    colors: [
      'Brand-aligned palette',
      'Artisan brown and cream',
      'Fresh, appetizing accents',
      'Clean, inviting backgrounds'
    ],
    features: [
      'Online ordering/delivery',
      'Product customization',
      'Loyalty program integration',
      'Store locator'
    ],
    trust: [
      'Quality certifications',
      'Customer reviews',
      'Local/artisan story',
      'Freshness guarantees'
    ],
    hero: [
      'Product close-up photography',
      'Artisan process videos',
      'Seasonal featured items',
      'Order CTA prominently placed'
    ],
    stats: [
      { value: '74%', label: 'prefer online ordering' },
      { value: '81%', label: 'influenced by food photos' },
      { value: '63%', label: 'join bakery loyalty programs' }
    ]
  }
};

/**
 * Get cached trends if available and not expired
 */
function getCachedTrends(industry) {
  const cached = TREND_CACHE.get(industry);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

/**
 * Set trends in cache
 */
function setCachedTrends(industry, data) {
  TREND_CACHE.set(industry, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Build search queries for an industry
 */
function buildSearchQueries(industry, location = null) {
  const currentYear = new Date().getFullYear();
  const template = INDUSTRY_QUERY_TEMPLATES[industry] || INDUSTRY_QUERY_TEMPLATES['restaurant'];
  const primaryTerm = template.terms[0];

  const queries = [
    `${primaryTerm} website design trends ${currentYear} best practices`,
    `${primaryTerm} website features that convert customers`,
    `${primaryTerm} website color schemes popular ${currentYear}`,
    `best ${primaryTerm} website examples ${currentYear}`
  ];

  if (location) {
    queries.push(`${primaryTerm} ${location} customer preferences`);
  }

  return queries;
}

/**
 * Parse trend data from search results
 * Note: This would integrate with actual web search results
 * For now, it enhances default trends with any extracted insights
 */
function parseTrendsFromResults(results, industry) {
  const template = INDUSTRY_QUERY_TEMPLATES[industry] || INDUSTRY_QUERY_TEMPLATES['restaurant'];
  const industryType = template.type;
  const defaults = DEFAULT_TRENDS[industryType] || DEFAULT_TRENDS['restaurant'];

  // Start with defaults
  const trends = {
    colors: [...defaults.colors],
    features: [...defaults.features],
    trust: [...defaults.trust],
    hero: [...defaults.hero],
    stats: [...defaults.stats],
    sources: []
  };

  // If we have real search results, extract insights
  if (results && Array.isArray(results) && results.length > 0) {
    // Extract source information
    trends.sources = results
      .filter(r => r && r.url)
      .slice(0, 5)
      .map(r => ({
        title: r.title || 'Web Source',
        url: r.url
      }));

    // Parse for color mentions
    const colorKeywords = extractColorKeywords(results);
    if (colorKeywords.length > 0) {
      trends.colors = colorKeywords.slice(0, 4);
    }

    // Parse for feature mentions
    const featureKeywords = extractFeatureKeywords(results, industryType);
    if (featureKeywords.length > 0) {
      trends.features = featureKeywords.slice(0, 4);
    }

    // Add live research badge
    trends.isLiveResearch = true;
  } else {
    trends.sources = [
      { title: 'Industry Best Practices', url: null },
      { title: 'Design Pattern Analysis', url: null }
    ];
    trends.isLiveResearch = false;
  }

  return trends;
}

/**
 * Extract color-related keywords from search results
 */
function extractColorKeywords(results) {
  const colorPatterns = [
    /warm (earth|natural|organic) tones?/gi,
    /terracotta|amber|burgundy|navy|sage|coral|blush/gi,
    /(modern|clean|minimal) (white|neutral)s?/gi,
    /gradient|gradient colors?/gi,
    /(dark|light) mode/gi,
    /brand colors?/gi,
    /(soft|bold|muted|vibrant) (palette|colors?)/gi
  ];

  const found = new Set();

  for (const result of results) {
    const text = (result.snippet || result.description || '').toLowerCase();
    for (const pattern of colorPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(m => found.add(m.trim()));
      }
    }
  }

  return Array.from(found).map(c =>
    c.charAt(0).toUpperCase() + c.slice(1)
  );
}

/**
 * Extract feature-related keywords from search results
 */
function extractFeatureKeywords(results, industryType) {
  const featurePatterns = {
    restaurant: [
      /online (ordering|reservations?)/gi,
      /mobile (ordering|app)/gi,
      /loyalty (program|rewards?)/gi,
      /delivery (integration|options?)/gi
    ],
    service: [
      /online (booking|scheduling)/gi,
      /before.?after (gallery|photos?)/gi,
      /gift cards?/gi,
      /client portal/gi
    ],
    healthcare: [
      /online (booking|appointments?)/gi,
      /patient portal/gi,
      /telehealth|virtual (visits?|consultations?)/gi,
      /insurance (verification|info)/gi
    ],
    tech: [
      /free trial/gi,
      /demo (request|video)/gi,
      /pricing (page|table)/gi,
      /integration(s)? (showcase|list)/gi
    ],
    default: [
      /contact form/gi,
      /live chat/gi,
      /testimonials?/gi,
      /newsletter/gi
    ]
  };

  const patterns = featurePatterns[industryType] || featurePatterns.default;
  const found = new Set();

  for (const result of results) {
    const text = (result.snippet || result.description || '').toLowerCase();
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(m => found.add(m.trim()));
      }
    }
  }

  return Array.from(found).map(f =>
    f.charAt(0).toUpperCase() + f.slice(1)
  );
}

/**
 * Main research function - gets trends for an industry
 * @param {string} industry - Industry ID
 * @param {string} location - Optional location for localized research
 * @param {Object} options - Options
 * @param {Function} options.searchFn - Optional custom search function
 * @returns {Object} Trend data
 */
async function researchIndustryTrends(industry, location = null, options = {}) {
  console.log(`\n🔍 TREND RESEARCH: Researching ${industry}${location ? ` in ${location}` : ''}`);

  // Check cache first
  const cacheKey = location ? `${industry}:${location}` : industry;
  const cached = getCachedTrends(cacheKey);
  if (cached) {
    console.log('   ✓ Returning cached trends');
    return { ...cached, cached: true };
  }

  // Build search queries
  const queries = buildSearchQueries(industry, location);
  console.log(`   Building ${queries.length} search queries...`);

  // Try to execute searches if a search function is provided
  let searchResults = [];

  if (options.searchFn && typeof options.searchFn === 'function') {
    try {
      console.log('   Executing web searches...');
      // Execute searches in parallel
      const searchPromises = queries.map(q =>
        options.searchFn(q).catch(e => {
          console.log(`   ⚠ Search failed for: ${q.slice(0, 50)}...`);
          return null;
        })
      );

      const results = await Promise.all(searchPromises);
      searchResults = results
        .filter(r => r !== null)
        .flat()
        .filter(r => r && (r.url || r.link));

      console.log(`   Found ${searchResults.length} search results`);
    } catch (err) {
      console.log(`   ⚠ Search error: ${err.message}`);
    }
  } else {
    console.log('   No search function provided, using defaults');
  }

  // Parse results into structured trends
  const trends = parseTrendsFromResults(searchResults, industry);
  trends.industry = industry;
  trends.location = location;
  trends.queries = queries;
  trends.cached = false;

  // Cache the results
  setCachedTrends(cacheKey, trends);

  console.log('   ✓ Trend research complete');
  return trends;
}

/**
 * Get default trends for an industry (no search required)
 */
function getDefaultTrends(industry) {
  const template = INDUSTRY_QUERY_TEMPLATES[industry] || INDUSTRY_QUERY_TEMPLATES['restaurant'];
  const industryType = template.type;
  const defaults = DEFAULT_TRENDS[industryType] || DEFAULT_TRENDS['restaurant'];

  return {
    ...defaults,
    industry,
    industryType,
    sources: [
      { title: 'Industry Best Practices', url: null },
      { title: 'Design Pattern Analysis', url: null }
    ],
    isLiveResearch: false,
    cached: false
  };
}

/**
 * Clear the trend cache (for testing/refreshing)
 */
function clearTrendCache() {
  TREND_CACHE.clear();
  console.log('   Trend cache cleared');
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: TREND_CACHE.size,
    industries: Array.from(TREND_CACHE.keys()),
    ttlHours: CACHE_TTL / (60 * 60 * 1000)
  };
}

module.exports = {
  researchIndustryTrends,
  getDefaultTrends,
  clearTrendCache,
  getCacheStats,
  buildSearchQueries,
  parseTrendsFromResults,
  INDUSTRY_QUERY_TEMPLATES,
  DEFAULT_TRENDS,
  CACHE_TTL
};
