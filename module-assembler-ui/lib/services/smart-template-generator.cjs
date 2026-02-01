/**
 * Smart Template Generator
 *
 * Hybrid approach: Template structure + AI content generation
 * - Uses proven template layouts as foundation
 * - Small focused AI calls for content zones
 * - User branding/customization applied throughout
 * - Location-aware content generation
 * - Industry-aware page names and terminology
 *
 * Cost: ~$0.10-0.30 per site (vs $1.50 for full AI)
 * Speed: ~30 seconds (vs 2-3 minutes for full AI)
 */

const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════
// INDUSTRY CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/**
 * Industry-specific page packages
 * - essential: Minimum viable site (3-4 pages)
 * - recommended: What most businesses need (5-6 pages)
 * - premium: Full-featured site (7-9 pages)
 */
const INDUSTRY_PAGE_PACKAGES = {
  // Food & Beverage
  'restaurant': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'reservations', 'catering', 'team', 'contact'],
    terminology: { services: 'Menu', service: 'Dish', team: 'Our Chefs' }
  },
  'cafe': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'events', 'team', 'contact'],
    terminology: { services: 'Menu', service: 'Item', team: 'Our Team' }
  },
  'pizza': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'order-online', 'specials', 'contact'],
    terminology: { services: 'Menu', service: 'Item', team: 'Our Team' }
  },
  'bakery': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'gallery', 'contact'],
    premium: ['home', 'menu', 'about', 'gallery', 'order-online', 'catering', 'contact'],
    terminology: { services: 'Our Treats', service: 'Item', team: 'Our Bakers' }
  },
  'bar': {
    essential: ['home', 'menu', 'contact'],
    recommended: ['home', 'menu', 'about', 'events', 'contact'],
    premium: ['home', 'menu', 'about', 'events', 'gallery', 'reservations', 'contact'],
    terminology: { services: 'Drinks & Food', service: 'Item', team: 'Our Team' }
  },

  // Healthcare
  'dental': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'testimonials', 'insurance', 'contact'],
    terminology: { services: 'Services', service: 'Treatment', team: 'Our Doctors' }
  },
  'healthcare': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'providers', 'contact'],
    premium: ['home', 'services', 'about', 'providers', 'testimonials', 'insurance', 'contact'],
    terminology: { services: 'Services', service: 'Service', team: 'Our Providers' }
  },

  // Beauty & Wellness
  'spa-salon': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'gallery', 'pricing', 'booking', 'contact'],
    terminology: { services: 'Services', service: 'Treatment', team: 'Our Stylists' }
  },
  'barbershop': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'gallery', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'gallery', 'pricing', 'booking', 'contact'],
    terminology: { services: 'Services', service: 'Service', team: 'Our Barbers' }
  },
  'tattoo': {
    essential: ['home', 'gallery', 'contact'],
    recommended: ['home', 'gallery', 'artists', 'about', 'contact'],
    premium: ['home', 'gallery', 'artists', 'about', 'styles', 'aftercare', 'booking', 'contact'],
    terminology: { services: 'Styles', service: 'Style', team: 'Our Artists' }
  },
  'fitness': {
    essential: ['home', 'classes', 'contact'],
    recommended: ['home', 'classes', 'trainers', 'membership', 'contact'],
    premium: ['home', 'classes', 'trainers', 'membership', 'schedule', 'about', 'gallery', 'contact'],
    terminology: { services: 'Classes', service: 'Class', team: 'Our Trainers' }
  },
  'yoga': {
    essential: ['home', 'classes', 'contact'],
    recommended: ['home', 'classes', 'schedule', 'instructors', 'contact'],
    premium: ['home', 'classes', 'schedule', 'instructors', 'pricing', 'about', 'contact'],
    terminology: { services: 'Classes', service: 'Class', team: 'Our Instructors' }
  },

  // Professional Services
  'law-firm': {
    essential: ['home', 'practice-areas', 'contact'],
    recommended: ['home', 'practice-areas', 'attorneys', 'about', 'contact'],
    premium: ['home', 'practice-areas', 'attorneys', 'about', 'case-results', 'testimonials', 'contact'],
    terminology: { services: 'Practice Areas', service: 'Practice Area', team: 'Our Attorneys' }
  },
  'real-estate': {
    essential: ['home', 'listings', 'contact'],
    recommended: ['home', 'listings', 'about', 'agents', 'contact'],
    premium: ['home', 'listings', 'about', 'agents', 'buyers', 'sellers', 'testimonials', 'contact'],
    terminology: { services: 'Listings', service: 'Property', team: 'Our Agents' }
  },
  'consulting': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'case-studies', 'testimonials', 'contact'],
    terminology: { services: 'Services', service: 'Service', team: 'Our Team' }
  },

  // Trades & Home Services
  'plumber': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'service-areas', 'contact'],
    premium: ['home', 'services', 'about', 'service-areas', 'testimonials', 'gallery', 'contact'],
    terminology: { services: 'Services', service: 'Service', team: 'Our Technicians' }
  },
  'electrician': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'service-areas', 'contact'],
    premium: ['home', 'services', 'about', 'service-areas', 'testimonials', 'gallery', 'contact'],
    terminology: { services: 'Services', service: 'Service', team: 'Our Electricians' }
  },
  'construction': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'portfolio', 'contact'],
    premium: ['home', 'services', 'about', 'portfolio', 'team', 'testimonials', 'contact'],
    terminology: { services: 'Services', service: 'Service', team: 'Our Team' }
  },

  // Default fallback
  'default': {
    essential: ['home', 'services', 'contact'],
    recommended: ['home', 'services', 'about', 'team', 'contact'],
    premium: ['home', 'services', 'about', 'team', 'gallery', 'testimonials', 'contact'],
    terminology: { services: 'Services', service: 'Service', team: 'Our Team' }
  }
};

/**
 * Portal/App pages for authenticated users
 */
const PORTAL_PAGES = {
  standard: ['dashboard', 'profile'],
  loyalty: ['dashboard', 'rewards', 'earn', 'profile'],
  full: ['dashboard', 'rewards', 'earn', 'wallet', 'leaderboard', 'profile']
};

/**
 * Get industry configuration
 */
function getIndustryConfig(industry) {
  const key = (industry || '').toLowerCase().replace(/\s+/g, '-');
  return INDUSTRY_PAGE_PACKAGES[key] || INDUSTRY_PAGE_PACKAGES['default'];
}

/**
 * Get pages for an industry at a specific tier
 */
function getIndustryPages(industry, tier = 'recommended') {
  const config = getIndustryConfig(industry);
  return config[tier] || config.recommended || config.essential;
}

/**
 * Get portal pages based on features
 */
function getPortalPages(features = []) {
  if (features.includes('loyalty') || features.includes('rewards')) {
    return PORTAL_PAGES.loyalty;
  }
  if (features.includes('wallet') || features.includes('full-portal')) {
    return PORTAL_PAGES.full;
  }
  if (features.includes('auth') || features.includes('portal')) {
    return PORTAL_PAGES.standard;
  }
  return [];
}

// Initialize Anthropic client
let anthropic = null;
function getAnthropicClient() {
  if (!anthropic) {
    anthropic = new Anthropic();
  }
  return anthropic;
}

/**
 * Content zones that AI will generate
 * Each zone has a small, focused prompt
 */
const CONTENT_ZONES = {
  heroTagline: {
    maxTokens: 150,
    description: 'Hero section tagline and subtext'
  },
  aboutStory: {
    maxTokens: 400,
    description: 'About page company story'
  },
  teamBios: {
    maxTokens: 600, // ~200 per person for up to 3 people
    description: 'Team member biographies'
  },
  serviceDescriptions: {
    maxTokens: 500, // ~50 per item for up to 10 items
    description: 'Service/menu item descriptions'
  },
  testimonials: {
    maxTokens: 300, // ~100 per testimonial
    description: 'Customer testimonials'
  },
  ctaText: {
    maxTokens: 80,
    description: 'Call-to-action button text and urgency'
  },
  locationContent: {
    maxTokens: 250,
    description: 'Location-specific content and local references'
  }
};

/**
 * Mood slider interpretations for AI prompts
 */
function interpretMoodSliders(sliders) {
  const { vibe = 50, energy = 50, era = 50, density = 50, price = 50 } = sliders || {};

  return {
    tone: vibe < 40 ? 'professional and formal' : vibe > 60 ? 'friendly and warm' : 'balanced',
    energy: energy < 40 ? 'calm and serene' : energy > 60 ? 'energetic and bold' : 'moderate',
    style: era < 40 ? 'classic and timeless' : era > 60 ? 'modern and trendy' : 'contemporary',
    contentDensity: density < 40 ? 'minimal and concise' : density > 60 ? 'rich and detailed' : 'balanced',
    marketPosition: price < 40 ? 'value-focused and accessible' : price > 60 ? 'premium and exclusive' : 'quality-focused'
  };
}

/**
 * Convert mood sliders to visual style values for CSS
 * These can be used in page templates to make each site unique
 */
function interpretMoodForVisuals(sliders) {
  const { vibe = 50, energy = 50, era = 50, density = 50, price = 50 } = sliders || {};

  // Border radius: professional = sharp, friendly = rounded
  const borderRadius = vibe < 40 ? '4px' : vibe > 70 ? '20px' : `${Math.round(4 + (vibe - 40) * 0.5)}px`;
  const buttonRadius = vibe < 40 ? '4px' : vibe > 70 ? '9999px' : `${Math.round(4 + (vibe - 40) * 0.3)}px`;

  // Spacing: dense content = tighter, minimal = more airy
  const sectionPadding = density < 40 ? '40px' : density > 60 ? '100px' : `${Math.round(40 + density * 0.6)}px`;
  const cardPadding = density < 40 ? '16px' : density > 60 ? '40px' : `${Math.round(16 + density * 0.24)}px`;

  // Font styling: era affects font choice and weight
  const headingFont = era < 40 ? "'Playfair Display', Georgia, serif" : era > 60 ? "'Inter', system-ui, sans-serif" : "'Poppins', sans-serif";
  const bodyFont = "'Inter', system-ui, sans-serif";
  const headingWeight = era < 40 ? '700' : '600';

  // Energy affects shadows and transitions
  const shadowIntensity = energy < 40 ? '0 2px 8px rgba(0,0,0,0.05)' : energy > 60 ? '0 8px 30px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.08)';
  const hoverTransform = energy < 40 ? 'translateY(-2px)' : energy > 60 ? 'translateY(-6px) scale(1.02)' : 'translateY(-4px)';
  const transitionSpeed = energy < 40 ? '0.4s' : energy > 60 ? '0.15s' : '0.25s';

  // Price tier affects visual cues
  const accentOpacity = price < 40 ? '0.8' : price > 60 ? '1' : '0.9';
  const heroOverlay = price < 40 ? 'rgba(0,0,0,0.3)' : price > 60 ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.4)';
  const letterSpacing = price > 60 ? '0.05em' : 'normal';

  return {
    borderRadius,
    buttonRadius,
    sectionPadding,
    cardPadding,
    headingFont,
    bodyFont,
    headingWeight,
    shadowIntensity,
    hoverTransform,
    transitionSpeed,
    accentOpacity,
    heroOverlay,
    letterSpacing,
    // Raw values for custom use
    raw: { vibe, energy, era, density, price }
  };
}

/**
 * Generate content for a specific zone using a small AI call
 */
async function generateContentZone(zone, context, options = {}) {
  const { skipAI = false } = options;

  // If skipping AI, return placeholder
  if (skipAI) {
    return getPlaceholderContent(zone, context);
  }

  const client = getAnthropicClient();
  const zoneConfig = CONTENT_ZONES[zone];

  if (!zoneConfig) {
    console.warn(`Unknown content zone: ${zone}`);
    return null;
  }

  const prompt = buildZonePrompt(zone, context);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: zoneConfig.maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error(`Error generating ${zone}:`, error.message);
    return getPlaceholderContent(zone, context);
  }
}

/**
 * Build focused prompt for each content zone
 */
function buildZonePrompt(zone, context) {
  const {
    businessName,
    industry,
    location,
    moodInterpretation,
    teamMembers,
    services,
    yearsInBusiness
  } = context;

  const toneGuide = `Tone: ${moodInterpretation.tone}. Style: ${moodInterpretation.style}. Market: ${moodInterpretation.marketPosition}.`;

  const prompts = {
    heroTagline: `Write a compelling hero tagline and 1-sentence subtext for "${businessName}", a ${industry} in ${location}.
${toneGuide}
Format:
TAGLINE: [6-10 words]
SUBTEXT: [15-25 words]
Only output the tagline and subtext, nothing else.`,

    aboutStory: `Write a brief "About Us" story for "${businessName}", a ${industry} in ${location}.
${yearsInBusiness ? `They've been in business for ${yearsInBusiness}.` : ''}
${toneGuide}
Keep it under 100 words. Focus on their passion and what makes them special.
Only output the story text, no headers.`,

    teamBios: `Write brief professional bios for these team members at "${businessName}" (${industry}):
${teamMembers.map(m => `- ${m.name}: ${m.role}`).join('\n')}
${toneGuide}
Format each as: NAME: [2-3 sentence bio]
Only output the bios, nothing else.`,

    serviceDescriptions: `Write brief, enticing descriptions for these ${industry} services/items:
${services.map(s => `- ${s.name}${s.price ? ` ($${s.price})` : ''}`).join('\n')}
${toneGuide}
Format each as: NAME: [1-2 sentence description]
Only output the descriptions, nothing else.`,

    testimonials: `Generate 3 realistic customer testimonials for "${businessName}", a ${industry} in ${location}.
${toneGuide}
Format each as:
"[Quote]" - [First Name], [Role/Type of customer]
Make them feel authentic and specific to this business type.`,

    ctaText: `Write 3 short call-to-action button texts for "${businessName}" (${industry}).
${toneGuide}
Examples of what we need: "Book Your Table", "Get Started", "Claim Your Spot"
Format: One per line, 2-4 words each.`,

    locationContent: `Write 2-3 sentences that naturally incorporate ${location} for "${businessName}" (${industry}).
Reference local landmarks, neighborhoods, or community pride.
${toneGuide}
Only output the sentences, nothing else.`
  };

  return prompts[zone] || `Generate content for ${zone}`;
}

/**
 * Get placeholder content when AI is skipped
 */
function getPlaceholderContent(zone, context) {
  const { businessName, industry, location } = context;

  const placeholders = {
    heroTagline: `TAGLINE: Welcome to ${businessName}\nSUBTEXT: Your premier ${industry} destination in ${location}.`,
    aboutStory: `${businessName} has been proudly serving the ${location} community with exceptional ${industry} services. Our dedicated team is committed to providing you with an outstanding experience every time you visit.`,
    teamBios: context.teamMembers?.map(m => `${m.name}: A dedicated professional bringing passion and expertise to ${businessName}.`).join('\n') || '',
    serviceDescriptions: context.services?.map(s => `${s.name}: A quality offering from ${businessName}.`).join('\n') || '',
    testimonials: `"Great experience at ${businessName}!" - Sarah, Local Customer\n"Highly recommend!" - Mike, Regular Visitor\n"The best in ${location}!" - Jennifer, Happy Client`,
    ctaText: `Get Started\nBook Now\nLearn More`,
    locationContent: `Proudly serving ${location} and the surrounding community.`
  };

  return placeholders[zone] || '';
}

/**
 * Main Smart Template Generator
 */
async function generateSmartTemplate(config, options = {}) {
  const {
    businessName,
    industry,
    location,
    tagline: customTagline,
    logo,
    colors = { primary: '#3b82f6', accent: '#8b5cf6', text: '#1a1a2e', background: '#ffffff' },
    hours,
    phone,
    email,
    teamMembers = [],
    menuText,
    services = [],
    moodSliders = {},
    layoutKey,
    features = [],
    pages: customPages,
    pageTier = 'recommended',
    includePortal = false,
    portalTier = 'standard',
    yearsInBusiness
  } = config;

  const {
    skipAI = false,
    onProgress = () => {}
  } = options;

  // Get industry configuration
  const industryConfig = getIndustryConfig(industry);
  const terminology = industryConfig.terminology || {};

  // Determine pages: use custom if provided, otherwise get from industry config
  let pages;
  if (customPages && customPages.length > 0) {
    pages = customPages;
  } else {
    pages = getIndustryPages(industry, pageTier);
  }

  // Add portal pages if requested
  let portalPages = [];
  if (includePortal || features.includes('auth') || features.includes('portal') || features.includes('loyalty')) {
    portalPages = getPortalPages(features.length > 0 ? features : [portalTier === 'full' ? 'full-portal' : portalTier]);
  }

  console.log('\n🎨 ====== SMART TEMPLATE MODE ======');
  console.log(`   Business: ${businessName}`);
  console.log(`   Industry: ${industry} (${pageTier} tier)`);
  console.log(`   Location: ${location}`);
  console.log(`   Pages: ${pages.join(', ')}`);
  if (portalPages.length > 0) {
    console.log(`   Portal: ${portalPages.join(', ')}`);
  }
  console.log(`   Terminology: ${terminology.services || 'Services'} / ${terminology.team || 'Our Team'}`);
  console.log(`   Skip AI: ${skipAI}`);

  onProgress({ step: 'Starting', message: '🎨 Smart Template generation starting...' });

  // Interpret mood sliders for AI guidance
  const moodInterpretation = interpretMoodSliders(moodSliders);
  console.log(`   Mood: ${moodInterpretation.tone}, ${moodInterpretation.style}`);

  // Parse menu text into services if provided
  let parsedServices = services;
  if (menuText && menuText.trim()) {
    parsedServices = parseMenuToServices(menuText);
    console.log(`   Parsed ${parsedServices.length} menu items`);
  }

  // Build context for AI calls
  const aiContext = {
    businessName,
    industry,
    location,
    moodInterpretation,
    teamMembers,
    services: parsedServices,
    yearsInBusiness
  };

  // Generate content zones (parallel for speed)
  onProgress({ step: 'Generating content', message: '✍️ Generating custom content...' });

  const contentPromises = {};
  const zonesToGenerate = ['heroTagline', 'aboutStory', 'ctaText', 'locationContent'];

  // Add conditional zones
  if (teamMembers.length > 0) zonesToGenerate.push('teamBios');
  if (parsedServices.length > 0) zonesToGenerate.push('serviceDescriptions');
  zonesToGenerate.push('testimonials');

  // Generate all zones in parallel
  for (const zone of zonesToGenerate) {
    contentPromises[zone] = generateContentZone(zone, aiContext, { skipAI });
  }

  const generatedContent = {};
  for (const [zone, promise] of Object.entries(contentPromises)) {
    generatedContent[zone] = await promise;
    onProgress({ step: `Generated ${zone}`, message: `   ✅ ${zone}` });
  }

  console.log('   ✅ Content zones generated');

  // Parse the generated content (pass original services for price matching)
  const parsedContent = parseGeneratedContent(generatedContent, parsedServices);

  // Build final template data
  onProgress({ step: 'Building template', message: '🔨 Assembling template...' });

  // Generate visual styles from mood sliders
  const visualStyles = interpretMoodForVisuals(moodSliders);

  const templateData = {
    business: {
      name: businessName,
      tagline: customTagline || parsedContent.tagline,
      subtext: parsedContent.subtext,
      industry,
      location,
      hours,
      phone,
      email,
      logo,
      yearsInBusiness
    },
    theme: {
      colors,
      moodSliders,
      moodInterpretation,
      visualStyles  // Add visual styles derived from mood sliders
    },
    content: {
      hero: {
        tagline: parsedContent.tagline,
        subtext: parsedContent.subtext,
        ctas: parsedContent.ctas
      },
      about: {
        story: parsedContent.aboutStory,
        locationContent: parsedContent.locationContent
      },
      team: parsedContent.teamBios,
      services: parsedContent.services,
      testimonials: parsedContent.testimonials
    },
    // Page configuration
    pages,
    portalPages,
    pageTier,
    // Industry configuration
    industryConfig: {
      key: industry,
      terminology,
      availableTiers: Object.keys(industryConfig).filter(k => k !== 'terminology')
    },
    features,
    layoutKey
  };

  onProgress({ step: 'Complete', message: '✅ Smart Template ready!' });

  return templateData;
}

/**
 * Parse menu text into services array
 */
function parseMenuToServices(menuText) {
  const lines = menuText.split('\n').map(l => l.trim()).filter(l => l);
  const services = [];
  let currentCategory = 'Menu';

  for (const line of lines) {
    // Check if it's a category header (ALL CAPS or ends with :)
    if (/^[A-Z\s&]+$/.test(line) || /^[A-Z][A-Za-z\s&]+:$/.test(line)) {
      currentCategory = line.replace(/:$/, '').trim();
      continue;
    }

    // Parse as item: "Item Name - $Price" or similar
    const priceMatch = line.match(/^(.+?)[\s\-–—:\.]+\$?(\d+(?:\.\d{2})?)\s*$/);

    if (priceMatch) {
      services.push({
        name: priceMatch[1].trim(),
        price: parseFloat(priceMatch[2]),
        category: currentCategory
      });
    } else if (line.length > 3) {
      services.push({
        name: line,
        category: currentCategory
      });
    }
  }

  return services;
}

/**
 * Clean AI-generated text by removing common artifacts
 */
function cleanAIText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')           // Remove ** bold markers
    .replace(/^\*\s*/gm, '')        // Remove * bullet points at line start
    .replace(/^-\s*/gm, '')         // Remove - bullet points at line start
    .replace(/^\d+\.\s*/gm, '')     // Remove numbered list markers
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .trim();
}

/**
 * Parse generated AI content into structured format
 */
function parseGeneratedContent(generated, originalServices = []) {
  const result = {
    tagline: '',
    subtext: '',
    aboutStory: '',
    teamBios: [],
    services: [],
    testimonials: [],
    ctas: [],
    locationContent: ''
  };

  // Parse hero tagline
  if (generated.heroTagline) {
    const taglineMatch = generated.heroTagline.match(/TAGLINE:\s*(.+)/i);
    const subtextMatch = generated.heroTagline.match(/SUBTEXT:\s*(.+)/i);
    result.tagline = cleanAIText(taglineMatch ? taglineMatch[1] : generated.heroTagline.split('\n')[0]);
    result.subtext = cleanAIText(subtextMatch ? subtextMatch[1] : '');
  }

  // Parse about story
  result.aboutStory = cleanAIText(generated.aboutStory || '');

  // Parse team bios - handle multi-line bios
  if (generated.teamBios) {
    const bioText = generated.teamBios;
    // Split by name pattern (NAME: or **NAME** or similar)
    const bioSections = bioText.split(/(?=^[A-Z][A-Z\s]+:|^\*\*[A-Z])/m).filter(s => s.trim());

    for (const section of bioSections) {
      const match = section.match(/^[\*]*([A-Za-z\s]+)[\*]*[:\-]\s*(.+)/s);
      if (match) {
        const name = cleanAIText(match[1]);
        const bio = cleanAIText(match[2]);
        if (name && bio) {
          result.teamBios.push({ name, bio });
        }
      }
    }

    // Fallback: simple line-by-line parsing
    if (result.teamBios.length === 0) {
      const bioLines = bioText.split('\n').filter(l => l.trim());
      for (const line of bioLines) {
        const simpleMatch = line.match(/^(.+?):\s*(.+)$/);
        if (simpleMatch) {
          result.teamBios.push({
            name: cleanAIText(simpleMatch[1]),
            bio: cleanAIText(simpleMatch[2])
          });
        }
      }
    }
  }

  // Parse service descriptions - merge with original service data (prices, categories)
  if (generated.serviceDescriptions) {
    const descLines = generated.serviceDescriptions.split('\n').filter(l => l.trim());

    for (const line of descLines) {
      const match = line.match(/^[\*]*(.+?)[\*]*:\s*(.+)$/);
      if (match) {
        const name = cleanAIText(match[1]);
        const description = cleanAIText(match[2]);

        // Find matching original service to get price/category
        const originalService = originalServices.find(s =>
          s.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(s.name.toLowerCase())
        );

        result.services.push({
          name,
          description,
          price: originalService?.price || null,
          category: originalService?.category || 'Menu'
        });
      }
    }
  }

  // If no AI descriptions but we have original services, use those
  if (result.services.length === 0 && originalServices.length > 0) {
    result.services = originalServices.map(s => ({
      name: s.name,
      description: s.description || '',
      price: s.price || null,
      category: s.category || 'Menu'
    }));
  }

  // Parse testimonials
  if (generated.testimonials) {
    const testimonialMatches = generated.testimonials.matchAll(/"([^"]+)"\s*[-–—]\s*([^,\n]+)(?:,\s*([^\n]+))?/g);
    for (const match of testimonialMatches) {
      result.testimonials.push({
        quote: cleanAIText(match[1]),
        name: cleanAIText(match[2]),
        role: cleanAIText(match[3]) || 'Customer'
      });
    }

    // Fallback if regex didn't match
    if (result.testimonials.length === 0 && generated.testimonials.includes('"')) {
      const lines = generated.testimonials.split('\n').filter(l => l.includes('"'));
      for (const line of lines) {
        const parts = line.match(/"(.+?)"/);
        if (parts) {
          const afterQuote = line.split('"').pop() || '';
          const namePart = afterQuote.replace(/^[\s\-–—]+/, '').trim();
          result.testimonials.push({
            quote: cleanAIText(parts[1]),
            name: namePart.split(',')[0]?.trim() || 'Customer',
            role: namePart.split(',')[1]?.trim() || 'Customer'
          });
        }
      }
    }
  }

  // Parse CTAs - clean up each one
  if (generated.ctaText) {
    result.ctas = generated.ctaText
      .split('\n')
      .map(l => cleanAIText(l))
      .filter(l => l && l.length > 1 && l.length < 30); // Valid CTA length
  }

  // Location content
  result.locationContent = cleanAIText(generated.locationContent || '');

  return result;
}

/**
 * Generate React pages from smart template data
 */
function generatePagesFromTemplate(templateData, projectPath) {
  const { business, theme, content, pages } = templateData;
  const pagesDir = path.join(projectPath, 'frontend', 'src', 'pages');

  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }

  const generatedPages = [];

  for (const pageName of pages) {
    const componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page';
    const pageContent = generatePageComponent(pageName, templateData);

    fs.writeFileSync(path.join(pagesDir, `${componentName}.jsx`), pageContent);
    generatedPages.push({ name: pageName, component: componentName });
  }

  return generatedPages;
}

/**
 * Generate a single page component from template data
 */
function generatePageComponent(pageName, templateData) {
  const { business, theme, content, industryConfig } = templateData;
  const { colors } = theme;
  const terminology = industryConfig?.terminology || {};

  // Page-specific generators
  const generators = {
    home: () => generateHomePage(templateData),
    about: () => generateAboutPage(templateData),
    services: () => generateServicesPage(templateData),
    menu: () => generateMenuPage(templateData),
    contact: () => generateContactPage(templateData),
    team: () => generateTeamPage(templateData),
    gallery: () => generateGalleryPage(templateData),
    // Industry-specific pages that map to common templates
    'practice-areas': () => generateServicesPage(templateData, 'Practice Areas'),
    'listings': () => generateServicesPage(templateData, 'Listings'),
    'classes': () => generateServicesPage(templateData, 'Classes'),
    'treatments': () => generateServicesPage(templateData, 'Treatments'),
    // Additional pages
    'reservations': () => generateReservationsPage(templateData),
    'booking': () => generateReservationsPage(templateData),
    'events': () => generateEventsPage(templateData),
    'schedule': () => generateSchedulePage(templateData),
    'testimonials': () => generateTestimonialsPage(templateData),
    'pricing': () => generatePricingPage(templateData),
    // Team variations
    'attorneys': () => generateTeamPage(templateData, 'Our Attorneys'),
    'providers': () => generateTeamPage(templateData, 'Our Providers'),
    'instructors': () => generateTeamPage(templateData, 'Our Instructors'),
    'trainers': () => generateTeamPage(templateData, 'Our Trainers'),
    'artists': () => generateTeamPage(templateData, 'Our Artists'),
    'agents': () => generateTeamPage(templateData, 'Our Agents')
  };

  const generator = generators[pageName.toLowerCase()];
  if (generator) {
    return generator();
  }

  // Default page template
  return generateDefaultPage(pageName, templateData);
}

/**
 * Generate Home page component
 */
function generateHomePage(templateData) {
  const { business, theme, content } = templateData;
  const { colors, visualStyles } = theme;
  // Extract visual style values with defaults
  const vs = visualStyles || {
    borderRadius: '8px',
    buttonRadius: '8px',
    sectionPadding: '80px',
    cardPadding: '32px',
    headingFont: "'Inter', sans-serif",
    headingWeight: '600',
    shadowIntensity: '0 4px 15px rgba(0,0,0,0.08)',
    transitionSpeed: '0.25s',
    letterSpacing: 'normal'
  };

  return `/**
 * ${business.name} - Home Page
 * Generated with Smart Template Mode
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Phone } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>${content.hero.tagline || business.tagline || `Welcome to ${business.name}`}</h1>
          <p style={styles.heroSubtext}>${content.hero.subtext || `Your premier ${business.industry} destination in ${business.location}`}</p>
          <div style={styles.heroCtas}>
            <Link to="/contact" style={styles.primaryCta}>${content.hero.ctas?.[0] || 'Get Started'}</Link>
            <Link to="/about" style={styles.secondaryCta}>Learn More</Link>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section style={styles.quickInfo}>
        ${business.location ? `<div style={styles.infoItem}><MapPin size={20} /> <span>${business.location}</span></div>` : ''}
        ${business.phone ? `<div style={styles.infoItem}><Phone size={20} /> <span>${business.phone}</span></div>` : ''}
      </section>

      {/* About Preview */}
      <section style={styles.aboutPreview}>
        <h2 style={styles.sectionTitle}>About ${business.name}</h2>
        <p style={styles.aboutText}>${content.about.story?.substring(0, 200) || ''}...</p>
        <Link to="/about" style={styles.link}>Read our story <ArrowRight size={16} /></Link>
      </section>

      {/* Testimonials */}
      ${content.testimonials?.length > 0 ? `
      <section style={styles.testimonials}>
        <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
        <div style={styles.testimonialGrid}>
          ${content.testimonials.slice(0, 3).map(t => `
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"${t.quote}"</p>
            <p style={styles.testimonialAuthor}>- ${t.name}${t.role ? `, ${t.role}` : ''}</p>
          </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      {/* Location Content */}
      ${content.about.locationContent ? `
      <section style={styles.locationSection}>
        <h2 style={styles.sectionTitle}>Proudly Serving ${business.location}</h2>
        <p style={styles.locationText}>${content.about.locationContent}</p>
      </section>
      ` : ''}

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <Link to="/contact" style={styles.primaryCta}>${content.hero.ctas?.[1] || 'Contact Us Today'}</Link>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: ${vs.headingFont}
  },
  hero: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}22 0%, ${colors.accent}22 100%)',
    padding: '60px 24px'
  },
  heroContent: {
    textAlign: 'center',
    maxWidth: '800px'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: '${vs.headingWeight}',
    fontFamily: ${vs.headingFont},
    color: '${colors.text}',
    marginBottom: '24px',
    lineHeight: 1.2,
    letterSpacing: '${vs.letterSpacing}'
  },
  heroSubtext: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: '${colors.text}',
    opacity: 0.8,
    marginBottom: '32px'
  },
  heroCtas: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryCta: {
    background: '${colors.primary}',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '${vs.buttonRadius}',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all ${vs.transitionSpeed} ease',
    boxShadow: '${vs.shadowIntensity}'
  },
  secondaryCta: {
    background: 'transparent',
    color: '${colors.primary}',
    padding: '14px 32px',
    borderRadius: '${vs.buttonRadius}',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: '2px solid ${colors.primary}',
    transition: 'all ${vs.transitionSpeed} ease'
  },
  quickInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '24px',
    background: '${colors.primary}',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  aboutPreview: {
    padding: '${vs.sectionPadding} 24px',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '${vs.headingWeight}',
    fontFamily: ${vs.headingFont},
    color: '${colors.text}',
    marginBottom: '24px',
    letterSpacing: '${vs.letterSpacing}'
  },
  aboutText: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.8,
    lineHeight: 1.7,
    marginBottom: '16px'
  },
  link: {
    color: '${colors.primary}',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500',
    transition: 'all ${vs.transitionSpeed} ease'
  },
  testimonials: {
    padding: '${vs.sectionPadding} 24px',
    background: '${colors.background === '#ffffff' ? '#f8fafc' : colors.background}'
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  testimonialCard: {
    background: '#ffffff',
    padding: '${vs.cardPadding}',
    borderRadius: '${vs.borderRadius}',
    boxShadow: '${vs.shadowIntensity}',
    transition: 'all ${vs.transitionSpeed} ease'
  },
  testimonialQuote: {
    fontSize: '1rem',
    color: '${colors.text}',
    fontStyle: 'italic',
    marginBottom: '16px',
    lineHeight: 1.6
  },
  testimonialAuthor: {
    color: '${colors.primary}',
    fontWeight: '600'
  },
  locationSection: {
    padding: '${vs.sectionPadding} 24px',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  },
  locationText: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.8,
    lineHeight: 1.7
  },
  ctaSection: {
    padding: '${vs.sectionPadding} 24px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)'
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '24px'
  }
};
`;
}

/**
 * Generate About page component
 */
function generateAboutPage(templateData) {
  const { business, theme, content } = templateData;
  const { colors } = theme;

  return `/**
 * ${business.name} - About Page
 * Generated with Smart Template Mode
 */
import React from 'react';
import { MapPin, Award, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>About ${business.name}</h1>
        <p style={styles.heroSubtext}>Learn more about who we are and what drives us</p>
      </section>

      {/* Our Story */}
      <section style={styles.storySection}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        <p style={styles.storyText}>${content.about.story || `${business.name} has been proudly serving the ${business.location} community.`}</p>
        ${content.about.locationContent ? `<p style={styles.storyText}>${content.about.locationContent}</p>` : ''}
      </section>

      {/* Values */}
      <section style={styles.valuesSection}>
        <h2 style={styles.sectionTitle}>What We Stand For</h2>
        <div style={styles.valuesGrid}>
          <div style={styles.valueCard}>
            <Award size={32} color="${colors.primary}" />
            <h3 style={styles.valueTitle}>Quality</h3>
            <p style={styles.valueText}>We never compromise on the quality of our products and services.</p>
          </div>
          <div style={styles.valueCard}>
            <Users size={32} color="${colors.primary}" />
            <h3 style={styles.valueTitle}>Community</h3>
            <p style={styles.valueText}>We're proud to be part of the ${business.location} community.</p>
          </div>
          <div style={styles.valueCard}>
            <Heart size={32} color="${colors.primary}" />
            <h3 style={styles.valueTitle}>Passion</h3>
            <p style={styles.valueText}>We love what we do and it shows in everything we create.</p>
          </div>
        </div>
      </section>

      ${business.yearsInBusiness ? `
      {/* Stats */}
      <section style={styles.statsSection}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>${business.yearsInBusiness}+</span>
          <span style={styles.statLabel}>Years in Business</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>1000+</span>
          <span style={styles.statLabel}>Happy Customers</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>100%</span>
          <span style={styles.statLabel}>Satisfaction</span>
        </div>
      </section>
      ` : ''}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 80px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '16px'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.7
  },
  storySection: {
    padding: '80px 24px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '24px',
    textAlign: 'center'
  },
  storyText: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.8,
    lineHeight: 1.8,
    marginBottom: '16px'
  },
  valuesSection: {
    padding: '80px 24px',
    background: '${colors.background === '#ffffff' ? '#f8fafc' : colors.background}'
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  valueCard: {
    textAlign: 'center',
    padding: '32px'
  },
  valueTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '${colors.text}',
    margin: '16px 0 8px'
  },
  valueText: {
    color: '${colors.text}',
    opacity: 0.7
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '64px',
    padding: '80px 24px',
    background: '${colors.primary}',
    flexWrap: 'wrap'
  },
  stat: {
    textAlign: 'center',
    color: '#ffffff'
  },
  statNumber: {
    display: 'block',
    fontSize: '3rem',
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: '1rem',
    opacity: 0.9
  }
};
`;
}

/**
 * Generate Services/Menu page component
 */
function generateServicesPage(templateData, customTitle = null) {
  const { business, theme, content, industryConfig } = templateData;
  const { colors } = theme;
  const terminology = industryConfig?.terminology || {};
  const pageTitle = customTitle || terminology.services || 'Our Services';

  const services = content.services?.length > 0 ? content.services : [
    { name: 'Service One', description: 'A quality service offering.' },
    { name: 'Service Two', description: 'Another great option for you.' },
    { name: 'Service Three', description: 'Premium service experience.' }
  ];

  return `/**
 * ${business.name} - ${pageTitle} Page
 * Generated with Smart Template Mode
 */
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const services = ${JSON.stringify(services, null, 4)};

  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>${pageTitle}</h1>
        <p style={styles.heroSubtext}>Discover what ${business.name} has to offer</p>
      </section>

      {/* Services Grid */}
      <section style={styles.servicesSection}>
        <div style={styles.servicesGrid}>
          {services.map((service, index) => (
            <div key={index} style={styles.serviceCard}>
              <h3 style={styles.serviceName}>{service.name}</h3>
              {service.price && <span style={styles.servicePrice}>\${service.price}</span>}
              <p style={styles.serviceDesc}>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <Link to="/contact" style={styles.ctaButton}>Contact Us <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 80px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '16px'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.7
  },
  servicesSection: {
    padding: '80px 24px'
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  serviceCard: {
    background: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid #eee'
  },
  serviceName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '8px'
  },
  servicePrice: {
    display: 'inline-block',
    background: '${colors.primary}22',
    color: '${colors.primary}',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '12px'
  },
  serviceDesc: {
    color: '${colors.text}',
    opacity: 0.7,
    lineHeight: 1.6
  },
  ctaSection: {
    padding: '80px 24px',
    textAlign: 'center',
    background: '${colors.primary}'
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '24px'
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#ffffff',
    color: '${colors.primary}',
    padding: '14px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600'
  }
};
`;
}

/**
 * Generate Menu page (for restaurants/cafes)
 */
function generateMenuPage(templateData) {
  const { business, theme, content } = templateData;
  const { colors } = theme;

  // Group services by category
  const menuItems = content.services?.length > 0 ? content.services : [
    { name: 'Signature Item', description: 'Our most popular choice.', price: 12, category: 'Main' }
  ];

  return `/**
 * ${business.name} - Menu Page
 * Generated with Smart Template Mode
 */
import React, { useState } from 'react';

export default function MenuPage() {
  const menuItems = ${JSON.stringify(menuItems, null, 4)};

  // Get unique categories
  const categories = [...new Set(menuItems.map(item => item.category || 'Menu'))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filteredItems = menuItems.filter(item => (item.category || 'Menu') === activeCategory);

  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Menu</h1>
        <p style={styles.heroSubtext}>Fresh, delicious, made with love</p>
      </section>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div style={styles.categoryTabs}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...styles.categoryTab,
                ...(activeCategory === cat ? styles.categoryTabActive : {})
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <section style={styles.menuSection}>
        <div style={styles.menuGrid}>
          {filteredItems.map((item, index) => (
            <div key={index} style={styles.menuItem}>
              <div style={styles.menuItemHeader}>
                <h3 style={styles.menuItemName}>{item.name}</h3>
                {item.price && <span style={styles.menuItemPrice}>\${item.price}</span>}
              </div>
              {item.description && <p style={styles.menuItemDesc}>{item.description}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '16px'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.7
  },
  categoryTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '24px',
    flexWrap: 'wrap',
    borderBottom: '1px solid #eee'
  },
  categoryTab: {
    padding: '10px 24px',
    border: 'none',
    background: 'transparent',
    color: '${colors.text}',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '20px',
    transition: 'all 0.2s'
  },
  categoryTabActive: {
    background: '${colors.primary}',
    color: '#ffffff'
  },
  menuSection: {
    padding: '40px 24px 80px'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  menuItem: {
    padding: '24px',
    borderBottom: '1px solid #eee'
  },
  menuItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  menuItemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '${colors.text}'
  },
  menuItemPrice: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '${colors.primary}'
  },
  menuItemDesc: {
    marginTop: '8px',
    color: '${colors.text}',
    opacity: 0.7,
    fontSize: '0.95rem'
  }
};
`;
}

/**
 * Generate Contact page
 */
function generateContactPage(templateData) {
  const { business, theme, content } = templateData;
  const { colors } = theme;

  return `/**
 * ${business.name} - Contact Page
 * Generated with Smart Template Mode
 */
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
  };

  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Contact Us</h1>
        <p style={styles.heroSubtext}>We'd love to hear from you</p>
      </section>

      <section style={styles.mainSection}>
        <div style={styles.grid}>
          {/* Contact Info */}
          <div style={styles.infoColumn}>
            <h2 style={styles.infoTitle}>Get in Touch</h2>

            ${business.location ? `
            <div style={styles.infoItem}>
              <MapPin size={20} color="${colors.primary}" />
              <div>
                <strong>Location</strong>
                <p>${business.location}</p>
              </div>
            </div>
            ` : ''}

            ${business.phone ? `
            <div style={styles.infoItem}>
              <Phone size={20} color="${colors.primary}" />
              <div>
                <strong>Phone</strong>
                <p>${business.phone}</p>
              </div>
            </div>
            ` : ''}

            ${business.email ? `
            <div style={styles.infoItem}>
              <Mail size={20} color="${colors.primary}" />
              <div>
                <strong>Email</strong>
                <p>${business.email}</p>
              </div>
            </div>
            ` : ''}

            ${business.hours ? `
            <div style={styles.infoItem}>
              <Clock size={20} color="${colors.primary}" />
              <div>
                <strong>Hours</strong>
                <p>${typeof business.hours === 'string' ? business.hours : JSON.stringify(business.hours)}</p>
              </div>
            </div>
            ` : ''}
          </div>

          {/* Contact Form */}
          <div style={styles.formColumn}>
            <h2 style={styles.formTitle}>Send a Message</h2>

            {submitted ? (
              <div style={styles.successMessage}>
                <p>Thank you for your message! We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    style={styles.textarea}
                  />
                </div>
                <button type="submit" style={styles.submitButton}>
                  Send Message <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '16px'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.7
  },
  mainSection: {
    padding: '60px 24px 80px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '48px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  infoColumn: {
    padding: '24px'
  },
  infoTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '32px'
  },
  infoItem: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    color: '${colors.text}'
  },
  formColumn: {
    background: '#f8fafc',
    padding: '32px',
    borderRadius: '12px'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '24px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '500',
    color: '${colors.text}'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px'
  },
  textarea: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    resize: 'vertical'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '${colors.primary}',
    color: '#ffffff',
    padding: '14px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  successMessage: {
    background: '#10b98122',
    color: '#10b981',
    padding: '24px',
    borderRadius: '8px',
    textAlign: 'center'
  }
};
`;
}

/**
 * Generate Team page
 */
function generateTeamPage(templateData, customTitle = null) {
  const { business, theme, content, industryConfig } = templateData;
  const { colors } = theme;
  const terminology = industryConfig?.terminology || {};
  const pageTitle = customTitle || terminology.team || 'Meet Our Team';

  const team = content.team?.length > 0 ? content.team : [
    { name: 'Team Member', bio: 'A dedicated professional.' }
  ];

  return `/**
 * ${business.name} - Team Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function TeamPage() {
  const team = ${JSON.stringify(team, null, 4)};

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>${pageTitle}</h1>
        <p style={styles.heroSubtext}>The people behind ${business.name}</p>
      </section>

      <section style={styles.teamSection}>
        <div style={styles.teamGrid}>
          {team.map((member, index) => (
            <div key={index} style={styles.teamCard}>
              <div style={styles.avatar}>
                {member.name.charAt(0)}
              </div>
              <h3 style={styles.memberName}>{member.name}</h3>
              {member.role && <p style={styles.memberRole}>{member.role}</p>}
              <p style={styles.memberBio}>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '${colors.text}'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.7,
    marginTop: '16px'
  },
  teamSection: {
    padding: '60px 24px 80px'
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  teamCard: {
    textAlign: 'center',
    padding: '32px'
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '${colors.primary}',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 auto 20px'
  },
  memberName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '${colors.text}'
  },
  memberRole: {
    color: '${colors.primary}',
    fontWeight: '500',
    margin: '8px 0'
  },
  memberBio: {
    color: '${colors.text}',
    opacity: 0.7,
    lineHeight: 1.6
  }
};
`;
}

/**
 * Generate Gallery page
 */
function generateGalleryPage(templateData) {
  const { business, theme } = templateData;
  const { colors } = theme;

  return `/**
 * ${business.name} - Gallery Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function GalleryPage() {
  // Placeholder gallery images
  const images = [
    { id: 1, alt: 'Gallery image 1' },
    { id: 2, alt: 'Gallery image 2' },
    { id: 3, alt: 'Gallery image 3' },
    { id: 4, alt: 'Gallery image 4' },
    { id: 5, alt: 'Gallery image 5' },
    { id: 6, alt: 'Gallery image 6' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Gallery</h1>
        <p style={styles.heroSubtext}>See what we do</p>
      </section>

      <section style={styles.gallerySection}>
        <div style={styles.galleryGrid}>
          {images.map((img) => (
            <div key={img.id} style={styles.galleryItem}>
              <div style={styles.placeholder}>
                <span>Photo</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '${colors.text}'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.7,
    marginTop: '16px'
  },
  gallerySection: {
    padding: '60px 24px 80px'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  galleryItem: {
    aspectRatio: '4/3',
    overflow: 'hidden',
    borderRadius: '12px'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    background: '${colors.primary}22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '${colors.primary}',
    fontSize: '1.25rem'
  }
};
`;
}

/**
 * Generate Reservations/Booking page
 */
function generateReservationsPage(templateData) {
  const { business, theme } = templateData;
  const { colors } = theme;

  return `/**
 * ${business.name} - Reservations Page
 * Generated with Smart Template Mode
 */
import React, { useState } from 'react';

export default function ReservationsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Reservation request submitted! We will contact you shortly.');
  };

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Make a Reservation</h1>
        <p style={styles.heroSubtext}>Book your table at ${business.name}</p>
      </section>

      <section style={styles.formSection}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="Your Name"
              style={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div style={styles.formRow}>
            <input
              type="tel"
              placeholder="Phone Number"
              style={styles.input}
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
            <select
              style={styles.input}
              value={formData.guests}
              onChange={(e) => setFormData({...formData, guests: e.target.value})}
            >
              {[1,2,3,4,5,6,7,8].map(n => (
                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div style={styles.formRow}>
            <input
              type="date"
              style={styles.input}
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <input
              type="time"
              style={styles.input}
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              required
            />
          </div>
          <textarea
            placeholder="Special requests or notes..."
            style={{...styles.input, minHeight: '100px', resize: 'vertical'}}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
          <button type="submit" style={styles.submitButton}>Request Reservation</button>
        </form>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh' },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', color: '${colors.text}' },
  heroSubtext: { fontSize: '1.1rem', color: '${colors.text}', opacity: 0.7, marginTop: '16px' },
  formSection: { padding: '60px 24px 80px', maxWidth: '600px', margin: '0 auto' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  input: {
    padding: '14px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    color: '${colors.text}'
  },
  submitButton: {
    background: '${colors.primary}',
    color: '#ffffff',
    padding: '16px 32px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  }
};
`;
}

/**
 * Generate Events page
 */
function generateEventsPage(templateData) {
  const { business, theme } = templateData;
  const { colors } = theme;

  return `/**
 * ${business.name} - Events Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function EventsPage() {
  const events = [
    { title: 'Weekly Special', date: 'Every Friday', description: 'Join us for our weekly featured event.' },
    { title: 'Live Entertainment', date: 'Saturdays', description: 'Enjoy live music and entertainment.' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Events</h1>
        <p style={styles.heroSubtext}>What's happening at ${business.name}</p>
      </section>

      <section style={styles.eventsSection}>
        <div style={styles.eventsGrid}>
          {events.map((event, index) => (
            <div key={index} style={styles.eventCard}>
              <span style={styles.eventDate}>{event.date}</span>
              <h3 style={styles.eventTitle}>{event.title}</h3>
              <p style={styles.eventDesc}>{event.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh' },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', color: '${colors.text}' },
  heroSubtext: { fontSize: '1.1rem', color: '${colors.text}', opacity: 0.7, marginTop: '16px' },
  eventsSection: { padding: '60px 24px 80px' },
  eventsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
  eventCard: { padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  eventDate: { color: '${colors.primary}', fontWeight: '600', fontSize: '14px' },
  eventTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '${colors.text}', margin: '12px 0' },
  eventDesc: { color: '${colors.text}', opacity: 0.7, lineHeight: 1.6 }
};
`;
}

/**
 * Generate Schedule page
 */
function generateSchedulePage(templateData) {
  const { business, theme } = templateData;
  const { colors } = theme;

  return `/**
 * ${business.name} - Schedule Page
 * Generated with Smart Template Mode
 */
import React, { useState } from 'react';

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const schedule = {
    Monday: [{ time: '9:00 AM', class: 'Morning Session' }, { time: '5:00 PM', class: 'Evening Session' }],
    Tuesday: [{ time: '10:00 AM', class: 'Mid-Morning Session' }, { time: '6:00 PM', class: 'After Work Session' }],
    Wednesday: [{ time: '9:00 AM', class: 'Morning Session' }, { time: '5:00 PM', class: 'Evening Session' }],
    Thursday: [{ time: '10:00 AM', class: 'Mid-Morning Session' }, { time: '6:00 PM', class: 'After Work Session' }],
    Friday: [{ time: '9:00 AM', class: 'Morning Session' }],
    Saturday: [{ time: '10:00 AM', class: 'Weekend Session' }],
    Sunday: [{ time: '10:00 AM', class: 'Weekend Session' }]
  };

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Schedule</h1>
        <p style={styles.heroSubtext}>Find the perfect time at ${business.name}</p>
      </section>

      <section style={styles.scheduleSection}>
        <div style={styles.dayTabs}>
          {days.map(day => (
            <button
              key={day}
              style={{...styles.dayTab, ...(selectedDay === day ? styles.dayTabActive : {})}}
              onClick={() => setSelectedDay(day)}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        <div style={styles.classList}>
          {(schedule[selectedDay] || []).map((item, index) => (
            <div key={index} style={styles.classItem}>
              <span style={styles.classTime}>{item.time}</span>
              <span style={styles.className}>{item.class}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh' },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', color: '${colors.text}' },
  heroSubtext: { fontSize: '1.1rem', color: '${colors.text}', opacity: 0.7, marginTop: '16px' },
  scheduleSection: { padding: '60px 24px 80px', maxWidth: '800px', margin: '0 auto' },
  dayTabs: { display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' },
  dayTab: { padding: '12px 20px', border: 'none', background: '#f5f5f5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  dayTabActive: { background: '${colors.primary}', color: '#fff' },
  classList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  classItem: { display: 'flex', gap: '24px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  classTime: { fontWeight: '600', color: '${colors.primary}', minWidth: '100px' },
  className: { color: '${colors.text}' }
};
`;
}

/**
 * Generate Testimonials page
 */
function generateTestimonialsPage(templateData) {
  const { business, theme, content } = templateData;
  const { colors } = theme;

  const testimonials = content.testimonials?.length > 0 ? content.testimonials : [
    { name: 'Happy Customer', quote: 'Amazing experience! Highly recommended.' },
    { name: 'Satisfied Client', quote: 'Professional service and great results.' }
  ];

  return `/**
 * ${business.name} - Testimonials Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function TestimonialsPage() {
  const testimonials = ${JSON.stringify(testimonials, null, 4)};

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>What Our Clients Say</h1>
        <p style={styles.heroSubtext}>Real feedback from real customers</p>
      </section>

      <section style={styles.testimonialsSection}>
        <div style={styles.testimonialGrid}>
          {testimonials.map((t, index) => (
            <div key={index} style={styles.testimonialCard}>
              <p style={styles.quote}>"{t.quote}"</p>
              <p style={styles.author}>— {t.name}{t.role ? \`, \${t.role}\` : ''}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh' },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', color: '${colors.text}' },
  heroSubtext: { fontSize: '1.1rem', color: '${colors.text}', opacity: 0.7, marginTop: '16px' },
  testimonialsSection: { padding: '60px 24px 80px' },
  testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  testimonialCard: { padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  quote: { fontSize: '1.1rem', fontStyle: 'italic', color: '${colors.text}', lineHeight: 1.6, marginBottom: '16px' },
  author: { color: '${colors.primary}', fontWeight: '600' }
};
`;
}

/**
 * Generate Pricing page
 */
function generatePricingPage(templateData) {
  const { business, theme, content } = templateData;
  const { colors } = theme;

  return `/**
 * ${business.name} - Pricing Page
 * Generated with Smart Template Mode
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    { name: 'Basic', price: 29, features: ['Feature One', 'Feature Two', 'Email Support'] },
    { name: 'Professional', price: 59, features: ['All Basic Features', 'Feature Three', 'Feature Four', 'Priority Support'], popular: true },
    { name: 'Enterprise', price: 99, features: ['All Pro Features', 'Feature Five', 'Custom Solutions', 'Dedicated Support'] }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Pricing</h1>
        <p style={styles.heroSubtext}>Choose the right plan for you</p>
      </section>

      <section style={styles.pricingSection}>
        <div style={styles.pricingGrid}>
          {plans.map((plan, index) => (
            <div key={index} style={{...styles.pricingCard, ...(plan.popular ? styles.popularCard : {})}}>
              {plan.popular && <span style={styles.popularBadge}>Most Popular</span>}
              <h3 style={styles.planName}>{plan.name}</h3>
              <div style={styles.price}>
                <span style={styles.currency}>$</span>
                <span style={styles.amount}>{plan.price}</span>
                <span style={styles.period}>/mo</span>
              </div>
              <ul style={styles.featureList}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={styles.feature}><Check size={16} /> {feature}</li>
                ))}
              </ul>
              <Link to="/contact" style={styles.ctaButton}>Get Started</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh' },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', color: '${colors.text}' },
  heroSubtext: { fontSize: '1.1rem', color: '${colors.text}', opacity: 0.7, marginTop: '16px' },
  pricingSection: { padding: '60px 24px 80px' },
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
  pricingCard: { padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', position: 'relative' },
  popularCard: { border: '2px solid ${colors.primary}', transform: 'scale(1.02)' },
  popularBadge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '${colors.primary}', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  planName: { fontSize: '1.25rem', fontWeight: 'bold', color: '${colors.text}', marginBottom: '16px' },
  price: { marginBottom: '24px' },
  currency: { fontSize: '1.25rem', color: '${colors.text}' },
  amount: { fontSize: '3rem', fontWeight: 'bold', color: '${colors.text}' },
  period: { fontSize: '1rem', color: '${colors.text}', opacity: 0.6 },
  featureList: { listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' },
  feature: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', color: '${colors.text}' },
  ctaButton: { display: 'inline-block', background: '${colors.primary}', color: '#fff', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }
};
`;
}

/**
 * Generate default page for unspecified page types
 */
function generateDefaultPage(pageName, templateData) {
  const { business, theme } = templateData;
  const { colors } = theme;
  const titleName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return `/**
 * ${business.name} - ${titleName} Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function ${titleName}Page() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>${titleName}</h1>
        <p style={styles.heroSubtext}>Welcome to our ${pageName} page</p>
      </section>

      <section style={styles.content}>
        <p>Content coming soon...</p>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}11 0%, ${colors.accent}11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '${colors.text}'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '${colors.text}',
    opacity: 0.7,
    marginTop: '16px'
  },
  content: {
    padding: '60px 24px',
    textAlign: 'center',
    color: '${colors.text}'
  }
};
`;
}

module.exports = {
  generateSmartTemplate,
  generateContentZone,
  generatePagesFromTemplate,
  interpretMoodSliders,
  interpretMoodForVisuals,  // Visual styles from sliders
  parseMenuToServices,
  CONTENT_ZONES,
  // Industry configuration exports
  INDUSTRY_PAGE_PACKAGES,
  PORTAL_PAGES,
  getIndustryConfig,
  getIndustryPages,
  getPortalPages
};
