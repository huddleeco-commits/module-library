/**
 * Prompt Builders
 * Extracted from server.cjs
 *
 * Handles: Industry detection, prompt construction, context building
 */

const {
  VISUAL_ARCHETYPES,
  getGenerationVariety,
  buildVarietyPrompt,
  getIndustryType,
  buildFeatureContext,
  analyzeGenerationRequest
} = require('../configs/index.cjs');

// Import layout context builder for industry-specific layouts
const {
  buildLayoutContext,
  getLayoutCategory,
  buildDetailedLayoutContext,
  getAvailableLayouts,
  getLayoutConfigFull,
  getPageLayout,
  INDUSTRY_LAYOUTS,
  PAGE_LAYOUTS
} = require('../../config/industry-layouts.cjs');

// Import video services for dynamic video fetching
const { getIndustryVideo } = require('../services/video.cjs');

// Import page name utilities
const { toNavLabel } = require('../utils/page-names.cjs');

// Import industry fixtures for test mode fallback pages
const { getIndustryFixture, getSampleData } = require('../configs/industry-fixtures.cjs');

// These need to be passed in or loaded separately
let INDUSTRIES, LAYOUTS, EFFECTS, SECTIONS;

/**
 * Initialize prompt builders with config data
 */
function initPromptBuilders(config) {
  INDUSTRIES = config.INDUSTRIES;
  LAYOUTS = config.LAYOUTS;
  EFFECTS = config.EFFECTS;
  SECTIONS = config.SECTIONS;
}

// ============================================
// MOOD SLIDERS - Creative Style Interpretation
// ============================================
/**
 * Interpret mood slider values and build a style context for AI generation
 * Sliders: vibe, energy, era, density, price (0-100 scale, 50 = neutral)
 *
 * @param {Object} sliders - { vibe: 0-100, energy: 0-100, era: 0-100, density: 0-100, price: 0-100 }
 * @returns {string} Context string for the AI prompt
 */
function buildMoodSliderContext(sliders) {
  if (!sliders || typeof sliders !== 'object') {
    return '';
  }

  const { vibe = 50, energy = 50, era = 50, density = 50, price = 50 } = sliders;

  // Build style directives based on slider values
  const styleDirectives = [];

  // VIBE: Professional (0) vs Friendly (100)
  if (vibe < 35) {
    styleDirectives.push('TONE: Formal, corporate, authoritative. Use "we" language, professional terminology, sophisticated vocabulary.');
    styleDirectives.push('IMAGERY: Corporate headshots, clean office spaces, handshakes, business settings.');
  } else if (vibe > 65) {
    styleDirectives.push('TONE: Warm, personal, approachable. Use conversational language, contractions, friendly invitations.');
    styleDirectives.push('IMAGERY: Smiling faces, candid moments, community vibes, welcoming atmosphere.');
  } else {
    styleDirectives.push('TONE: Balanced professional-friendly. Approachable but competent.');
  }

  // ENERGY: Calm (0) vs Bold (100)
  if (energy < 35) {
    styleDirectives.push('VISUAL ENERGY: Muted colors, subtle animations, generous whitespace, soft shadows.');
    styleDirectives.push('TYPOGRAPHY: Light font weights (300-400), refined serif fonts for headings, understated elegance.');
    styleDirectives.push('ANIMATIONS: Minimal - gentle fades, slow reveals (800-1200ms), no bouncing or flashy effects.');
  } else if (energy > 65) {
    styleDirectives.push('VISUAL ENERGY: Vibrant saturated colors, bold contrasts, dynamic compositions.');
    styleDirectives.push('TYPOGRAPHY: Heavy font weights (700-900), large impactful headlines, strong visual hierarchy.');
    styleDirectives.push('ANIMATIONS: Dynamic - quick reveals (300-500ms), slide-ins, scale effects, engaging micro-interactions.');
  } else {
    styleDirectives.push('VISUAL ENERGY: Balanced - moderate color saturation, comfortable contrasts.');
  }

  // ERA: Classic (0) vs Modern (100)
  if (era < 35) {
    styleDirectives.push('STYLE ERA: Timeless, traditional, established. Think classic elegance, trust through heritage.');
    styleDirectives.push('FONTS: Serif typefaces (Playfair Display, Merriweather, Georgia), traditional layouts.');
    styleDirectives.push('ELEMENTS: Ornamental borders, traditional section dividers, established credibility markers.');
  } else if (era > 65) {
    styleDirectives.push('STYLE ERA: Cutting-edge, trendy, contemporary. Think startup-fresh, innovative, forward-thinking.');
    styleDirectives.push('FONTS: Modern sans-serif (Inter, Outfit, Space Grotesk), asymmetric layouts, bold geometrics.');
    styleDirectives.push('ELEMENTS: Gradient backgrounds, glassmorphism, floating cards, modern grid systems.');
  } else {
    styleDirectives.push('STYLE ERA: Contemporary classic - modern techniques with timeless sensibility.');
  }

  // DENSITY: Minimal (0) vs Rich (100)
  if (density < 35) {
    styleDirectives.push('CONTENT DENSITY: Minimal, spacious, focused. Less is more approach.');
    styleDirectives.push('SECTIONS: 3-5 focused sections max, each with single clear purpose.');
    styleDirectives.push('WHITESPACE: Generous padding (80-120px between sections), breathing room, visual rest.');
  } else if (density > 65) {
    styleDirectives.push('CONTENT DENSITY: Rich, detailed, comprehensive. Information-forward approach.');
    styleDirectives.push('SECTIONS: 6-10 detailed sections with supporting subsections.');
    styleDirectives.push('WHITESPACE: Efficient use of space, more compact layouts (40-60px between sections).');
  } else {
    styleDirectives.push('CONTENT DENSITY: Balanced - enough detail without overwhelming.');
  }

  // PRICE: Value (0) vs Premium (100)
  if (price < 35) {
    styleDirectives.push('MARKET POSITIONING: Value-focused, accessible, budget-friendly appeal.');
    styleDirectives.push('COPY: Emphasize savings, deals, competitive pricing, "affordable", "best value".');
    styleDirectives.push('DESIGN: Approachable, no-frills, clear pricing, emphasis on quantity/deals.');
  } else if (price > 65) {
    styleDirectives.push('MARKET POSITIONING: Premium, luxury, exclusive, high-end positioning.');
    styleDirectives.push('COPY: Emphasize quality, craftsmanship, exclusivity, "bespoke", "premium", "finest".');
    styleDirectives.push('DESIGN: Elevated aesthetics, luxurious textures, sophisticated color palette, refined details.');
  } else {
    styleDirectives.push('MARKET POSITIONING: Quality-value balance - good quality at fair price.');
  }

  // Build the context string
  const context = `
══════════════════════════════════════════════════════════════
🎨 STYLE PREFERENCES - USER-SELECTED CREATIVE DIRECTION
══════════════════════════════════════════════════════════════
The user has customized their site's creative direction using style sliders.
FOLLOW THESE DIRECTIVES TO MATCH THEIR VISION:

${styleDirectives.join('\n\n')}

SLIDER VALUES (0-100 scale, 50=neutral):
- Vibe: ${vibe} (${vibe < 35 ? 'Professional' : vibe > 65 ? 'Friendly' : 'Balanced'})
- Energy: ${energy} (${energy < 35 ? 'Calm/Refined' : energy > 65 ? 'Bold/Dynamic' : 'Balanced'})
- Era: ${era} (${era < 35 ? 'Classic/Timeless' : era > 65 ? 'Modern/Trendy' : 'Contemporary'})
- Density: ${density} (${density < 35 ? 'Minimal/Spacious' : density > 65 ? 'Rich/Detailed' : 'Balanced'})
- Price: ${price} (${price < 35 ? 'Value-Focused' : price > 65 ? 'Premium/Luxury' : 'Quality-Value'})

IMPORTANT: These preferences should influence EVERY aspect of the generated page:
- Color choices and saturation levels
- Font selections and weights
- Animation timing and style
- Content depth and section count
- Copy tone and vocabulary
- Overall visual impression
══════════════════════════════════════════════════════════════
`;

  return context;
}

/**
 * Convert mood slider values into concrete CSS styles for fallback pages
 * This enables zero-cost previews that still reflect user preferences
 *
 * @param {Object} sliders - { vibe, energy, era, density, price } (0-100)
 * @param {Object} baseColors - Base colors from industry config
 * @returns {Object} Style configuration object
 */
function getSliderStyles(sliders, baseColors = {}) {
  const {
    vibe = 50,
    energy = 50,
    era = 50,
    density = 50,
    price = 50,
    theme = 'light' // Explicit theme mode: 'light', 'medium', 'dark'
  } = sliders || {};

  // Base colors with fallbacks
  const base = {
    primary: baseColors.primary || '#2563eb',
    accent: baseColors.accent || '#06b6d4',
    text: baseColors.text || '#1a1a2e',
    textMuted: baseColors.textMuted || '#64748b',
    background: baseColors.background || '#ffffff',
    surface: baseColors.surface || '#f8fafc'
  };

  // FONTS based on era slider
  let fontHeading, fontBody, fontWeight;
  if (era < 35) {
    // Classic - serif fonts
    fontHeading = "'Playfair Display', Georgia, serif";
    fontBody = "'Merriweather', Georgia, serif";
    fontWeight = '400';
  } else if (era > 65) {
    // Modern - clean sans-serif
    fontHeading = "'Inter', 'Outfit', system-ui, sans-serif";
    fontBody = "'Inter', system-ui, sans-serif";
    fontWeight = '600';
  } else {
    // Balanced
    fontHeading = "'DM Sans', 'Inter', system-ui, sans-serif";
    fontBody = "system-ui, sans-serif";
    fontWeight = '500';
  }

  // SPACING based on density slider
  let sectionPadding, cardPadding, gap;
  if (density < 35) {
    // Minimal - lots of whitespace
    sectionPadding = '120px 20px';
    cardPadding = '40px';
    gap = '48px';
  } else if (density > 65) {
    // Rich - tighter spacing
    sectionPadding = '60px 20px';
    cardPadding = '20px';
    gap = '20px';
  } else {
    // Balanced
    sectionPadding = '80px 20px';
    cardPadding = '28px';
    gap = '32px';
  }

  // BORDER RADIUS based on era
  // Ultra-modern (90+) = sharp squared-off look
  // Modern (65-90) = rounded
  // Classic (<35) = subtle
  let borderRadius;
  if (era >= 90) {
    borderRadius = '2px'; // Ultra-modern - sharp, squared-off, clean geometric
  } else if (era < 35) {
    borderRadius = '4px'; // Classic - subtle
  } else if (era > 65) {
    borderRadius = '16px'; // Modern - rounded
  } else {
    borderRadius = '8px'; // Balanced
  }

  // COLOR ADJUSTMENTS based on explicit theme mode and price positioning
  let primaryColor = base.primary;
  let accentColor = base.accent;
  let surfaceColor = base.surface;

  // LUXURY COLORS: When price is premium (>85), use luxury gold/champagne palette
  const isLuxury = price > 85;
  if (isLuxury) {
    primaryColor = '#d4af37';      // Luxury gold
    accentColor = '#c9a227';       // Darker gold accent
    base.primary = primaryColor;
    base.accent = accentColor;
  } else if (price > 65) {
    // Premium but not ultra-luxury - refined gold tones
    primaryColor = '#b8860b';      // Dark goldenrod
    accentColor = '#daa520';       // Goldenrod accent
    base.primary = primaryColor;
    base.accent = accentColor;
  }

  // Theme-based background colors (light/medium/dark)
  if (theme === 'dark') {
    // Dark theme - bold, dramatic backgrounds
    if (isLuxury) {
      // Luxury dark - rich charcoal/near-black
      surfaceColor = '#1a1a1f';
      base.text = '#f5f5f0';
      base.textMuted = '#a8a8a0';
      base.background = '#0d0d0f';
    } else {
      surfaceColor = '#0f172a';
      base.text = '#f1f5f9';
      base.textMuted = '#94a3b8';
      base.background = '#0a0a0f';
    }
  } else if (theme === 'medium') {
    // Medium theme - soft, subtle backgrounds (warm grays)
    if (isLuxury) {
      // Luxury medium - warm cream/champagne tones
      surfaceColor = '#f5f0e6';
      base.text = '#2d2a26';
      base.textMuted = '#5c5955';
      base.background = '#faf6ef';
    } else {
      surfaceColor = '#e5e5e5';
      base.text = '#1f2937';
      base.textMuted = '#4b5563';
      base.background = '#f0f0f0';
    }
  } else if (isLuxury) {
    // Luxury light - clean whites with warm undertones
    surfaceColor = '#fdfbf7';
    base.text = '#1f1e1c';
    base.textMuted = '#4a4845';
    base.background = '#ffffff';
  }
  // 'light' non-luxury theme keeps the default light colors

  // HEADLINE STYLE based on vibe
  let headlineStyle;
  if (vibe < 35) {
    // Professional
    headlineStyle = 'uppercase';
  } else {
    headlineStyle = 'none';
  }

  // BUTTON STYLE based on energy
  let buttonStyle;
  if (energy < 35) {
    // Calm - subtle buttons
    buttonStyle = {
      padding: '14px 28px',
      borderRadius: borderRadius,
      fontWeight: '500',
      textTransform: 'none'
    };
  } else if (energy > 65) {
    // Bold - prominent buttons
    buttonStyle = {
      padding: '18px 36px',
      borderRadius: borderRadius,
      fontWeight: '700',
      textTransform: 'uppercase'
    };
  } else {
    buttonStyle = {
      padding: '16px 32px',
      borderRadius: borderRadius,
      fontWeight: '600',
      textTransform: 'none'
    };
  }

  // COPY TONE based on vibe
  let copyTone;
  if (vibe < 35) {
    copyTone = {
      greeting: 'Welcome.',
      cta: 'Learn More',
      about: 'Our firm has been delivering excellence since establishment.',
      valueWords: ['expertise', 'professional', 'trusted', 'established']
    };
  } else if (vibe > 65) {
    copyTone = {
      greeting: "Hey there! We're so glad you're here.",
      cta: "Let's Get Started!",
      about: "We're a passionate team that loves what we do.",
      valueWords: ['friendly', 'caring', 'community', 'family']
    };
  } else {
    copyTone = {
      greeting: 'Welcome to our business.',
      cta: 'Get Started',
      about: 'We are dedicated to providing quality service.',
      valueWords: ['quality', 'reliable', 'dedicated', 'experienced']
    };
  }

  // PRICE POSITIONING copy
  let priceTone;
  if (price < 35) {
    priceTone = {
      valueMessage: 'Affordable quality you can count on.',
      priceLabel: 'Great Value',
      words: ['affordable', 'value', 'savings', 'budget-friendly']
    };
  } else if (price > 65) {
    priceTone = {
      valueMessage: 'Experience the finest quality and craftsmanship.',
      priceLabel: 'Premium',
      words: ['premium', 'luxury', 'exclusive', 'bespoke', 'finest']
    };
  } else {
    priceTone = {
      valueMessage: 'Quality service at fair prices.',
      priceLabel: 'Quality',
      words: ['quality', 'value', 'professional', 'reliable']
    };
  }

  return {
    // Typography
    fontHeading,
    fontBody,
    fontWeight,
    headlineStyle,

    // Spacing
    sectionPadding,
    cardPadding,
    gap,
    borderRadius,

    // Colors (adjusted)
    colors: {
      primary: primaryColor,
      accent: accentColor,
      text: base.text,
      textMuted: base.textMuted,
      background: base.background,
      surface: surfaceColor
    },

    // Theme mode
    theme,
    isDark: theme === 'dark',
    isMedium: theme === 'medium',
    isLuxury: price > 85,
    isPremium: price > 65,

    // Button styles
    buttonStyle,

    // Copy/content tone
    copyTone,
    priceTone,

    // Raw slider values for reference
    sliders: { vibe, energy, era, density, price, theme }
  };
}

// ============================================
// INDUSTRY DETECTION - Keyword-based matching
// ============================================
function detectIndustryFromDescription(description) {
  const text = description.toLowerCase();
  
  // Order matters - more specific matches first
  const patterns = [
    // Finance/Investment (BEFORE SaaS to catch investment firms)
    { industry: 'finance', keywords: ['investment', 'wealth management', 'portfolio', 'hedge fund', 'private equity', 'asset management', 'financial advisor', 'capital', 'securities', 'trading firm', 'brokerage'] },
    
    // Law
    { industry: 'law-firm', keywords: ['law firm', 'attorney', 'lawyer', 'legal', 'litigation', 'counsel'] },
    
    // Healthcare
    { industry: 'healthcare', keywords: ['medical', 'healthcare', 'clinic', 'hospital', 'physician', 'doctor office', 'health center'] },
    { industry: 'dental', keywords: ['dental', 'dentist', 'orthodont', 'oral surgery'] },
    { industry: 'chiropractic', keywords: ['chiropract', 'physical therapy', 'pt clinic', 'rehab center'] },
    { industry: 'barbershop', keywords: ['barbershop', 'barber', 'barber shop', 'brass razor', 'mens grooming', 'fade', 'haircut', 'shave'] },
    { industry: 'spa-salon', keywords: ['spa', 'salon', 'beauty', 'nail', 'hair stylist', 'esthetician', 'massage therapy'] },
    
    // Food & Beverage (pizza FIRST - more specific than restaurant)
    { industry: 'pizza', keywords: ['pizza', 'pizzeria', 'pie shop', 'slice'] },
    { industry: 'restaurant', keywords: ['restaurant', 'dining', 'bistro', 'eatery', 'fine dining', 'steakhouse', 'seafood', 'bbq', 'barbecue', 'grill'] },
    { industry: 'cafe', keywords: ['coffee', 'cafe', 'espresso', 'tea house', 'roaster'] },
    { industry: 'bar', keywords: ['bar', 'nightclub', 'lounge', 'pub', 'brewery', 'cocktail', 'wine bar'] },
    { industry: 'bakery', keywords: ['bakery', 'pastry', 'cake shop', 'donut', 'bread'] },
    
    // Professional Services
    { industry: 'accounting', keywords: ['accounting', 'cpa', 'bookkeep', 'tax preparation', 'audit'] },
    { industry: 'consulting', keywords: ['consulting', 'consultant', 'advisory', 'strategy firm'] },
    { industry: 'real-estate', keywords: ['real estate', 'realtor', 'property', 'realty', 'broker'] },
    { industry: 'insurance', keywords: ['insurance', 'coverage', 'policy', 'claims'] },
    
    // Fitness & Wellness
    { industry: 'fitness', keywords: ['gym', 'fitness center', 'crossfit', 'personal training', 'workout'] },
    { industry: 'yoga', keywords: ['yoga', 'pilates', 'meditation studio', 'wellness studio'] },
    
    // Tech
    { industry: 'saas', keywords: ['saas', 'software', 'platform', 'app', 'tech startup', 'b2b', 'dashboard', 'analytics tool'] },
    { industry: 'startup', keywords: ['startup', 'disrupt', 'innovation lab', 'venture'] },
    { industry: 'agency', keywords: ['agency', 'marketing agency', 'design agency', 'creative agency', 'digital agency', 'seo', 'ppc'] },
    
    // Retail
    { industry: 'ecommerce', keywords: ['ecommerce', 'online store', 'shop', 'retail', 'boutique', 'merchandise'] },
    { industry: 'subscription-box', keywords: ['subscription box', 'monthly box', 'curated box'] },
    
    // Creative
    { industry: 'photography', keywords: ['photography', 'photographer', 'photo studio', 'headshot'] },
    { industry: 'wedding', keywords: ['wedding', 'event planner', 'bridal', 'event coordinator'] },
    { industry: 'portfolio', keywords: ['portfolio', 'freelance', 'designer portfolio', 'developer portfolio'] },
    
    // Organizations
    { industry: 'nonprofit', keywords: ['nonprofit', 'charity', 'foundation', 'ngo', 'cause'] },
    { industry: 'church', keywords: ['church', 'ministry', 'worship', 'congregation', 'faith'] },
    
    // Education
    { industry: 'school', keywords: ['school', 'academy', 'institute', 'university', 'college', 'education'] },
    { industry: 'online-course', keywords: ['online course', 'e-learning', 'bootcamp', 'training program', 'masterclass'] },
    
    // Trade Services
    { industry: 'construction', keywords: ['construction', 'contractor', 'builder', 'remodel', 'renovation', 'roofing'] },
    { industry: 'plumber', keywords: ['plumb', 'hvac', 'heating', 'cooling', 'air condition'] },
    { industry: 'electrician', keywords: ['electric', 'wiring', 'electrical contractor'] },
    { industry: 'landscaping', keywords: ['landscap', 'lawn care', 'garden', 'yard', 'tree service'] },
    { industry: 'cleaning', keywords: ['cleaning', 'maid', 'janitorial', 'housekeep'] },
    { industry: 'auto-repair', keywords: ['auto repair', 'mechanic', 'car service', 'automotive', 'body shop', 'oil change'] },
    
    // Other Services
    { industry: 'pet-services', keywords: ['pet', 'grooming', 'veterinar', 'dog walk', 'pet sit', 'kennel'] },
    { industry: 'moving', keywords: ['moving', 'movers', 'relocation', 'hauling'] },
    
    // Events & Hospitality
    { industry: 'event-venue', keywords: ['venue', 'banquet', 'event space', 'conference center', 'ballroom'] },
    { industry: 'hotel', keywords: ['hotel', 'resort', 'inn', 'lodging', 'hospitality', 'motel'] },
    { industry: 'travel', keywords: ['travel', 'tour', 'vacation', 'trip', 'adventure'] },
    
    // Entertainment
    { industry: 'musician', keywords: ['musician', 'band', 'artist', 'singer', 'dj', 'music producer'] },
    { industry: 'podcast', keywords: ['podcast', 'content creator', 'youtuber', 'streamer'] },
    { industry: 'gaming', keywords: ['gaming', 'esport', 'gamer', 'twitch'] },
  ];
  
  for (const { industry, keywords } of patterns) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        console.log(`   🎯 Detected industry: ${industry} (matched: "${keyword}")`);
        return industry;
      }
    }
  }
  
  // Default fallback
  console.log(`   🎯 No specific match, defaulting to: saas`);
  return 'saas';
}

// Build minimal prompt for AI - only includes what's needed
function buildPrompt(industryKey, layoutKey, selectedEffects) {
  const industry = INDUSTRIES[industryKey];
  if (!industry) return null;
  
  const layout = layoutKey ? LAYOUTS[layoutKey] : LAYOUTS[industry.defaultLayout] || LAYOUTS['hero-full-image'];
  const effects = (selectedEffects || industry.effects || []).map(e => EFFECTS[e]).filter(Boolean);
  const sections = (industry.sections || []).map(s => SECTIONS[s] || s);
  
  return {
    industry: {
      name: industry.name,
      vibe: industry.vibe,
      visualPrompt: industry.visualPrompt
    },
    colors: industry.colors,
    typography: industry.typography,
    imagery: industry.imagery,
    layout: {
      name: layout?.name || 'Hero Full Image',
      description: layout?.description || 'Full-width hero with background image',
      codeHint: layout?.codeHint || 'Full viewport hero section',
      heroHeight: layout?.heroHeight || '70vh'
    },
    effects: effects.map(e => ({ name: e.name, css: e.css, reactHint: e.reactHint })),
    sections: sections.map(s => typeof s === 'string' ? s : { name: s.name, elements: s.elements })
  };
}

/**
 * Build smart context guide for AI to infer realistic content from minimal input
 * This helps Claude generate specific, realistic content even when user provides minimal details
 */
function buildSmartContextGuide(businessInput, industryName) {
  const input = (businessInput || '').toLowerCase();
  const industry = (industryName || '').toLowerCase();

  // Detect business type from input keywords
  const contextHints = [];

  // Restaurant/Food detection
  if (input.includes('pizza') || input.includes('pizzeria') || industry.includes('restaurant')) {
    contextHints.push(`
DETECTED: PIZZA/ITALIAN RESTAURANT
Generate these specific elements:
- MENU: Create 15-20 actual menu items with names like "Margherita", "Meat Lovers Supreme", "Brooklyn Special"
- PRICES: Pizzas $14-24, Appetizers $8-14, Salads $10-15, Drinks $3-5, Desserts $6-9
- SECTIONS: Pizzas, Specialty Pizzas, Calzones, Salads, Appetizers, Drinks, Desserts
- HOURS: Mon-Thu 11am-10pm, Fri-Sat 11am-11pm, Sun 12pm-9pm
- FEATURES: Dine-in, Takeout, Delivery, Catering available
- ATMOSPHERE: Family-friendly, casual Italian dining
`);
  }

  if (input.includes('dental') || input.includes('dentist') || industry.includes('dental')) {
    contextHints.push(`
DETECTED: DENTAL PRACTICE
Generate these specific elements:
- SERVICES: General Dentistry, Cosmetic Dentistry, Teeth Whitening, Dental Implants, Invisalign, Emergency Care
- TEAM: Create 3-4 dentist/hygienist profiles with realistic names and specialties
- INSURANCE: "We accept most major insurance plans including Delta, Cigna, Aetna, MetLife"
- HOURS: Mon-Fri 8am-5pm, Sat 9am-2pm (by appointment)
- FEATURES: New patient specials, Same-day appointments, Sedation dentistry available
- ATMOSPHERE: Modern, comfortable, family-friendly practice
`);
  }

  if (input.includes('law') || input.includes('attorney') || input.includes('legal') || industry.includes('legal') || industry.includes('law')) {
    contextHints.push(`
DETECTED: LAW FIRM
Generate these specific elements:
- PRACTICE AREAS: Personal Injury, Family Law, Criminal Defense, Estate Planning, Business Law
- TEAM: Create 3-5 attorney profiles with JD credentials, bar admissions, years of experience
- STATS: "Over $50M recovered for clients", "500+ cases won", "35+ years combined experience"
- CONSULTATION: Free initial consultation, No fee unless we win (for PI cases)
- HOURS: Mon-Fri 9am-6pm, 24/7 for emergencies
- ATMOSPHERE: Professional, trustworthy, client-focused
`);
  }

  if (input.includes('gym') || input.includes('fitness') || input.includes('crossfit') || industry.includes('fitness')) {
    contextHints.push(`
DETECTED: FITNESS/GYM
Generate these specific elements:
- CLASSES: CrossFit, HIIT, Spin, Yoga, Strength Training, Boxing, Personal Training
- MEMBERSHIP: Basic $29/mo, Premium $49/mo, VIP $79/mo with specific features for each
- AMENITIES: Free weights, Cardio machines, Locker rooms, Showers, Sauna, Smoothie bar
- HOURS: Mon-Fri 5am-10pm, Sat-Sun 7am-8pm
- FEATURES: Free trial class, No contract options, Personal training available
- ATMOSPHERE: Motivating, high-energy, supportive community
`);
  }

  if (input.includes('salon') || input.includes('spa') || input.includes('beauty') || industry.includes('spa') || industry.includes('salon')) {
    contextHints.push(`
DETECTED: SALON/SPA
Generate these specific elements:
- SERVICES: Haircuts $35-75, Color $85-150, Highlights $120-200, Facials $75-150, Massage $80-150, Nails $25-65
- TEAM: Create 4-6 stylist profiles with specialties and experience
- PACKAGES: Bridal packages, Spa day packages, Monthly memberships
- HOURS: Tue-Sat 9am-7pm, Sun-Mon closed
- FEATURES: Online booking, Gift cards, Loyalty program
- ATMOSPHERE: Relaxing, upscale, luxurious pampering experience
`);
  }

  if (input.includes('plumb') || input.includes('hvac') || input.includes('electric') || industry.includes('plumber') || industry.includes('home-services')) {
    contextHints.push(`
DETECTED: HOME SERVICES (Plumbing/HVAC/Electrical)
Generate these specific elements:
- SERVICES: Emergency repairs, Installation, Maintenance, Inspections
- PRICING: Service call $89, specific job estimates on common repairs
- AVAILABILITY: 24/7 emergency service, Same-day appointments
- COVERAGE: List 5-10 cities/neighborhoods served
- TRUST: Licensed, bonded, insured, background-checked technicians
- GUARANTEES: Satisfaction guaranteed, Upfront pricing, No overtime charges
`);
  }

  if (input.includes('auto') || input.includes('car') || input.includes('mechanic') || industry.includes('auto')) {
    contextHints.push(`
DETECTED: AUTO REPAIR/DEALERSHIP
Generate these specific elements:
- SERVICES: Oil changes $39.99, Brake service, Tire rotation, Engine diagnostics, A/C repair
- BRANDS: All makes and models, or specific brand specialization
- WARRANTIES: 12-month/12,000-mile warranty on repairs
- HOURS: Mon-Fri 7:30am-6pm, Sat 8am-4pm
- FEATURES: Free estimates, Loaner cars available, Shuttle service
- TRUST: ASE certified technicians, BBB A+ rating
`);
  }

  if (input.includes('tattoo') || input.includes('ink') || input.includes('body art') || industry.includes('tattoo')) {
    contextHints.push(`
DETECTED: TATTOO STUDIO
Generate these specific elements:
- ARTISTS: Create 3-5 tattoo artist profiles with UNIQUE names (like "Marcus 'Blackout' Rodriguez"), each with a specialty:
  * Traditional & Neo-Traditional
  * Photorealistic Portraits
  * Blackwork & Geometric
  * Japanese/Irezumi
  * Watercolor & Abstract
- PRICING: Custom quotes start at $150/hour, minimum $80-100, large pieces by consultation
- SERVICES: Custom tattoos, Cover-ups, Touch-ups, Consultations (free)
- HOURS: Tue-Sat 12pm-10pm, Sun-Mon by appointment only
- POLICIES: 18+ with valid ID, Deposit required, 48-hour cancellation policy
- AFTERCARE: Detailed aftercare instructions provided, Free touch-ups within 6 months
- ATMOSPHERE: Professional, clean, sterile environment, Walk-ins welcome (when available)
`);
  }

  if (input.includes('barber') || input.includes('grooming') || industry.includes('barber')) {
    contextHints.push(`
DETECTED: BARBERSHOP
Generate these specific elements:
- BARBERS: Create 3-5 barber profiles with names and specialties (fades, classic cuts, beard work)
- SERVICES: Haircut $25-35, Beard trim $15, Hot towel shave $30, Kids cut $20, Full service $50
- HOURS: Tue-Fri 9am-7pm, Sat 8am-5pm, Sun-Mon closed
- FEATURES: Walk-ins welcome, Appointments available, Cash and card accepted
- PRODUCTS: Premium pomades, beard oils, grooming kits for sale
- ATMOSPHERE: Classic barbershop vibe, sports on TV, friendly conversation
`);
  }

  if (input.includes('preschool') || input.includes('montessori') || input.includes('daycare') ||
      input.includes('childcare') || input.includes('nursery') || input.includes('kindergarten') ||
      industry.includes('preschool') || industry.includes('montessori') || industry.includes('daycare')) {
    contextHints.push(`
DETECTED: PRESCHOOL/MONTESSORI/DAYCARE
Generate these specific elements:
- PROGRAMS: Infant (6wks-12mo), Toddler (1-2yrs), Preschool (3-4yrs), Pre-K (4-5yrs), Before/After School
- CURRICULUM: Play-based learning, Montessori method, STEM activities, Art & Music, Outdoor play
- TEACHERS: Create 4-6 warm, friendly teacher profiles with education credentials (ECE certified, CPR trained)
- HOURS: Mon-Fri 6:30am-6:30pm, Year-round or School-year options
- TUITION: Full-time $1,200-1,800/mo, Part-time options available, Sibling discounts
- FEATURES: Low student-teacher ratios (1:4 for infants, 1:8 for preschool), Organic snacks, Daily reports via app
- SAFETY: Licensed, Background-checked staff, Secure entry, Video monitoring
- GALLERY: Show children learning, art projects, playground activities, circle time, reading corners
- ATMOSPHERE: Nurturing, educational, safe, fun learning environment
`);
  }

  if (input.includes('education') || input.includes('school') || input.includes('academy') ||
      input.includes('tutoring') || input.includes('learning center') ||
      industry.includes('education') || industry.includes('tutoring')) {
    contextHints.push(`
DETECTED: EDUCATION/TUTORING CENTER
Generate these specific elements:
- PROGRAMS: Math tutoring, Reading/Writing, Test prep (SAT/ACT), STEM enrichment, Language classes
- GRADE LEVELS: Elementary, Middle School, High School, College prep
- INSTRUCTORS: Create 4-6 teacher profiles with degrees and teaching experience
- FORMATS: 1-on-1 tutoring, Small groups (3-5 students), Online sessions, In-home tutoring
- PRICING: $50-100/hour for individual, $30-50/hour for group sessions, Package discounts
- HOURS: Mon-Fri 3pm-8pm, Sat 9am-5pm (peak after-school hours)
- RESULTS: "Students improve 2+ grade levels", "95% see improvement within 3 months"
- FEATURES: Free assessment, Progress tracking, Homework help, Flexible scheduling
- GALLERY: Show students studying, classroom activities, graduation celebrations
- ATMOSPHERE: Supportive, encouraging, academic excellence focus
`);
  }

  // Default guidance if no specific type detected
  if (contextHints.length === 0) {
    contextHints.push(`
GENERAL BUSINESS - Infer from the name and industry:
- Create 6-10 specific services/products with realistic prices
- Generate 3-4 team member profiles with realistic names and roles
- Include specific business hours appropriate for the industry
- Add realistic stats: years in business (10-25), customers served (1000+), rating (4.8+ stars)
- Create 3-4 testimonials with first names and specific praise
- Include specific location/service area details
`);
  }

  return contextHints.join('\n');
}

/**
 * Build layout context from frontend preview configuration
 * This converts the frontend's layoutStylePreview into AI prompt instructions
 */
function buildLayoutContextFromPreview(layoutId, previewConfig, industryKey) {
  const heroStyleMap = {
    'full': 'Full-bleed hero image with overlay text',
    'split': 'Split layout with text on left, image on right',
    'minimal': 'Minimal hero with clean typography focus',
    'corporate': 'Professional corporate hero with subtle imagery',
    'warm': 'Warm, welcoming hero with friendly imagery',
    'clean': 'Clean, modern hero with plenty of whitespace',
    'team': 'Team-focused hero showcasing professionals',
    'overlay': 'Image with gradient overlay and centered text'
  };

  const contentStyleMap = {
    'formal': 'Formal, professional content presentation',
    'results': 'Results-driven with case studies and testimonials',
    'services': 'Services-focused with clear offerings grid',
    'caring': 'Warm, compassionate content for patient/client trust',
    'personal': 'Personal, human-centered content approach'
  };

  const ctaStyleMap = {
    'overlay': 'CTA button overlaid on hero image',
    'button': 'Prominent CTA buttons below hero',
    'prominent': 'Large, eye-catching CTA section',
    'subtle': 'Subtle, professional CTA placement',
    'consultation': 'Free consultation CTA emphasis',
    'booking': 'Easy booking/appointment CTA'
  };

  const heroDesc = heroStyleMap[previewConfig.heroStyle] || 'Modern hero section';
  const contentDesc = contentStyleMap[previewConfig.contentStyle] || '';
  const ctaDesc = ctaStyleMap[previewConfig.ctaStyle] || 'Clear call-to-action';
  const menuPosition = previewConfig.menuPosition ? `Menu position: ${previewConfig.menuPosition}` : '';

  return `
═══════════════════════════════════════════════════════════════
SELECTED LAYOUT STYLE: ${layoutId.replace(/-/g, ' ').toUpperCase()}
═══════════════════════════════════════════════════════════════

HERO SECTION STYLE:
${heroDesc}
${previewConfig.heroStyle === 'full' ? '- Use a dramatic full-width background image\n- Text should be white with text-shadow for readability\n- Include gradient overlay for text contrast' : ''}
${previewConfig.heroStyle === 'split' ? '- Two-column layout: compelling headline on left, visual on right\n- Clean separation between text and image areas' : ''}
${previewConfig.heroStyle === 'minimal' ? '- Focus on typography, minimal imagery\n- Lots of whitespace, clean and elegant\n- Let the copy speak for itself' : ''}

${contentDesc ? `CONTENT STYLE:\n${contentDesc}` : ''}

CTA APPROACH:
${ctaDesc}
${menuPosition}

IMPORTANT: The user specifically chose the "${layoutId.replace(/-/g, ' ')}" layout.
Follow these style guidelines closely when generating the hero and page structure.
═══════════════════════════════════════════════════════════════
`;
}

/**
 * Extract statistics from business description text
 * Parses numbers and context to provide realistic stats for the AI
 */
function extractBusinessStats(businessText, industryName) {
  if (!businessText) {
    return generateDefaultStats(industryName);
  }

  const stats = [];
  const text = businessText.toLowerCase();

  // Pattern matchers for common stat phrases
  const patterns = [
    // Years of experience
    { regex: /(\d+)\+?\s*(?:years?|yrs?)(?:\s+(?:of\s+)?(?:experience|in business|combined))?/gi, label: 'Years Experience', suffix: '+ Years' },
    { regex: /(?:since|established|founded|opened)\s*(?:in\s+)?(\d{4})/gi, type: 'year', label: 'Years in Business', suffix: '+ Years' },
    { regex: /(\d+)\+?\s*(?:years?|yrs?)\s*(?:combined|of combined)/gi, label: 'Combined Experience', suffix: '+ Years' },

    // Reviews and ratings
    { regex: /(\d+)\+?\s*(?:5-star|five star|★+)\s*reviews?/gi, label: 'Reviews', suffix: '+ 5-Star Reviews' },
    { regex: /(\d+)\+?\s*reviews?/gi, label: 'Reviews', suffix: '+ Reviews' },
    { regex: /(\d+(?:\.\d+)?)\s*(?:star|★)\s*(?:rating|average)/gi, label: 'Rating', suffix: ' Stars' },

    // Customers/Clients
    { regex: /(\d+(?:,\d{3})*)\+?\s*(?:happy\s+)?(?:customers?|clients?|families|patients?)/gi, label: 'Customers', suffix: '+ Happy Customers' },
    { regex: /served\s+(?:over\s+)?(\d+(?:,\d{3})*)\+?/gi, label: 'Customers Served', suffix: '+ Served' },

    // Projects/Jobs
    { regex: /(\d+(?:,\d{3})*)\+?\s*(?:projects?|jobs?|homes?|cases?|installations?)/gi, label: 'Projects', suffix: '+ Projects' },
    { regex: /completed\s+(?:over\s+)?(\d+(?:,\d{3})*)\+?/gi, label: 'Completed', suffix: '+ Completed' },

    // Team
    { regex: /(\d+)\+?\s*(?:team\s+members?|employees?|staff|professionals?|experts?|technicians?)/gi, label: 'Team', suffix: '+ Team Members' },

    // Satisfaction
    { regex: /(\d+)%\s*(?:satisfaction|success|retention|customer\s+satisfaction)/gi, label: 'Satisfaction', suffix: '% Satisfaction' },

    // Awards
    { regex: /(\d+)\+?\s*awards?/gi, label: 'Awards', suffix: '+ Awards' },

    // Locations
    { regex: /(\d+)\+?\s*locations?/gi, label: 'Locations', suffix: '+ Locations' },

    // Products/Services
    { regex: /(\d+)\+?\s*(?:products?|services?|menu items?)/gi, label: 'Products', suffix: '+ Products' }
  ];

  const foundStats = {};

  for (const pattern of patterns) {
    const matches = [...businessText.matchAll(pattern.regex)];
    for (const match of matches) {
      let value = match[1];

      // Handle "since YEAR" pattern
      if (pattern.type === 'year') {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        value = currentYear - year;
      } else {
        // Remove commas and parse
        value = parseInt(value.replace(/,/g, ''));
      }

      if (value > 0 && !foundStats[pattern.label]) {
        foundStats[pattern.label] = { value, suffix: pattern.suffix };
      }
    }
  }

  // Build the stats context string
  if (Object.keys(foundStats).length > 0) {
    let result = 'EXTRACTED STATS FROM BUSINESS DESCRIPTION (USE THESE!):\n';
    for (const [label, data] of Object.entries(foundStats)) {
      result += `- ${label}: ${data.value}${data.suffix}\n`;
      stats.push(`<AnimatedCounter end={${data.value}} suffix="${data.suffix}" duration={2} />`);
    }
    result += '\nUSE THESE EXACT NUMBERS in AnimatedCounter components!\n';
    return result;
  }

  // No stats found - generate industry-appropriate defaults
  return generateDefaultStats(industryName);
}

/**
 * Generate realistic default stats based on industry
 */
function generateDefaultStats(industryName) {
  const industry = (industryName || '').toLowerCase();

  let defaults = {
    years: 15,
    customers: 1000,
    satisfaction: 98,
    extra: null
  };

  // Industry-specific defaults
  if (industry.includes('tattoo') || industry.includes('ink') || industry.includes('body art')) {
    defaults = { years: 8, customers: 5000, satisfaction: 99, extra: { label: 'Custom Designs', value: 10000 } };
  } else if (industry.includes('barber') || industry.includes('hair') || industry.includes('salon') || industry.includes('grooming')) {
    defaults = { years: 12, customers: 2700, satisfaction: 98, extra: { label: 'Master Barbers', value: 4 } };
  } else if (industry.includes('law') || industry.includes('legal')) {
    defaults = { years: 25, customers: 500, satisfaction: 98, extra: { label: 'Cases Won', value: 250 } };
  } else if (industry.includes('restaurant') || industry.includes('food') || industry.includes('pizza')) {
    defaults = { years: 10, customers: 5000, satisfaction: 97, extra: { label: 'Dishes Served', value: 50000 } };
  } else if (industry.includes('fitness') || industry.includes('gym')) {
    defaults = { years: 8, customers: 2000, satisfaction: 96, extra: { label: 'Transformations', value: 500 } };
  } else if (industry.includes('medical') || industry.includes('health') || industry.includes('dental')) {
    defaults = { years: 20, customers: 3000, satisfaction: 99, extra: { label: 'Procedures', value: 10000 } };
  } else if (industry.includes('plumb') || industry.includes('hvac') || industry.includes('electric')) {
    defaults = { years: 15, customers: 2500, satisfaction: 98, extra: { label: 'Jobs Completed', value: 5000 } };
  } else if (industry.includes('bowl') || industry.includes('arcade') || industry.includes('entertainment')) {
    defaults = { years: 12, customers: 10000, satisfaction: 95, extra: { label: 'Parties Hosted', value: 2000 } };
  } else if (industry.includes('retail') || industry.includes('shop')) {
    defaults = { years: 10, customers: 5000, satisfaction: 96, extra: { label: 'Products', value: 500 } };
  } else if (industry.includes('consult') || industry.includes('professional')) {
    defaults = { years: 20, customers: 300, satisfaction: 99, extra: { label: 'Projects', value: 150 } };
  } else if (industry.includes('auto') || industry.includes('car') || industry.includes('mechanic')) {
    defaults = { years: 18, customers: 4000, satisfaction: 97, extra: { label: 'Vehicles Serviced', value: 8000 } };
  } else if (industry.includes('spa') || industry.includes('beauty') || industry.includes('wellness')) {
    defaults = { years: 10, customers: 3500, satisfaction: 98, extra: { label: 'Treatments', value: 15000 } };
  } else if (industry.includes('pet') || industry.includes('vet') || industry.includes('grooming')) {
    defaults = { years: 8, customers: 2000, satisfaction: 99, extra: { label: 'Happy Pets', value: 5000 } };
  } else if (industry.includes('preschool') || industry.includes('montessori') || industry.includes('daycare') ||
             industry.includes('childcare') || industry.includes('nursery') || industry.includes('kindergarten')) {
    defaults = { years: 12, customers: 500, satisfaction: 99, extra: { label: 'Graduates', value: 1500 } };
  } else if (industry.includes('education') || industry.includes('school') || industry.includes('academy') ||
             industry.includes('tutoring') || industry.includes('learning')) {
    defaults = { years: 15, customers: 1000, satisfaction: 97, extra: { label: 'Students Taught', value: 5000 } };
  }

  let result = `NO SPECIFIC STATS FOUND - USE THESE REALISTIC DEFAULTS FOR ${industryName || 'BUSINESS'}:
- Years in Business: ${defaults.years}+ Years
- Customers Served: ${defaults.customers}+ Happy Customers
- Satisfaction Rate: ${defaults.satisfaction}%+ Satisfaction`;

  if (defaults.extra) {
    result += `\n- ${defaults.extra.label}: ${defaults.extra.value}+`;
  }

  result += `

IMPORTANT: These are MINIMUM realistic values. Feel free to adjust slightly higher.
NEVER use 0 or placeholder text like "X" - always use real numbers!`;

  return result;
}

/**
 * Generate CONTEXT-AWARE industry-specific image URLs
 * Returns different images for hero, team, gallery, services based on context
 */
function getIndustryImageUrls(industryName) {
  const industry = (industryName || '').toLowerCase();
  console.log(`   🖼️ getIndustryImageUrls called with: "${industryName}" → normalized: "${industry}"`);

  // Context-aware image configurations - different images for different page sections
  const imageConfig = {
    tattoo: {
      hero: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=1920', // Tattoo studio interior
      heroVideo: 'https://videos.pexels.com/video-files/5319884/5319884-hd_1920_1080_30fps.mp4', // Tattoo artist working
      team: [
        'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800', // Tattoo artist working
        'https://images.unsplash.com/photo-1590246814883-57764f7f17c9?w=800', // Tattooed person portrait
        'https://images.unsplash.com/photo-1542727365-19732a80dcfd?w=800', // Artist with tattoo machine
        'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=800'  // Tattooed professional
      ],
      gallery: [
        'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=800', // Tattoo closeup
        'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800', // Arm tattoo
        'https://images.unsplash.com/photo-1475403614135-5f1aa0eb5015?w=800', // Back tattoo
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800'  // Detailed tattoo work
      ],
      services: [
        'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800', // Tattooing in progress
        'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800'  // Studio setup
      ],
      searchTerms: ['tattoo artist', 'tattoo studio', 'tattooing', 'tattoo art', 'inked']
    },
    barbershop: {
      hero: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920',
      heroVideo: 'https://videos.pexels.com/video-files/3993451/3993451-uhd_2560_1440_25fps.mp4', // Barber cutting hair
      team: [
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800', // Barber at work
        'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800', // Barber portrait
        'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800', // Barber styling
        'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800'  // Barber with client
      ],
      gallery: [
        'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800', // Barber tools
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800', // Shop interior
        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800'  // Styling
      ],
      services: [
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
        'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800'
      ],
      searchTerms: ['barbershop', 'barber cutting hair', 'mens grooming', 'barber portrait']
    },
    salon: {
      hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920',
      team: [
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', // Stylist working
        'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800', // Hairstylist portrait
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'  // Salon professional
      ],
      gallery: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
        'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800'
      ],
      services: [
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
      ],
      searchTerms: ['hair salon', 'hairstylist', 'hair cutting', 'salon professional']
    },
    restaurant: {
      hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920',
      heroVideo: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4', // Chef plating food
      team: [
        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800', // Chef portrait
        'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800', // Chef cooking
        'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800'  // Kitchen staff
      ],
      gallery: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', // Food plating
        'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800', // Dish
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'  // Food
      ],
      services: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'
      ],
      searchTerms: ['restaurant interior', 'chef cooking', 'fine dining', 'chef portrait']
    },
    pizza: {
      hero: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1920',
      heroVideo: 'https://videos.pexels.com/video-files/4253291/4253291-uhd_2560_1440_25fps.mp4', // Pizza being made
      team: [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', // Pizza chef
        'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800'  // Pizza making
      ],
      gallery: [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800'
      ],
      services: [
        'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800'
      ],
      searchTerms: ['pizza chef', 'pizzeria', 'pizza making', 'italian restaurant']
    },
    // Coffee Shop / Cafe - cozy coffee house atmosphere
    coffee: {
      hero: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920', // Cozy coffee shop interior
      heroVideo: 'https://videos.pexels.com/video-files/3214107/3214107-uhd_2560_1440_25fps.mp4', // Coffee being made
      team: [
        'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800', // Barista making coffee
        'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800', // Barista portrait
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', // Coffee shop employee
        'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800'  // Coffee roaster
      ],
      gallery: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', // Latte art
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800', // Coffee and pastry
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', // Coffee cup
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800', // Coffee beans
        'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800', // Pastries display
        'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800'  // Cozy cafe scene
      ],
      services: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', // Latte art
        'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800'  // Barista at work
      ],
      searchTerms: ['coffee shop', 'barista', 'latte art', 'cafe interior', 'coffee beans', 'espresso', 'cozy cafe']
    },
    // Luxury Steakhouse - upscale dining, dry-aged beef, wine, elegant atmosphere
    steakhouse: {
      hero: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920', // Fine dining table setting
      heroVideo: 'https://videos.pexels.com/video-files/4253001/4253001-uhd_2560_1440_25fps.mp4', // Steak searing
      team: [
        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800', // Chef portrait in whites
        'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800', // Chef with knife
        'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=800', // Sommelier with wine
        'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800'  // Kitchen staff
      ],
      gallery: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', // Perfectly plated steak
        'https://images.unsplash.com/photo-1558030006-450675393462?w=800', // Ribeye steak
        'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800', // Wine selection
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', // Elegant dining room
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800', // Steak being cut
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'  // Food presentation
      ],
      services: [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', // Fine dining
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'  // Plated steak
      ],
      searchTerms: ['luxury steakhouse', 'fine dining steak', 'dry aged beef', 'ribeye', 'wagyu', 'upscale restaurant', 'wine cellar']
    },
    dental: {
      hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920',
      team: [
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800', // Dentist portrait
        'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800', // Dental team
        'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800'  // Dentist working
      ],
      gallery: [
        'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
        'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800'
      ],
      services: [
        'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800'
      ],
      searchTerms: ['dentist', 'dental office', 'dental team', 'dental professional']
    },
    fitness: {
      hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920',
      heroVideo: 'https://videos.pexels.com/video-files/4761434/4761434-uhd_2560_1440_25fps.mp4', // Gym workout
      team: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', // Personal trainer
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', // Trainer portrait
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800'  // Fitness coach
      ],
      gallery: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800'
      ],
      services: [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'
      ],
      searchTerms: ['personal trainer', 'fitness coach', 'gym trainer', 'workout instructor']
    },
    auto: {
      hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920',
      team: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', // Mechanic
        'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800'  // Auto tech
      ],
      gallery: [
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
      ],
      services: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
      ],
      searchTerms: ['auto mechanic', 'car repair', 'mechanic portrait', 'auto technician']
    },
    law: {
      hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920',
      team: [
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800', // Attorney portrait
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800', // Lawyer
        'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=800'  // Legal professional
      ],
      gallery: [
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800',
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800'
      ],
      services: [
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800'
      ],
      searchTerms: ['attorney', 'law firm', 'lawyer portrait', 'legal professional']
    },
    spa: {
      hero: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920',
      heroVideo: 'https://videos.pexels.com/video-files/3188167/3188167-uhd_2560_1440_25fps.mp4', // Spa massage treatment
      team: [
        'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800', // Spa therapist
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800'  // Wellness professional
      ],
      gallery: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
      ],
      services: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
      ],
      searchTerms: ['spa therapist', 'massage therapist', 'wellness professional', 'spa treatment']
    },
    // Education - Preschool, Montessori, Daycare, Learning Centers
    education: {
      hero: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920', // Children learning
      team: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800', // Teacher with students
        'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800', // Teacher smiling
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', // Educator portrait
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800'  // Teacher helping student
      ],
      gallery: [
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', // Children learning
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800', // Art project
        'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800', // Classroom activities
        'https://images.unsplash.com/photo-1564429238607-4a7e00ead26a?w=800', // Children playing
        'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800', // Reading time
        'https://images.unsplash.com/photo-1602052793312-b99c2a9ee797?w=800'  // Group activity
      ],
      services: [
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800'
      ],
      searchTerms: ['preschool classroom', 'children learning', 'montessori', 'daycare activities', 'kids art project']
    },
    // Preschool/Montessori specific (alias with child-specific images)
    preschool: {
      hero: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1920', // Kids in classroom
      team: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800', // Teacher with children
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800', // Teacher reading
        'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800', // Friendly teacher
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'  // Educator
      ],
      gallery: [
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800', // Art activity
        'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800', // Circle time
        'https://images.unsplash.com/photo-1564429238607-4a7e00ead26a?w=800', // Playground
        'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800', // Story time
        'https://images.unsplash.com/photo-1602052793312-b99c2a9ee797?w=800', // Music class
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', // Learning center
        'https://images.unsplash.com/photo-1567057419565-4349c49d8a04?w=800', // Sensory play
        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'  // Happy children
      ],
      services: [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800'
      ],
      searchTerms: ['preschool', 'montessori classroom', 'toddler activities', 'early childhood', 'daycare']
    },
    default: {
      hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920',
      team: [
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800', // Business team
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', // Professional portrait
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'  // Team member
      ],
      gallery: [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'
      ],
      services: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
      ],
      searchTerms: ['business professional', 'team portrait', 'office', 'professional headshot']
    }
  };

  // Match industry to config with expanded matching
  let config = imageConfig.default;
  if (industry.includes('tattoo') || industry.includes('ink') || industry.includes('body art')) {
    config = imageConfig.tattoo;
  } else if (industry.includes('barber') || industry.includes('grooming')) {
    config = imageConfig.barbershop;
  } else if (industry.includes('salon') || industry.includes('hair') || industry.includes('beauty')) {
    config = imageConfig.salon;
  } else if (industry.includes('pizza') || industry.includes('pizzeria')) {
    config = imageConfig.pizza;
  } else if (industry.includes('coffee') || industry.includes('cafe') || industry.includes('espresso') ||
             industry.includes('roaster') || industry.includes('tea house')) {
    console.log(`   ☕ COFFEE SHOP MATCH! Using coffee config with video: ${imageConfig.coffee.heroVideo}`);
    config = imageConfig.coffee;
  } else if (industry.includes('steakhouse') || industry.includes('steak house') ||
             industry.includes('prime') || industry.includes('chophouse') ||
             (industry.includes('steak') && (industry.includes('luxury') || industry.includes('fine') || industry.includes('upscale')))) {
    console.log(`   🥩 STEAKHOUSE MATCH! Using steakhouse config with video: ${imageConfig.steakhouse.heroVideo}`);
    config = imageConfig.steakhouse;
  } else if (industry.includes('restaurant') || industry.includes('food') || industry.includes('dining')) {
    config = imageConfig.restaurant;
  } else if (industry.includes('dental') || industry.includes('dentist')) {
    config = imageConfig.dental;
  } else if (industry.includes('fitness') || industry.includes('gym') || industry.includes('yoga')) {
    config = imageConfig.fitness;
  } else if (industry.includes('auto') || industry.includes('car') || industry.includes('mechanic')) {
    config = imageConfig.auto;
  } else if (industry.includes('law') || industry.includes('legal') || industry.includes('attorney')) {
    config = imageConfig.law;
  } else if (industry.includes('spa') || industry.includes('wellness') || industry.includes('massage')) {
    config = imageConfig.spa;
  } else if (industry.includes('preschool') || industry.includes('montessori') || industry.includes('daycare') ||
             industry.includes('childcare') || industry.includes('nursery') || industry.includes('early childhood') ||
             industry.includes('kindergarten') || industry.includes('toddler')) {
    config = imageConfig.preschool;
  } else if (industry.includes('education') || industry.includes('school') || industry.includes('academy') ||
             industry.includes('tutoring') || industry.includes('learning center')) {
    config = imageConfig.education;
  }

  // Return with backward compatibility (hero and secondary) PLUS new context-specific fields
  console.log(`   📸 Selected config has heroVideo: ${config.heroVideo ? 'YES - ' + config.heroVideo.substring(0, 50) + '...' : 'NO'}`);
  return {
    hero: config.hero,
    heroVideo: config.heroVideo || null, // Video background for supported industries
    secondary: config.gallery || config.team, // Backward compat
    team: config.team,
    gallery: config.gallery,
    services: config.services,
    searchTerms: config.searchTerms
  };
}

// Build context from existing site (REBUILD mode)
function buildRebuildContext(existingSite) {
  if (!existingSite) return '';
  
  let context = `
══════════════════════════════════════════════════════════════
REBUILD MODE - Upgrading existing site
══════════════════════════════════════════════════════════════
`;

  // Business info
  if (existingSite.businessName) {
    context += `EXISTING BUSINESS: ${existingSite.businessName}\n`;
  }
  
  // What they don't like (avoid these patterns)
  if (existingSite.dislikes && existingSite.dislikes.length > 0) {
    const dislikeMap = {
      'outdated': 'AVOID outdated design patterns - make it modern and fresh',
      'slow': 'PRIORITIZE performance - minimal animations, optimized layout',
      'mobile': 'MOBILE-FIRST design - ensure excellent responsive behavior',
      'colors': 'USE NEW COLOR SCHEME - do not replicate their old colors',
      'layout': 'COMPLETELY NEW LAYOUT - restructure the information hierarchy',
      'fonts': 'MODERN TYPOGRAPHY - use clean, professional font pairings',
      'images': 'BETTER IMAGERY - use high-quality Unsplash images',
      'navigation': 'INTUITIVE NAVIGATION - clear, simple menu structure',
      'content': 'IMPROVED COPY - more compelling headlines and CTAs',
      'trust': 'BUILD TRUST - add testimonials, credentials, social proof'
    };
    context += `\nIMPROVEMENTS REQUESTED:\n`;
    existingSite.dislikes.forEach(d => {
      if (dislikeMap[d]) context += `- ${dislikeMap[d]}\n`;
    });
  }
  
  // User notes
  if (existingSite.userNotes) {
    context += `\nUSER NOTES: "${existingSite.userNotes}"\n`;
  }
  
  // Existing content to potentially reuse
  if (existingSite.pageContent) {
    const { headlines, paragraphs, prices } = existingSite.pageContent;
    
    if (headlines && headlines.length > 0) {
      context += `\nEXISTING HEADLINES (rewrite better, keep meaning):\n`;
      headlines.slice(0, 5).forEach(h => {
        context += `- "${h}"\n`;
      });
    }
    
    if (prices && prices.length > 0) {
      context += `\nPRICING TO INCLUDE: ${prices.slice(0, 6).join(', ')}\n`;
    }
  }
  
  // Existing images to reuse - categorized for better placement
  const catImages = existingSite.designSystem?.categorizedImages;
  if (catImages) {
    context += `\n═══ EXISTING IMAGES BY CATEGORY (use these actual URLs) ═══\n`;
    
    if (catImages.logo?.length > 0) {
      context += `\nLOGO (use in header/nav):\n`;
      catImages.logo.slice(0, 2).forEach(img => {
        context += `  ${img.src}\n`;
      });
    }
    
    if (catImages.hero?.length > 0) {
      context += `\nHERO IMAGES (use as hero backgrounds or feature images):\n`;
      catImages.hero.slice(0, 4).forEach(img => {
        context += `  ${img.src}${img.alt ? ` - ${img.alt}` : ''}\n`;
      });
    }
    
    if (catImages.gallery?.length > 0) {
      context += `\nGALLERY IMAGES (use in gallery/portfolio sections):\n`;
      catImages.gallery.slice(0, 6).forEach(img => {
        context += `  ${img.src}\n`;
      });
    }
    
    if (catImages.product?.length > 0) {
      context += `\nPRODUCT/SERVICE IMAGES (use in service cards or product sections):\n`;
      catImages.product.slice(0, 6).forEach(img => {
        context += `  ${img.src}${img.alt ? ` - ${img.alt}` : ''}\n`;
      });
    }
    
    if (catImages.team?.length > 0) {
      context += `\nTEAM PHOTOS (use in about/team sections):\n`;
      catImages.team.slice(0, 4).forEach(img => {
        context += `  ${img.src}${img.alt ? ` - ${img.alt}` : ''}\n`;
      });
    }
    
    if (catImages.background?.length > 0) {
      context += `\nBACKGROUND IMAGES (use as section backgrounds):\n`;
      catImages.background.slice(0, 3).forEach(img => {
        context += `  ${img.src}\n`;
      });
    }
    
    // Fallback to general if no categorized images
    if (catImages.general?.length > 0 && 
        !catImages.hero?.length && !catImages.gallery?.length && !catImages.product?.length) {
      context += `\nGENERAL IMAGES (use where appropriate):\n`;
      catImages.general.slice(0, 6).forEach(img => {
        context += `  ${img.src}${img.alt ? ` - ${img.alt}` : ''}\n`;
      });
    }
    
    context += `\nIMPORTANT: Use these ACTUAL image URLs in your code. Do NOT use placeholder URLs or Unsplash unless no suitable image exists above.\n`;
  } else if (existingSite.designSystem?.images && existingSite.designSystem.images.length > 0) {
    // Fallback for old format
    context += `\nEXISTING IMAGES (use these actual URLs):\n`;
    existingSite.designSystem.images.slice(0, 8).forEach(img => {
      if (img.src && !img.src.includes('data:')) {
        context += `- ${img.src}${img.alt ? ` (${img.alt})` : ''}\n`;
      }
    });
  }
  
  // Reference inspiration sites
  if (existingSite.referenceInspiration && existingSite.referenceInspiration.length > 0) {
    context += `\nINSPIRATION SITES TO BLEND:\n`;
    existingSite.referenceInspiration.forEach(ref => {
      context += `- ${ref.url}\n`;
    });
  }
  
  return context;
}

// Build context from reference sites (INSPIRED mode)
function buildInspiredContext(referenceSites) {
  if (!referenceSites || referenceSites.length === 0) return '';
  
  let context = `
══════════════════════════════════════════════════════════════
INSPIRED MODE - Blend the best of these reference sites
══════════════════════════════════════════════════════════════
`;

  referenceSites.forEach((site, index) => {
    context += `\nREFERENCE ${index + 1}: ${site.url}\n`;
    
    // What they like about this site
    if (site.likes && site.likes.length > 0) {
      const likeMap = {
        'colors': 'COLOR SCHEME',
        'layout': 'LAYOUT STRUCTURE',
        'typography': 'TYPOGRAPHY STYLE',
        'animations': 'ANIMATIONS/TRANSITIONS',
        'hero': 'HERO SECTION DESIGN',
        'navigation': 'NAVIGATION PATTERN',
        'cards': 'CARD COMPONENT DESIGN',
        'spacing': 'WHITESPACE/SPACING',
        'images': 'IMAGE TREATMENT',
        'cta': 'CALL-TO-ACTION DESIGN',
        'footer': 'FOOTER DESIGN',
        'overall': 'OVERALL AESTHETIC'
      };
      context += `  ELEMENTS TO INCORPORATE:\n`;
      site.likes.forEach(like => {
        if (likeMap[like]) context += `    - ${likeMap[like]}\n`;
      });
    }
    
    // Specific notes
    if (site.notes) {
      context += `  SPECIFIC NOTES: "${site.notes}"\n`;
    }
    
    // Analysis data
    if (site.analysis) {
      if (site.analysis.colors) {
        context += `  EXTRACTED COLORS: Primary ${site.analysis.colors.primary}, Accent ${site.analysis.colors.accent}\n`;
      }
      if (site.analysis.style) {
        context += `  DETECTED STYLE: ${site.analysis.style}\n`;
      }
      if (site.analysis.mood) {
        context += `  MOOD: ${site.analysis.mood}\n`;
      }
    }
  });
  
  context += `\nBLEND INSTRUCTIONS: Create a UNIQUE design that incorporates the best elements from each reference while maintaining cohesion. Do NOT copy directly - synthesize into something new.\n`;
  
  return context;
}

// Build context from uploaded assets
function buildUploadedAssetsContext(uploadedAssets, imageDescription) {
  if (!uploadedAssets && !imageDescription) return '';
  
  let context = '';
  
  // Logo
  if (uploadedAssets?.logo) {
    const logoExt = uploadedAssets.logo.type?.split('/')[1] || 'png';
    context += `
══════════════════════════════════════════════════════════════
UPLOADED LOGO - USE THIS EXACT PATH
══════════════════════════════════════════════════════════════
The user has uploaded their logo. Use these extracted brand colors throughout the design.
Logo filename: ${uploadedAssets.logo.file}

CRITICAL: In the header/nav, use this EXACT image tag:
<img src="/uploads/logo.${logoExt}" alt="Logo" style={{ height: '40px' }} />

DO NOT use placeholder text or broken image references.
The logo file exists at: /uploads/logo.${logoExt}
`;
  }
  
  // Product/Gallery Photos
  if (uploadedAssets?.photos && uploadedAssets.photos.length > 0) {
    context += `
══════════════════════════════════════════════════════════════
UPLOADED PRODUCT/GALLERY PHOTOS (${uploadedAssets.photos.length} photos)
══════════════════════════════════════════════════════════════
The user has uploaded ${uploadedAssets.photos.length} photos of their products/work.
Photo files: ${uploadedAssets.photos.map(p => p.file).join(', ')}

CRITICAL: For gallery sections, product showcases, and hero backgrounds:
- Reference these as "uploaded photos" - the system will inject them
- Create image galleries that showcase these photos
- Use them in hero sections, about pages, and service showcases
- DO NOT use generic Unsplash URLs - use the uploaded photos instead
`;
  }
  
  // Menu/Pricing
  if (uploadedAssets?.menu) {
    let menuText = '';
    if (uploadedAssets.menu.extractedText) {
      menuText = uploadedAssets.menu.extractedText;
    }
    
    context += `
══════════════════════════════════════════════════════════════
UPLOADED MENU / PRICE LIST - USE THIS ACTUAL DATA
══════════════════════════════════════════════════════════════
The user has uploaded their menu or price list.
File: ${uploadedAssets.menu.file} (${uploadedAssets.menu.type.includes('pdf') ? 'PDF' : 'Image'})

${menuText ? `EXTRACTED MENU CONTENT (use these REAL items and prices):
${menuText.substring(0, 3000)}
` : ''}
CRITICAL: Use the actual menu items and prices shown above in your menu/pricing sections.
DO NOT make up menu items - use ONLY what's in the extracted content above.
If no items were extracted, create placeholder sections that say "Menu coming soon" or similar.
`;
  }
  
  // Image style description
  if (imageDescription && imageDescription.trim()) {
    context += `
══════════════════════════════════════════════════════════════
USER'S VISUAL STYLE PREFERENCES
══════════════════════════════════════════════════════════════
"${imageDescription.trim()}"

Apply this visual style throughout all pages - backgrounds, image treatments, overall mood.
`;
  }
  
  return context;
}

async function buildFreshModePrompt(pageId, pageName, otherPages, description, promptConfig) {
  const cfg = promptConfig || {};
  const industry = cfg.industry || {};
  const colors = cfg.colors || { primary: '#6366f1', accent: '#06b6d4', text: '#1a1a2e', textMuted: '#64748b', background: '#ffffff' };
  const typography = cfg.typography || { heading: "'Inter', sans-serif", body: "system-ui, sans-serif" };
  
  // SELECT A RANDOM ARCHETYPE FOR VARIETY
  const archetypeKeys = Object.keys(VISUAL_ARCHETYPES);
  const selectedArchetype = VISUAL_ARCHETYPES[Math.floor(Math.random() * archetypeKeys.length)];

  // SELECT RANDOM GENERATION VARIETY (hero layout, colors, sections, components)
  const industryType = getIndustryType(industry.name);
  const generationVariety = getGenerationVariety(industryType);
  const varietyPromptSection = buildVarietyPrompt(generationVariety);

  // DETECT FEATURES AND BUILD PATTERN GUIDANCE
  const businessInputText = description.text || description || '';
  const featureContext = buildFeatureContext(businessInputText, industry.name, {
    compact: false,  // Use full patterns for better generation
    includeBackend: true,
    includeFrontend: true
  });
  const featurePromptSection = featureContext.promptSection || '';
  const featureModeGuidance = featureContext.modeGuidance || '';

  // Log detected features for debugging
  if (featureContext.features && featureContext.features.length > 0) {
    console.log(`   🔍 Detected features: ${featureContext.features.join(', ')}`);
    console.log(`   📊 Complexity level: ${featureContext.complexity}`);
  }

  // DYNAMIC SPACING BASED ON VIBE
  const isLuxury = industry.vibe?.toLowerCase().includes('luxury') || industry.vibe?.toLowerCase().includes('clean');
  const sectionPadding = isLuxury ? '140px' : '80px';
  
  // EXTRACT EXISTING SITE DATA (REBUILD MODE)
  const existingSite = description.existingSite || null;
  const rebuildContext = existingSite ? buildRebuildContext(existingSite) : '';
  
  // EXTRACT REFERENCE SITES DATA (INSPIRED MODE)
  const referenceSites = description.referenceSites || [];
  const inspiredContext = referenceSites.length > 0 ? buildInspiredContext(referenceSites) : '';
  
  // EXTRACT UPLOADED ASSETS
  const uploadedAssets = description.uploadedAssets || null;
  const imageDescription = description.imageDescription || '';
  const assetsContext = buildUploadedAssetsContext(uploadedAssets, imageDescription);

  // EXTRACT USER-PASTED MENU TEXT (separate from uploaded files)
  const pastedMenuText = description.menuText || '';
  const menuTextContext = pastedMenuText.trim() ? `
══════════════════════════════════════════════════════════════
USER'S MENU ITEMS (PASTED TEXT) - USE THIS ACTUAL DATA!
══════════════════════════════════════════════════════════════
${pastedMenuText.substring(0, 4000)}

CRITICAL INSTRUCTIONS FOR MENU PAGE:
1. Use the EXACT items and prices listed above
2. Parse categories from ALL CAPS headers or lines ending with ":"
3. Create a visually appealing menu layout with these real items
4. DO NOT make up menu items - use ONLY what the user provided
5. If the page is "menu", this content is your PRIMARY data source
══════════════════════════════════════════════════════════════
` : '';

  // EXTRACT USER BUSINESS DATA (hours, location, team, etc.)
  const businessLocation = description.location || description.businessLocation || '';
  const businessHours = description.hours || null;
  const businessDataContext = (businessLocation || businessHours) ? `
══════════════════════════════════════════════════════════════
BUSINESS DETAILS - USE THESE REAL VALUES
══════════════════════════════════════════════════════════════
${businessLocation ? `LOCATION: ${businessLocation}` : ''}
${businessHours ? `HOURS OF OPERATION: (use in Contact page and header)
${JSON.stringify(businessHours, null, 2)}` : ''}

Use this REAL location and hours data in the Contact page and anywhere hours/location are displayed.
══════════════════════════════════════════════════════════════
` : '';
  
  // EXTRACT EXTRA DETAILS FROM USER
  const extraDetails = description.extraDetails || '';
  const extraDetailsContext = extraDetails.trim() ? `
══════════════════════════════════════════════════════════════
CUSTOM REQUIREMENTS FROM USER:
══════════════════════════════════════════════════════════════
${extraDetails}

IMPORTANT: Apply these custom requirements throughout the page design.
Replace any standard elements with the user's specified alternatives.
══════════════════════════════════════════════════════════════
` : '';

  // EXTRACT INDUSTRY LAYOUT CONFIG (support both layoutKey and layoutStyleId from frontend)
  const industryLayoutKey = description.industryKey || null;
  const selectedLayoutKey = description.layoutStyleId || description.layoutKey || null;
  const layoutStylePreview = description.layoutStylePreview || null;

  // Build layout context - prefer frontend preview config, fallback to industry-layouts.cjs
  let layoutContext = '';
  if (layoutStylePreview && selectedLayoutKey) {
    // Use the frontend's preview configuration directly
    layoutContext = buildLayoutContextFromPreview(selectedLayoutKey, layoutStylePreview, industryLayoutKey);
  } else if (industryLayoutKey) {
    // Fallback to industry-layouts.cjs
    layoutContext = buildLayoutContext(industryLayoutKey, selectedLayoutKey);
  }

  // Extract stats from business description
  const businessText = description.text || '';
  const extractedStats = extractBusinessStats(businessText, industry.name);

  // Build smart context inference for minimal input
  const businessInput = description.text || 'A professional business';
  const smartContextGuide = buildSmartContextGuide(businessInput, industry.name);

  // Build mood slider context (user's creative direction preferences)
  const moodSliders = description.moodSliders || null;
  const moodSliderContext = buildMoodSliderContext(moodSliders);
  if (moodSliders) {
    console.log(`   🎨 Mood sliders applied: vibe=${moodSliders.vibe}, energy=${moodSliders.energy}, era=${moodSliders.era}, density=${moodSliders.density}, price=${moodSliders.price}`);
  }

  // Get industry-specific CONTEXT-AWARE image URLs
  const industryImages = getIndustryImageUrls(industry.name || businessInput);

  // Check if user enabled video hero (from UI toggle)
  const enableVideoHero = description.enableVideoHero === true;

  // If no hardcoded video available but video is enabled, try dynamic Pexels fetch
  if (enableVideoHero && !industryImages.heroVideo) {
    console.log('   🎬 No hardcoded video - trying dynamic Pexels fetch...');
    const dynamicVideoUrl = await getIndustryVideo(industry.name || '', businessInput);
    if (dynamicVideoUrl) {
      industryImages.heroVideo = dynamicVideoUrl;
      console.log('   ✅ Using dynamic Pexels video');
    }
  }

  const hasVideoAvailable = !!industryImages.heroVideo;

  // Build video context ONLY if video is enabled AND available
  let videoContext = '';
  if (enableVideoHero && hasVideoAvailable) {
    videoContext = `
══════════════════════════════════════════════════════════════
🎬 VIDEO BACKGROUND ENABLED - USE THIS FOR HOME PAGE HERO!
══════════════════════════════════════════════════════════════
The user has ENABLED video background for the home page hero!

VIDEO URL: ${industryImages.heroVideo}
POSTER IMAGE (fallback): ${industryImages.hero}

HOW TO USE VideoBackground COMPONENT:
import { VideoBackground } from '../effects';

<VideoBackground
  videoSrc="${industryImages.heroVideo}"
  posterImage="${industryImages.hero}"
  overlay="linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.85))"
  height="100vh"
>
  {/* Hero content goes here */}
  <h1>Your Headline</h1>
  <p>Your tagline</p>
  <button>CTA Button</button>
</VideoBackground>

IMPORTANT VIDEO RULES:
1. USE VideoBackground on the HOME PAGE hero section (user requested this!)
2. Other pages should use static images (ParallaxSection or regular backgrounds)
3. The video autoplays muted and loops - perfect for ambiance
4. On mobile, it automatically falls back to the poster image
5. Always include a dark overlay for text readability
══════════════════════════════════════════════════════════════
`;
  } else if (hasVideoAvailable && !enableVideoHero) {
    // Video available but user disabled it
    videoContext = `
NOTE: Video background is available for this industry but user has DISABLED it.
Use static image backgrounds instead (ParallaxSection or backgroundImage).
`;
  }

  const imageContext = `
══════════════════════════════════════════════════════════════
CONTEXT-AWARE IMAGES - USE THE RIGHT IMAGE FOR EACH SECTION
══════════════════════════════════════════════════════════════
${videoContext}
🎯 HERO/HEADER SECTION - Use atmospheric, wide shots:
${industryImages.hero}

👥 TEAM/ARTIST/STAFF SECTION - Use portraits of ACTUAL professionals in this industry:
${(industryImages.team || []).map((url, i) => `Team Member ${i + 1}: ${url}`).join('\n')}
CRITICAL: For tattoo studios, use tattoo artist photos. For barbershops, use barber photos.
NEVER use random stock photos of people stretching or unrelated activities!

🖼️ GALLERY/PORTFOLIO SECTION - Use work examples:
${(industryImages.gallery || []).map((url, i) => `Gallery ${i + 1}: ${url}`).join('\n')}

🛠️ SERVICES SECTION - Use action shots of the work being done:
${(industryImages.services || []).map((url, i) => `Service ${i + 1}: ${url}`).join('\n')}

🔍 SEARCH TERMS for additional images: ${industryImages.searchTerms.join(', ')}

══════════════════════════════════════════════════════════════
CRITICAL IMAGE MATCHING RULES:
══════════════════════════════════════════════════════════════
1. TEAM PAGES: Use ONLY the team images above - they show actual professionals in this industry
2. HERO: Use the hero image for big background sections
3. GALLERY: Use gallery images for portfolio/work showcases
4. SERVICES: Use service images to illustrate what you offer
5. NEVER mix contexts - don't put a yoga stretch photo on a tattoo artist page!
6. NEVER use generic Unsplash URLs - always use the industry-specific ones above
7. Format: url("IMAGE_URL") for CSS backgrounds or src="IMAGE_URL" for img tags

For TATTOO STUDIOS specifically:
- Team section: Use photos of tattoo artists working or portraits of tattooed professionals
- Gallery: Use closeup shots of completed tattoos
- Hero: Use studio interior with tattoo equipment visible

For PRESCHOOLS/MONTESSORI/DAYCARE specifically:
- Team section: Use photos of teachers with children, warm educator portraits
- Gallery: Use photos of children learning, art projects, classroom activities, playground
- Hero: Use bright, colorful classroom or children engaged in activities
- NEVER use generic stock business photos - always show children and educators

For EDUCATION/SCHOOLS specifically:
- Team section: Use photos of teachers, educators, tutors in teaching environments
- Gallery: Use photos of students learning, classroom settings, study groups
- Hero: Use academic settings with students engaged in learning
══════════════════════════════════════════════════════════════
`;

  // ==========================================
  // NEW: High-impact question context
  // ==========================================
  const teamSize = description.teamSize || null;
  const priceRange = description.priceRange || null;
  const yearsEstablished = description.yearsEstablished || null;
  const inferredDetails = description.inferredDetails || null;
  const location = description.location || null;
  const targetAudience = description.targetAudience || [];
  const primaryCTA = description.primaryCTA || 'contact';
  const tone = description.tone || 'balanced';

  // Build business context from high-impact questions
  let businessContext = '';

  if (teamSize || priceRange || yearsEstablished || location) {
    businessContext = `
══════════════════════════════════════════════════════════════
BUSINESS DETAILS - USE THESE FOR ACCURATE CONTENT
══════════════════════════════════════════════════════════════
`;
    if (location) {
      businessContext += `📍 LOCATION: ${location} - Customize content for this area\n`;
    }
    if (teamSize) {
      const teamSizeMap = {
        'solo': '1 person (solo operator) - use "I" language, personal touch',
        'small': '2-4 people - use "our small team" language, close-knit feel',
        'medium': '5-10 people - use "our team" language, established feel',
        'large': '10+ people - use "our professionals" language, corporate feel'
      };
      businessContext += `👥 TEAM SIZE: ${teamSizeMap[teamSize] || teamSize}\n`;
    }
    if (priceRange) {
      const priceMap = {
        'budget': 'Budget-friendly ($) - emphasize value, affordability, competitive pricing',
        'mid': 'Mid-range ($$) - balance quality and value, mainstream pricing',
        'premium': 'Premium ($$$) - emphasize quality, expertise, worth the investment',
        'luxury': 'Luxury ($$$$) - exclusive, high-end, bespoke, elite experience'
      };
      businessContext += `💰 PRICE RANGE: ${priceMap[priceRange] || priceRange}\n`;
    }
    if (yearsEstablished) {
      const yearsMap = {
        'new': 'Just starting - emphasize fresh perspective, modern approach, passion',
        'growing': '1-5 years - emphasize momentum, proven results, growing reputation',
        'established': '5-15 years - emphasize experience, track record, trusted expertise',
        'veteran': '15+ years - emphasize legacy, unmatched experience, industry leader'
      };
      businessContext += `⏱️ EXPERIENCE: ${yearsMap[yearsEstablished] || yearsEstablished}\n`;
    }
    if (targetAudience.length > 0) {
      businessContext += `🎯 TARGET AUDIENCE: ${targetAudience.join(', ')}\n`;
    }
    if (primaryCTA && primaryCTA !== 'contact') {
      const ctaMap = {
        'book': 'Book Appointment - make booking CTA prominent',
        'call': 'Call Now - show phone number prominently',
        'quote': 'Get a Quote - emphasize free quotes/estimates',
        'buy': 'Buy/Order Now - shopping/ordering focus',
        'visit': 'Visit Location - directions and map prominent'
      };
      businessContext += `👆 PRIMARY CTA: ${ctaMap[primaryCTA] || primaryCTA}\n`;
    }
    businessContext += `🎭 TONE: ${tone}\n`;
    businessContext += `══════════════════════════════════════════════════════════════\n`;
  }

  return `You are a high-end UI/UX Architect. Create a stunning, unique ${pageId} page.

BUSINESS INPUT: ${businessInput}
INDUSTRY: ${industry.name || 'Business'}
VIBE: ${industry.vibe || 'Unique and modern'}
${businessContext}

══════════════════════════════════════════════════════════════
CRITICAL: SMART CONTENT INFERENCE - USE COMMON SENSE!
══════════════════════════════════════════════════════════════
${smartContextGuide}

INFERENCE RULES:
1. If the user only gave a name like "Mario's Pizza" - YOU must infer:
   - It's a pizzeria/Italian restaurant
   - Create a realistic menu with actual pizza names, prices ($14-22), toppings
   - Include appetizers, salads, drinks, desserts with realistic prices
   - Add realistic hours (11am-10pm), delivery info, location feel

2. If minimal input like "Brooklyn Dental" - YOU must infer:
   - It's a dental practice
   - List services: cleanings, fillings, crowns, whitening, implants
   - Add insurance info, new patient specials, emergency care
   - Professional but welcoming atmosphere

3. KEYWORD EXPANSION - If user provides keywords or short phrases, EXPAND them into full content:
   - "fast, reliable, 24/7" → "Your emergency is our priority. Available 24/7, our team arrives fast and fixes it right the first time."
   - "family owned, 30 years" → "Family-owned and operated since 1994, we've built our reputation on honest work and lasting relationships."
   - "organic, locally sourced" → "We source our ingredients from local organic farms, ensuring every dish is fresh, sustainable, and bursting with natural flavor."
   - Take any keywords the user provides and weave them into compelling, professional copy.

4. NEVER generate generic placeholder content like:
   - "Lorem ipsum" or "[Business Name]"
   - "Service 1, Service 2, Service 3"
   - "$XX.XX" or "Call for pricing"
   - "123 Main Street" (use realistic addresses)

4. ALWAYS generate specific, realistic, industry-appropriate content:
   - Real menu items with creative names and accurate prices
   - Specific service descriptions with typical pricing
   - Realistic business hours for the industry
   - Genuine-sounding testimonials with first names

${rebuildContext}${inspiredContext}${assetsContext}${extraDetailsContext}${menuTextContext}${businessDataContext}${layoutContext}${imageContext}${moodSliderContext}
══════════════════════════════════════════════════════════════
CRITICAL: STATISTICS & NUMBERS - NEVER USE ZEROS!
══════════════════════════════════════════════════════════════
${extractedStats}

STAT RULES - FOLLOW EXACTLY:
1. NEVER show "0", "0+", "1%", or single-digit numbers (except for team size)
2. ALWAYS use numbers from above OR these industry-appropriate minimums:
   - Years in business: 10+ to 25+ (never below 5)
   - Customers served: 2,000+ to 10,000+ (never below 500)
   - Satisfaction rate: 95% to 99% (never below 90%)
   - Team members: 4 to 25 (realistic for business size)

CORRECT AnimatedCounter EXAMPLES - COPY THIS EXACT PATTERN:
<AnimatedCounter end={12} suffix="+ Years" duration={2} />
<AnimatedCounter end={2700} suffix="+ Happy Clients" duration={2.5} />
<AnimatedCounter end={98} suffix="%" duration={2} />  {/* For percentages */}
<AnimatedCounter end={4} suffix=" Master Barbers" duration={1.5} />

NOTE: duration is in SECONDS (not milliseconds). Use 2 for 2 seconds.

WRONG EXAMPLES - NEVER DO THIS:
<AnimatedCounter end={0} suffix="+ Years" />  ❌ Zero is broken
<AnimatedCounter end={27} suffix="+ Clients" />  ❌ Too small, use 2700
<AnimatedCounter end={1} suffix="%" />  ❌ 1% satisfaction is insulting
<AnimatedCounter end={12} duration={2000} />  ❌ 2000 seconds is way too long!

FOR A BARBERSHOP, USE THESE EXACT STATS:
- Years: 12+ Years Experience
- Clients: 2,700+ Satisfied Clients
- Team: 4 Master Barbers
- Rating: 98% Client Satisfaction

══════════════════════════════════════════════════════════════
CRITICAL: INDUSTRY-SPECIFIC DESIGN - NOT A GENERIC TEMPLATE!
══════════════════════════════════════════════════════════════
DO NOT use the same layout structure for every industry. A bowling alley should look COMPLETELY DIFFERENT from a law firm.

LAYOUT VARIATION RULES:
1. READ the industry guidance below and FOLLOW IT - each industry has specific section orders and emphasis.
2. VARY the section structure based on what matters most to THIS business type:
   - Entertainment venues: Fun first! Bold colors, large booking CTAs, party packages prominent
   - Professional services: Trust first! Credentials, testimonials, case studies prominent
   - Restaurants: Menu first! Food imagery, reservation CTA, ambiance gallery
   - Fitness: Motivation first! Action imagery, class schedules, membership comparisons
   - Retail: Products first! Large product grids, shopping CTAs, featured items

3. DIFFERENT industries need DIFFERENT hero treatments:
   - Fun venues: Neon effects, bold headlines, animated elements, video backgrounds
   - Professionals: Clean, minimal, trust-focused, subtle imagery
   - Restaurants: Full-bleed food photography, warm overlays
   - Fitness: Dynamic action shots, dark/dramatic, motivational text
   - Retail: Product-focused, clean grids, shopping-oriented

4. SECTION ORDER should vary by industry - don't always do Hero → About → Services → Contact

══════════════════════════════════════════════════════════════
CORE VISUAL ARCHETYPE: ${selectedArchetype}
══════════════════════════════════════════════════════════════

${varietyPromptSection}

${featureModeGuidance}
${featurePromptSection}

DESIGN SYSTEM:
const THEME = {
  colors: { 
    primary: '${colors.primary}', 
    accent: '${colors.accent}', 
    background: '${colors.background}', 
    text: '${colors.text}', 
    surface: '${colors.surface || '#f8fafc'}' 
  },
  fonts: { heading: "${typography.heading}", body: "${typography.body}" },
  spacing: { sectionPadding: '${sectionPadding}' }
};

CRITICAL HERO TEXT RULES:
- If hero has dark/gradient background: text MUST be white (#ffffff) with textShadow: '0 2px 4px rgba(0,0,0,0.3)'
- If hero has light background: text MUST be dark (${colors.text})
- NEVER use low-contrast text colors on heroes

${getIndustryDesignGuidance(industry.name)}

PAGE REQUIREMENTS:
${getPageRequirements(pageId, industry.name)}

══════════════════════════════════════════════════════════════
EFFECTS LIBRARY - ADD POLISH WITH THESE COMPONENTS
══════════════════════════════════════════════════════════════
Import from '../effects' and use these to make pages feel premium:

import { ScrollReveal, AnimatedCounter, StaggeredList, ParallaxSection, TiltCard, GlowEffect, VideoBackground } from '../effects';

AVAILABLE EFFECTS:
- <ScrollReveal> - Wrap sections to fade-in on scroll
- <AnimatedCounter end={500} suffix="+" duration={2} /> - Animate numbers counting up (duration in SECONDS)
- <StaggeredList items={array} renderItem={(item) => <Card />} /> - Stagger children animations
- <ParallaxSection imageSrc="url" height="60vh"> - Parallax background sections
- <TiltCard> - 3D tilt effect on hover for cards
- <GlowEffect color="#22c55e"> - Glowing border on hover
- <VideoBackground videoSrc="url" posterImage="url" overlay="rgba()" height="100vh"> - Video hero backgrounds (HOME PAGE ONLY)

REQUIRED USAGE:
- Home pages: Use AnimatedCounter for ALL statistics (years, customers, etc.)
- Home pages: Wrap at least 2 sections with <ScrollReveal>
- Home pages: If VIDEO URL is provided above, use VideoBackground for the hero!
- Service/Menu pages: Use ScrollReveal on the cards grid
- About pages: AnimatedCounter for company stats

EXAMPLE (Static Hero):
<ScrollReveal>
  <section style={styles.stats}>
    <AnimatedCounter end={14} suffix=" Years" duration={2} />
    <AnimatedCounter end={5000} suffix="+ Customers" duration={2.5} />
  </section>
</ScrollReveal>

EXAMPLE (Video Hero - for HOME PAGE when video URL available):
<VideoBackground
  videoSrc="VIDEO_URL_FROM_ABOVE"
  posterImage="HERO_IMAGE_URL"
  overlay="linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.85))"
  height="100vh"
>
  <div style={{ textAlign: 'center', color: 'white', maxWidth: '800px', padding: '0 20px' }}>
    <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Headline</h1>
    <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '30px' }}>Tagline</p>
    <button style={{ padding: '15px 40px', fontSize: '18px' }}>CTA</button>
  </div>
</VideoBackground>

TECHNICAL RULES (MUST FOLLOW):
1. Use inline styles ONLY: style={{ }} - NO className or Tailwind.

   CRITICAL STYLE SYNTAX - FOLLOW EXACTLY:
   ✅ CORRECT: opacity: 0.7 (number, no quotes)
   ✅ CORRECT: fontSize: 16 (number, no quotes)
   ✅ CORRECT: fontSize: '16px' (string WITH quotes on BOTH sides)
   ✅ CORRECT: color: '#ffffff' (string WITH quotes on BOTH sides)
   ✅ CORRECT: padding: '20px 40px' (string WITH quotes on BOTH sides)

   ❌ WRONG: opacity: 0.7' (trailing quote with no opening quote)
   ❌ WRONG: fontSize: 16' (trailing quote on a number)
   ❌ WRONG: color: #ffffff (missing quotes around hex color)
   ❌ WRONG: padding: 20px 40px (missing quotes around CSS value)

   Rule: Numbers without units = no quotes. Anything with units or special chars = quotes on BOTH sides.

2. Use Lucide icons: import { IconName } from 'lucide-react'.
   VALID ICONS (use ONLY these): ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Check, X, Menu,
   ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Plus, Minus, Search, Filter,
   Star, Heart, Mail, Phone, MapPin, Clock, Calendar, User, Users, Settings,
   Home, Building, Briefcase, Shield, Award, Target, Zap, Sparkles, Crown,
   DollarSign, CreditCard, ShoppingCart, Package, Truck, Gift, Tag, Percent,
   Eye, EyeOff, Lock, Unlock, Key, Bell, MessageSquare, Send, Share, Download, Upload,
   Image, Camera, Play, Pause, Volume, VolumeX, Mic, Video, Music, File, FileText, Folder,
   Link, ExternalLink, Globe, Wifi, Database, Server, Code, Terminal, Cpu,
   Sun, Moon, Cloud, Thermometer, Droplet, Wind, Umbrella,
   Car, Plane, Ship, Train, Bike, MapPinned, Navigation, Compass,
   Utensils, Coffee, Wine, Pizza, Cake, Apple,
   Stethoscope, Activity, Pill, Syringe, Bone, Brain,
   GraduationCap, BookOpen, Pencil, Ruler, Calculator,
   Wrench, Hammer, Scissors, Paintbrush, Palette,
   Dog, Cat, Bird, Fish, Bug, Leaf, Flower, Tree,
   Facebook, Twitter, Instagram, Linkedin, Youtube, Github,
   AlertCircle, AlertTriangle, Info, HelpCircle, CheckCircle, XCircle,
   RefreshCw, RotateCw, Loader, MoreHorizontal, MoreVertical, Grip,
   Copy, Clipboard, Save, Trash, Edit, Edit2, Maximize, Minimize,
   LogIn, LogOut, UserPlus, UserMinus, UserCheck, Smile, Frown, Meh,
   ThumbsUp, ThumbsDown, Flag, Bookmark, Archive, Inbox, Layers,
   Layout, Grid, List, Table, BarChart, BarChart2, BarChart3, PieChart, LineChart, TrendingUp, TrendingDown,
   Quote, Hash, AtSign, Percent, Receipt, Wallet, Banknote, Coins,
   Headphones, Speaker, Radio, Tv, Monitor, Smartphone, Tablet, Watch, Printer,
   Power, Battery, BatteryCharging, Plug, Lightbulb, Flashlight, Flame,
   Anchor, Rocket, Award, Medal, Trophy, Crown, Gem, Diamond
   DO NOT use icons not in this list. If you need "Handshake", use "Users" or "Link" instead.
3. NAVIGATION: Use <Link to="/path"> from react-router-dom.
4. NO nav/footer - those are provided by App.jsx.
5. NO CartContext/CartProvider - NEVER create your own cart context or provider. The app-level CartProvider already wraps all pages.
   If you need cart functionality: import { useCart } from '../context/CartContext';
   Then use: const { items, addItem, removeItem, clearCart, total, itemCount } = useCart();
   DO NOT create local cart state, CartContext, or CartProvider - it will conflict with the app-level provider and cause "useCart must be used within CartProvider" errors.
6. WHITESPACE: Use THEME.spacing.sectionPadding for top/bottom margins.
7. INNOVATION: Do not use standard vertical blocks. Experiment with the ARCHETYPE provided above.
8. APP PAGES: For dashboard/earn/rewards/wallet/profile/leaderboard pages, these are FUNCTIONAL APP PAGES not marketing pages. Build them with useState hooks, mock data arrays, and interactive elements. Create the full UI inline - do not import from ../modules/.
9. MOBILE-FIRST: Design for mobile screens FIRST (375px width). Use these patterns:
   - Single column layouts by default
   - Large touch targets (min 44px height for buttons)
   - Bottom navigation bar for app pages (fixed position)
   - Cards should be full-width on mobile with 16px padding
   - Font sizes: 16px minimum for body text (prevents zoom on iOS)
   - Use flexDirection: 'column' as default, switch to 'row' only with @media or window.innerWidth checks
   - Sticky headers with blur backdrop for app pages
   - Pull-to-refresh patterns where appropriate

Return ONLY valid JSX code.
Start with: import React from 'react';
End with: export default ${pageName}Page;`;
}

function getIndustryDesignGuidance(industryName) {
  const guidance = {
    'Law Firm': `
STYLE: Sophisticated, authoritative, trustworthy
HERO: Clean, minimal. White or light background preferred. No busy images.
TYPOGRAPHY: Serif headings (Georgia, Times). Thin weights. Large sizes (48-64px).
COLORS: Dark navy/charcoal primary. Gold/bronze accent. Lots of white space.
IMAGERY: Abstract patterns, city skylines, or no images. Never stock photos of "lawyers".
LAYOUT PATTERNS: Asymmetric grids, editorial layouts, generous margins.
SECTIONS: Practice areas with icons, attorney credentials, case results stats, testimonials.`,

    'Restaurant / Food Service': `
STYLE: Warm, inviting, sensory, appetizing
HERO: Full-bleed food photography or atmospheric restaurant shots. Dark overlays work well.
TYPOGRAPHY: Mix of serif (menu feel) and clean sans-serif. Can be more decorative.
COLORS: Warm tones - burgundy, gold, cream, forest green. Earthy palettes.
IMAGERY: High-quality food photos, interior shots, chef at work. Real Unsplash food images.
LAYOUT PATTERNS: Magazine-style, image-heavy, overlapping elements.
SECTIONS: Featured dishes with photos, chef story, ambiance gallery, reservation CTA prominently placed, location/hours sticky.
UNIQUE: Menu should be THE STAR - consider tabbed menu categories, hoverable dish cards, or a visual menu grid.`,

    'Steakhouse / Fine Dining': `
STYLE: Luxurious, sophisticated, elegant, upscale dining experience
HERO: Perfectly plated steak with dramatic lighting, elegant table setting, or wine cellar. Dark, moody atmosphere.
TYPOGRAPHY: Elegant serif fonts (Playfair Display, Cormorant). Large, refined headlines. Thin weights.
COLORS: Deep burgundy, rich gold, charcoal black, cream accents. Warm, intimate palette.
IMAGERY: CRITICAL - Use ONLY steakhouse-specific images:
- Perfectly seared steaks (ribeye, filet mignon, tomahawk)
- Dry-aged beef display, butcher presentation
- Wine selection, sommelier service, wine cellar shots
- Elegant dining room with white tablecloths and candlelight
- Professional chef plating, kitchen fire/grill action
- NEVER use generic food images, sushi, pasta, or ethnic cuisine photos
LAYOUT PATTERNS: Elegant cards with subtle borders, generous whitespace, refined grid layouts.
SECTIONS: Featured cuts with descriptions, wine pairings section, chef story/philosophy, private dining, reservations CTA (prominent), awards/accolades.
UNIQUE: Emphasize QUALITY and CRAFTSMANSHIP - show the aging process, the selection process, the expertise. Include tasting notes style descriptions for cuts.`,

    'SaaS / B2B Platform': `
STYLE: Modern, clean, innovative, trustworthy
HERO: Split layout (text + product screenshot) OR gradient background with floating UI elements.
TYPOGRAPHY: Clean sans-serif (Inter, SF Pro). Bold headlines, readable body.
COLORS: Purple/blue gradients popular. High contrast. Dark mode friendly.
IMAGERY: Product screenshots, dashboard mockups, abstract 3D shapes, isometric illustrations.
LAYOUT PATTERNS: Bento grids, feature cards, comparison tables, social proof strips.
SECTIONS: Logo cloud, feature grid, how-it-works steps, pricing cards, testimonials, integration logos.`,

    'Healthcare / Medical': `
STYLE: Clean, calming, professional, trustworthy
HERO: Soft, approachable. Light backgrounds. Minimal imagery or abstract health visuals.
TYPOGRAPHY: Clean, highly readable. Sans-serif preferred. Accessible sizes.
COLORS: Calming blues, teals, soft greens. White/light backgrounds. Avoid harsh contrasts.
IMAGERY: Abstract medical, caring professionals (tasteful), nature/wellness imagery.
LAYOUT PATTERNS: Card-based, clear information hierarchy, easy navigation cues.
SECTIONS: Services/specialties, provider profiles, patient resources, appointment booking, insurance info.`,

    'E-Commerce / Retail': `
STYLE: Dynamic, visual, conversion-focused
HERO: Product-focused. Large product images or lifestyle shots. Clear CTA.
TYPOGRAPHY: Bold, attention-grabbing headlines. Clean body text.
COLORS: Brand-dependent but high contrast CTAs. Sale/promo colors (red, orange).
IMAGERY: Product photography, lifestyle shots, user-generated content style.
LAYOUT PATTERNS: Grid-heavy, card-based products, sticky CTAs, urgency elements.
SECTIONS: Featured products grid, category tiles, bestsellers carousel, reviews with stars, trust badges, newsletter signup.
UNIQUE: Product showcase is KING - use large image cards, hover effects, quick-view patterns.`,

    // ENTERTAINMENT & FUN VENUES
    'Entertainment': `
STYLE: Bold, playful, energetic, FUN - this is NOT a corporate site!
HERO: Large action imagery, neon/glow effects, animated elements, video backgrounds work great.
TYPOGRAPHY: Bold, chunky fonts. Can be playful/quirky. Large impactful headlines.
COLORS: Bright, bold colors - neon pink, electric blue, bright orange, lime green. Dark backgrounds with glowing accents.
IMAGERY: People having fun, action shots, neon lights, bowling pins flying, arcade games, celebrations.
LAYOUT PATTERNS: Asymmetric, overlapping elements, floating cards, gamified UI elements, progress bars, achievement badges.
SECTIONS: "What's On" with large event cards, pricing/packages with visual comparisons, photo gallery mosaic, party booking CTA (BIG and bold), hours with fun icons.
UNIQUE: Make it feel like an EXPERIENCE - use hover animations, playful icons, maybe even a mini-game element or leaderboard teaser.`,

    'Bowling Alley': `
STYLE: Retro-fun meets modern, neon glow, energetic party vibe
HERO: Bowling action shot with neon overlay effects, lanes lit up, pins flying. Video loop of strikes.
TYPOGRAPHY: Bold, chunky, retro-inspired fonts. Think arcade vibes. Glowing text effects.
COLORS: Neon pink, electric blue, black backgrounds, glowing orange accents. Retro color palette.
IMAGERY: Glowing lanes, pins exploding, people celebrating strikes, cosmic bowling atmosphere.
LAYOUT PATTERNS: Floating neon-bordered cards, asymmetric grids, gamified elements like score displays.
SECTIONS: "Book Your Lane" CTA front-and-center, party packages with fun illustrations, cosmic bowling showcase, league info with leaderboard style, arcade/bar area highlight, birthday party section with confetti.
UNIQUE: Add gamification - maybe a "Strike Counter" AnimatedCounter, glow effects on buttons, retro arcade styling. Make visitors WANT to bowl!`,

    'Arcade': `
STYLE: Retro gaming, pixel art vibes, neon, 80s throwback with modern twist
HERO: Arcade cabinet imagery, pixel art elements, neon grids, controller icons.
TYPOGRAPHY: Pixel fonts for headers, retro gaming typography, 8-bit style numbers.
COLORS: Neon purple, hot pink, cyan, black backgrounds, CRT scan line effects.
IMAGERY: Arcade cabinets, joysticks, tokens, high score screens, multiplayer action.
LAYOUT PATTERNS: Pixel-bordered cards, CRT monitor styled sections, high-score table layouts.
SECTIONS: Game showcase grid, token/credit packages, party room booking, high scores leaderboard, birthday packages.
UNIQUE: Add score-like AnimatedCounters, pixel art icons, maybe a fake "INSERT COIN" button.`,

    // FITNESS & WELLNESS
    'Fitness': `
STYLE: High-energy, motivational, powerful, action-oriented
HERO: Dynamic action shots - people mid-workout, weights in motion, intense focus. Dark/dramatic.
TYPOGRAPHY: Bold, strong, condensed fonts. IMPACT. All-caps for key headlines.
COLORS: Dark backgrounds (black, charcoal), bold accent (red, orange, electric blue), high contrast.
IMAGERY: Athletes in action, gym equipment, sweat and determination, transformation photos.
LAYOUT PATTERNS: Strong geometric shapes, diagonal lines, bold dividers, before/after layouts.
SECTIONS: Class schedule (prominent, interactive if possible), membership tiers as bold comparison cards, trainer profiles with stats, transformation gallery, free trial CTA.
UNIQUE: Make it MOTIVATING - use strong action verbs, progress-style layouts, maybe countdown timers for challenges.`,

    'Gym': `
STYLE: Powerful, results-focused, community-driven, no-nonsense
HERO: Weight room action, people pushing limits, dramatic lighting on equipment.
TYPOGRAPHY: Bold condensed sans-serif, industrial feel, strong headlines.
COLORS: Black, dark gray, red or orange accents, metallic touches.
IMAGERY: Free weights, cable machines, group classes in action, focused athletes.
LAYOUT PATTERNS: Grid-based equipment/class showcase, membership comparison tables, strong geometric sections.
SECTIONS: "Join Now" prominent CTA, membership tiers with clear pricing, class schedule table/tabs, trainer team, equipment showcase, testimonial transformations.
UNIQUE: Show the RESULTS - before/after transformations, member stats, community achievements.`,

    'Yoga Studio': `
STYLE: Calm, serene, mindful, balanced, natural
HERO: Peaceful poses, natural light, plants, minimalist space. Soft, dreamy.
TYPOGRAPHY: Light, airy fonts. Thin weights. Generous letter-spacing. Lowercase feels right.
COLORS: Soft sage green, dusty rose, cream, warm white, terracotta, natural tones.
IMAGERY: Yoga poses in beautiful spaces, nature elements, plants, morning light, meditation.
LAYOUT PATTERNS: Lots of whitespace, organic shapes, flowing curves, asymmetric balance.
SECTIONS: Class schedule with easy-to-read times, instructor profiles with philosophy, workshop/retreat highlights, pricing as simple cards, new student offer.
UNIQUE: Breathe CALM into the design - gentle animations, flowing transitions, peaceful imagery.`,

    // CREATIVE & EDGY INDUSTRIES
    'Tattoo Studio': `
STYLE: Bold, edgy, artistic, dark, authentic - NOT corporate or clean
HERO: Dark, atmospheric studio shot OR dramatic tattoo closeup with moody lighting. Video of tattooing works great.
TYPOGRAPHY: Bold, often condensed or distressed fonts. Can be slightly grungy. Uppercase for impact.
COLORS: BLACK is dominant. Accent with crimson red, deep gold, or muted metallics. High contrast.
IMAGERY: CRITICAL - Use ONLY tattoo-specific images:
  - Team photos: Tattoo artists AT WORK or portrait shots of tattooed professionals
  - Gallery: Closeup shots of completed tattoos on skin
  - NOT yoga people, NOT hairstylists, NOT generic stock photos
LAYOUT PATTERNS: Dark backgrounds, bold dividers, asymmetric galleries, hoverable portfolio items.
SECTIONS: Artist profiles (with their specialty styles), portfolio gallery (organized by style - traditional, realism, geometric, etc.), booking/consultation CTA, aftercare info, FAQs, shop policies.
UNIQUE: The PORTFOLIO is everything - make it visually striking. Show the artists' individual styles. Dark theme with dramatic lighting effects. Instagram integration for latest work.`,

    'Barbershop': `
STYLE: Masculine, vintage-meets-modern, confident, classic
HERO: Classic barbershop interior OR barber at work with dramatic lighting. Leather, wood, chrome vibes.
TYPOGRAPHY: Bold serif or strong sans-serif. Vintage touches work well. All-caps for headings.
COLORS: Dark backgrounds (charcoal, navy), warm accents (gold, cream, burgundy), masculine palette.
IMAGERY: Barbers cutting hair, vintage tools, leather chairs, pomade, grooming products.
LAYOUT PATTERNS: Clean but bold grids, service cards, team profiles with specialties.
SECTIONS: Services with prices, the barbers (with their chair/specialty), booking CTA prominent, gallery of cuts/styles, shop story.
UNIQUE: Classic masculinity - think vintage signs, straight razors, leather textures. Make booking EASY.`,

    // PROFESSIONAL SERVICES
    'Professional Services': `
STYLE: Trustworthy, credible, sophisticated, results-oriented
HERO: Clean, minimal, text-focused. Abstract imagery or subtle patterns. No cheesy stock photos.
TYPOGRAPHY: Professional serif or clean sans-serif. Traditional feels trustworthy.
COLORS: Navy, charcoal, white, gold/bronze accents. Conservative palette.
IMAGERY: Abstract, city skylines, handshakes (tasteful), office environments, success imagery.
LAYOUT PATTERNS: Clean grids, generous whitespace, editorial layouts, credential showcases.
SECTIONS: Services overview, credentials/certifications, case studies or results stats, team bios, testimonials from named clients, consultation CTA.
UNIQUE: TRUST is everything - show certifications, years in business, client logos, specific results numbers.`,

    'Consulting': `
STYLE: Strategic, intellectual, results-driven, premium
HERO: Minimal, sophisticated. Data visualization elements, abstract strategy imagery.
TYPOGRAPHY: Clean, modern sans-serif. Professional but not stuffy.
COLORS: Deep blues, white, subtle gold accents, muted professional palette.
IMAGERY: Abstract strategy visuals, charts/graphs (stylized), meeting rooms, city views.
LAYOUT PATTERNS: Case study cards, results metrics prominently displayed, process timelines.
SECTIONS: Expertise areas, methodology/process steps, case studies with metrics, team credentials, client logos, discovery call CTA.
UNIQUE: Show EXPERTISE and RESULTS - use AnimatedCounters for client results, showcase methodology.`,

    'Accounting': `
STYLE: Precise, trustworthy, organized, approachable
HERO: Clean, professional, maybe abstract financial imagery or clean office.
TYPOGRAPHY: Clean, highly readable. Numbers should be prominent and well-designed.
COLORS: Blues, greens (money), white, conservative accents.
IMAGERY: Abstract financial, organized documents, calculators, professional settings.
LAYOUT PATTERNS: Clean service grids, pricing tables, credential badges, organized information.
SECTIONS: Services (tax, bookkeeping, advisory), credentials/certifications, about the team, client testimonials, free consultation CTA, deadline reminders.
UNIQUE: Emphasize TRUST and ACCURACY - certifications prominent, years experience, client count.`,

    // TRADES & HOME SERVICES
    'Home Services': `
STYLE: Reliable, local, trustworthy, urgent-friendly
HERO: Before/after project photos, workers in action, completed work showcase.
TYPOGRAPHY: Bold, clear, easy to read. Phone numbers LARGE.
COLORS: Blues, oranges, greens - trustworthy trade colors. High contrast for CTAs.
IMAGERY: Completed projects, uniformed workers, tools, happy homeowners, before/after.
LAYOUT PATTERNS: Service cards with icons, trust badges prominent, quote forms accessible.
SECTIONS: Services grid with icons, service areas map, trust badges (licensed, insured, bonded), reviews carousel, FREE ESTIMATE button everywhere, emergency service callout.
UNIQUE: Make CALLING/BOOKING easy - phone number in header, quote forms prominent, urgency messaging.`,

    'Plumbing': `
STYLE: Emergency-ready, trustworthy, local, fast response
HERO: Professional plumber at work, or clean bathroom result. Clear "CALL NOW" messaging.
TYPOGRAPHY: Bold, urgent, phone numbers prominent. Clear service headlines.
COLORS: Blues (water), white, orange/red for emergency CTAs.
IMAGERY: Professional work, tools, fixtures, happy homeowners, before/after.
LAYOUT PATTERNS: Service icons grid, emergency banner, trust badges, quick quote form.
SECTIONS: Emergency services highlighted, service list, service areas, trust badges, reviews, call-to-action with phone number HUGE.
UNIQUE: EMERGENCY messaging prominent - "24/7 Service", "Fast Response", "Same Day Service".`,

    'Landscaping': `
STYLE: Natural, transformative, seasonal, curb appeal focused
HERO: Beautiful completed landscape, dramatic before/after, lush greenery.
TYPOGRAPHY: Clean, natural feel. Can be slightly organic/earthy.
COLORS: Greens, browns, earth tones, with clean white backgrounds.
IMAGERY: Stunning landscaping projects, seasonal variety, before/after transformations, happy families in yards.
LAYOUT PATTERNS: Project gallery mosaic, seasonal services, before/after sliders.
SECTIONS: Services by season, project gallery (large images), design consultation offer, maintenance packages, testimonials with project photos.
UNIQUE: Show TRANSFORMATIONS - before/after comparisons, gallery of best work, seasonal tips.`,

    'default': `
STYLE: Professional, modern, trustworthy
HERO: Clear value proposition, prominent CTA, relevant imagery
TYPOGRAPHY: Clean sans-serif, clear hierarchy
COLORS: Use the provided theme colors consistently
IMAGERY: High-quality, relevant Unsplash images
LAYOUT PATTERNS: Standard sections with clear visual breaks
SECTIONS: Hero, features/services, about snippet, testimonials, CTA`
  };

  // Try exact match first, then partial match
  if (guidance[industryName]) {
    return guidance[industryName];
  }

  // Try partial matching for broader categories
  const lowerName = (industryName || '').toLowerCase();

  if (lowerName.includes('bowl') || lowerName.includes('arcade') || lowerName.includes('entertainment') || lowerName.includes('fun') || lowerName.includes('laser') || lowerName.includes('trampoline') || lowerName.includes('go-kart') || lowerName.includes('mini golf')) {
    return guidance['Entertainment'];
  }
  if (lowerName.includes('gym') || lowerName.includes('fitness') || lowerName.includes('crossfit') || lowerName.includes('workout')) {
    return guidance['Fitness'];
  }
  if (lowerName.includes('yoga') || lowerName.includes('pilates') || lowerName.includes('meditation')) {
    return guidance['Yoga Studio'];
  }
  // STEAKHOUSE - must match BEFORE generic restaurant
  if (lowerName.includes('steakhouse') || lowerName.includes('steak house') ||
      lowerName.includes('chophouse') || lowerName.includes('chop house') ||
      (lowerName.includes('steak') && (lowerName.includes('luxury') || lowerName.includes('fine') || lowerName.includes('prime') || lowerName.includes('upscale')))) {
    return guidance['Steakhouse / Fine Dining'];
  }
  if (lowerName.includes('restaurant') || lowerName.includes('food') || lowerName.includes('dining') || lowerName.includes('cafe') || lowerName.includes('bistro')) {
    return guidance['Restaurant / Food Service'];
  }
  if (lowerName.includes('law') || lowerName.includes('legal') || lowerName.includes('attorney')) {
    return guidance['Law Firm'];
  }
  if (lowerName.includes('consult') || lowerName.includes('advisory')) {
    return guidance['Consulting'];
  }
  if (lowerName.includes('account') || lowerName.includes('tax') || lowerName.includes('cpa') || lowerName.includes('bookkeep')) {
    return guidance['Accounting'];
  }
  if (lowerName.includes('plumb') || lowerName.includes('hvac') || lowerName.includes('electric') || lowerName.includes('roof')) {
    return guidance['Home Services'];
  }
  if (lowerName.includes('landscap') || lowerName.includes('lawn') || lowerName.includes('garden')) {
    return guidance['Landscaping'];
  }
  if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('clinic') || lowerName.includes('dental')) {
    return guidance['Healthcare / Medical'];
  }
  if (lowerName.includes('shop') || lowerName.includes('store') || lowerName.includes('retail') || lowerName.includes('ecommerce') || lowerName.includes('boutique')) {
    return guidance['E-Commerce / Retail'];
  }
  if (lowerName.includes('saas') || lowerName.includes('software') || lowerName.includes('platform') || lowerName.includes('app') || lowerName.includes('tech')) {
    return guidance['SaaS / B2B Platform'];
  }
  if (lowerName.includes('tattoo') || lowerName.includes('ink') || lowerName.includes('body art') || lowerName.includes('piercing')) {
    return guidance['Tattoo Studio'];
  }
  if (lowerName.includes('barber') || lowerName.includes('grooming')) {
    return guidance['Barbershop'];
  }

  return guidance['default'];
}

function getPageRequirements(pageId, industry) {
  const lowerIndustry = (industry || '').toLowerCase();

  // ===========================================
  // INDUSTRY-SPECIFIC APP PAGE REQUIREMENTS
  // ===========================================

  // COLLECTIBLES INDUSTRY (sneakers, cards, memorabilia, etc.)
  const collectiblesPages = {
    dashboard: `
APP PAGE - Collection Dashboard (Mobile-first, works great on desktop too)
- COLLECTION FOCUSED - NOT survey/earn focused!
- Top section: Large "Collection Value" display (e.g., "$47,850") with percentage change
- Stats row: 3 stat cards - Total Items, Wallet Balance, Reward Points
- Quick actions: Add to Collection, Browse Marketplace, Scan Item, Trading Hub
- Recent activity: Sales, purchases, authentications, scans - show item names like "Jordan 1 Chicago"
- Achievement badges: "Grail Hunter", "Century Club", unlocked status indicators
- Bottom CTA: "Find your next grail" with marketplace and scan buttons
- Mobile bottom nav: Collection, Dashboard, Scan, Trade, Rewards
- Use mock data arrays with realistic collectible items (sneakers, cards, etc.)`,

    earn: `
APP PAGE - Collection Rewards/Earn Page (Mobile-first, works great on desktop too)
- COLLECTION FOCUSED - Earn by engaging with the platform
- Header: "Earn Rewards" with filter tabs (All, Scans, Trades, Referrals, Daily)
- Reward opportunity cards showing:
  * "Scan a Pair" - Earn points for authenticating items
  * "Complete a Trade" - Earn points for successful trades
  * "Daily Check-in" - Streak bonus for daily visits
  * "Refer a Friend" - Referral rewards
- Points balance prominently displayed
- Progress bars for tiered rewards
- NOT surveys - these are platform engagement activities`,

    rewards: `
APP PAGE - Collection Rewards Page (Mobile-first, works great on desktop too)
- COLLECTION FOCUSED rewards system
- Hero: Current tier status (Bronze/Silver/Gold/Platinum) with progress to next tier
- Rewards showcase: Redeemable items like:
  * Free authentications/scans
  * Marketplace fee discounts
  * Exclusive drops access
  * Priority support
- Daily spin wheel for bonus points
- Streak bonus display showing consecutive days active
- Recent rewards claimed section
- Tier benefits comparison`,

    wallet: `
APP PAGE - Collection Wallet Page (Mobile-first, works great on desktop too)
- COLLECTION FOCUSED wallet for marketplace transactions
- Balance hero: Large wallet balance display (funds from sales, ready to spend)
- Quick actions: Add Funds, Withdraw, Transfer
- Payment methods: Connected cards, bank accounts, PayPal
- Transaction history: Show item sales, purchases, scan fees, withdrawals
  * Each row: Item name, type (sale/purchase/fee), amount, date
  * Color code: +green for sales, -red for purchases
- Pending transactions section
- Section: "Funds from Recent Sales" showing items sold`,

    profile: `
APP PAGE - Collector Profile (Mobile-first, works great on desktop too)
- COLLECTION FOCUSED profile
- Profile header: Avatar, username, member tier badge, "Collecting since 2023"
- Stats: Collection Value, Total Items, Completed Trades, Authentications
- Collection highlights: Top 3-5 most valuable items with images
- Referral section: Invite collectors, show referral code, bonus structure
- Settings: Notifications, Payment Methods, Privacy, Shipping Address
- Achievement badges: Collection milestones earned
- Public profile toggle`,

    leaderboard: `
APP PAGE - Collector Leaderboard (Mobile-first, works great on desktop too)
- COLLECTION FOCUSED rankings
- Tabs: Collection Value, Items Owned, Trades Completed, Authentications
- Top 3 podium with collector avatars and top item thumbnails
- Ranked list: Rank, avatar, username, stat value
- User's own rank highlighted
- Monthly/All-time toggle
- Prize indicators for top collectors`
  };

  // SURVEY-REWARDS INDUSTRY (survey apps, reward platforms, GPT sites)
  const surveyRewardsPages = {
    dashboard: `
APP PAGE - User Dashboard (Mobile-first, works great on desktop too)
- Top section: Large balance display with current earnings (centered, bold)
- Stats row: 3 stat cards in a row (use flexWrap: 'wrap' so they stack on mobile)
- Quick actions: Big tap-friendly buttons linking to /earn, /rewards, /wallet
- Recent activity feed showing last 5 transactions in a clean list
- Use Card components with shadows, rounded corners (borderRadius: 16px)
- All buttons minimum 48px height for touch targets
- Max-width 600px centered on desktop, full-width on mobile`,

    earn: `
APP PAGE - Earn/Surveys Page (Mobile-first, works great on desktop too)
- Header: "Earn Money" with horizontal scrolling filter tabs (All, Surveys, Tasks, Offers)
- Survey cards: Full-width cards with padding 16px, borderRadius 12px, subtle shadow
- Each card shows: provider logo (40px), title, reward in GREEN bold ($0.50), time estimate
- Cards are tappable (cursor: pointer, hover/active states)
- Use flexWrap: 'wrap' for desktop to show 2 cards per row, single column on mobile
- Max-width 800px centered on desktop
- Sticky header with blur effect (backdropFilter: 'blur(10px)')
- Empty state with friendly illustration if no surveys`,

    rewards: `
APP PAGE - Rewards/Spin Page (Mobile-first, works great on desktop too)
- Hero section: Daily spin wheel centered, max-width 320px (build a colorful wheel with CSS transforms)
- Big "SPIN NOW" button below wheel (green, 56px height, full-width max 300px)
- Countdown timer if spin not available ("Next spin in 4:32:15")
- Streak bonus display showing consecutive days
- Recent winners: horizontal scroll of small winner cards showing avatar + amount won
- Achievements grid at bottom: 3 columns of badge icons with labels
- Max-width 500px centered on desktop, full-width with 16px padding on mobile`,

    wallet: `
APP PAGE - Wallet/Cashout Page (Mobile-first, works great on desktop too)
- Balance hero: Large centered balance "$24.50" (48px font, bold, green)
- Subtitle: "Available to cash out" with progress bar to next threshold
- Cashout buttons: 3 large tap-friendly cards (PayPal, Gift Cards, Bank)
- Each cashout card: icon (32px), name, minimum amount, "2-3 days" processing time
- Cards use flexWrap so 3 columns on desktop, stacked on mobile
- Transaction history: Clean list with date, description, +$0.50 green or -$10.00 for cashouts
- Section headers: "Cash Out", "History" with subtle dividers
- Max-width 600px centered on desktop`,

    profile: `
APP PAGE - User Profile (Mobile-first, works great on desktop too)
- Profile header: Centered avatar (80px circle), username below, "Member since Jan 2024"
- Stats row: 3 cards showing Total Earned ($142.50), Surveys (89), Level (12)
- Referral section: "Invite Friends" card with referral code, big "Copy" button, "Earn $1 per friend"
- Settings list: Clean rows with ChevronRight icons (Notifications, Payment Methods, Help, Log Out)
- Each settings row: 48px height, border-bottom, tappable
- Achievement badges: Horizontal scroll of earned badges with labels
- Max-width 500px centered on desktop`,

    leaderboard: `
APP PAGE - Leaderboard (Mobile-first, works great on desktop too)
- Sticky header with filter tabs: Today, This Week, This Month, All Time (horizontal scroll)
- Top 3 podium: Special section with gold/silver/bronze styling, larger avatars, crown icon for #1
- Ranked list below: Each row shows rank #, avatar (36px), username, earnings in green
- Rows are 60px height with subtle border-bottom
- Current user row: Highlighted with accent background color, "YOU" badge
- Sticky bottom card: "Your Rank: #47" always visible when scrolling
- Max-width 500px centered on desktop
- Use alternating subtle background colors for rows`
  };

  // RESTAURANT / FOOD SERVICE INDUSTRY
  const restaurantPages = {
    dashboard: `
APP PAGE - Restaurant Member Dashboard (Mobile-first, works great on desktop too)
- DINING FOCUSED - loyalty and reservations
- Top section: Loyalty points balance with progress ring to next reward
- Stats row: 3 cards - Total Visits, Points Earned, Rewards Redeemed
- Upcoming reservations: Card showing next reservation date/time/party size with "Modify" button
- Quick actions: Make Reservation, View Menu, Order Online, Redeem Reward
- Recent orders: Last 3-5 orders with items ordered, date, and "Reorder" button
- Favorite dishes: Horizontal scroll of dishes with images, tap to add to order
- Special offers: Banner for current promotions or birthday rewards
- Mobile bottom nav: Home, Menu, Reservations, Rewards, Profile`,

    earn: `
APP PAGE - Restaurant Earn Points Page (Mobile-first, works great on desktop too)
- DINING FOCUSED - earn through visits and spending
- Header: "Earn Points" with current balance prominently displayed
- Points structure explanation:
  * "$1 = 1 point" for dining
  * "50 bonus points" for writing a review
  * "100 points" for referring a friend
  * "Double points" on your birthday month
- Current offers: Cards showing bonus point opportunities
- Recent point activity: List of recent earnings with date and source
- Referral section: Share code to earn bonus points
- NOT surveys - these are dining engagement rewards`,

    rewards: `
APP PAGE - Restaurant Rewards Page (Mobile-first, works great on desktop too)
- DINING FOCUSED rewards redemption
- Hero: Current tier (Bronze/Silver/Gold/VIP) with progress to next tier
- Available rewards to redeem:
  * Free appetizer (500 pts)
  * $10 off entree (750 pts)
  * Free dessert (400 pts)
  * Complimentary drink (300 pts)
- Birthday reward: Special banner if birthday month
- VIP perks: Priority seating, exclusive menu items, chef's table access
- Reward history: Past redemptions
- No spin wheel - dining rewards are straightforward`,

    wallet: `
APP PAGE - Restaurant Wallet Page (Mobile-first, works great on desktop too)
- DINING FOCUSED payment and gift cards
- Gift card balance: Large display of any restaurant gift cards
- Saved payment methods: Credit cards for quick checkout
- Recent transactions: Dining history with amounts
- Add gift card: Input field to add new gift card codes
- Auto-reload option: Set up automatic gift card reload
- Split payment preferences: Default tip percentage, split bill settings`,

    profile: `
APP PAGE - Restaurant Member Profile (Mobile-first, works great on desktop too)
- DINING FOCUSED profile
- Profile header: Avatar, name, member tier badge, "Member since 2023"
- Stats: Total Visits, Lifetime Points, Rewards Redeemed, Favorite Location
- Dining preferences: Dietary restrictions, allergies, seating preferences
- Special dates: Birthday, anniversary (for special offers)
- Favorite orders: Quick reorder list
- Settings: Notifications, Payment Methods, Reservation Preferences
- Referral code: Share to earn points`
  };

  // REAL ESTATE INDUSTRY
  const realEstatePages = {
    dashboard: `
APP PAGE - Real Estate Client Dashboard (Mobile-first, works great on desktop too)
- PROPERTY SEARCH FOCUSED
- Top section: Search status summary ("Actively Searching" or "Under Contract")
- Stats row: Saved Properties count, Price Alerts, Showings Scheduled
- Saved properties: Grid of 2-3 property cards with image, price, beds/baths, heart icon
- Upcoming showings: Calendar-style list of scheduled property tours
- Price alerts: Recent notifications about price drops on saved properties
- Market updates: Local market trends, new listings in your criteria
- Quick actions: Search Properties, Schedule Showing, Contact Agent, Mortgage Calculator
- Agent contact: Quick message or call button to your agent
- Mobile bottom nav: Search, Saved, Showings, Messages, Profile`,

    profile: `
APP PAGE - Real Estate Client Profile (Mobile-first, works great on desktop too)
- PROPERTY SEARCH FOCUSED profile
- Profile header: Avatar, name, search status badge
- Search criteria summary: Location, price range, beds/baths, property type
- Pre-approval status: Approved amount, lender info, expiration date
- Timeline: Target move-in date, urgency level
- Preferences: Must-haves, nice-to-haves, deal-breakers
- Documents: Upload section for pre-approval letter, ID
- Communication preferences: Email, text, call preferences
- Assigned agent: Agent photo, contact info, direct message`,

    wallet: `
APP PAGE - Real Estate Financial Dashboard (Mobile-first, works great on desktop too)
- PROPERTY PURCHASE FOCUSED
- Pre-approval amount: Large display of approved loan amount
- Earnest money tracker: If under contract, show escrow status
- Closing cost estimate: Breakdown of expected costs
- Down payment savings: Progress toward target down payment
- Monthly payment calculator: Interactive slider for different scenarios
- Document checklist: Required financial documents status
- Important dates: Inspection, appraisal, closing deadlines`
  };

  // HEALTHCARE / MEDICAL INDUSTRY
  const healthcarePages = {
    dashboard: `
APP PAGE - Patient Portal Dashboard (Mobile-first, works great on desktop too)
- HEALTHCARE FOCUSED - appointments and health info
- Top section: Welcome message with next appointment prominently displayed
- Upcoming appointments: Card with date, time, provider, location, "Check In" button
- Quick actions: Schedule Appointment, Message Provider, Refill Prescription, View Results
- Recent activity: Test results ready, messages from provider, prescription updates
- Health reminders: Annual checkup due, vaccination reminder, screening due
- Prescription refills: Medications needing refill with "Request Refill" button
- Care team: Photos and names of your providers with message buttons
- Mobile bottom nav: Home, Appointments, Messages, Records, Profile
- HIPAA compliant messaging throughout`,

    profile: `
APP PAGE - Patient Profile (Mobile-first, works great on desktop too)
- HEALTHCARE FOCUSED profile
- Profile header: Avatar, name, patient ID, date of birth
- Insurance information: Provider, member ID, group number
- Emergency contacts: Name, relationship, phone number
- Primary care provider: Assigned doctor info
- Pharmacy preference: Preferred pharmacy for prescriptions
- Medical history summary: Allergies, conditions, medications
- Communication preferences: Email, text, call for appointments
- Advance directives: Link to view/update
- Settings: Notifications, Proxy access, Privacy settings`,

    wallet: `
APP PAGE - Patient Billing Dashboard (Mobile-first, works great on desktop too)
- HEALTHCARE BILLING FOCUSED
- Outstanding balance: Large display of amount due
- Payment options: Pay Now button, payment plan setup
- Recent statements: List of bills with dates and amounts
- Insurance claims: Pending claims status, EOB documents
- HSA/FSA balance: If connected, show available balance
- Payment history: Past payments with receipts
- Financial assistance: Link to apply for aid programs
- Billing questions: Quick contact to billing department`
  };

  // FITNESS / GYM INDUSTRY
  const fitnessPages = {
    dashboard: `
APP PAGE - Fitness Member Dashboard (Mobile-first, works great on desktop too)
- FITNESS FOCUSED - workouts and classes
- Top section: Check-in streak counter with flame icon, "X days this week"
- Stats row: 3 cards - This Month's Visits, Classes Booked, Personal Records
- Today's schedule: Upcoming classes booked with time and instructor
- Quick actions: Check In, Book Class, Find Trainer, View Schedule
- Recent workouts: Last 5 check-ins with date, duration, calories burned
- Class recommendations: Suggested classes based on history
- Challenges: Active fitness challenges with progress bars
- Trainer availability: Quick book with favorite trainers
- Mobile bottom nav: Home, Classes, Check In, Progress, Profile`,

    earn: `
APP PAGE - Fitness Rewards/Earn Page (Mobile-first, works great on desktop too)
- FITNESS FOCUSED - earn through activity
- Header: "Earn Points" with current balance
- How to earn:
  * Check-in: 10 points per visit
  * Complete class: 25 points
  * Refer a friend: 500 points
  * Hit weekly goal: 100 bonus points
  * Personal training session: 50 points
- Active challenges: Join challenges to earn bonus points
- Streak bonuses: 7-day streak = 2x points
- Leaderboard preview: Top 3 members this month`,

    rewards: `
APP PAGE - Fitness Rewards Page (Mobile-first, works great on desktop too)
- FITNESS FOCUSED rewards
- Current tier: Bronze/Silver/Gold/Platinum with progress bar
- Available rewards:
  * Free guest pass (200 pts)
  * Personal training session (1000 pts)
  * Pro shop discount (300 pts)
  * Free smoothie (150 pts)
  * Branded merchandise (500 pts)
- Tier benefits comparison: What each level unlocks
- Reward history: Past redemptions`,

    wallet: `
APP PAGE - Fitness Account/Wallet Page (Mobile-first, works great on desktop too)
- FITNESS MEMBERSHIP FOCUSED
- Membership status: Plan type, renewal date, monthly cost
- Personal training credits: Remaining sessions purchased
- Guest passes: Available passes to share
- Add-ons: Locker rental, towel service status
- Payment method: Update billing info
- Freeze membership: Option to pause
- Transaction history: Dues, purchases, credits`,

    profile: `
APP PAGE - Fitness Member Profile (Mobile-first, works great on desktop too)
- FITNESS FOCUSED profile
- Profile header: Avatar, name, member tier, "Member since 2023"
- Stats: Total Visits, Classes Attended, Personal Records
- Fitness goals: Weight, strength, cardio targets
- Body metrics: Optional tracking of weight, measurements
- Workout preferences: Favorite classes, preferred times
- Trainer: Assigned or favorite trainer
- Settings: Notifications, Privacy, Class reminders
- Referral code: Share to earn points`,

    leaderboard: `
APP PAGE - Fitness Leaderboard (Mobile-first, works great on desktop too)
- FITNESS FOCUSED rankings
- Tabs: Check-ins, Classes, Challenges, Streaks
- Top 3 podium with member photos and stats
- Ranked list: Rank, avatar, name, stat value
- Your position highlighted
- Monthly/All-time toggle
- Active challenge rankings
- Gym location filter for multi-location gyms`
  };

  // SALON / SPA / BEAUTY INDUSTRY
  const salonPages = {
    dashboard: `
APP PAGE - Salon/Spa Client Dashboard (Mobile-first, works great on desktop too)
- BEAUTY FOCUSED - appointments and loyalty
- Top section: Next appointment with stylist/esthetician name and service
- Stats row: Total Visits, Loyalty Points, Rewards Earned
- Quick actions: Book Appointment, Rebook Last Service, View Services, Buy Gift Card
- Upcoming appointments: List with date, time, service, provider
- Favorite services: Quick rebook your regular services
- Product recommendations: Based on your service history
- Stylist/provider: Your preferred provider with direct booking
- Special offers: Current promotions, birthday discount
- Mobile bottom nav: Home, Book, Services, Rewards, Profile`,

    earn: `
APP PAGE - Salon/Spa Earn Points Page (Mobile-first, works great on desktop too)
- BEAUTY FOCUSED - earn through visits and purchases
- Header: "Earn Points" with current balance
- How to earn:
  * Service visit: Points per dollar spent
  * Product purchase: Points per dollar
  * Refer a friend: Bonus points
  * Review on Google: Bonus points
  * Birthday bonus: Double points all month
- Current promotions: Bonus point opportunities
- Referral section: Share your code`,

    rewards: `
APP PAGE - Salon/Spa Rewards Page (Mobile-first, works great on desktop too)
- BEAUTY FOCUSED rewards
- Current tier: Guest/Member/VIP/Elite with progress
- Available rewards:
  * Free add-on service (300 pts)
  * $20 off any service (500 pts)
  * Free product sample (200 pts)
  * Complimentary deep conditioning (400 pts)
- VIP perks: Priority booking, exclusive products, special events
- Birthday reward: Free service or discount
- Reward history: Past redemptions`,

    wallet: `
APP PAGE - Salon/Spa Wallet Page (Mobile-first, works great on desktop too)
- BEAUTY SERVICE FOCUSED
- Gift card balance: Restaurant-style gift cards for services
- Prepaid packages: Service packages purchased (e.g., 5 blowouts)
- Membership status: If on a monthly membership plan
- Payment methods: Saved cards for quick checkout
- Recent transactions: Service history with amounts
- Add gift card: Input code to add balance`,

    profile: `
APP PAGE - Salon/Spa Client Profile (Mobile-first, works great on desktop too)
- BEAUTY FOCUSED profile
- Profile header: Avatar, name, loyalty tier, "Client since 2022"
- Stats: Total Visits, Services Tried, Products Purchased
- Hair/skin profile: Hair type, color history, skin type, sensitivities
- Preferred stylist/esthetician: Default provider
- Service preferences: Favorite services, appointment time preferences
- Product preferences: Brands you love, allergies
- Settings: Appointment reminders, marketing preferences
- Referral code: Share to earn rewards`
  };

  // EDUCATION / COURSES INDUSTRY
  const educationPages = {
    dashboard: `
APP PAGE - Student/Learner Dashboard (Mobile-first, works great on desktop too)
- EDUCATION FOCUSED - courses and progress
- Top section: Current course progress with percentage complete
- Stats row: Courses Enrolled, Completed, Certificates Earned
- Continue learning: Resume where you left off with course card
- Upcoming deadlines: Assignments, quizzes, project due dates
- Recent activity: Completed lessons, quiz scores, achievements
- Quick actions: Browse Courses, View Calendar, Check Grades, Get Help
- Announcements: Important updates from instructors
- Study streak: Days in a row of learning activity
- Mobile bottom nav: Home, Courses, Calendar, Grades, Profile`,

    earn: `
APP PAGE - Education Earn/Achievements Page (Mobile-first, works great on desktop too)
- EDUCATION FOCUSED - earn through learning
- Header: "Earn Achievements" with XP or points display
- How to earn:
  * Complete lesson: XP per lesson
  * Pass quiz: Bonus XP for high scores
  * Finish course: Certificate + major XP
  * Daily learning: Streak bonuses
  * Help peers: Community contribution points
- Active challenges: Learning challenges with deadlines
- Skill badges: Earn badges for mastering topics`,

    rewards: `
APP PAGE - Education Rewards/Achievements Page (Mobile-first, works great on desktop too)
- EDUCATION FOCUSED achievements
- Current level: Student level with XP progress bar
- Certificates earned: Display of completed course certificates
- Badges gallery: Grid of earned skill badges
- Honor roll status: If qualifying GPA/score
- Unlock progress: What's needed for next achievements
- Share achievements: LinkedIn, social sharing options`,

    wallet: `
APP PAGE - Education Account/Billing Page (Mobile-first, works great on desktop too)
- EDUCATION BILLING FOCUSED
- Tuition balance: Outstanding amount due
- Payment plan: Current installment plan status
- Financial aid: Scholarships, grants applied
- Course purchases: Individual course purchases
- Subscription status: If monthly/annual learning subscription
- Payment methods: Update billing info
- Transaction history: Payments made, receipts`,

    profile: `
APP PAGE - Student Profile (Mobile-first, works great on desktop too)
- EDUCATION FOCUSED profile
- Profile header: Avatar, name, student ID, enrollment date
- Stats: Courses Completed, Certificates, Current GPA/Score
- Learning goals: What you're working toward
- Enrolled courses: Current course list with progress
- Completed courses: History of finished courses
- Skills: List of skills learned with proficiency levels
- Settings: Notification preferences, study reminders
- Transcript: Link to view/download academic record`,

    leaderboard: `
APP PAGE - Education Leaderboard (Mobile-first, works great on desktop too)
- EDUCATION FOCUSED rankings
- Tabs: This Course, All Courses, This Month, All Time
- Top 3 podium with student avatars and XP/scores
- Class rankings: Rank, avatar, name, score/XP
- Your position highlighted
- Filter by course or subject
- Quiz high scores section
- Study streak leaders`
  };

  // PROFESSIONAL SERVICES (Law, Accounting, Consulting)
  const professionalPages = {
    dashboard: `
APP PAGE - Client Portal Dashboard (Mobile-first, works great on desktop too)
- PROFESSIONAL SERVICES FOCUSED - matters and communication
- Top section: Active matter/case status summary
- Stats row: Active Matters, Documents Pending, Upcoming Meetings
- Active matters: List of current cases/projects with status indicators
- Upcoming meetings: Scheduled calls, consultations with join links
- Document requests: Items your firm needs from you with upload buttons
- Recent activity: New documents, messages, case updates
- Quick actions: Schedule Meeting, Upload Document, Message Team, View Invoice
- Your team: Photos of assigned professionals with direct message
- Mobile bottom nav: Home, Matters, Documents, Messages, Profile`,

    profile: `
APP PAGE - Client Profile (Mobile-first, works great on desktop too)
- PROFESSIONAL SERVICES FOCUSED profile
- Profile header: Avatar, name, client ID, "Client since 2023"
- Contact information: Phone, email, address
- Company info: If business client, company details
- Matter history: Past completed matters/cases
- Key contacts: Your primary attorney/accountant/consultant
- Communication preferences: Email, phone, secure message preferences
- Settings: Notifications, Document delivery preferences
- Important dates: Deadlines, renewal dates`,

    wallet: `
APP PAGE - Client Billing Dashboard (Mobile-first, works great on desktop too)
- PROFESSIONAL BILLING FOCUSED
- Outstanding balance: Amount currently due
- Retainer balance: If on retainer, remaining funds
- Recent invoices: List with amounts and due dates
- Payment options: Pay online, payment plan setup
- Billing history: Past invoices and payments
- Time/expense details: If available, billable hours breakdown
- Payment methods: Update billing information
- Billing contact: Questions to billing department`
  };

  // COWORKING / WORKSPACE INDUSTRY
  const coworkingPages = {
    dashboard: `
APP PAGE - Coworking Member Dashboard (Mobile-first, works great on desktop too)
- WORKSPACE FOCUSED - bookings and credits
- Top section: Today's bookings with room/desk details
- Stats row: Credits Remaining, Bookings This Month, Events Attended
- Today's schedule: Your reserved spaces with times and locations
- Quick actions: Book Desk, Reserve Room, View Events, Get Day Pass
- Available now: Real-time availability of desks and rooms
- Upcoming events: Networking events, workshops at the space
- Recent bookings: Past week's usage history
- Community: New members, member spotlights
- Mobile bottom nav: Home, Book, Events, Community, Profile`,

    earn: `
APP PAGE - Coworking Earn Credits Page (Mobile-first, works great on desktop too)
- COWORKING FOCUSED - earn through engagement
- Header: "Earn Credits" with current balance
- How to earn:
  * Refer a member: Free day passes or credits
  * Long-term booking discount: Book monthly, save more
  * Event attendance: Earn credits for joining events
  * Community contribution: Host a workshop, earn credits
- Current promotions: Bonus credit opportunities
- Referral section: Share your member code`,

    rewards: `
APP PAGE - Coworking Rewards/Perks Page (Mobile-first, works great on desktop too)
- COWORKING FOCUSED member perks
- Current tier: Flex/Standard/Premium/Enterprise
- Available perks:
  * Free guest day passes
  * Meeting room credits
  * Event access
  * Partner discounts (coffee, food, services)
- Tier benefits: What each membership level includes
- Upgrade options: Move to higher tier`,

    wallet: `
APP PAGE - Coworking Account/Credits Page (Mobile-first, works great on desktop too)
- WORKSPACE BILLING FOCUSED
- Credit balance: Available booking credits
- Membership status: Plan type, renewal date
- Add-ons: Mail handling, storage, phone booth hours
- Guest passes: Available passes to share
- Recent usage: Booking history with credits used
- Payment method: Update billing
- Upgrade/downgrade: Change membership plan`,

    profile: `
APP PAGE - Coworking Member Profile (Mobile-first, works great on desktop too)
- COWORKING FOCUSED profile
- Profile header: Avatar, name, company, membership tier
- Stats: Total Bookings, Events Attended, Referrals Made
- Company info: Your business details for directory
- Workspace preferences: Preferred location, quiet vs collaborative
- Booking preferences: Favorite desks, regular schedule
- Community visibility: Public profile settings
- Settings: Notifications, Calendar sync, WiFi preferences
- Referral code: Share to earn credits`
  };

  // ===========================================
  // INDUSTRY DETECTION AND ROUTING
  // ===========================================

  // Detect industry type
  const isCollectibles = lowerIndustry.includes('collectible') ||
    lowerIndustry.includes('sneaker') ||
    lowerIndustry.includes('card') ||
    lowerIndustry.includes('memorabilia') ||
    lowerIndustry.includes('trading') ||
    lowerIndustry.includes('vault') ||
    lowerIndustry.includes('authentication');

  const isSurveyRewards = lowerIndustry.includes('survey') ||
    lowerIndustry.includes('reward') ||
    lowerIndustry.includes('cashback') ||
    lowerIndustry.includes('gpt');

  const isRestaurant = lowerIndustry.includes('restaurant') ||
    lowerIndustry.includes('steakhouse') ||
    lowerIndustry.includes('cafe') ||
    lowerIndustry.includes('bistro') ||
    lowerIndustry.includes('dining') ||
    lowerIndustry.includes('food') ||
    lowerIndustry.includes('pizza') ||
    lowerIndustry.includes('bar') ||
    lowerIndustry.includes('brewery') ||
    lowerIndustry.includes('grill');

  const isRealEstate = lowerIndustry.includes('real estate') ||
    lowerIndustry.includes('realtor') ||
    lowerIndustry.includes('property') ||
    lowerIndustry.includes('homes') ||
    lowerIndustry.includes('housing') ||
    lowerIndustry.includes('realty') ||
    lowerIndustry.includes('mortgage');

  const isHealthcare = lowerIndustry.includes('medical') ||
    lowerIndustry.includes('healthcare') ||
    lowerIndustry.includes('doctor') ||
    lowerIndustry.includes('clinic') ||
    lowerIndustry.includes('dental') ||
    lowerIndustry.includes('dentist') ||
    lowerIndustry.includes('hospital') ||
    lowerIndustry.includes('wellness') ||
    lowerIndustry.includes('therapy') ||
    lowerIndustry.includes('patient');

  const isFitness = lowerIndustry.includes('fitness') ||
    lowerIndustry.includes('gym') ||
    lowerIndustry.includes('workout') ||
    lowerIndustry.includes('crossfit') ||
    lowerIndustry.includes('yoga') ||
    lowerIndustry.includes('pilates') ||
    lowerIndustry.includes('training') ||
    lowerIndustry.includes('athletic');

  const isSalon = lowerIndustry.includes('salon') ||
    lowerIndustry.includes('spa') ||
    lowerIndustry.includes('beauty') ||
    lowerIndustry.includes('hair') ||
    lowerIndustry.includes('nails') ||
    lowerIndustry.includes('barbershop') ||
    lowerIndustry.includes('barber') ||
    lowerIndustry.includes('massage') ||
    lowerIndustry.includes('skincare');

  const isEducation = lowerIndustry.includes('education') ||
    lowerIndustry.includes('school') ||
    lowerIndustry.includes('course') ||
    lowerIndustry.includes('training') ||
    lowerIndustry.includes('learning') ||
    lowerIndustry.includes('academy') ||
    lowerIndustry.includes('tutoring') ||
    lowerIndustry.includes('university');

  const isProfessional = lowerIndustry.includes('law') ||
    lowerIndustry.includes('legal') ||
    lowerIndustry.includes('attorney') ||
    lowerIndustry.includes('accounting') ||
    lowerIndustry.includes('consulting') ||
    lowerIndustry.includes('advisory') ||
    lowerIndustry.includes('financial');

  const isCoworking = lowerIndustry.includes('coworking') ||
    lowerIndustry.includes('workspace') ||
    lowerIndustry.includes('office') ||
    lowerIndustry.includes('flex space') ||
    lowerIndustry.includes('desk') ||
    lowerIndustry.includes('meeting room');

  // App pages that need industry-specific content
  const appPages = ['dashboard', 'earn', 'rewards', 'wallet', 'profile', 'leaderboard'];

  if (appPages.includes(pageId)) {
    // Return industry-specific page content if available
    if (isCollectibles && collectiblesPages[pageId]) {
      return collectiblesPages[pageId];
    }
    if (isSurveyRewards && surveyRewardsPages[pageId]) {
      return surveyRewardsPages[pageId];
    }
    if (isRestaurant && restaurantPages[pageId]) {
      return restaurantPages[pageId];
    }
    if (isRealEstate && realEstatePages[pageId]) {
      return realEstatePages[pageId];
    }
    if (isHealthcare && healthcarePages[pageId]) {
      return healthcarePages[pageId];
    }
    if (isFitness && fitnessPages[pageId]) {
      return fitnessPages[pageId];
    }
    if (isSalon && salonPages[pageId]) {
      return salonPages[pageId];
    }
    if (isEducation && educationPages[pageId]) {
      return educationPages[pageId];
    }
    if (isProfessional && professionalPages[pageId]) {
      return professionalPages[pageId];
    }
    if (isCoworking && coworkingPages[pageId]) {
      return coworkingPages[pageId];
    }
    // Default to survey-rewards style for any app with these pages
    if (surveyRewardsPages[pageId]) {
      return surveyRewardsPages[pageId];
    }
  }

  // ===========================================
  // STANDARD PAGE REQUIREMENTS (non-app pages)
  // ===========================================
  const requirements = {
    home: `
- Create a Hero that feels unique to the ARCHETYPE (not just a background image).
- Include 3-4 sections that showcase the business value.
- Mix up the order: Consider starting with a "Stat Strip" or "Featured Work" before the features.
- Ensure a clear CTA at the end.`,

    about: `
- Tell the story using the ARCHETYPE layout.
- Include a "Values" section that doesn't use standard cards (try a list or large text blocks).
- Highlight the mission with a massive pull-quote.`,

    services: `
- Show 3-6 offerings.
- If Bento archetype: Use different box sizes for different service tiers.
- If Editorial archetype: Use large images for each service with minimal text.`,

    contact: `
- Split layout: Contact form + Business details.
- Use Lucide icons for phone, email, and address.
- Minimal, high-contrast inputs.`
  };

  return requirements[pageId] || `Create a unique ${pageId} page layout using the assigned archetype.`;
}

function buildEnhanceModePrompt(pageId, pageName, existingSiteData, promptConfig) {
  const colors = existingSiteData?.designSystem?.colors || [];
  const fonts = existingSiteData?.designSystem?.fonts || [];
  
  return `ENHANCE MODE: Recreate the ${pageId} page for ${existingSiteData?.businessName || 'Business'} with a MORE PREMIUM look while keeping their brand.

THEIR BRAND (USE THESE EXACT VALUES):
- Primary Color: ${colors[0] || '#3e3e3e'}
- Accent Color: ${colors[1] || '#ff0e36'}
- Font: ${fonts[0]?.split('%')[0] || 'Oswald'}, sans-serif
- Prices: ${existingSiteData?.pageContent?.prices?.join(', ') || 'N/A'}

THEIR IMAGES (USE THESE ACTUAL URLs):
${existingSiteData?.designSystem?.images?.slice(0, 6).map(i => i.src).join('\n') || 'No images extracted'}

THEIR HEADLINES (USE THESE):
${existingSiteData?.pageContent?.headlines?.slice(0, 6).join(' | ') || 'Business Headline'}

RULES:
- Inline styles (style={{ }}) - NO Tailwind
- Lucide React icons - NO emojis
- NO header/footer - App.jsx handles those
- NO CartContext/CartProvider - NEVER create your own cart context. Use: import { useCart } from '../context/CartContext';
- <Link> from react-router-dom
- USE their image URLs in img tags

CRITICAL STYLE SYNTAX:
✅ opacity: 0.7 (number, no quotes)
✅ fontSize: '16px' (string with quotes BOTH sides)
❌ NEVER: opacity: 0.7' (trailing quote without opening)
Rule: Numbers alone = no quotes. Values with units = quotes on BOTH sides.

${getEnhancePageInstructions(pageId, existingSiteData)}

IMPROVEMENTS: 80px+ section padding, 48-64px headlines, shadows, hover effects.

Return ONLY valid JSX starting with imports, ending with export default ${pageName}Page.`;
}

function getPageSpecificInstructions(pageId, colors, layout) {
  const heroHeight = layout.heroHeight || '70vh';
  const primary = colors.primary || '#0a1628';
  const accent = colors.accent || '#c9a962';

  // Page-specific animation styles - IMPORTANT: Each page should have DIFFERENT animations
  const pageAnimations = {
    home: `
ANIMATION STYLE FOR HOME - "DRAMATIC ENTRANCE":
- Wrap hero content in <ScrollReveal animation="fade-up" delay={0.2}>
- Use <ParallaxSection> for the hero background image
- Stats: Use <AnimatedCounter> with staggered delays (0, 0.2, 0.4)
- Feature cards: Wrap in <StaggeredList> for sequential reveal
- Add subtle <GlowEffect> to primary CTA button`,

    about: `
ANIMATION STYLE FOR ABOUT - "STORYTELLING FLOW":
- Hero: <ScrollReveal animation="fade-in" delay={0.1}> - simple, elegant
- Story section: Use <ScrollReveal animation="slide-right"> for text, <ScrollReveal animation="slide-left"> for images
- Values cards: <StaggeredList delay={0.15}> - gentle stagger
- Timeline elements: Alternate <ScrollReveal animation="slide-left"> and "slide-right"
- Team photos: <TiltCard> for subtle 3D hover effect`,

    services: `
ANIMATION STYLE FOR SERVICES - "CARD CASCADE":
- Hero: Minimal animation - just <ScrollReveal animation="fade-in">
- Service cards: Use <StaggeredList delay={0.1}> with <TiltCard> wrappers
- Process steps: <ScrollReveal animation="zoom-in"> for each step icon
- Pricing tiers: Stagger with delays 0.1, 0.2, 0.3
- NO parallax on this page - keep it professional and scannable`,

    gallery: `
ANIMATION STYLE FOR GALLERY - "MASONRY REVEAL":
- Hero: Short, simple <ScrollReveal animation="fade-in">
- Gallery images: <StaggeredList delay={0.05}> for rapid cascade effect
- Each image: Add subtle hover zoom (transform: scale(1.03))
- Lightbox overlay: CSS transition for smooth open
- Categories: Horizontal scroll or filter pills with fade transitions`,

    contact: `
ANIMATION STYLE FOR CONTACT - "CLEAN & DIRECT":
- Hero: Simple <ScrollReveal animation="fade-in">
- Contact form: <ScrollReveal animation="slide-up"> - single reveal for whole form
- Info cards: <ScrollReveal animation="fade-in" delay={0.2}> - subtle
- Map (if present): Fade in after form loads
- MINIMAL animations - users want to contact you, not watch effects`,

    pricing: `
ANIMATION STYLE FOR PRICING - "SPOTLIGHT TIERS":
- Hero: <ScrollReveal animation="fade-in">
- Pricing cards: <StaggeredList> with center card having <GlowEffect>
- Featured tier: Add subtle pulsing border animation (CSS @keyframes)
- Feature checkmarks: Stagger within each card
- Comparison table rows: <ScrollReveal animation="fade-up"> per row`,

    testimonials: `
ANIMATION STYLE FOR TESTIMONIALS - "QUOTE THEATER":
- Hero: <ScrollReveal animation="fade-in">
- Quote cards: <StaggeredList delay={0.15}> with <TiltCard> wrappers
- Large quote icons: <ScrollReveal animation="zoom-in">
- Star ratings: Animate in sequence (CSS @keyframes)
- Client photos: Subtle border glow on hover`,

    team: `
ANIMATION STYLE FOR TEAM - "PROFESSIONAL INTRODUCTION":
- Hero: <ScrollReveal animation="fade-in">
- Team cards: <StaggeredList delay={0.12}>
- Photos: <TiltCard> with subtle 3D effect on hover
- Social icons: Fade in on card hover (CSS transition)
- Bio text: <ScrollReveal animation="fade-up"> per section`,

    menu: `
ANIMATION STYLE FOR MENU - "APPETIZING DISPLAY":
- Hero: <ParallaxSection> with food imagery background
- Menu categories: <ScrollReveal animation="slide-up"> for headers
- Menu items: <StaggeredList delay={0.08}> for rapid display
- Prices: <AnimatedCounter> for any featured prices
- Food images: Scale-up hover effect (transform: scale(1.05))`,

    booking: `
ANIMATION STYLE FOR BOOKING - "GUIDED EXPERIENCE":
- Hero: Simple <ScrollReveal animation="fade-in">
- Booking form: <ScrollReveal animation="slide-up">
- Available slots: Subtle pulse animation on available times
- Calendar: CSS transition for date selection
- Confirmation: <ScrollReveal animation="zoom-in"> for success state`,

    faq: `
ANIMATION STYLE FOR FAQ - "ACCORDION FLOW":
- Hero: <ScrollReveal animation="fade-in">
- FAQ items: <StaggeredList delay={0.08}>
- Accordion expand: CSS max-height transition (0.3s ease)
- Plus/minus icons: Rotate transform on toggle
- Related questions: Fade in at bottom`
  };

  const instructions = {
    home: `
HOME PAGE REQUIREMENTS:
- HERO (${heroHeight}): Dark background (${primary}) with image overlay
  backgroundImage: 'linear-gradient(rgba(10, 22, 40, 0.85), rgba(10, 22, 40, 0.95)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920")'
  backgroundSize: 'cover', backgroundPosition: 'center'
- Accent line (width 60px, height 3px, background: ${accent}) above headline
- Main headline: large, font-weight 300
- Subheadline: 18-20px, opacity 0.9
- Two buttons: Filled primary CTA, outlined secondary
- INTRO SECTION: White/light background, value proposition, max-width 800px
- FEATURES: 3-4 cards with accent-colored Lucide icons
- TESTIMONIAL: Single quote with large Quote icon, italic text
- CTA SECTION: Dark background, compelling headline, accent button
${pageAnimations.home}`,

    about: `
ABOUT PAGE REQUIREMENTS:
- HERO (50vh): Solid dark background (${primary}), centered content
- Small label "OUR STORY" uppercase, letter-spacing 3px, accent color (${accent})
- Company name large (48px)
- Stats row: three numbers (500+, 15+, 1000+) with labels below
- STORY SECTION: Light bg, two columns - text left, pull quote right
- VALUES: 4 cards with icons (Shield, Target, Users, Award)
- CREDENTIALS: Subtle section with certifications
- CTA at bottom
${pageAnimations.about}`,

    services: `
SERVICES PAGE REQUIREMENTS:
- HERO (40vh): Gradient background, centered text
- Simple headline, brief tagline, NO buttons in hero
- SERVICE CARDS: Numbered (01, 02, 03, 04), accent-colored numbers
- Each card: title, description, bullet points with Check icons
- PROCESS SECTION: 4-step visual flow
- CTA: Accent button to contact
${pageAnimations.services}`,

    contact: `
CONTACT PAGE REQUIREMENTS:
- HERO (30vh): Dark background, "GET IN TOUCH" label, simple headline
- Split layout below: Form (60%) left, Info (40%) right
- Form: First name, Last name, Email, Phone, Company, Message
- Clean inputs: subtle borders, accent focus state, accent submit button
- Info card: MapPin, Phone, Mail, Clock icons with details
- Business hours displayed
${pageAnimations.contact}`,

    pricing: `
PRICING PAGE REQUIREMENTS:
- HERO (35vh): Dark background, "PRICING" label
- Pricing cards: featured tier with accent border
- Check icons for features in accent color
- Clear pricing, CTA buttons
- FAQ section below if space
${pageAnimations.pricing}`,

    faq: `
FAQ PAGE REQUIREMENTS:
- HERO (25vh): Light gray background, dark text
- Simple "Frequently Asked Questions" headline
- Accordion items with Plus/Minus icons (useState for expand/collapse)
- 8-10 relevant questions with detailed answers
- Accent color on expanded item border
- CTA at bottom for additional questions
${pageAnimations.faq}`,

    testimonials: `
TESTIMONIALS PAGE REQUIREMENTS:
- HERO (30vh): Dark background, "CLIENT SUCCESS" label
- Large testimonial cards with Quote icon
- Client initials in accent circle, name, title
- 4-6 testimonials in grid
- Stats section with success metrics
${pageAnimations.testimonials}`,

    team: `
TEAM PAGE REQUIREMENTS:
- HERO (40vh): Dark background, "OUR TEAM" label
- Team cards: initials in circle, name, title in accent
- 3-4 team members with short bios
- Credentials below each
${pageAnimations.team}`,

    booking: `
BOOKING PAGE REQUIREMENTS:
- HERO (30vh): Dark background, "SCHEDULE" label
- Booking form with service selection, date preference
- Contact fields
- Right side: what to expect, benefits
- Accent submit button
${pageAnimations.booking}`,

    gallery: `
GALLERY PAGE REQUIREMENTS:
- HERO (30vh): Dark background, "OUR WORK" or "GALLERY" label
- Gallery grid: masonry or uniform grid layout
- Lightbox on click for full-size images
- Categories/filters if multiple types of work
- High-quality images showcasing best work
${pageAnimations.gallery}`,

    menu: `
MENU PAGE REQUIREMENTS:
- HERO (35vh): Food imagery background with overlay
- Menu categories clearly labeled
- Items with descriptions and prices
- Dietary icons (vegetarian, gluten-free, etc.)
- Featured/popular items highlighted
${pageAnimations.menu}`
  };
  
  return instructions[pageId] || `
${pageId.toUpperCase()} PAGE:
- HERO (40vh): Appropriate for this page type
- Clear headline and description
- Relevant content sections
- CTA where appropriate`;
}

function getEnhancePageInstructions(pageId, existingSiteData) {
  // Simplified enhance instructions
  const images = existingSiteData?.designSystem?.images || [];
  
  if (pageId === 'home') {
    return `HOME PAGE - Create stunning hero with their product images, feature cards, testimonials, CTA sections.
Use their actual product images: ${images.slice(0, 8).map(i => i.src).join(', ') || 'none found'}`;
  }
  
  return `${pageId.toUpperCase()} PAGE - Create appropriate sections with their branding.`;
}

/**
 * Build page prompt specifically for Orchestrator mode
 * Streamlined version optimized for orchestrator-generated businesses
 *
 * @param {string} pageId - Page identifier (home, about, services, etc.)
 * @param {string} componentName - React component name
 * @param {string} otherPages - List of other pages in the site
 * @param {Object} description - Business description object
 * @param {Object} promptConfig - Prompt configuration (colors, industry, etc.)
 * @param {Object} [layoutConfig] - Optional layout configuration for layout intelligence
 */
function buildOrchestratorPagePrompt(pageId, componentName, otherPages, description, promptConfig, layoutConfig = null) {
  const businessName = description.businessName || promptConfig.businessName || 'Our Business';
  const tagline = description.tagline || '';
  const cta = description.callToAction || 'Get Started';
  const industry = promptConfig.industry?.name || description.industryKey || 'business';
  const location = description.location || '';
  const colors = promptConfig.colors || { primary: '#6366f1', accent: '#06b6d4' };

  // Get industry-specific images
  const industryImages = getIndustryImageUrls(industry);

  // Check if we have layout intelligence
  const hasLayoutIntelligence = layoutConfig && layoutConfig.detailedContext;

  // Generic page type guide (used when no layout intelligence)
  const pageTypeGuide = {
    home: `HERO SECTION with impactful headline, tagline, and CTA button. FEATURES/SERVICES preview. TESTIMONIALS. About preview. Contact CTA.`,
    about: `Company story and mission. Team section with photos. Values/philosophy. Timeline or milestones. Trust badges.`,
    services: `Service cards with icons, descriptions, pricing hints. Process/how-it-works section. FAQ. Service area coverage.`,
    contact: `Contact form (name, email, phone, message). Business hours. Location map placeholder. Phone and email displayed prominently.`,
    pricing: `Pricing tiers/packages. Feature comparison. FAQ about pricing. Money-back guarantee badge. CTA to contact.`,
    gallery: `Image grid showcasing work. Before/after if applicable. Category filters. Lightbox-style presentation.`,
    'book-online': `Booking form or calendar integration placeholder. Service selection. Date/time picker mockup. Confirmation info.`,
    'service-areas': `Map or list of service areas. Coverage radius. Area-specific info. CTA per area.`,
    team: `Team member cards with photos, names, roles, bios. Company culture section.`,
    testimonials: `Customer reviews with photos, names, ratings. Video testimonial placeholders. Trust indicators.`,
    faq: `Accordion-style FAQ sections organized by category. Contact CTA for more questions.`,
    blog: `Blog post previews in card grid. Categories sidebar. Search placeholder. Featured posts.`
  };

  // Use layout intelligence for home page if available, otherwise use generic guide
  let pageGuide;
  if (hasLayoutIntelligence && (pageId === 'home' || pageId === 'landing')) {
    // For home page with layout intelligence, the detailed context includes section order
    pageGuide = 'Follow the LAYOUT INTELLIGENCE section order below EXACTLY.';
  } else {
    pageGuide = pageTypeGuide[pageId] || `Create appropriate content sections for a ${pageId} page.`;
  }

  // Build layout intelligence block if available
  const layoutIntelligenceBlock = hasLayoutIntelligence ? `
${layoutConfig.detailedContext}
` : '';

  return `You are an expert React developer creating a ${pageId.toUpperCase()} page for "${businessName}".

BUSINESS CONTEXT:
- Business Name: ${businessName}
- Industry: ${industry}
- Tagline: "${tagline}"
- Primary CTA: "${cta}"
- Location: ${location || 'Not specified'}

PAGE REQUIREMENTS:
${pageGuide}
${layoutIntelligenceBlock}
OTHER PAGES IN THIS SITE: ${otherPages || 'none'}

DESIGN SYSTEM:
- Primary Color: ${colors.primary}
- Accent Color: ${colors.accent}
- Use modern, clean design with plenty of whitespace
- Mobile-first responsive design
- Smooth hover animations

IMAGES TO USE:
- Hero: ${industryImages.hero}
- Gallery: ${(industryImages.gallery || []).slice(0, 4).join(', ')}
- Services: ${(industryImages.services || []).slice(0, 3).join(', ')}

TECHNICAL REQUIREMENTS:
1. Export a single React functional component named ${componentName}Page
2. Use inline styles with JavaScript objects (no CSS imports except theme.css)
3. Import { Link } from 'react-router-dom' for navigation
4. Use semantic HTML (header, main, section, footer)
5. Include responsive breakpoints using CSS-in-JS
6. Add smooth scroll behavior for anchor links
7. NO nav/footer - those are provided by App.jsx
8. NO CartContext/CartProvider - NEVER create your own cart context. If you need cart functionality:
   import { useCart } from '../context/CartContext';
   Then use: const { items, addItem, removeItem, clearCart, total, itemCount } = useCart();

CRITICAL:
- Return ONLY the JSX code, no markdown code blocks
- The component must be a complete, working React component
- Include proper export default statement
- Use actual image URLs provided, not placeholders

Generate the complete ${componentName}Page.jsx component:`;
}

function buildFallbackPage(componentName, pageId, promptConfig, industry, moodSliders = null) {
  // Get slider-aware styles
  const sliderStyles = getSliderStyles(moodSliders, promptConfig?.colors);

  // Use slider-adjusted colors and typography
  const colors = sliderStyles.colors;
  const typography = {
    heading: sliderStyles.fontHeading,
    body: sliderStyles.fontBody
  };
  const displayName = toNavLabel(pageId);

  // Get industry-specific data for richer fallback pages
  const fixture = industry ? getIndustryFixture(industry) : null;
  const sampleData = industry ? getSampleData(industry) : null;
  const terminology = fixture?.terminology || { items: 'Services', action: sliderStyles.copyTone.cta };

  // Get copy tone from sliders
  const { copyTone, priceTone, buttonStyle, isDark } = sliderStyles;

  // Generate page-specific content based on pageId
  const pageType = pageId.toLowerCase();

  // Background and text colors based on dark mode
  const bgColor = isDark ? '#0a0a0f' : colors.background;
  const heroGradient = isDark
    ? `linear-gradient(135deg, #1a1a2e 0%, ${colors.primary} 100%)`
    : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent || colors.primary} 100%)`;

  // HOME PAGE - Hero + Features
  if (pageType === 'home' || pageType === 'landing') {
    return `import React from 'react';
import { Link } from 'react-router-dom';

const ${componentName}Page = () => {
  return (
    <div style={{ minHeight: '100vh', background: '${bgColor}' }}>
      {/* Hero Section */}
      <section style={{
        padding: '${sliderStyles.sectionPadding}',
        paddingTop: '140px',
        background: '${heroGradient}',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '${sliderStyles.sliders.energy > 65 ? '56px' : '48px'}',
            fontFamily: "${typography.heading}",
            marginBottom: '24px',
            fontWeight: ${sliderStyles.fontWeight},
            textTransform: '${sliderStyles.headlineStyle}',
            letterSpacing: '${sliderStyles.sliders.era < 35 ? '2px' : '0'}'
          }}>
            ${copyTone.greeting.replace("We're so glad you're here.", '')}
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px', lineHeight: 1.7, fontFamily: "${typography.body}" }}>
            ${priceTone.valueMessage} ${terminology.items} you can ${copyTone.valueWords[2] || 'trust'}.
          </p>
          <Link to="/contact" style={{
            display: 'inline-block',
            padding: '${buttonStyle.padding}',
            background: '${isDark ? colors.accent : 'white'}',
            color: '${isDark ? 'white' : colors.primary}',
            textDecoration: 'none',
            borderRadius: '${sliderStyles.borderRadius}',
            fontWeight: ${buttonStyle.fontWeight},
            fontSize: '18px',
            textTransform: '${buttonStyle.textTransform}'
          }}>
            ${copyTone.cta}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '${sliderStyles.sectionPadding}', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '32px',
          color: '${colors.text}',
          textAlign: 'center',
          marginBottom: '${sliderStyles.gap}',
          fontFamily: "${typography.heading}",
          textTransform: '${sliderStyles.headlineStyle}'
        }}>
          Why Choose Us
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${sliderStyles.gap}' }}>
          {['${copyTone.valueWords[0] || 'Quality'}', '${copyTone.valueWords[1] || 'Experience'}', '${copyTone.valueWords[2] || 'Trust'}'].map((feature, idx) => (
            <div key={idx} style={{
              padding: '${sliderStyles.cardPadding}',
              background: '${isDark ? 'rgba(255,255,255,0.05)' : colors.surface}',
              borderRadius: '${sliderStyles.borderRadius}',
              textAlign: 'center',
              border: '${isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'}'
            }}>
              <h3 style={{ fontSize: '20px', color: '${colors.primary}', marginBottom: '12px', textTransform: 'capitalize' }}>{feature}</h3>
              <p style={{ color: '${colors.textMuted}', lineHeight: 1.6, fontFamily: "${typography.body}" }}>
                We pride ourselves on delivering exceptional {feature.toLowerCase()} in everything we do.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ${componentName}Page;`;
  }

  // MENU / SERVICES / PRODUCTS PAGE
  if (pageType === 'menu' || pageType === 'services' || pageType === 'products' || pageType === 'shop') {
    const categories = sampleData?.categories || [
      { name: 'Category 1', items: [{ name: 'Item A', price: 29, description: 'Great option' }] },
      { name: 'Category 2', items: [{ name: 'Item B', price: 49, description: 'Premium choice' }] }
    ];

    return `import React from 'react';

const ${componentName}Page = () => {
  const categories = ${JSON.stringify(categories, null, 2)};

  return (
    <div style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '${colors.primary}', fontFamily: "${typography.heading}", marginBottom: '16px', textAlign: 'center' }}>
        Our ${terminology.items}
      </h1>
      <p style={{ color: '${colors.textMuted}', fontSize: '18px', textAlign: 'center', marginBottom: '48px' }}>
        Browse our selection below
      </p>

      {categories.map((category, catIdx) => (
        <div key={catIdx} style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', color: '${colors.text}', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid ${colors.surface}' }}>
            {category.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {category.items.map((item, itemIdx) => (
              <div key={itemIdx} style={{
                padding: '24px',
                background: '${colors.surface}',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: '${colors.text}', marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ color: '${colors.textMuted}', fontSize: '14px' }}>{item.description}</p>
                </div>
                {item.price && (
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '${colors.primary}' }}>
                    \${item.price}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName}Page;`;
  }

  // ABOUT PAGE
  if (pageType === 'about') {
    return `import React from 'react';

const ${componentName}Page = () => {
  return (
    <div style={{ padding: '80px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '${colors.primary}', fontFamily: "${typography.heading}", marginBottom: '24px', textAlign: 'center' }}>
        About Us
      </h1>

      <div style={{ fontSize: '18px', color: '${colors.text}', lineHeight: 1.8 }}>
        <p style={{ marginBottom: '24px' }}>
          Welcome to our business. We've been serving our community with dedication and excellence.
          Our team is committed to providing you with the best ${terminology.items.toLowerCase()} and customer experience.
        </p>

        <p style={{ marginBottom: '24px' }}>
          What sets us apart is our attention to detail and genuine care for every customer.
          We believe in building lasting relationships based on trust and quality.
        </p>

        <div style={{
          padding: '32px',
          background: '${colors.surface}',
          borderRadius: '12px',
          marginTop: '40px',
          borderLeft: '4px solid ${colors.primary}'
        }}>
          <h3 style={{ color: '${colors.primary}', marginBottom: '12px' }}>Our Mission</h3>
          <p style={{ color: '${colors.textMuted}', margin: 0 }}>
            To deliver exceptional ${terminology.items.toLowerCase()} that exceed expectations and make a positive impact in our customers' lives.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName}Page;`;
  }

  // CONTACT PAGE
  if (pageType === 'contact') {
    return `import React, { useState } from 'react';

const ${componentName}Page = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <div style={{ padding: '80px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '${colors.primary}', fontFamily: "${typography.heading}", marginBottom: '16px', textAlign: 'center' }}>
        Contact Us
      </h1>
      <p style={{ color: '${colors.textMuted}', fontSize: '18px', textAlign: 'center', marginBottom: '40px' }}>
        We'd love to hear from you
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '${colors.text}', fontWeight: 500 }}>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '16px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '${colors.text}', fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '16px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '${colors.text}', fontWeight: 500 }}>Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            required
            rows={5}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>
        <button type="submit" style={{
          padding: '14px 28px',
          background: '${colors.primary}',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ${componentName}Page;`;
  }

  // GALLERY PAGE
  if (pageType === 'gallery' || pageType === 'portfolio') {
    return `import React from 'react';

const ${componentName}Page = () => {
  const images = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    src: \`https://picsum.photos/seed/\${i + 1}/400/300\`,
    alt: \`Gallery image \${i + 1}\`
  }));

  return (
    <div style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '${colors.primary}', fontFamily: "${typography.heading}", marginBottom: '16px', textAlign: 'center' }}>
        ${displayName}
      </h1>
      <p style={{ color: '${colors.textMuted}', fontSize: '18px', textAlign: 'center', marginBottom: '48px' }}>
        See our work in action
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {images.map((img) => (
          <div key={img.id} style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <img
              src={img.src}
              alt={img.alt}
              style={{ width: '100%', height: '240px', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName}Page;`;
  }

  // TEAM PAGE
  if (pageType === 'team' || pageType === 'staff' || pageType === 'providers') {
    return `import React from 'react';

const ${componentName}Page = () => {
  const team = [
    { name: 'John Smith', role: 'Owner', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Sarah Johnson', role: 'Manager', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Mike Davis', role: 'Specialist', image: 'https://randomuser.me/api/portraits/men/67.jpg' }
  ];

  return (
    <div style={{ padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '${colors.primary}', fontFamily: "${typography.heading}", marginBottom: '16px', textAlign: 'center' }}>
        Meet Our Team
      </h1>
      <p style={{ color: '${colors.textMuted}', fontSize: '18px', textAlign: 'center', marginBottom: '48px' }}>
        The people behind our success
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
        {team.map((member, idx) => (
          <div key={idx} style={{ textAlign: 'center' }}>
            <img
              src={member.image}
              alt={member.name}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '16px',
                border: '4px solid ${colors.surface}'
              }}
            />
            <h3 style={{ fontSize: '20px', color: '${colors.text}', marginBottom: '4px' }}>{member.name}</h3>
            <p style={{ color: '${colors.primary}', fontWeight: 500 }}>{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName}Page;`;
  }

  // DEFAULT - Generic page with styled content
  return `import React from 'react';
import { Link } from 'react-router-dom';

const ${componentName}Page = () => {
  return (
    <div style={{ padding: '80px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', color: '${colors.primary}', fontFamily: "${typography.heading}", marginBottom: '24px' }}>
        ${displayName}
      </h1>
      <p style={{ color: '${colors.textMuted}', fontSize: '18px', lineHeight: 1.7, marginBottom: '32px' }}>
        Welcome to the ${displayName} page. Content coming soon.
      </p>
      <Link to="/home" style={{
        display: 'inline-block',
        padding: '12px 24px',
        background: '${colors.primary}',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 500
      }}>
        Back to Home
      </Link>
    </div>
  );
};

export default ${componentName}Page;`;
}

// ============================================
// INDUSTRY HEADER CONFIGURATIONS
// ============================================
function getIndustryHeaderConfig(industry) {
  const lowerIndustry = (industry || '').toLowerCase();

  // Tattoo/Creative/Edgy Industries (Tattoo, Piercing, Motorcycle, Custom)
  if (lowerIndustry.includes('tattoo') || lowerIndustry.includes('ink') ||
      lowerIndustry.includes('piercing') || lowerIndustry.includes('motorcycle') ||
      lowerIndustry.includes('custom') || lowerIndustry.includes('body art')) {
    return {
      type: 'creative',
      showEmergencyBanner: false,
      primaryCta: { text: 'Book Consultation', icon: 'Calendar', action: 'link', href: '/booking' },
      secondaryCta: { text: 'View Portfolio', icon: 'Image', action: 'link', href: '/gallery' },
      headerStyle: 'edgy',
      glowEffect: true,
      mobilePhoneVisible: false
    };
  }

  // Barbershop/Grooming - masculine, bold
  if (lowerIndustry.includes('barber') || lowerIndustry.includes('grooming')) {
    return {
      type: 'barbershop',
      showEmergencyBanner: false,
      primaryCta: { text: 'Book Now', icon: 'Calendar', action: 'link', href: '/booking' },
      secondaryCta: { text: 'Our Services', icon: 'Scissors', action: 'link', href: '/services' },
      headerStyle: 'bold',
      mobilePhoneVisible: true
    };
  }

  // Emergency Services (Plumber, HVAC, Electrician, Locksmith)
  if (lowerIndustry.includes('plumb') || lowerIndustry.includes('hvac') ||
      lowerIndustry.includes('electric') || lowerIndustry.includes('locksmith') ||
      lowerIndustry.includes('roofing') || lowerIndustry.includes('emergency')) {
    return {
      type: 'emergency',
      showEmergencyBanner: true,
      emergencyText: '24/7 Emergency Service',
      showPhoneProminent: true,
      phoneNumber: '(555) 123-4567',
      primaryCta: { text: 'Call Now', icon: 'Phone', action: 'tel' },
      secondaryCta: { text: 'Get Quote', icon: 'FileText', action: 'link', href: '/contact' },
      showBadge: true,
      badgeText: '24/7',
      headerStyle: 'emergency',
      mobilePhoneVisible: true
    };
  }

  // Entertainment (Bowling, Arcade, Mini Golf, Trampoline)
  if (lowerIndustry.includes('bowl') || lowerIndustry.includes('arcade') ||
      lowerIndustry.includes('golf') || lowerIndustry.includes('trampoline') ||
      lowerIndustry.includes('laser') || lowerIndustry.includes('entertainment') ||
      lowerIndustry.includes('fun') || lowerIndustry.includes('go-kart')) {
    return {
      type: 'entertainment',
      showEmergencyBanner: false,
      showSocialIcons: true,
      primaryCta: { text: 'Book Now', icon: 'Calendar', action: 'link', href: '/book' },
      secondaryCta: { text: 'Parties', icon: 'PartyPopper', action: 'link', href: '/parties' },
      headerStyle: 'playful',
      glowEffect: true,
      mobilePhoneVisible: false
    };
  }

  // Restaurants/Food
  if (lowerIndustry.includes('restaurant') || lowerIndustry.includes('food') ||
      lowerIndustry.includes('dining') || lowerIndustry.includes('cafe') ||
      lowerIndustry.includes('bistro') || lowerIndustry.includes('bar') ||
      lowerIndustry.includes('grill') || lowerIndustry.includes('kitchen')) {
    return {
      type: 'restaurant',
      showEmergencyBanner: false,
      showHours: true,
      hoursText: 'Open today: 11am - 10pm',
      showLocation: true,
      primaryCta: { text: 'Order Online', icon: 'ShoppingBag', action: 'link', href: '/order' },
      secondaryCta: { text: 'Reservations', icon: 'Calendar', action: 'link', href: '/reservations' },
      headerStyle: 'warm',
      mobilePhoneVisible: true
    };
  }

  // Professional Services (Law, Accounting, Consulting)
  if (lowerIndustry.includes('law') || lowerIndustry.includes('legal') ||
      lowerIndustry.includes('attorney') || lowerIndustry.includes('account') ||
      lowerIndustry.includes('consult') || lowerIndustry.includes('advisory') ||
      lowerIndustry.includes('financial') || lowerIndustry.includes('cpa')) {
    return {
      type: 'professional',
      showEmergencyBanner: false,
      showCredentials: true,
      credentialsText: 'BBB A+ Rated',
      primaryCta: { text: 'Free Consultation', icon: 'Calendar', action: 'link', href: '/contact' },
      headerStyle: 'minimal',
      mobilePhoneVisible: true
    };
  }

  // Retail/E-commerce
  if (lowerIndustry.includes('retail') || lowerIndustry.includes('ecommerce') ||
      lowerIndustry.includes('shop') || lowerIndustry.includes('store') ||
      lowerIndustry.includes('boutique')) {
    return {
      type: 'retail',
      showEmergencyBanner: false,
      showSearch: true,
      showCart: true,
      primaryCta: { text: 'Shop Now', icon: 'ShoppingBag', action: 'link', href: '/shop' },
      showPromoBanner: true,
      promoText: 'Free Shipping on Orders $50+',
      headerStyle: 'modern',
      mobilePhoneVisible: false
    };
  }

  // Healthcare/Medical
  if (lowerIndustry.includes('health') || lowerIndustry.includes('medical') ||
      lowerIndustry.includes('clinic') || lowerIndustry.includes('dental') ||
      lowerIndustry.includes('doctor') || lowerIndustry.includes('hospital') ||
      lowerIndustry.includes('therapy') || lowerIndustry.includes('wellness')) {
    return {
      type: 'healthcare',
      showEmergencyBanner: false,
      showPhoneProminent: true,
      phoneNumber: '(555) 123-4567',
      primaryCta: { text: 'Book Appointment', icon: 'Calendar', action: 'link', href: '/appointment' },
      secondaryCta: { text: 'Patient Portal', icon: 'User', action: 'link', href: '/portal' },
      showCredentials: true,
      credentialsText: 'HIPAA Compliant',
      headerStyle: 'calming',
      mobilePhoneVisible: true
    };
  }

  // Fitness/Gym
  if (lowerIndustry.includes('fitness') || lowerIndustry.includes('gym') ||
      lowerIndustry.includes('yoga') || lowerIndustry.includes('crossfit') ||
      lowerIndustry.includes('workout') || lowerIndustry.includes('personal train')) {
    return {
      type: 'fitness',
      showEmergencyBanner: false,
      primaryCta: { text: 'Start Free Trial', icon: 'Zap', action: 'link', href: '/join' },
      secondaryCta: { text: 'Class Schedule', icon: 'Calendar', action: 'link', href: '/schedule' },
      headerStyle: 'bold',
      mobilePhoneVisible: false
    };
  }

  // Default
  return {
    type: 'default',
    showEmergencyBanner: false,
    primaryCta: { text: 'Contact Us', icon: 'Mail', action: 'link', href: '/contact' },
    headerStyle: 'default',
    mobilePhoneVisible: false
  };
}

function buildAppJsx(name, pages, promptConfig, industry) {
  const colors = promptConfig?.colors || { primary: '#0a1628', text: '#1a1a2e', textMuted: '#4a5568' };
  const typography = promptConfig?.typography || { heading: "Georgia, 'Times New Roman', serif" };

  // Get industry-specific header configuration
  const headerConfig = getIndustryHeaderConfig(industry);

  // Industries that require authentication (expanded to all industries with companion apps)
  // Auth is needed for: user accounts, loyalty programs, order history, bookings, etc.
  const authRequiredIndustries = [
    // All food & beverage
    'restaurant', 'pizza', 'pizzeria', 'steakhouse', 'cafe', 'bar', 'bakery', 'brewery', 'winery', 'coffee-shop',
    // Healthcare & wellness
    'healthcare', 'dental', 'chiropractic', 'veterinary', 'spa-salon', 'barbershop', 'fitness', 'yoga', 'yoga-studio', 'martial-arts',
    // Professional services
    'law-firm', 'accounting', 'consulting', 'real-estate', 'insurance', 'finance', 'financial-advisor',
    // Tech & retail
    'saas', 'startup', 'agency', 'ecommerce', 'subscription-box', 'collectibles',
    // Creative & entertainment
    'photography', 'wedding', 'portfolio', 'musician', 'podcast', 'gaming',
    // Organizations & education
    'nonprofit', 'church', 'school', 'online-course',
    // Trade services
    'construction', 'plumber', 'electrician', 'hvac', 'landscaping', 'roofing', 'cleaning', 'auto-repair', 'moving',
    // Other
    'pet-services', 'event-venue', 'hotel', 'travel', 'daycare', 'tutoring', 'music-school', 'florist',
    // Legacy
    'survey-rewards', 'family'
  ];
  const needsAuth = authRequiredIndustries.includes(industry);
  
  // Pages that require authentication (protected routes)
  const protectedPages = ['dashboard', 'earn', 'rewards', 'wallet', 'profile', 'settings', 'account'];
  
  const routeImports = pages.map(p => {
    const componentName = toComponentName(p) + 'Page';
    return `import ${componentName} from './pages/${componentName}';`;
  }).join('\n');
  
  const routeElements = pages.map(p => {
    const componentName = toComponentName(p) + 'Page';
    const routePath = toRoutePath(p);
    const isProtected = needsAuth && protectedPages.includes(p.toLowerCase().replace(/\s+/g, '-'));

    if (isProtected) {
      return `              <Route path="${routePath}" element={<ProtectedRoute><${componentName} /></ProtectedRoute>} />`;
    }
    return `              <Route path="${routePath}" element={<${componentName} />} />`;
  }).join('\n');

  // Separate public pages from user/account pages
  const publicPageNames = ['home', 'menu', 'about', 'gallery', 'contact', 'team', 'booking', 'services', 'portfolio', 'blog', 'faq', 'pricing'];
  const userPageNames = ['dashboard', 'earn', 'wallet', 'rewards', 'profile', 'leaderboard', 'settings', 'account', 'orders', 'order-history'];

  // Filter out login/register and separate by type
  const navPages = pages.filter(p => !['login', 'register'].includes(p.toLowerCase()));
  const publicPages = navPages.filter(p => publicPageNames.includes(p.toLowerCase().replace(/\s+/g, '-')));
  const userPages = navPages.filter(p => userPageNames.includes(p.toLowerCase().replace(/\s+/g, '-')));
  const hasUserPages = userPages.length > 0;

  // Only show public pages in main nav (LEFT side)
  const navLinks = publicPages.map(p => {
    const label = toNavLabel(p);
    const navPath = toRoutePath(p);
    return `            <Link to="${navPath}" style={styles.navLink}>${label}</Link>`;
  }).join('\n');

  // Build user dropdown items with icons for RIGHT side when logged in
  const userDropdownItems = userPages.map(p => {
    const label = toNavLabel(p);
    const navPath = toRoutePath(p);
    const iconMap = {
      'dashboard': 'LayoutDashboard',
      'profile': 'User',
      'wallet': 'Wallet',
      'rewards': 'Gift',
      'earn': 'Coins',
      'leaderboard': 'Trophy',
      'settings': 'Settings',
      'account': 'User',
      'orders': 'ShoppingBag',
      'order-history': 'ClipboardList'
    };
    const icon = iconMap[p.toLowerCase().replace(/\s+/g, '-')] || 'ChevronRight';
    return { label, path: navPath, icon };
  });
  
  // Auth imports and components
  const authImports = needsAuth ? `
// Auth components
import { AuthProvider } from './modules/auth-pages/components/AuthProvider';
import { ProtectedRoute } from './modules/auth-pages/components/ProtectedRoute';
import { LoginPage } from './modules/auth-pages/components/LoginPage';
import { RegisterPage } from './modules/auth-pages/components/RegisterPage';
import { useAuth } from './modules/auth-pages/components/AuthProvider';` : '';

  const authRoutes = needsAuth ? `
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />` : '';

  const authNavButtons = needsAuth ? `
            <AuthButtons />` : '';

  // User dropdown items for generation
  const dropdownItemsCode = userDropdownItems.map(item =>
    `          <Link to="${item.path}" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <${item.icon} size={16} />
            ${item.label}
          </Link>`
  ).join('\n');

  const authButtonsComponent = needsAuth ? `
// User dropdown for logged-in state
function UserDropdown({ user, logout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={styles.userDropdownContainer} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={styles.userDropdownTrigger}
        aria-expanded={dropdownOpen}
      >
        <User size={18} />
        <span style={styles.userDropdownName}>{user.fullName || 'My Account'}</span>
        <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>
      {dropdownOpen && (
        <div style={styles.userDropdownMenu}>
${dropdownItemsCode}
          <div style={styles.dropdownDivider} />
          <button onClick={() => { logout(); setDropdownOpen(false); }} style={styles.dropdownLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// Auth navigation buttons - show Login/Signup or User Dropdown
function AuthButtons() {
  const { user, logout } = useAuth();

  if (user) {
    return <UserDropdown user={user} logout={logout} />;
  }

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Link to="/login" style={styles.loginButton}>Login</Link>
      <Link to="/register" style={styles.registerButton}>Sign Up</Link>
    </div>
  );
}

// Mobile user section - shows user pages or login buttons
function MobileUserSection() {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div style={styles.mobileUserSection}>
        <div style={styles.mobileUserHeader}>
          <User size={20} />
          <span>{user.fullName || user.email}</span>
        </div>
${dropdownItemsCode.split('\n').map(line => line.replace('styles.dropdownItem', 'styles.mobileUserLink').replace('onClick={() => setDropdownOpen(false)}', '')).join('\n')}
        <button onClick={logout} style={styles.mobileLogoutBtn}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={styles.mobileAuthButtons}>
      <Link to="/login" style={styles.mobileLoginBtn}>Login</Link>
      <Link to="/register" style={styles.mobileRegisterBtn}>Sign Up</Link>
    </div>
  );
}
` : '';

  const authStyles = needsAuth ? `
  // Login/Register buttons
  loginButton: {
    color: '${colors.textMuted}',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  registerButton: {
    background: '${colors.primary}',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  // User dropdown styles
  userDropdownContainer: {
    position: 'relative',
  },
  userDropdownTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '${colors.text}',
    fontSize: '14px',
    fontWeight: '500',
  },
  userDropdownName: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userDropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '200px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    padding: '8px',
    zIndex: 1001,
    animation: 'dropdownFadeIn 0.15s ease-out',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    color: '${colors.text}',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'background 0.15s',
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(0,0,0,0.08)',
    margin: '8px 0',
  },
  dropdownLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    color: '#dc2626',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.15s',
  },
  // Mobile user section styles
  mobileUserSection: {
    paddingTop: '16px',
    borderTop: '1px solid rgba(0,0,0,0.1)',
  },
  mobileUserHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    color: '${colors.text}',
    fontWeight: '600',
    fontSize: '16px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    marginBottom: '8px',
  },
  mobileUserLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 8px',
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '15px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  mobileLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 8px',
    color: '#dc2626',
    background: 'transparent',
    border: 'none',
    fontSize: '15px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '8px',
  },
  mobileLoginBtn: {
    display: 'block',
    padding: '14px',
    textAlign: 'center',
    color: '${colors.text}',
    textDecoration: 'none',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '10px',
  },
  mobileRegisterBtn: {
    display: 'block',
    padding: '14px',
    textAlign: 'center',
    background: '${colors.primary}',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
  },` : '';

  const appWrapper = needsAuth ? ['<AuthProvider>', '</AuthProvider>'] : ['', ''];

  // Build industry-specific header icons
  const headerIcons = ['Menu', 'X'];
  if (headerConfig.primaryCta?.icon) headerIcons.push(headerConfig.primaryCta.icon);
  if (headerConfig.secondaryCta?.icon) headerIcons.push(headerConfig.secondaryCta.icon);
  if (headerConfig.showPhoneProminent) headerIcons.push('Phone');
  if (headerConfig.showSearch) headerIcons.push('Search');
  if (headerConfig.showCart) headerIcons.push('ShoppingCart');
  if (headerConfig.showSocialIcons) headerIcons.push('Facebook', 'Instagram');
  if (headerConfig.showHours) headerIcons.push('Clock');
  if (headerConfig.showLocation) headerIcons.push('MapPin');
  if (headerConfig.showCredentials) headerIcons.push('Shield');
  // Add auth-related icons
  if (needsAuth) {
    headerIcons.push('User', 'ChevronDown', 'LogOut');
    // Add icons for user dropdown items
    userDropdownItems.forEach(item => headerIcons.push(item.icon));
  }
  const uniqueIcons = [...new Set(headerIcons)].join(', ');

  // Build emergency banner if needed
  const emergencyBanner = headerConfig.showEmergencyBanner ? `
      {/* Emergency Banner */}
      <div style={styles.emergencyBanner}>
        <span style={styles.emergencyBadge}>${headerConfig.badgeText || '24/7'}</span>
        <span style={styles.emergencyText}>${headerConfig.emergencyText || '24/7 Emergency Service'}</span>
        <a href="tel:${(headerConfig.phoneNumber || '').replace(/[^0-9]/g, '')}" style={styles.emergencyPhone}>
          <Phone size={16} />
          ${headerConfig.phoneNumber || '(555) 123-4567'}
        </a>
      </div>` : '';

  // Build promo banner for retail
  const promoBanner = headerConfig.showPromoBanner ? `
      {/* Promo Banner */}
      <div style={styles.promoBanner}>
        ${headerConfig.promoText || 'Free Shipping on Orders $50+'}
      </div>` : '';

  // Build primary CTA button
  const primaryCtaCode = headerConfig.primaryCta ? `
            ${headerConfig.primaryCta.action === 'tel'
              ? `<a href="tel:${(headerConfig.phoneNumber || '').replace(/[^0-9]/g, '')}" style={styles.primaryCta}>
              <${headerConfig.primaryCta.icon} size={16} />
              ${headerConfig.primaryCta.text}
            </a>`
              : `<Link to="${headerConfig.primaryCta.href || '/contact'}" style={styles.primaryCta}>
              <${headerConfig.primaryCta.icon} size={16} />
              ${headerConfig.primaryCta.text}
            </Link>`
            }` : '';

  // Build secondary CTA button
  const secondaryCtaCode = headerConfig.secondaryCta ? `
            <Link to="${headerConfig.secondaryCta.href || '/contact'}" style={styles.secondaryCta}>
              <${headerConfig.secondaryCta.icon} size={16} />
              ${headerConfig.secondaryCta.text}
            </Link>` : '';

  // Build phone button for mobile
  const mobilePhoneBtn = headerConfig.mobilePhoneVisible && headerConfig.phoneNumber ? `
          <a href="tel:${(headerConfig.phoneNumber || '').replace(/[^0-9]/g, '')}" style={styles.mobilePhoneBtn}>
            <Phone size={20} />
          </a>` : '';

  // Build search for retail
  const searchBox = headerConfig.showSearch ? `
            <div style={styles.searchBox}>
              <Search size={18} style={styles.searchIcon} />
              <input type="text" placeholder="Search..." style={styles.searchInput} />
            </div>` : '';

  // Build cart for retail
  const cartIcon = headerConfig.showCart ? `
            <Link to="/cart" style={styles.cartLink}>
              <ShoppingCart size={20} />
              <span style={styles.cartBadge}>0</span>
            </Link>` : '';

  // Build hours for restaurant
  const hoursDisplay = headerConfig.showHours ? `
            <span style={styles.hoursDisplay}>
              <Clock size={14} />
              ${headerConfig.hoursText || 'Open today: 11am - 10pm'}
            </span>` : '';

  // Build credentials badge
  const credentialsBadge = headerConfig.showCredentials ? `
            <span style={styles.credentialsBadge}>
              <Shield size={14} />
              ${headerConfig.credentialsText || 'Certified'}
            </span>` : '';

  // Build social icons for entertainment
  const socialIcons = headerConfig.showSocialIcons ? `
            <div style={styles.socialIcons}>
              <a href="#" style={styles.socialLink}><Facebook size={18} /></a>
              <a href="#" style={styles.socialLink}><Instagram size={18} /></a>
            </div>` : '';

  return `/**
 * ${name} - Frontend App
 * Auto-generated by Module Library Assembler with AI
 * Header Type: ${headerConfig.type}
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ${uniqueIcons} } from 'lucide-react';
import './theme.css';
// Page imports
${routeImports}
${authImports}
${authButtonsComponent}
// Mobile menu wrapper component with industry-specific header
function NavWrapper({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>${emergencyBanner}${promoBanner}
      <nav style={styles.nav}>
        <Link to="/home" style={styles.navBrand}>
          <span style={styles.brandText}>${name.replace(/-/g, ' ').replace(/\s+/g, ' ').trim()}</span>
        </Link>

        {isMobile ? (
          <div style={styles.mobileActions}>${mobilePhoneBtn}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={styles.hamburger}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        ) : (
          <>
            ${headerConfig.type === 'retail' ? searchBox : ''}
            <div style={styles.navLinks}>
${navLinks}
            </div>
            <div style={styles.navActions}>
              ${hoursDisplay}
              ${credentialsBadge}
              ${socialIcons}
              ${cartIcon}
              ${primaryCtaCode}
              ${secondaryCtaCode}
${authNavButtons}
            </div>
          </>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div style={styles.mobileMenuOverlay} onClick={() => setMenuOpen(false)}>
          <div style={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
${navLinks.split('\n').map(link => link.replace('styles.navLink', 'styles.mobileNavLink')).join('\n')}
            <div style={styles.mobileCtas}>
              ${headerConfig.primaryCta ? `<Link to="${headerConfig.primaryCta.href || '/contact'}" style={styles.mobilePrimaryCta}>${headerConfig.primaryCta.text}</Link>` : ''}
              ${headerConfig.secondaryCta ? `<Link to="${headerConfig.secondaryCta.href || '/contact'}" style={styles.mobileSecondaryCta}>${headerConfig.secondaryCta.text}</Link>` : ''}
            </div>
${needsAuth && hasUserPages ? `            <MobileUserSection />` : `            <div style={styles.mobileAuthButtons}>
${authNavButtons}
            </div>`}
          </div>
        </div>
      )}
      {children}
    </>
  );
}

function App() {
  return (
    ${appWrapper[0]}
    <BrowserRouter>
      <div style={styles.app}>
        <NavWrapper>
          {/* Main Content */}
          <main style={styles.main}>
            <Routes>
${routeElements}${authRoutes}
            </Routes>
          </main>
          {/* Footer */}
          <footer style={styles.footer}>
            <p>© ${new Date().getFullYear()} ${name}. All rights reserved.</p>
          </footer>
        </NavWrapper>
      </div>
    </BrowserRouter>
    ${appWrapper[1]}
  );
}
// Calculate top offset based on banners
const topOffset = ${headerConfig.showEmergencyBanner ? '100' : headerConfig.showPromoBanner ? '92' : '60'};

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    color: '${colors.text}',
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  // Emergency banner (for service businesses)
  emergencyBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
    color: '#ffffff',
    padding: '8px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    zIndex: 1001,
    fontSize: '14px',
    fontWeight: '500',
  },
  emergencyBadge: {
    background: '#ffffff',
    color: '#dc2626',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
  },
  emergencyText: {
    display: 'none',
    '@media (min-width: 640px)': { display: 'inline' },
  },
  emergencyPhone: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '700',
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 12px',
    borderRadius: '4px',
  },
  // Promo banner (for retail)
  promoBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: '${colors.primary}',
    color: '#ffffff',
    padding: '8px 24px',
    textAlign: 'center',
    zIndex: 1001,
    fontSize: '13px',
    fontWeight: '500',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? (headerConfig.headerStyle === 'edgy' ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' : headerConfig.headerStyle === 'bold' ? '#1a1a2e' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)') : '#ffffff'}',
    borderBottom: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? 'none' : '1px solid rgba(10, 22, 40, 0.1)'}',
    position: 'fixed',
    top: ${headerConfig.showEmergencyBanner ? '40px' : headerConfig.showPromoBanner ? '32px' : '0'},
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    boxSizing: 'border-box',
    ${headerConfig.glowEffect ? "boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)'," : headerConfig.headerStyle === 'edgy' ? "boxShadow: '0 2px 20px rgba(220, 38, 38, 0.2)'," : ''}
  },
  navBrand: {
    textDecoration: 'none',
  },
  brandText: {
    fontSize: '20px',
    fontWeight: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? '700' : '400'}',
    fontFamily: "${typography.heading}",
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? '#ffffff' : colors.primary}',
    letterSpacing: '${headerConfig.headerStyle === 'edgy' ? '2px' : '1px'}',
    textTransform: '${headerConfig.headerStyle === 'edgy' ? 'uppercase' : 'none'}',
    ${headerConfig.glowEffect ? "textShadow: '0 0 10px rgba(147, 51, 234, 0.5)'," : headerConfig.headerStyle === 'edgy' ? "textShadow: '0 0 10px rgba(220, 38, 38, 0.3)'," : ''}
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navAuth: {
    display: 'flex',
    alignItems: 'center',
  },
  navLink: {
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? 'rgba(255,255,255,0.8)' : colors.textMuted}',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '${headerConfig.headerStyle === 'edgy' ? '600' : '500'}',
    letterSpacing: '${headerConfig.headerStyle === 'edgy' ? '2px' : '1px'}',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
  // Primary CTA button
  primaryCta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '${headerConfig.type === 'emergency' ? '#dc2626' : headerConfig.type === 'entertainment' ? 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)' : headerConfig.type === 'creative' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : headerConfig.type === 'barbershop' ? '#1a1a2e' : '#22c55e'}',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '${headerConfig.headerStyle === 'edgy' ? '4px' : '8px'}',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    ${headerConfig.glowEffect ? "boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)'," : headerConfig.type === 'creative' ? "boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)'," : ''}
  },
  // Secondary CTA button
  secondaryCta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'transparent',
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? '#ffffff' : colors.primary}',
    border: '1px solid ${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}',
    textDecoration: 'none',
    borderRadius: '${headerConfig.headerStyle === 'edgy' ? '4px' : '8px'}',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  // Hours display (restaurant)
  hoursDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '${colors.textMuted}',
    fontSize: '13px',
    padding: '6px 12px',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '4px',
  },
  // Credentials badge (professional)
  credentialsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#059669',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    background: 'rgba(5, 150, 105, 0.1)',
    borderRadius: '4px',
  },
  // Social icons (entertainment)
  socialIcons: {
    display: 'flex',
    gap: '8px',
  },
  socialLink: {
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? 'rgba(255,255,255,0.7)' : colors.textMuted}',
    transition: 'color 0.2s',
  },
  // Search box (retail)
  searchBox: {
    position: 'relative',
    marginRight: '24px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  searchInput: {
    padding: '10px 12px 10px 40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    width: '240px',
    fontSize: '14px',
    outline: 'none',
  },
  // Cart link (retail)
  cartLink: {
    position: 'relative',
    color: '${colors.text}',
    padding: '8px',
  },
  cartBadge: {
    position: 'absolute',
    top: '0',
    right: '0',
    background: '#dc2626',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '600',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mobile actions container
  mobileActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  // Mobile phone button (service businesses)
  mobilePhoneBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    background: '${headerConfig.type === 'emergency' ? '#dc2626' : '#22c55e'}',
    color: '#ffffff',
    borderRadius: '50%',
    textDecoration: 'none',
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? '#ffffff' : colors.text}',
    cursor: 'pointer',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
    marginRight: '-12px',
  },
  mobileMenuOverlay: {
    position: 'fixed',
    top: topOffset + 'px',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  mobileMenu: {
    position: 'fixed',
    top: topOffset + 'px',
    left: 0,
    right: 0,
    background: '#ffffff',
    borderBottom: '1px solid rgba(10, 22, 40, 0.1)',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxHeight: 'calc(100vh - ' + topOffset + 'px)',
    overflowY: 'auto',
  },
  mobileNavLink: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '16px 0',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    display: 'block',
    minHeight: '48px',
    lineHeight: '16px',
  },
  mobileCtas: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '16px',
  },
  mobilePrimaryCta: {
    display: 'block',
    padding: '16px',
    background: '${headerConfig.type === 'emergency' ? '#dc2626' : headerConfig.type === 'entertainment' ? 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)' : '#22c55e'}',
    color: '#ffffff',
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
  },
  mobileSecondaryCta: {
    display: 'block',
    padding: '16px',
    background: 'transparent',
    border: '1px solid #e5e7eb',
    color: '${colors.text}',
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '16px',
  },
  mobileAuthButtons: {
    paddingTop: '16px',
    borderTop: '1px solid rgba(0,0,0,0.1)',
  },${authStyles}
  main: {
    flex: 1,
    paddingTop: topOffset + 'px',
  },
  footer: {
    padding: '40px 48px',
    background: '${colors.primary}',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    letterSpacing: '1px',
  },
};
export default App;
`;
}

// ============================================
// SYNTAX VALIDATION - Check AI-generated code
// ============================================

function buildFallbackThemeCss(promptConfig) {
  const colors = promptConfig?.colors || {};
  const typography = promptConfig?.typography || {};

  return `/* Auto-generated theme from industry config */
:root {
  --color-primary: ${colors.primary || '#6366f1'};
  --color-secondary: ${colors.secondary || '#8b5cf6'};
  --color-accent: ${colors.accent || '#06b6d4'};
  --color-background: ${colors.background || '#ffffff'};
  --color-surface: ${colors.surface || '#f8f9fa'};
  --color-text: ${colors.text || '#1a1a2e'};
  --color-text-muted: ${colors.textMuted || '#64748b'};
  --font-heading: ${typography.heading || "'Inter', sans-serif"};
  --font-body: ${typography.body || "system-ui, sans-serif"};
  --border-radius: ${ctx.inputRadius || '8px'};
}
body { margin: 0; font-family: var(--font-body); color: var(--color-text); }
`;
}

// ============================================
// LAYOUT-AWARE PREVIEW GENERATOR
// Generates HTML preview based on layout's sectionOrder
// Used for zero-cost testing with different structures
// ============================================

/**
 * Section HTML generators - each returns HTML for a specific section type
 */
const SECTION_GENERATORS = {
  // HERO SECTIONS
  'hero-split': (ctx) => `
    <section style="display: grid; grid-template-columns: 1fr 1fr; min-height: 500px; background: ${ctx.colors.background};">
      <div style="padding: 80px 60px; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 20px; font-family: ${ctx.fonts.heading};">${ctx.businessName}</h1>
        <p style="font-size: 18px; color: ${ctx.colors.textMuted}; margin-bottom: 32px; line-height: 1.6;">${ctx.tagline}</p>
        <div><button style="padding: 16px 32px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-size: 16px; cursor: pointer;">${ctx.cta}</button></div>
      </div>
      <div style="background: linear-gradient(135deg, ${ctx.colors.primary}22, ${ctx.colors.accent || ctx.colors.primary}33); display: flex; align-items: center; justify-content: center;">
        <div style="width: 300px; height: 300px; background: ${ctx.colors.primary}44; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 48px;">📸</div>
      </div>
    </section>`,

  'hero-centered': (ctx) => `
    <section style="padding: 120px 40px; text-align: center; background: linear-gradient(135deg, ${ctx.colors.primary}, ${ctx.colors.accent || ctx.colors.primary}); color: white;">
      <h1 style="font-size: 56px; margin-bottom: 24px; font-family: ${ctx.fonts.heading};">${ctx.businessName}</h1>
      <p style="font-size: 20px; opacity: 0.9; margin-bottom: 40px; max-width: 600px; margin-left: auto; margin-right: auto;">${ctx.tagline}</p>
      <button style="padding: 18px 40px; background: white; color: ${ctx.colors.primary}; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-size: 18px; font-weight: 600; cursor: pointer;">${ctx.cta}</button>
    </section>`,

  'hero-image-first': (ctx) => `
    <section style="display: grid; grid-template-columns: 1fr 1fr; min-height: 500px;">
      <div style="background: linear-gradient(135deg, ${ctx.colors.primary}33, ${ctx.colors.accent || ctx.colors.primary}22); display: flex; align-items: center; justify-content: center;">
        <div style="width: 350px; height: 280px; background: ${ctx.colors.surface}; border-radius: ${ctx.borderRadius}; display: flex; align-items: center; justify-content: center; font-size: 64px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">🍽️</div>
      </div>
      <div style="padding: 80px 60px; display: flex; flex-direction: column; justify-content: center; background: ${ctx.colors.background};">
        <h1 style="font-size: 44px; color: ${ctx.colors.text}; margin-bottom: 20px; font-family: ${ctx.fonts.heading};">${ctx.businessName}</h1>
        <p style="font-size: 18px; color: ${ctx.colors.textMuted}; margin-bottom: 32px;">${ctx.tagline}</p>
        <button style="padding: 16px 32px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: ${ctx.inputRadius || '8px'}; width: fit-content;">${ctx.cta}</button>
      </div>
    </section>`,

  'dental-hero': (ctx) => `
    <section style="background: linear-gradient(135deg, ${ctx.colors.primary}, ${ctx.colors.secondary || ctx.colors.primary}); color: white; padding: 100px 40px; text-align: center;">
      <div style="background: rgba(255,255,255,0.1); padding: 12px 24px; border-radius: ${ctx.inputRadius || '8px'}; display: inline-block; margin-bottom: 24px; font-size: 14px;">🦷 Accepting New Patients</div>
      <h1 style="font-size: 48px; margin-bottom: 20px; font-family: ${ctx.fonts.heading};">${ctx.businessName}</h1>
      <p style="font-size: 20px; opacity: 0.9; margin-bottom: 32px;">${ctx.tagline || 'Your smile is our priority'}</p>
      <div style="display: flex; gap: 16px; justify-content: center;">
        <button style="padding: 16px 32px; background: white; color: ${ctx.colors.primary}; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600;">Book Appointment</button>
        <button style="padding: 16px 32px; background: transparent; color: white; border: 2px solid white; border-radius: ${ctx.inputRadius || '8px'};">Call Now</button>
      </div>
    </section>`,

  'medical-hero': (ctx) => `
    <section style="background: ${ctx.colors.background}; padding: 100px 40px;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
        <div>
          <div style="background: #ef444422; color: #ef4444; padding: 8px 16px; border-radius: 6px; display: inline-block; margin-bottom: 20px; font-size: 13px;">🚨 For emergencies, call 911</div>
          <h1 style="font-size: 44px; color: ${ctx.colors.text}; margin-bottom: 20px; font-family: ${ctx.fonts.heading};">${ctx.businessName}</h1>
          <p style="font-size: 18px; color: ${ctx.colors.textMuted}; margin-bottom: 32px; line-height: 1.7;">Compassionate healthcare for you and your family. We accept most major insurance plans.</p>
          <button style="padding: 16px 32px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: ${ctx.inputRadius || '8px'};">Schedule Visit</button>
        </div>
        <div style="background: ${ctx.colors.surface}; border-radius: ${ctx.borderRadius}; padding: 40px; text-align: center;">
          <div style="font-size: 80px; margin-bottom: 20px;">🏥</div>
          <p style="color: ${ctx.colors.textMuted};">Caring for our community since 1995</p>
        </div>
      </div>
    </section>`,

  'realestate-hero': (ctx) => `
    <section style="background: linear-gradient(135deg, ${ctx.colors.primary}11, ${ctx.colors.accent || ctx.colors.primary}22); padding: 80px 40px;">
      <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
        <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">${ctx.businessName}</h1>
        <p style="font-size: 20px; color: ${ctx.colors.textMuted}; margin-bottom: 40px;">${ctx.tagline || 'Find your dream home'}</p>
        <div style="background: white; padding: 24px; border-radius: ${ctx.borderRadius}; box-shadow: 0 10px 40px rgba(0,0,0,0.1); display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
          <input placeholder="Location..." style="padding: 16px; border: 1px solid #ddd; border-radius: ${ctx.inputRadius || '8px'}; width: 200px;">
          <select style="padding: 16px; border: 1px solid #ddd; border-radius: ${ctx.inputRadius || '8px'}; width: 150px;"><option>Price Range</option></select>
          <select style="padding: 16px; border: 1px solid #ddd; border-radius: ${ctx.inputRadius || '8px'}; width: 120px;"><option>Beds</option></select>
          <button style="padding: 16px 32px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: ${ctx.inputRadius || '8px'};">Search</button>
        </div>
      </div>
    </section>`,

  // SERVICES/FEATURES SECTIONS
  'services-grid': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Our Services</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
          ${['Service 1', 'Service 2', 'Service 3'].map(s => `
            <div style="padding: 32px; background: ${ctx.colors.surface}; border-radius: ${ctx.borderRadius}; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 16px;">⭐</div>
              <h3 style="font-size: 20px; color: ${ctx.colors.text}; margin-bottom: 12px;">${s}</h3>
              <p style="color: ${ctx.colors.textMuted}; line-height: 1.6;">Professional service tailored to your needs.</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'dental-services': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Our Dental Services</h2>
        <p style="text-align: center; color: ${ctx.colors.textMuted}; margin-bottom: 48px;">Comprehensive care for your entire family</p>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
          ${['🦷 General Dentistry', '✨ Cosmetic', '🔧 Restorative', '👶 Pediatric'].map(s => `
            <div style="padding: 28px; background: white; border-radius: ${ctx.borderRadius}; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <div style="font-size: 32px; margin-bottom: 12px;">${s.split(' ')[0]}</div>
              <h3 style="font-size: 16px; color: ${ctx.colors.text}; margin: 0;">${s.split(' ').slice(1).join(' ')}</h3>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'medical-services-grid': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Medical Services</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          ${['🩺 Primary Care', '💉 Vaccinations', '🔬 Lab Services', '❤️ Cardiology', '🦴 Orthopedics', '👁️ Eye Care'].map(s => `
            <div style="padding: 24px; background: ${ctx.colors.surface}; border-radius: ${ctx.borderRadius}; display: flex; align-items: center; gap: 16px;">
              <div style="font-size: 32px;">${s.split(' ')[0]}</div>
              <div>
                <h3 style="font-size: 18px; color: ${ctx.colors.text}; margin: 0 0 4px 0;">${s.split(' ').slice(1).join(' ')}</h3>
                <p style="color: ${ctx.colors.textMuted}; margin: 0; font-size: 14px;">Expert care available</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  // GALLERY SECTIONS
  'gallery-masonry': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Gallery</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 150px; gap: 16px;">
          <div style="background: ${ctx.colors.primary}22; border-radius: ${ctx.borderRadius}; grid-row: span 2;"></div>
          <div style="background: ${ctx.colors.accent || ctx.colors.primary}22; border-radius: ${ctx.borderRadius};"></div>
          <div style="background: ${ctx.colors.primary}33; border-radius: ${ctx.borderRadius};"></div>
          <div style="background: ${ctx.colors.accent || ctx.colors.primary}33; border-radius: ${ctx.borderRadius}; grid-row: span 2;"></div>
          <div style="background: ${ctx.colors.primary}22; border-radius: ${ctx.borderRadius};"></div>
          <div style="background: ${ctx.colors.accent || ctx.colors.primary}22; border-radius: ${ctx.borderRadius}; grid-column: span 2;"></div>
        </div>
      </div>
    </section>`,

  'smile-gallery': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Smile Gallery</h2>
        <p style="text-align: center; color: ${ctx.colors.textMuted}; margin-bottom: 48px;">See the transformations we've created</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          ${[1,2,3].map(() => `
            <div style="background: white; border-radius: ${ctx.borderRadius}; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <div style="display: grid; grid-template-columns: 1fr 1fr;">
                <div style="height: 150px; background: ${ctx.colors.primary}22; display: flex; align-items: center; justify-content: center; color: ${ctx.colors.textMuted};">Before</div>
                <div style="height: 150px; background: ${ctx.colors.primary}44; display: flex; align-items: center; justify-content: center; color: white;">After</div>
              </div>
              <div style="padding: 16px; text-align: center;">
                <p style="color: ${ctx.colors.text}; font-weight: 500; margin: 0;">Smile Makeover</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  // LISTINGS / PROPERTIES
  'featured-properties': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Featured Properties</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          ${['$450,000', '$625,000', '$890,000'].map((price, i) => `
            <div style="background: white; border-radius: ${ctx.borderRadius}; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <div style="height: 200px; background: linear-gradient(135deg, ${ctx.colors.primary}22, ${ctx.colors.primary}44); display: flex; align-items: center; justify-content: center; font-size: 48px;">🏠</div>
              <div style="padding: 20px;">
                <div style="color: ${ctx.colors.primary}; font-size: 24px; font-weight: 700; margin-bottom: 8px;">${price}</div>
                <p style="color: ${ctx.colors.text}; font-weight: 500; margin: 0 0 8px 0;">${3+i} bed • ${2+i} bath • ${1800+i*200} sqft</p>
                <p style="color: ${ctx.colors.textMuted}; font-size: 14px; margin: 0;">123 Main Street, City</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'property-search': (ctx) => `
    <section style="padding: 60px 40px; background: white; border-bottom: 1px solid #eee;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 28px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 32px; font-family: ${ctx.fonts.heading};">Find Your Perfect Home</h2>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
          <input placeholder="City or ZIP" style="padding: 14px 20px; border: 2px solid #eee; border-radius: ${ctx.inputRadius || '8px'}; width: 180px; font-size: 15px;">
          <select style="padding: 14px 20px; border: 2px solid #eee; border-radius: ${ctx.inputRadius || '8px'}; width: 160px; font-size: 15px;"><option>Price: Any</option></select>
          <select style="padding: 14px 20px; border: 2px solid #eee; border-radius: ${ctx.inputRadius || '8px'}; width: 140px; font-size: 15px;"><option>Beds: Any</option></select>
          <select style="padding: 14px 20px; border: 2px solid #eee; border-radius: ${ctx.inputRadius || '8px'}; width: 160px; font-size: 15px;"><option>Property Type</option></select>
          <button style="padding: 14px 32px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600;">Search</button>
        </div>
      </div>
    </section>`,

  // TEAM / PROVIDERS
  'about-team': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Meet Our Team</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;">
          ${['Dr. Smith', 'Dr. Johnson', 'Sarah M.', 'Mike R.'].map(name => `
            <div style="text-align: center;">
              <div style="width: 150px; height: 150px; background: ${ctx.colors.primary}22; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 48px;">👤</div>
              <h3 style="font-size: 18px; color: ${ctx.colors.text}; margin: 0 0 4px 0;">${name}</h3>
              <p style="color: ${ctx.colors.textMuted}; font-size: 14px; margin: 0;">Team Member</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'provider-profiles': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Our Providers</h2>
        <p style="text-align: center; color: ${ctx.colors.textMuted}; margin-bottom: 48px;">Board-certified and experienced healthcare professionals</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
          ${['Dr. Sarah Johnson, MD', 'Dr. Michael Chen, DDS', 'Dr. Emily Davis, DO'].map(name => `
            <div style="background: white; border-radius: ${ctx.borderRadius}; padding: 32px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
              <div style="width: 120px; height: 120px; background: ${ctx.colors.primary}22; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 48px;">👨‍⚕️</div>
              <h3 style="font-size: 18px; color: ${ctx.colors.text}; margin: 0 0 8px 0;">${name}</h3>
              <p style="color: ${ctx.colors.primary}; font-size: 14px; margin: 0 0 12px 0;">Primary Care Physician</p>
              <button style="padding: 10px 24px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: 6px; font-size: 14px;">Book Appointment</button>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  // TRUST / STATS
  'trust-logos': (ctx) => `
    <section style="padding: 40px; background: ${ctx.colors.surface}; border-top: 1px solid ${ctx.colors.primary}11; border-bottom: 1px solid ${ctx.colors.primary}11;">
      <div style="max-width: 1000px; margin: 0 auto; display: flex; justify-content: center; align-items: center; gap: 48px; flex-wrap: wrap;">
        <span style="color: ${ctx.colors.textMuted}; font-size: 14px;">Trusted by:</span>
        ${['Brand 1', 'Brand 2', 'Brand 3', 'Brand 4'].map(b => `
          <div style="padding: 12px 24px; background: ${ctx.colors.background}; border-radius: ${ctx.inputRadius || '8px'}; color: ${ctx.colors.textMuted}; font-weight: 500;">${b}</div>
        `).join('')}
      </div>
    </section>`,

  'stats-animated': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.primary}; color: white;">
      <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center;">
        ${[['500+', 'Happy Clients'], ['15+', 'Years Experience'], ['50+', 'Team Members'], ['99%', 'Satisfaction']].map(([num, label]) => `
          <div>
            <div style="font-size: 48px; font-weight: 700; margin-bottom: 8px;">${num}</div>
            <div style="opacity: 0.9;">${label}</div>
          </div>
        `).join('')}
      </div>
    </section>`,

  'insurance-accepted': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 28px; color: ${ctx.colors.text}; margin-bottom: 32px; font-family: ${ctx.fonts.heading};">Insurance We Accept</h2>
        <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
          ${['Blue Cross', 'Aetna', 'Cigna', 'United', 'Medicare'].map(ins => `
            <div style="padding: 16px 28px; background: white; border-radius: ${ctx.inputRadius || '8px'}; color: ${ctx.colors.text}; font-weight: 500; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">${ins}</div>
          `).join('')}
        </div>
      </div>
    </section>`,

  // TESTIMONIALS
  'testimonials-carousel': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 800px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">What Our Clients Say</h2>
        <div style="background: ${ctx.colors.surface}; padding: 48px; border-radius: ${ctx.borderRadius};">
          <div style="font-size: 24px; color: ${ctx.colors.primary}; margin-bottom: 24px;">★★★★★</div>
          <p style="font-size: 20px; color: ${ctx.colors.text}; line-height: 1.7; margin-bottom: 24px; font-style: italic;">"Outstanding service! They exceeded all my expectations. Highly recommend to anyone looking for quality."</p>
          <div style="font-weight: 600; color: ${ctx.colors.text};">John D.</div>
          <div style="color: ${ctx.colors.textMuted}; font-size: 14px;">Verified Customer</div>
        </div>
      </div>
    </section>`,

  'testimonials-grid': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Patient Reviews</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          ${['Sarah M.', 'James K.', 'Lisa P.'].map(name => `
            <div style="background: white; padding: 28px; border-radius: ${ctx.borderRadius}; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <div style="color: #fbbf24; margin-bottom: 12px;">★★★★★</div>
              <p style="color: ${ctx.colors.text}; line-height: 1.6; margin-bottom: 16px;">"Excellent experience from start to finish. The team was professional and caring."</p>
              <div style="font-weight: 600; color: ${ctx.colors.text};">${name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  // CTA SECTIONS
  'cta-simple': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.primary}; text-align: center; color: white;">
      <h2 style="font-size: 36px; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Ready to Get Started?</h2>
      <p style="font-size: 18px; opacity: 0.9; margin-bottom: 32px;">Contact us today for a free consultation.</p>
      <button style="padding: 18px 40px; background: white; color: ${ctx.colors.primary}; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-size: 18px; font-weight: 600; cursor: pointer;">${ctx.cta}</button>
    </section>`,

  'appointment-booking': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.primary}; color: white;">
      <div style="max-width: 600px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 36px; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Book Your Appointment</h2>
        <p style="font-size: 18px; opacity: 0.9; margin-bottom: 32px;">Schedule online or call us today</p>
        <div style="display: flex; gap: 16px; justify-content: center;">
          <button style="padding: 16px 32px; background: white; color: ${ctx.colors.primary}; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600;">Book Online</button>
          <button style="padding: 16px 32px; background: transparent; color: white; border: 2px solid white; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600;">📞 Call Now</button>
        </div>
      </div>
    </section>`,

  // CONTACT
  'contact-with-map': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;">
        <div>
          <h2 style="font-size: 36px; color: ${ctx.colors.text}; margin-bottom: 24px; font-family: ${ctx.fonts.heading};">Contact Us</h2>
          <div style="margin-bottom: 24px;">
            <p style="color: ${ctx.colors.text}; font-weight: 500; margin: 0 0 4px 0;">📍 Address</p>
            <p style="color: ${ctx.colors.textMuted}; margin: 0;">123 Main Street, City, ST 12345</p>
          </div>
          <div style="margin-bottom: 24px;">
            <p style="color: ${ctx.colors.text}; font-weight: 500; margin: 0 0 4px 0;">📞 Phone</p>
            <p style="color: ${ctx.colors.textMuted}; margin: 0;">(555) 123-4567</p>
          </div>
          <div>
            <p style="color: ${ctx.colors.text}; font-weight: 500; margin: 0 0 4px 0;">✉️ Email</p>
            <p style="color: ${ctx.colors.textMuted}; margin: 0;">hello@business.com</p>
          </div>
        </div>
        <div style="background: ${ctx.colors.surface}; border-radius: ${ctx.borderRadius}; display: flex; align-items: center; justify-content: center; min-height: 300px;">
          <span style="color: ${ctx.colors.textMuted};">📍 Map Location</span>
        </div>
      </div>
    </section>`,

  // MENU (for restaurants)
  'services-tabs': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 32px; font-family: ${ctx.fonts.heading};">Our Menu</h2>
        <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 40px;">
          ${['Appetizers', 'Mains', 'Desserts', 'Drinks'].map((tab, i) => `
            <button style="padding: 12px 24px; background: ${i === 0 ? ctx.colors.primary : ctx.colors.surface}; color: ${i === 0 ? 'white' : ctx.colors.text}; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 500;">${tab}</button>
          `).join('')}
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
          ${['Signature Dish', 'House Special', 'Chef\'s Choice', 'Classic Favorite'].map(item => `
            <div style="display: flex; justify-content: space-between; padding: 20px; background: ${ctx.colors.surface}; border-radius: ${ctx.inputRadius || '8px'};">
              <div>
                <h3 style="font-size: 18px; color: ${ctx.colors.text}; margin: 0 0 4px 0;">${item}</h3>
                <p style="color: ${ctx.colors.textMuted}; font-size: 14px; margin: 0;">Delicious description here</p>
              </div>
              <span style="color: ${ctx.colors.primary}; font-weight: 600;">$18</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  // FAQ
  'faq-accordion': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Frequently Asked Questions</h2>
        ${['What are your hours?', 'Do you accept insurance?', 'How do I schedule?'].map(q => `
          <div style="background: white; margin-bottom: 16px; border-radius: ${ctx.inputRadius || '8px'}; overflow: hidden;">
            <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <span style="font-weight: 500; color: ${ctx.colors.text};">${q}</span>
              <span style="color: ${ctx.colors.primary};">+</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`,

  // Additional section types for better coverage
  'trust-badges': (ctx) => `
    <section style="padding: 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1000px; margin: 0 auto; display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; align-items: center;">
        ${['✓ Licensed & Insured', '★ 5-Star Rated', '🏆 Award Winning', '👥 1000+ Clients'].map(b => `
          <div style="display: flex; align-items: center; gap: 8px; color: ${ctx.colors.textMuted}; font-size: 14px; font-weight: 500;">
            <span>${b}</span>
          </div>
        `).join('')}
      </div>
    </section>`,

  'cta-with-form': (ctx) => `
    <section style="padding: 80px 40px; background: linear-gradient(135deg, ${ctx.colors.primary}, ${ctx.colors.secondary || ctx.colors.primary});">
      <div style="max-width: 600px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 36px; color: white; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Ready to Get Started?</h2>
        <p style="color: rgba(255,255,255,0.9); margin-bottom: 32px;">Contact us today for a free consultation</p>
        <div style="background: white; padding: 32px; border-radius: ${ctx.borderRadius};">
          <input placeholder="Your Name" style="width: 100%; padding: 14px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px;">
          <input placeholder="Email Address" style="width: 100%; padding: 14px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px;">
          <input placeholder="Phone Number" style="width: 100%; padding: 14px; margin-bottom: 16px; border: 1px solid #ddd; border-radius: 6px;">
          <button style="width: 100%; padding: 16px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Submit Request</button>
        </div>
      </div>
    </section>`,

  'about-split': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
        <div style="background: linear-gradient(135deg, ${ctx.colors.primary}22, ${ctx.colors.primary}44); border-radius: ${ctx.borderRadius}; height: 400px; display: flex; align-items: center; justify-content: center; font-size: 64px;">🏢</div>
        <div>
          <h2 style="font-size: 36px; color: ${ctx.colors.text}; margin-bottom: 20px; font-family: ${ctx.fonts.heading};">About ${ctx.businessName}</h2>
          <p style="color: ${ctx.colors.textMuted}; line-height: 1.8; margin-bottom: 20px;">We've been serving our community with dedication and excellence. Our team of experienced professionals is committed to delivering the best results for every client.</p>
          <p style="color: ${ctx.colors.textMuted}; line-height: 1.8;">With years of experience and a passion for what we do, we've built a reputation for quality and trust.</p>
        </div>
      </div>
    </section>`,

  'hero-minimal': (ctx) => `
    <section style="padding: 100px 40px; background: ${ctx.colors.background}; text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 20px; font-family: ${ctx.fonts.heading}; font-weight: 400;">${ctx.businessName}</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 500px; margin: 0 auto 32px auto; line-height: 1.7;">${ctx.tagline}</p>
      <button style="padding: 14px 32px; background: transparent; color: ${ctx.colors.primary}; border: 2px solid ${ctx.colors.primary}; border-radius: 6px; font-weight: 500;">${ctx.cta}</button>
    </section>`,

  'services-list': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Our Services</h2>
        ${['Service One', 'Service Two', 'Service Three', 'Service Four'].map((s, i) => `
          <div style="display: flex; gap: 24px; padding: 24px 0; border-bottom: 1px solid ${ctx.isDark ? 'rgba(255,255,255,0.1)' : '#eee'}; align-items: center;">
            <div style="width: 60px; height: 60px; background: ${ctx.colors.primary}22; border-radius: ${ctx.borderRadius}; display: flex; align-items: center; justify-content: center; font-size: 24px; color: ${ctx.colors.primary};">0${i+1}</div>
            <div style="flex: 1;">
              <h3 style="font-size: 20px; color: ${ctx.colors.text}; margin: 0 0 8px 0;">${s}</h3>
              <p style="color: ${ctx.colors.textMuted}; margin: 0; line-height: 1.6;">Professional service tailored to meet your specific needs and requirements.</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`,

  'testimonials-featured': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 900px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">What Our Clients Say</h2>
        <div style="background: white; padding: 48px; border-radius: ${ctx.borderRadius}; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          <div style="font-size: 48px; margin-bottom: 24px;">⭐⭐⭐⭐⭐</div>
          <p style="font-size: 22px; color: ${ctx.colors.text}; line-height: 1.8; margin-bottom: 32px; font-style: italic;">"Absolutely exceptional service! The team went above and beyond our expectations. Highly recommend to anyone looking for quality and professionalism."</p>
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
            <div style="width: 56px; height: 56px; background: ${ctx.colors.primary}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">JD</div>
            <div style="text-align: left;">
              <div style="font-weight: 600; color: ${ctx.colors.text};">John D.</div>
              <div style="color: ${ctx.colors.textMuted}; font-size: 14px;">Verified Customer</div>
            </div>
          </div>
        </div>
      </div>
    </section>`,

  'stats-bar': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.primary};">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 40px;">
        ${[['500+', 'Happy Clients'], ['15+', 'Years Experience'], ['98%', 'Satisfaction'], ['24/7', 'Support']].map(([num, label]) => `
          <div style="text-align: center; color: white;">
            <div style="font-size: 42px; font-weight: 700; margin-bottom: 8px;">${num}</div>
            <div style="font-size: 14px; opacity: 0.9;">${label}</div>
          </div>
        `).join('')}
      </div>
    </section>`,

  'quick-actions': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
        ${[['📅', 'Book Appointment'], ['📞', 'Call Us'], ['💬', 'Live Chat'], ['📍', 'Find Location']].map(([icon, label]) => `
          <div style="padding: 24px; background: ${ctx.colors.surface}; border-radius: ${ctx.borderRadius}; text-align: center; cursor: pointer; transition: all 0.2s;">
            <div style="font-size: 32px; margin-bottom: 12px;">${icon}</div>
            <div style="color: ${ctx.colors.text}; font-weight: 500; font-size: 14px;">${label}</div>
          </div>
        `).join('')}
      </div>
    </section>`,

  'insurance-info': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 28px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Insurance & Payment</h2>
        <p style="color: ${ctx.colors.textMuted}; margin-bottom: 32px;">We accept most major insurance plans</p>
        <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
          ${['Aetna', 'Blue Cross', 'Cigna', 'United', 'Medicare'].map(ins => `
            <div style="padding: 16px 24px; background: white; border-radius: ${ctx.inputRadius || '8px'}; color: ${ctx.colors.textMuted}; font-weight: 500;">${ins}</div>
          `).join('')}
        </div>
      </div>
    </section>`,

  // Restaurant/Food specific
  'menu-tabs': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 32px; font-family: ${ctx.fonts.heading};">Our Menu</h2>
        <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 48px;">
          ${['Appetizers', 'Mains', 'Desserts', 'Drinks'].map((tab, i) => `
            <button style="padding: 12px 24px; background: ${i === 0 ? ctx.colors.primary : 'transparent'}; color: ${i === 0 ? 'white' : ctx.colors.text}; border: ${i === 0 ? 'none' : '1px solid #ddd'}; border-radius: 25px; cursor: pointer;">${tab}</button>
          `).join('')}
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
          ${[['Signature Dish', '$24'], ['House Special', '$18'], ['Chef\'s Choice', '$32'], ['Classic Favorite', '$16']].map(([name, price]) => `
            <div style="display: flex; justify-content: space-between; padding: 20px; background: ${ctx.colors.surface}; border-radius: ${ctx.borderRadius};">
              <div>
                <h3 style="font-size: 18px; color: ${ctx.colors.text}; margin: 0 0 4px 0;">${name}</h3>
                <p style="color: ${ctx.colors.textMuted}; margin: 0; font-size: 14px;">Fresh ingredients, expertly prepared</p>
              </div>
              <div style="color: ${ctx.colors.primary}; font-weight: 700; font-size: 18px;">${price}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'ordering-cta': (ctx) => `
    <section style="padding: 80px 40px; background: linear-gradient(135deg, ${ctx.colors.primary}, ${ctx.colors.secondary || ctx.colors.primary});">
      <div style="max-width: 800px; margin: 0 auto; text-align: center; color: white;">
        <h2 style="font-size: 40px; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Ready to Order?</h2>
        <p style="font-size: 18px; opacity: 0.9; margin-bottom: 32px;">Order online for pickup or delivery</p>
        <div style="display: flex; gap: 16px; justify-content: center;">
          <button style="padding: 16px 32px; background: white; color: ${ctx.colors.primary}; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600; cursor: pointer;">Order Online</button>
          <button style="padding: 16px 32px; background: transparent; color: white; border: 2px solid white; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600; cursor: pointer;">View Menu</button>
        </div>
      </div>
    </section>`,

  // ============================================
  // PAGE-SPECIFIC HERO SECTIONS
  // ============================================

  'about-hero': (ctx) => `
    <section style="padding: 80px 40px; background: linear-gradient(135deg, ${ctx.colors.primary}11, ${ctx.colors.primary}22); text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">About ${ctx.businessName}</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">Learn more about our story, mission, and the team behind our success.</p>
    </section>`,

  'services-hero': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.primary}; text-align: center;">
      <h1 style="font-size: 48px; color: white; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Our Services</h1>
      <p style="font-size: 18px; color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto;">Comprehensive solutions tailored to meet your specific needs.</p>
    </section>`,

  'contact-hero': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface}; text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Contact Us</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">We'd love to hear from you. Reach out today.</p>
    </section>`,

  'team-hero': (ctx) => `
    <section style="padding: 80px 40px; background: linear-gradient(135deg, ${ctx.colors.primary}, ${ctx.colors.secondary || ctx.colors.primary}); text-align: center;">
      <h1 style="font-size: 48px; color: white; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Meet Our Team</h1>
      <p style="font-size: 18px; color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto;">The dedicated professionals behind ${ctx.businessName}.</p>
    </section>`,

  'gallery-hero': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background}; text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Our Gallery</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">A visual showcase of our work and results.</p>
    </section>`,

  'testimonials-hero': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface}; text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Client Testimonials</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">See what our customers have to say about us.</p>
    </section>`,

  'faq-hero': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background}; text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Frequently Asked Questions</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">Find answers to common questions about our services.</p>
    </section>`,

  'pricing-hero': (ctx) => `
    <section style="padding: 80px 40px; background: linear-gradient(135deg, ${ctx.colors.primary}11, ${ctx.colors.accent || ctx.colors.primary}22); text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Pricing & Plans</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">Transparent pricing for our services.</p>
    </section>`,

  'menu-hero': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.primary}; text-align: center;">
      <h1 style="font-size: 48px; color: white; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Our Menu</h1>
      <p style="font-size: 18px; color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto;">Explore our delicious offerings.</p>
    </section>`,

  'booking-hero': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface}; text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Book an Appointment</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">Schedule your visit with us today.</p>
    </section>`,

  'listings-hero': (ctx) => `
    <section style="padding: 80px 40px; background: linear-gradient(135deg, ${ctx.colors.primary}11, ${ctx.colors.primary}33); text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Property Listings</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">Browse our current properties for sale.</p>
    </section>`,

  'portfolio-hero': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background}; text-align: center;">
      <h1 style="font-size: 48px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Our Portfolio</h1>
      <p style="font-size: 18px; color: ${ctx.colors.textMuted}; max-width: 600px; margin: 0 auto;">Explore our featured projects and case studies.</p>
    </section>`,

  // ============================================
  // ADDITIONAL PAGE SECTIONS
  // ============================================

  'about-values': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Our Core Values</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
          ${[['🎯', 'Excellence', 'We strive for the highest standards'], ['🤝', 'Integrity', 'Honest and transparent in all we do'], ['💡', 'Innovation', 'Always finding better solutions'], ['❤️', 'Care', 'Putting our clients first']].map(([icon, title, desc]) => `
            <div style="text-align: center; padding: 32px 24px; background: ${ctx.colors.background}; border-radius: ${ctx.borderRadius};">
              <div style="font-size: 40px; margin-bottom: 16px;">${icon}</div>
              <h3 style="font-size: 20px; color: ${ctx.colors.text}; margin-bottom: 8px;">${title}</h3>
              <p style="color: ${ctx.colors.textMuted}; font-size: 14px; line-height: 1.6;">${desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'process-steps': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">How It Works</h2>
        <div style="display: flex; justify-content: space-between; position: relative;">
          ${[['1', 'Consultation', 'Discuss your needs'], ['2', 'Planning', 'Create your strategy'], ['3', 'Execution', 'Deliver results'], ['4', 'Support', 'Ongoing care']].map(([num, title, desc], i) => `
            <div style="flex: 1; text-align: center; position: relative; z-index: 1;">
              <div style="width: 60px; height: 60px; background: ${ctx.colors.primary}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin: 0 auto 16px auto;">${num}</div>
              <h3 style="font-size: 18px; color: ${ctx.colors.text}; margin-bottom: 8px;">${title}</h3>
              <p style="color: ${ctx.colors.textMuted}; font-size: 14px;">${desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'pricing-cards': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Our Pricing</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          ${[['Basic', '$99', 'Essential features'], ['Professional', '$199', 'Most popular'], ['Enterprise', '$399', 'Full service']].map(([name, price, desc], i) => `
            <div style="padding: 40px 32px; background: ${i === 1 ? ctx.colors.primary : ctx.colors.surface}; border-radius: ${ctx.borderRadius}; text-align: center; ${i === 1 ? 'transform: scale(1.05);' : ''}">
              <h3 style="font-size: 24px; color: ${i === 1 ? 'white' : ctx.colors.text}; margin-bottom: 8px;">${name}</h3>
              <div style="font-size: 48px; font-weight: 700; color: ${i === 1 ? 'white' : ctx.colors.primary}; margin-bottom: 8px;">${price}</div>
              <p style="color: ${i === 1 ? 'rgba(255,255,255,0.8)' : ctx.colors.textMuted}; margin-bottom: 24px;">${desc}</p>
              <button style="padding: 14px 28px; background: ${i === 1 ? 'white' : ctx.colors.primary}; color: ${i === 1 ? ctx.colors.primary : 'white'}; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600; cursor: pointer;">Get Started</button>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'credentials-list': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 28px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 32px; font-family: ${ctx.fonts.heading};">Certifications & Credentials</h2>
        <div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;">
          ${['✓ Licensed Professional', '✓ Board Certified', '✓ 15+ Years Experience', '✓ Award Winning'].map(cred => `
            <div style="display: flex; align-items: center; gap: 8px; color: ${ctx.colors.text}; font-weight: 500;">${cred}</div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'contact-split': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px;">
        <div>
          <h2 style="font-size: 36px; color: ${ctx.colors.text}; margin-bottom: 24px; font-family: ${ctx.fonts.heading};">Get In Touch</h2>
          <div style="margin-bottom: 20px;">
            <div style="font-weight: 600; color: ${ctx.colors.text}; margin-bottom: 4px;">📍 Address</div>
            <div style="color: ${ctx.colors.textMuted};">123 Business Street, City, State 12345</div>
          </div>
          <div style="margin-bottom: 20px;">
            <div style="font-weight: 600; color: ${ctx.colors.text}; margin-bottom: 4px;">📞 Phone</div>
            <div style="color: ${ctx.colors.textMuted};">(555) 123-4567</div>
          </div>
          <div style="margin-bottom: 20px;">
            <div style="font-weight: 600; color: ${ctx.colors.text}; margin-bottom: 4px;">✉️ Email</div>
            <div style="color: ${ctx.colors.textMuted};">info@${ctx.businessName.toLowerCase().replace(/\s+/g, '')}.com</div>
          </div>
        </div>
        <div style="background: ${ctx.colors.surface}; padding: 40px; border-radius: ${ctx.borderRadius};">
          <h3 style="font-size: 24px; color: ${ctx.colors.text}; margin-bottom: 24px;">Send a Message</h3>
          <input placeholder="Your Name" style="width: 100%; padding: 14px; margin-bottom: 16px; border: 1px solid ${ctx.isDark ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: ${ctx.inputRadius || '8px'}; background: ${ctx.colors.background}; color: ${ctx.colors.text};">
          <input placeholder="Email" style="width: 100%; padding: 14px; margin-bottom: 16px; border: 1px solid ${ctx.isDark ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: ${ctx.inputRadius || '8px'}; background: ${ctx.colors.background}; color: ${ctx.colors.text};">
          <textarea placeholder="Your Message" style="width: 100%; padding: 14px; height: 120px; margin-bottom: 16px; border: 1px solid ${ctx.isDark ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: ${ctx.inputRadius || '8px'}; resize: none; background: ${ctx.colors.background}; color: ${ctx.colors.text};"></textarea>
          <button style="width: 100%; padding: 16px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600; cursor: pointer;">Send Message</button>
        </div>
      </div>
    </section>`,

  'contact-minimal': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 600px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; margin-bottom: 16px; font-family: ${ctx.fonts.heading};">Ready to Begin?</h2>
        <p style="color: ${ctx.colors.textMuted}; margin-bottom: 32px;">Taking the first step is often the hardest. We're here to help.</p>
        <div style="background: ${ctx.colors.background}; padding: 40px; border-radius: ${ctx.borderRadius};">
          <input placeholder="Your Name" style="width: 100%; padding: 14px; margin-bottom: 16px; border: 1px solid ${ctx.isDark ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: ${ctx.inputRadius || '8px'}; background: ${ctx.colors.surface}; color: ${ctx.colors.text};">
          <input placeholder="Phone or Email" style="width: 100%; padding: 14px; margin-bottom: 16px; border: 1px solid ${ctx.isDark ? 'rgba(255,255,255,0.1)' : '#ddd'}; border-radius: ${ctx.inputRadius || '8px'}; background: ${ctx.colors.surface}; color: ${ctx.colors.text};">
          <button style="width: 100%; padding: 16px; background: ${ctx.colors.primary}; color: white; border: none; border-radius: ${ctx.inputRadius || '8px'}; font-weight: 600;">Schedule Consultation</button>
        </div>
      </div>
    </section>`,

  'service-areas': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 28px; color: ${ctx.colors.text}; margin-bottom: 24px; font-family: ${ctx.fonts.heading};">Service Areas</h2>
        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
          ${['Downtown', 'North Side', 'South Side', 'West End', 'East District', 'Suburbs'].map(area => `
            <div style="padding: 12px 24px; background: ${ctx.colors.background}; border-radius: 25px; color: ${ctx.colors.text}; font-size: 14px;">${area}</div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'emergency-info': (ctx) => `
    <section style="padding: 40px; background: #dc262622; border: 1px solid #dc262644;">
      <div style="max-width: 800px; margin: 0 auto; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 12px;">🚨</div>
        <h2 style="font-size: 24px; color: #dc2626; margin-bottom: 8px;">Emergency?</h2>
        <p style="color: ${ctx.colors.textMuted}; margin-bottom: 16px;">For medical emergencies, please call 911 or go to your nearest emergency room.</p>
        <div style="font-size: 24px; font-weight: 700; color: ${ctx.colors.text};">Emergency Line: (555) 911-1234</div>
      </div>
    </section>`,

  'gallery-grid': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Photo Gallery</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
          ${Array(8).fill(0).map((_, i) => `
            <div style="aspect-ratio: 1; background: linear-gradient(135deg, ${ctx.colors.primary}${20 + i*5}, ${ctx.colors.primary}${40 + i*5}); border-radius: ${ctx.borderRadius}; display: flex; align-items: center; justify-content: center; font-size: 32px;">📷</div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'office-hours': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 28px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 32px; font-family: ${ctx.fonts.heading};">Hours of Operation</h2>
        <div style="background: ${ctx.colors.background}; border-radius: ${ctx.borderRadius}; overflow: hidden;">
          ${[['Monday - Friday', '9:00 AM - 6:00 PM'], ['Saturday', '10:00 AM - 4:00 PM'], ['Sunday', 'Closed']].map(([day, hours]) => `
            <div style="display: flex; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid ${ctx.isDark ? 'rgba(255,255,255,0.1)' : '#eee'};">
              <span style="color: ${ctx.colors.text}; font-weight: 500;">${day}</span>
              <span style="color: ${ctx.colors.textMuted};">${hours}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'portfolio-grid': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.background};">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          ${[['Brand Redesign', 'Client: TechCorp'], ['Website Launch', 'Client: StartupXYZ'], ['Marketing Campaign', 'Client: LocalBiz'], ['Mobile App', 'Client: HealthCo'], ['E-commerce Store', 'Client: RetailPro'], ['Social Strategy', 'Client: FoodCo']].map(([title, client]) => `
            <div style="background: ${ctx.colors.surface}; border-radius: ${ctx.borderRadius}; overflow: hidden;">
              <div style="height: 200px; background: linear-gradient(135deg, ${ctx.colors.primary}33, ${ctx.colors.accent || ctx.colors.primary}44); display: flex; align-items: center; justify-content: center; font-size: 48px;">💼</div>
              <div style="padding: 24px;">
                <h3 style="font-size: 18px; color: ${ctx.colors.text}; margin-bottom: 4px;">${title}</h3>
                <p style="color: ${ctx.colors.textMuted}; font-size: 14px; margin: 0;">${client}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'specializations': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Areas of Specialization</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          ${['Anxiety & Stress', 'Depression', 'Relationship Issues', 'Trauma & PTSD', 'Life Transitions', 'Self-Esteem'].map(area => `
            <div style="padding: 20px; background: ${ctx.colors.background}; border-radius: ${ctx.borderRadius}; border-left: 4px solid ${ctx.colors.primary};">
              <h3 style="font-size: 16px; color: ${ctx.colors.text}; margin: 0;">${area}</h3>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`,

  'market-stats': (ctx) => `
    <section style="padding: 60px 40px; background: ${ctx.colors.primary};">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 32px;">
        ${[['$2.5M', 'Avg. Sale Price'], ['45', 'Homes Sold This Year'], ['98%', 'Client Satisfaction'], ['12', 'Days Avg. on Market']].map(([num, label]) => `
          <div style="text-align: center; color: white;">
            <div style="font-size: 48px; font-weight: 700; margin-bottom: 8px;">${num}</div>
            <div style="font-size: 14px; opacity: 0.9;">${label}</div>
          </div>
        `).join('')}
      </div>
    </section>`,

  'class-schedule': (ctx) => `
    <section style="padding: 80px 40px; background: ${ctx.colors.surface};">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 36px; color: ${ctx.colors.text}; text-align: center; margin-bottom: 48px; font-family: ${ctx.fonts.heading};">Class Schedule</h2>
        <div style="background: ${ctx.colors.background}; border-radius: ${ctx.borderRadius}; overflow: hidden;">
          ${[['Morning Flow', '6:00 AM', 'Mon, Wed, Fri'], ['Power Hour', '12:00 PM', 'Tue, Thu'], ['Evening Zen', '6:00 PM', 'Mon - Fri'], ['Weekend Warrior', '9:00 AM', 'Sat, Sun']].map(([name, time, days]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid ${ctx.isDark ? 'rgba(255,255,255,0.1)' : '#eee'};">
              <div>
                <div style="font-weight: 600; color: ${ctx.colors.text};">${name}</div>
                <div style="font-size: 14px; color: ${ctx.colors.textMuted};">${days}</div>
              </div>
              <div style="text-align: right;">
                <div style="color: ${ctx.colors.primary}; font-weight: 600;">${time}</div>
                <button style="padding: 6px 16px; background: ${ctx.colors.primary}22; color: ${ctx.colors.primary}; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; margin-top: 4px;">Book</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`
};

/**
 * Build a layout-aware HTML preview
 * Uses page-specific layouts per industry to generate different structures
 *
 * @param {string} pageId - Page identifier (home, about, services, contact, etc.)
 * @param {string} businessName - Name of the business
 * @param {string} industryKey - Industry key for page-specific layouts
 * @param {Object} layoutConfig - Layout configuration (optional, for home page override)
 * @param {Object} promptConfig - Prompt configuration with colors, etc.
 * @param {Object} moodSliders - Mood slider values
 * @returns {string} HTML string for the page preview
 */
function buildLayoutAwarePreview(pageId, businessName, industryKey, layoutConfig, promptConfig, moodSliders) {
  const sliderStyles = getSliderStyles(moodSliders, promptConfig?.colors);
  const colors = sliderStyles.colors;

  // Build theme-aware colors based on explicit theme mode
  const theme = sliderStyles.theme || 'light';
  let themeColors;

  if (theme === 'dark') {
    themeColors = {
      background: '#0a0a0f',
      surface: '#1a1a2e',
      text: '#e4e4e4',
      textMuted: '#888'
    };
  } else if (theme === 'medium') {
    themeColors = {
      background: '#e8e8e8',
      surface: '#f5f5f5',
      text: '#1f2937',
      textMuted: '#4b5563'
    };
  } else {
    // Light theme (default)
    themeColors = {
      background: colors.background || '#ffffff',
      surface: colors.surface || '#f8f9fa',
      text: colors.text || '#1a1a2e',
      textMuted: colors.textMuted || '#64748b'
    };
  }

  // Build context object for section generators
  const ctx = {
    businessName: businessName || 'Your Business',
    pageId: pageId,
    tagline: promptConfig?.tagline || 'Experience the finest quality and craftsmanship',
    cta: sliderStyles.copyTone?.cta || 'Get Started',
    colors: {
      primary: colors.primary || '#6366f1',
      secondary: colors.secondary || '#8b5cf6',
      accent: colors.accent || '#06b6d4',
      background: themeColors.background,
      surface: themeColors.surface,
      text: themeColors.text,
      textMuted: themeColors.textMuted,
    },
    fonts: {
      heading: sliderStyles.fontHeading || "'Inter', sans-serif",
      body: sliderStyles.fontBody || "system-ui, sans-serif"
    },
    theme: theme,
    isDark: theme === 'dark',
    isMedium: theme === 'medium',
    // Border radius based on era slider (90+ = sharp/squared, <35 = subtle, else = rounded)
    borderRadius: sliderStyles.borderRadius || '12px',
    // Input/button radius (slightly less than card radius)
    inputRadius: sliderStyles.borderRadius === '2px' ? '2px' : (sliderStyles.borderRadius === '4px' ? '4px' : '8px')
  };

  // Get section order for this specific page and industry
  let sectionOrder = [];

  // For home page, prefer the layout variant's sectionOrder if available
  if (pageId === 'home' && layoutConfig?.layout?.sectionOrder) {
    sectionOrder = layoutConfig.layout.sectionOrder;
  } else {
    // Use page-specific layouts based on industry
    sectionOrder = getPageLayout(industryKey, pageId);
  }

  // Generate HTML for each section
  const sectionsHtml = sectionOrder.map(sectionKey => {
    const generator = SECTION_GENERATORS[sectionKey];
    if (generator) {
      return generator(ctx);
    } else {
      // Fallback for unknown sections - show wireframe placeholder
      return `
        <section style="padding: 60px 40px; background: ${ctx.colors.surface}; text-align: center; border: 2px dashed ${ctx.colors.primary}44;">
          <div style="color: ${ctx.colors.textMuted}; font-size: 14px;">
            <div style="font-size: 32px; margin-bottom: 12px;">📐</div>
            <strong style="color: ${ctx.colors.primary};">${sectionKey}</strong>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">Section wireframe - AI will generate full content</div>
          </div>
        </section>`;
    }
  }).join('\n');

  return sectionsHtml;
}

module.exports = {
  initPromptBuilders,
  detectIndustryFromDescription,
  buildPrompt,
  buildSmartContextGuide,
  buildMoodSliderContext,
  getSliderStyles,
  buildLayoutContextFromPreview,
  extractBusinessStats,
  generateDefaultStats,
  getIndustryImageUrls,
  buildRebuildContext,
  buildInspiredContext,
  buildUploadedAssetsContext,
  buildFreshModePrompt,
  getIndustryDesignGuidance,
  getPageRequirements,
  buildEnhanceModePrompt,
  getPageSpecificInstructions,
  getEnhancePageInstructions,
  buildOrchestratorPagePrompt,
  buildFallbackPage,
  getIndustryHeaderConfig,
  buildFallbackThemeCss,
  buildLayoutAwarePreview,
  // Layout Intelligence exports
  getLayoutCategory,
  buildDetailedLayoutContext,
  getAvailableLayouts,
  getLayoutConfigFull,
  INDUSTRY_LAYOUTS
};
