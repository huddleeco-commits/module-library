/**
 * Orchestrator Mode - Fourth Generation Mode for Blink
 *
 * Takes a SINGLE sentence from the user and autonomously generates
 * a complete website configuration by inferring all details using Claude AI.
 *
 * @example
 * orchestrate("Create a website for Mario's Pizza in Brooklyn")
 * // Returns complete payload ready for /api/assemble
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Load industries config
const INDUSTRIES = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../prompts/industries.json'), 'utf8')
);

// Get list of valid industry keys
const VALID_INDUSTRIES = Object.keys(INDUSTRIES);

// Load available backend modules
function getAvailableModules() {
  const modulesDir = path.join(__dirname, '../../backend');
  const modules = [];

  try {
    const dirs = fs.readdirSync(modulesDir, { withFileTypes: true });

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const moduleJsonPath = path.join(modulesDir, dir.name, 'module.json');
        if (fs.existsSync(moduleJsonPath)) {
          try {
            const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
            modules.push({
              name: moduleData.name || dir.name,
              description: moduleData.description || '',
              features: moduleData.features || [],
              endpoints: moduleData.endpoints || []
            });
          } catch (err) {
            // Skip malformed module.json files
          }
        }
      }
    }
  } catch (err) {
    console.error('[orchestrator] Error loading modules:', err.message);
  }

  return modules;
}

// Industry keyword mapping for faster inference
const INDUSTRY_KEYWORDS = {
  // Food & Beverage
  'pizza': 'pizza',
  'pizzeria': 'pizza',
  'restaurant': 'restaurant',
  'cafe': 'cafe',
  'coffee': 'cafe',
  'bar': 'bar',
  'lounge': 'bar',
  'nightclub': 'bar',
  'bakery': 'bakery',
  'pastry': 'bakery',

  // Professional Services
  'law': 'law-firm',
  'attorney': 'law-firm',
  'lawyer': 'law-firm',
  'legal': 'law-firm',
  'accounting': 'accounting',
  'cpa': 'accounting',
  'tax': 'accounting',
  'consulting': 'consulting',
  'consultant': 'consulting',
  'real estate': 'real-estate',
  'realtor': 'real-estate',
  'insurance': 'insurance',

  // Healthcare
  'healthcare': 'healthcare',
  'medical': 'healthcare',
  'doctor': 'healthcare',
  'clinic': 'healthcare',
  'dental': 'dental',
  'dentist': 'dental',
  'chiropractic': 'chiropractic',
  'chiropractor': 'chiropractic',
  'spa': 'spa-salon',
  'salon': 'spa-salon',
  'massage': 'spa-salon',

  // Fitness & Wellness
  'gym': 'fitness',
  'fitness': 'fitness',
  'crossfit': 'fitness',
  'yoga': 'yoga',
  'pilates': 'yoga',

  // Technology
  'saas': 'saas',
  'software': 'saas',
  'app': 'saas',
  'startup': 'startup',
  'tech': 'startup',
  'agency': 'agency',
  'marketing': 'agency',
  'digital': 'agency',

  // Retail
  'ecommerce': 'ecommerce',
  'store': 'ecommerce',
  'shop': 'ecommerce',
  'subscription': 'subscription-box',

  // Creative
  'photography': 'photography',
  'photographer': 'photography',
  'wedding': 'wedding',
  'event planner': 'wedding',
  'portfolio': 'portfolio',
  'designer': 'portfolio',

  // Organizations
  'nonprofit': 'nonprofit',
  'charity': 'nonprofit',
  'church': 'church',
  'school': 'school',
  'education': 'school',
  'course': 'online-course',

  // Trade Services
  'construction': 'construction',
  'contractor': 'construction',
  'plumber': 'plumber',
  'plumbing': 'plumber',
  'hvac': 'plumber',
  'electrician': 'electrician',
  'electrical': 'electrician',
  'landscaping': 'landscaping',
  'lawn': 'landscaping',
  'cleaning': 'cleaning',
  'maid': 'cleaning',
  'auto': 'auto-repair',
  'mechanic': 'auto-repair',
  'car repair': 'auto-repair',

  // Other
  'pet': 'pet-services',
  'grooming': 'pet-services',
  'vet': 'pet-services',
  'moving': 'moving',
  'movers': 'moving',
  'event venue': 'event-venue',
  'banquet': 'event-venue',
  'hotel': 'hotel',
  'hospitality': 'hotel',
  'travel': 'travel',
  'tour': 'travel',
  'musician': 'musician',
  'band': 'musician',
  'podcast': 'podcast',
  'gaming': 'gaming',
  'esports': 'gaming',
  'finance': 'finance',
  'investment': 'finance'
};

// Page recommendations by industry category
const PAGE_RECOMMENDATIONS = {
  'food-beverage': ['home', 'menu', 'about', 'gallery', 'contact', 'order', 'reservations'],
  'professional-services': ['home', 'services', 'about', 'team', 'testimonials', 'contact', 'faq'],
  'healthcare': ['home', 'services', 'providers', 'patient-info', 'appointments', 'contact', 'testimonials'],
  'fitness': ['home', 'classes', 'membership', 'trainers', 'schedule', 'contact', 'gallery'],
  'technology': ['home', 'features', 'pricing', 'about', 'blog', 'contact', 'demo'],
  'retail': ['home', 'products', 'categories', 'about', 'contact', 'faq', 'shipping'],
  'creative': ['home', 'portfolio', 'services', 'about', 'pricing', 'contact'],
  'trade-services': ['home', 'services', 'projects', 'about', 'testimonials', 'contact', 'quote'],
  'default': ['home', 'about', 'services', 'contact', 'testimonials', 'faq']
};

// Module recommendations by industry
const MODULE_RECOMMENDATIONS = {
  'restaurant': ['auth', 'booking', 'payments', 'notifications'],
  'pizza': ['auth', 'booking', 'payments', 'notifications'],
  'cafe': ['auth', 'payments', 'notifications'],
  'bar': ['auth', 'booking', 'payments', 'notifications'],
  'healthcare': ['auth', 'booking', 'notifications', 'documents'],
  'dental': ['auth', 'booking', 'notifications', 'documents'],
  'fitness': ['auth', 'booking', 'payments', 'notifications', 'calendar'],
  'yoga': ['auth', 'booking', 'payments', 'calendar'],
  'spa-salon': ['auth', 'booking', 'payments', 'notifications'],
  'law-firm': ['auth', 'booking', 'documents', 'notifications'],
  'consulting': ['auth', 'booking', 'documents', 'notifications'],
  'real-estate': ['auth', 'booking', 'documents', 'notifications'],
  'ecommerce': ['auth', 'payments', 'inventory', 'notifications', 'stripe-payments'],
  'saas': ['auth', 'payments', 'stripe-payments', 'analytics', 'notifications'],
  'startup': ['auth', 'analytics', 'notifications'],
  'photography': ['auth', 'booking', 'payments', 'file-upload'],
  'wedding': ['auth', 'booking', 'documents', 'payments'],
  'construction': ['auth', 'booking', 'documents', 'file-upload'],
  'default': ['auth', 'notifications']
};

/**
 * Extract business name from input
 * Looks for quoted text or proper nouns
 */
function extractBusinessName(input) {
  // Check for quoted text first
  const quotedMatch = input.match(/["']([^"']+)["']/);
  if (quotedMatch) {
    return quotedMatch[1].trim();
  }

  // Look for "for [Business Name]" pattern
  const forMatch = input.match(/for\s+([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)*)/);
  if (forMatch) {
    return forMatch[1].trim();
  }

  // Look for "called [Business Name]" pattern
  const calledMatch = input.match(/called\s+([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)*)/);
  if (calledMatch) {
    return calledMatch[1].trim();
  }

  return null;
}

/**
 * Quick industry detection from keywords
 */
function detectIndustryFromKeywords(input) {
  const lowerInput = input.toLowerCase();

  for (const [keyword, industry] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (lowerInput.includes(keyword)) {
      return industry;
    }
  }

  return null;
}

/**
 * Get industry category for page/module recommendations
 */
function getIndustryCategory(industry) {
  const categories = {
    'food-beverage': ['pizza', 'restaurant', 'cafe', 'bar', 'bakery'],
    'professional-services': ['law-firm', 'accounting', 'consulting', 'real-estate', 'insurance'],
    'healthcare': ['healthcare', 'dental', 'chiropractic', 'spa-salon'],
    'fitness': ['fitness', 'yoga'],
    'technology': ['saas', 'startup', 'agency'],
    'retail': ['ecommerce', 'subscription-box'],
    'creative': ['photography', 'wedding', 'portfolio', 'musician', 'podcast'],
    'trade-services': ['construction', 'plumber', 'electrician', 'landscaping', 'cleaning', 'auto-repair', 'moving']
  };

  for (const [category, industries] of Object.entries(categories)) {
    if (industries.includes(industry)) {
      return category;
    }
  }

  return 'default';
}

/**
 * Main orchestration function
 * Takes a single sentence and returns a complete payload for /api/assemble
 *
 * @param {string} userInput - Single sentence describing the desired website
 * @returns {Promise<Object>} Complete payload for /api/assemble endpoint
 */
async function orchestrate(userInput) {
  if (!userInput || typeof userInput !== 'string' || userInput.trim().length < 3) {
    throw new Error('Please provide a description of the website you want to create');
  }

  const input = userInput.trim();
  console.log(`[orchestrator] Processing: "${input}"`);

  // Quick local inference first
  const quickBusinessName = extractBusinessName(input);
  const quickIndustry = detectIndustryFromKeywords(input);

  // Build context for Claude
  const availableModules = getAvailableModules();
  const moduleList = availableModules.map(m => `- ${m.name}: ${m.description}`).join('\n');

  // Initialize Anthropic client
  const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
  });

  const systemPrompt = `You are a website configuration expert for Blink, an AI website builder. Your job is to take a simple user request and infer ALL details needed to create a professional website.

CRITICAL RULES:
1. Make CONFIDENT decisions - never ask for clarification
2. Use common sense and industry knowledge to fill in realistic details
3. Return ONLY valid JSON - no explanations, no apologies
4. Every field must have a value - no nulls unless truly unknown

AVAILABLE INDUSTRIES (use exact key):
${VALID_INDUSTRIES.join(', ')}

AVAILABLE MODULES:
${moduleList}

INDUSTRY CONFIGS contain: colors, typography, layouts, effects, sections, and visual prompts.

When inferring:
- Business names in quotes or after "for" should be extracted exactly
- Industry should match one of the available keys
- Location can be inferred from city/state/country mentions
- Target audience should match the industry type
- Tone should match industry norms (e.g., law firms = professional, pizzerias = warm/friendly)
- Pages should be 5-8, appropriate for the industry
- Modules should include auth + industry-relevant features
- Colors can use the industry default or be customized based on vibe words`;

  const userPrompt = `Analyze this request and return a complete website configuration:

"${input}"

${quickBusinessName ? `Detected business name: "${quickBusinessName}"` : ''}
${quickIndustry ? `Likely industry: "${quickIndustry}"` : ''}

Return ONLY this JSON structure (no other text):
{
  "businessName": "The business name (infer professional name if not specified)",
  "industry": "exact industry key from available list",
  "location": {
    "city": "city or null",
    "state": "state/province or null",
    "country": "country (default USA)"
  },
  "targetAudience": "primary audience (e.g., 'families', 'young professionals', 'businesses')",
  "tone": "brand voice (e.g., 'professional', 'friendly', 'luxurious', 'energetic')",
  "pages": ["array of 5-8 page names"],
  "modules": ["array of module names from available list"],
  "colorOverride": {
    "useDefault": true,
    "primary": "#hex or null",
    "accent": "#hex or null"
  },
  "layoutPreference": "preferred layout style or null",
  "effects": ["suggested effects from industry config"],
  "specialFeatures": {
    "hasBooking": true/false,
    "hasEcommerce": true/false,
    "hasPortfolio": true/false,
    "hasBlog": true/false
  },
  "inferredDetails": {
    "tagline": "a catchy tagline for the business",
    "heroHeadline": "compelling headline for homepage",
    "callToAction": "primary CTA text",
    "uniqueSellingPoints": ["3-4 key differentiators"]
  },
  "confidence": "high/medium/low"
}`;

  try {
    const startTime = Date.now();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    });

    const durationMs = Date.now() - startTime;
    console.log(`[orchestrator] Claude response in ${durationMs}ms`);

    // Extract JSON from response
    const responseText = response.content[0]?.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const aiConfig = JSON.parse(jsonMatch[0]);
    console.log(`[orchestrator] Inferred: ${aiConfig.businessName} (${aiConfig.industry})`);

    // Validate and fill in any missing pieces
    const industry = VALID_INDUSTRIES.includes(aiConfig.industry)
      ? aiConfig.industry
      : (quickIndustry || 'consulting');

    const industryConfig = INDUSTRIES[industry] || INDUSTRIES['consulting'];
    const category = getIndustryCategory(industry);

    // Build the final payload for /api/assemble
    const assemblePayload = {
      // Core required fields
      name: aiConfig.businessName || quickBusinessName || 'New Business',
      industry: industry,

      // Theme configuration
      theme: {
        colors: aiConfig.colorOverride?.useDefault !== false
          ? industryConfig.colors
          : {
              ...industryConfig.colors,
              primary: aiConfig.colorOverride?.primary || industryConfig.colors.primary,
              accent: aiConfig.colorOverride?.accent || industryConfig.colors.accent
            },
        typography: industryConfig.typography,
        layout: aiConfig.layoutPreference || industryConfig.defaultLayout,
        effects: aiConfig.effects?.length > 0 ? aiConfig.effects : industryConfig.effects
      },

      // Content configuration
      description: aiConfig.inferredDetails?.tagline || industryConfig.vibe,

      // Location
      location: aiConfig.location?.city ? aiConfig.location : null,

      // Pages and modules
      pages: aiConfig.pages?.length > 0
        ? aiConfig.pages
        : PAGE_RECOMMENDATIONS[category] || PAGE_RECOMMENDATIONS.default,

      modules: aiConfig.modules?.length > 0
        ? aiConfig.modules
        : MODULE_RECOMMENDATIONS[industry] || MODULE_RECOMMENDATIONS.default,

      // Additional metadata
      metadata: {
        orchestratorVersion: '1.0',
        generatedAt: new Date().toISOString(),
        confidence: aiConfig.confidence || 'medium',
        targetAudience: aiConfig.targetAudience,
        tone: aiConfig.tone,
        specialFeatures: aiConfig.specialFeatures,
        inferredDetails: aiConfig.inferredDetails,
        originalInput: input,
        processingTimeMs: durationMs,
        tokenUsage: response.usage
      },

      // Auto-deploy setting (can be overridden by caller)
      autoDeploy: false,

      // Reference the industry config for the generator
      industryConfig: {
        name: industryConfig.name,
        icon: industryConfig.icon,
        category: industryConfig.category,
        vibe: industryConfig.vibe,
        visualPrompt: industryConfig.visualPrompt,
        imagery: industryConfig.imagery
      }
    };

    return {
      success: true,
      payload: assemblePayload,
      summary: {
        businessName: assemblePayload.name,
        industry: industry,
        industryName: industryConfig.name,
        pages: assemblePayload.pages.length,
        modules: assemblePayload.modules.length,
        location: aiConfig.location?.city
          ? `${aiConfig.location.city}${aiConfig.location.state ? ', ' + aiConfig.location.state : ''}`
          : 'Not specified',
        confidence: aiConfig.confidence
      }
    };

  } catch (error) {
    console.error('[orchestrator] Error:', error.message);

    // Fallback to local inference if Claude fails
    if (quickIndustry || quickBusinessName) {
      console.log('[orchestrator] Using fallback local inference');

      const industry = quickIndustry || 'consulting';
      const industryConfig = INDUSTRIES[industry] || INDUSTRIES['consulting'];
      const category = getIndustryCategory(industry);

      return {
        success: true,
        payload: {
          name: quickBusinessName || 'New Business',
          industry: industry,
          theme: {
            colors: industryConfig.colors,
            typography: industryConfig.typography,
            layout: industryConfig.defaultLayout,
            effects: industryConfig.effects
          },
          description: industryConfig.vibe,
          pages: PAGE_RECOMMENDATIONS[category] || PAGE_RECOMMENDATIONS.default,
          modules: MODULE_RECOMMENDATIONS[industry] || MODULE_RECOMMENDATIONS.default,
          autoDeploy: false,
          metadata: {
            orchestratorVersion: '1.0',
            generatedAt: new Date().toISOString(),
            confidence: 'low',
            fallbackUsed: true,
            originalInput: input,
            error: error.message
          },
          industryConfig: {
            name: industryConfig.name,
            icon: industryConfig.icon,
            category: industryConfig.category,
            vibe: industryConfig.vibe,
            visualPrompt: industryConfig.visualPrompt,
            imagery: industryConfig.imagery
          }
        },
        summary: {
          businessName: quickBusinessName || 'New Business',
          industry: industry,
          industryName: industryConfig.name,
          pages: (PAGE_RECOMMENDATIONS[category] || PAGE_RECOMMENDATIONS.default).length,
          modules: (MODULE_RECOMMENDATIONS[industry] || MODULE_RECOMMENDATIONS.default).length,
          location: 'Not specified',
          confidence: 'low',
          fallbackUsed: true
        }
      };
    }

    throw new Error(`Orchestration failed: ${error.message}`);
  }
}

/**
 * Validate an orchestrator result before sending to assemble
 */
function validatePayload(payload) {
  const errors = [];

  if (!payload.name || payload.name.length < 2) {
    errors.push('Business name is required (min 2 characters)');
  }

  if (!payload.industry || !VALID_INDUSTRIES.includes(payload.industry)) {
    errors.push(`Invalid industry. Must be one of: ${VALID_INDUSTRIES.slice(0, 10).join(', ')}...`);
  }

  if (!payload.pages || !Array.isArray(payload.pages) || payload.pages.length < 1) {
    errors.push('At least one page is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get a preview of what the orchestrator would generate
 * Useful for showing users before committing
 */
async function preview(userInput) {
  const result = await orchestrate(userInput);

  return {
    businessName: result.summary.businessName,
    industry: result.summary.industryName,
    pages: result.payload.pages,
    modules: result.payload.modules,
    colors: result.payload.theme.colors,
    tagline: result.payload.metadata?.inferredDetails?.tagline,
    confidence: result.summary.confidence
  };
}

module.exports = {
  orchestrate,
  validatePayload,
  preview,
  VALID_INDUSTRIES,
  INDUSTRY_KEYWORDS
};
