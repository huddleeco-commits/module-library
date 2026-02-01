/**
 * AI Composer Service - Enhanced
 *
 * Uses Claude to make intelligent, location-aware composition decisions:
 * - Analyzes business location for neighborhood vibe
 * - Selects archetype based on business personality
 * - Chooses section order and variants
 * - Recommends color palette and imagery style
 * - Creates a cohesive visual strategy
 */

const fs = require('fs');
const path = require('path');

// Load configuration files
const PROMPTS_DIR = path.join(__dirname, '../../../prompts');

let SECTIONS = {};
let INDUSTRIES = {};

try {
  SECTIONS = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, 'sections.json'), 'utf-8'));
} catch (e) {
  console.warn('Could not load sections.json:', e.message);
}

try {
  INDUSTRIES = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, 'industries.json'), 'utf-8'));
} catch (e) {
  console.warn('Could not load industries.json:', e.message);
}

class AIComposer {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.client = null;
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = { info: '🎨', success: '✅', warn: '⚠️', error: '❌', location: '📍', visual: '🖼️' }[type] || '🎨';
      console.log(`${prefix} [AIComposer] ${message}`);
    }
  }

  async initClient() {
    if (this.client) return this.client;

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('No Claude API key found. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY.');
    }

    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    this.client = new Anthropic({ apiKey });
    return this.client;
  }

  /**
   * Get available sections for AI to choose from
   */
  getAvailableSections() {
    return Object.entries(SECTIONS).map(([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
      elements: config.elements || []
    }));
  }

  /**
   * Get industry guidance for a specific industry
   */
  getIndustryGuidance(industryKey) {
    const industry = INDUSTRIES[industryKey];
    if (!industry) return null;

    return {
      name: industry.name,
      vibe: industry.vibe,
      suggestedSections: industry.sections || [],
      colors: industry.colors,
      typography: industry.typography,
      imagery: industry.imagery,
      visualPrompt: industry.visualPrompt
    };
  }

  /**
   * Main composition method - AI analyzes location & creates unique visual strategy
   */
  async compose(businessInfo, industryKey, options = {}) {
    this.log(`Composing unique site for: ${businessInfo.name}`);

    const client = await this.initClient();
    const availableSections = this.getAvailableSections();
    const industryGuidance = this.getIndustryGuidance(industryKey);

    // Build rich context about the business
    const locationContext = this.parseLocation(businessInfo.address);

    const systemPrompt = `You are an expert creative director and web designer.
Your job is to create a UNIQUE, visually distinctive website composition.

You must analyze:
1. LOCATION CONTEXT - What neighborhood is this? Urban? Suburban? Upscale? Family-friendly?
2. BUSINESS PERSONALITY - Based on name, rating, reviews - what's their vibe?
3. COMPETITIVE POSITIONING - How should they stand out?

Available sections (choose 5-8):
${availableSections.map(s => `- ${s.id}: ${s.description}`).join('\n')}

Available archetypes:
- "luxury": Editorial, elegant, lots of whitespace, serif fonts, muted colors
- "local": Warm, community-focused, friendly, family feel
- "ecommerce": Conversion-focused, bold CTAs, product-forward

Hero styles:
- "carousel": Multiple slides, good for showcasing variety
- "fullscreen": Single powerful image, minimal text
- "split": Image on one side, text on other
- "video": Background video (premium feel)
- "minimal": Clean, text-focused, sophisticated

${industryGuidance ? `
Industry guidance for ${industryGuidance.name}:
- Typical vibe: ${industryGuidance.vibe}
- Common sections: ${industryGuidance.suggestedSections.join(', ')}
BUT DON'T JUST USE DEFAULTS - make creative choices based on THIS specific business.
` : ''}

IMPORTANT: Your choices should feel INTENTIONAL and UNIQUE to this business.
A bakery in a trendy urban area should look DIFFERENT from one in a family suburb.`;

    const userPrompt = `Analyze this business and create a unique visual strategy:

BUSINESS: ${businessInfo.name}
INDUSTRY: ${industryKey}
${businessInfo.address ? `ADDRESS: ${businessInfo.address}` : ''}
${locationContext.city ? `CITY: ${locationContext.city}, ${locationContext.state}` : ''}
${locationContext.neighborhood ? `AREA TYPE: ${locationContext.neighborhood}` : ''}
${businessInfo.description ? `DESCRIPTION: ${businessInfo.description}` : ''}
${businessInfo.rating ? `RATING: ${businessInfo.rating} stars (${businessInfo.reviewCount || 0} reviews)` : ''}
${businessInfo.priceLevel ? `PRICE LEVEL: ${businessInfo.priceLevel}` : ''}

STEP 1: Analyze the location and business
- What type of neighborhood is this? (upscale, family, trendy, traditional, etc.)
- What personality does the business name suggest?
- What would make them stand out in their area?

STEP 2: Choose visual strategy
Return JSON with your creative decisions:

{
  "locationAnalysis": {
    "neighborhoodType": "upscale|family|trendy|traditional|mixed",
    "vibeInsight": "1 sentence about the area's feel",
    "competitiveAdvantage": "what would make them stand out"
  },
  "archetype": "luxury|local|ecommerce",
  "archetypeReason": "why this archetype fits",
  "heroStyle": "carousel|fullscreen|split|video|minimal",
  "heroReason": "why this hero style",
  "sections": [
    { "id": "hero-carousel", "reason": "why" },
    { "id": "story-section", "reason": "why" }
  ],
  "colorStrategy": {
    "mood": "warm|cool|neutral|bold|elegant|earthy",
    "suggestion": "specific color direction, e.g. 'warm cream and chocolate browns' or 'clean whites with gold accents'",
    "avoidColors": ["colors that wouldn't work"]
  },
  "typographyStrategy": {
    "headingStyle": "serif|sans|display",
    "bodyStyle": "serif|sans",
    "mood": "elegant|friendly|modern|classic",
    "reason": "why this typography"
  },
  "imageryGuidance": {
    "style": "bright-airy|moody-dark|natural-light|high-contrast|soft-muted",
    "subjects": ["what should be in photos"],
    "avoid": ["what to avoid in imagery"]
  },
  "uniqueElements": ["special features for this business"],
  "creativeBrief": "2-3 sentence creative direction that captures the unique vision"
}`;

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const content = response.content[0].text;

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON in AI response');
      }

      const composition = JSON.parse(jsonMatch[0]);

      // Log the creative decisions
      this.log(`Location: ${composition.locationAnalysis?.neighborhoodType || 'analyzed'}`, 'location');
      this.log(`Archetype: ${composition.archetype} - ${composition.archetypeReason}`, 'visual');
      this.log(`Hero: ${composition.heroStyle} - ${composition.heroReason}`, 'visual');
      this.log(`Colors: ${composition.colorStrategy?.suggestion}`, 'visual');
      this.log(`Creative brief: ${composition.creativeBrief}`, 'success');

      // Track token usage for cost estimation
      composition._usage = {
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        estimatedCost: this.estimateCost(response.usage)
      };

      return composition;

    } catch (error) {
      this.log(`Composition failed: ${error.message}`, 'error');
      return this.getFallbackComposition(industryKey);
    }
  }

  /**
   * Parse location string for context
   */
  parseLocation(address) {
    if (!address) return {};

    const result = {
      raw: address,
      city: null,
      state: null,
      neighborhood: null
    };

    // Try to extract city, state from address
    // Common formats: "123 Main St, City, ST 12345" or "City, ST"
    const cityStateMatch = address.match(/,\s*([^,]+),\s*([A-Z]{2})\s*\d*/);
    if (cityStateMatch) {
      result.city = cityStateMatch[1].trim();
      result.state = cityStateMatch[2];
    }

    // Detect neighborhood hints from address keywords
    const upscaleKeywords = ['plaza', 'gallery', 'heights', 'hills', 'park', 'village', 'square'];
    const familyKeywords = ['family', 'meadow', 'creek', 'grove', 'ranch'];
    const urbanKeywords = ['downtown', 'center', 'central', 'market', 'district'];
    const trendyKeywords = ['arts', 'design', 'loft', 'studio', 'quarter'];

    const lowerAddress = address.toLowerCase();

    if (upscaleKeywords.some(k => lowerAddress.includes(k))) {
      result.neighborhood = 'upscale';
    } else if (urbanKeywords.some(k => lowerAddress.includes(k))) {
      result.neighborhood = 'urban';
    } else if (trendyKeywords.some(k => lowerAddress.includes(k))) {
      result.neighborhood = 'trendy';
    } else if (familyKeywords.some(k => lowerAddress.includes(k))) {
      result.neighborhood = 'family';
    }

    return result;
  }

  /**
   * Fallback composition using industry defaults
   */
  getFallbackComposition(industryKey) {
    const guidance = this.getIndustryGuidance(industryKey);

    const defaultSections = guidance?.suggestedSections || [
      'hero', 'features', 'about', 'testimonials', 'contact'
    ];

    return {
      archetype: 'local',
      heroStyle: 'standard',
      sections: defaultSections.map(id => ({ id, reason: 'Industry default' })),
      colorStrategy: { mood: 'warm', suggestion: 'Warm, welcoming colors' },
      typographyStrategy: { headingStyle: 'sans', bodyStyle: 'sans', mood: 'friendly' },
      imageryGuidance: { style: 'bright-airy', subjects: ['products', 'interior'], avoid: [] },
      uniqueElements: [],
      creativeBrief: 'Using industry-standard layout as fallback',
      _fallback: true
    };
  }

  /**
   * Estimate API cost from usage
   */
  estimateCost(usage) {
    if (!usage) return 0;
    const inputCost = (usage.input_tokens || 0) * 0.003 / 1000;
    const outputCost = (usage.output_tokens || 0) * 0.015 / 1000;
    return inputCost + outputCost;
  }
}

module.exports = { AIComposer };
