/**
 * AI Content Service
 *
 * Uses Claude to generate real, unique content:
 * - Headlines and taglines
 * - About/story text
 * - Service/menu descriptions
 * - CTAs and microcopy
 * - SEO metadata
 *
 * Takes prospect data and generates business-specific content.
 */

const fs = require('fs');
const path = require('path');

// Load industry config for context
const PROMPTS_DIR = path.join(__dirname, '../../../prompts');
let INDUSTRIES = {};

try {
  INDUSTRIES = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, 'industries.json'), 'utf-8'));
} catch (e) {
  console.warn('Could not load industries.json:', e.message);
}

class AIContent {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.client = null;
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = { info: '✍️', success: '✅', warn: '⚠️', error: '❌' }[type] || '✍️';
      console.log(`${prefix} [AIContent] ${message}`);
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
   * Generate all content for a site
   */
  async generateContent(businessInfo, industryKey, options = {}) {
    this.log(`Generating content for: ${businessInfo.name}`);

    const client = await this.initClient();
    const industry = INDUSTRIES[industryKey] || {};

    const systemPrompt = `You are an expert copywriter creating website content for small businesses.
Write compelling, authentic content that:
- Sounds natural and human (not generic or corporate)
- Highlights what makes this specific business unique
- Uses appropriate tone for the industry
- Is concise and scannable for web
- Includes calls-to-action where appropriate

Industry context: ${industry.name || industryKey}
Vibe: ${industry.vibe || 'Professional and welcoming'}`;

    const userPrompt = `Create website content for:

Business: ${businessInfo.name}
Industry: ${industryKey}
${businessInfo.address ? `Location: ${businessInfo.address}` : ''}
${businessInfo.phone ? `Phone: ${businessInfo.phone}` : ''}
${businessInfo.rating ? `Rating: ${businessInfo.rating} stars (${businessInfo.reviewCount || 0} reviews)` : ''}
${businessInfo.description ? `Description: ${businessInfo.description}` : ''}
${businessInfo.hours ? `Hours: ${JSON.stringify(businessInfo.hours)}` : ''}

Generate authentic, unique content. Return JSON:
{
  "hero": {
    "headline": "Main headline (5-10 words, compelling)",
    "subheadline": "Supporting text (15-25 words)",
    "cta": "Primary button text",
    "secondaryCta": "Secondary button text"
  },
  "about": {
    "headline": "About section headline",
    "paragraphs": ["2-3 paragraphs telling their story"],
    "highlights": ["3-4 key differentiators or values"]
  },
  "services": {
    "headline": "Services section headline",
    "intro": "Brief intro paragraph",
    "items": [
      { "name": "Service name", "description": "Brief description" }
    ]
  },
  "testimonialIntro": "Headline for testimonials section",
  "ctaSection": {
    "headline": "Final CTA headline",
    "subtext": "Supporting text",
    "buttonText": "CTA button"
  },
  "seo": {
    "title": "Page title (50-60 chars)",
    "description": "Meta description (150-160 chars)",
    "keywords": ["relevant", "keywords"]
  },
  "microcopy": {
    "menuLink": "Text for menu link",
    "contactLink": "Text for contact link",
    "bookingCta": "Booking button text"
  }
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

      const generatedContent = JSON.parse(jsonMatch[0]);

      this.log(`Generated content with ${Object.keys(generatedContent).length} sections`, 'success');

      // Track usage
      generatedContent._usage = {
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        estimatedCost: this.estimateCost(response.usage)
      };

      return generatedContent;

    } catch (error) {
      this.log(`Content generation failed: ${error.message}`, 'error');
      return this.getFallbackContent(businessInfo, industryKey);
    }
  }

  /**
   * Generate menu/products content specifically
   */
  async generateMenuContent(businessInfo, industryKey, menuType = 'food') {
    this.log(`Generating menu content for: ${businessInfo.name}`);

    const client = await this.initClient();

    const systemPrompt = `You are creating realistic menu/product content for a ${industryKey} business.
Generate items that would realistically be offered by this type of business.
Use appropriate pricing for the location and business type.
Make descriptions appetizing and specific.`;

    const userPrompt = `Create menu items for ${businessInfo.name} (${industryKey}).
${businessInfo.address ? `Location: ${businessInfo.address}` : ''}

Return JSON with 8-12 menu items:
{
  "categories": [
    {
      "name": "Category name",
      "items": [
        {
          "name": "Item name",
          "description": "Appetizing description (10-20 words)",
          "price": 12.99,
          "tags": ["popular", "new", "vegetarian", etc]
        }
      ]
    }
  ]
}`;

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No valid JSON in AI response');
      }

      const menuContent = JSON.parse(jsonMatch[0]);
      menuContent._usage = {
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        estimatedCost: this.estimateCost(response.usage)
      };

      this.log(`Generated ${menuContent.categories?.length || 0} menu categories`, 'success');
      return menuContent;

    } catch (error) {
      this.log(`Menu generation failed: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Fallback content using business name
   */
  getFallbackContent(businessInfo, industryKey) {
    return {
      hero: {
        headline: `Welcome to ${businessInfo.name}`,
        subheadline: `Your trusted ${industryKey} serving the local community with quality and care.`,
        cta: 'Get Started',
        secondaryCta: 'Learn More'
      },
      about: {
        headline: 'Our Story',
        paragraphs: [
          `${businessInfo.name} has been proudly serving our community with dedication and excellence.`,
          `We believe in quality, integrity, and building lasting relationships with our customers.`
        ],
        highlights: ['Quality Service', 'Local Business', 'Customer Focused']
      },
      services: {
        headline: 'What We Offer',
        intro: 'Discover our range of services designed to meet your needs.',
        items: []
      },
      testimonialIntro: 'What Our Customers Say',
      ctaSection: {
        headline: 'Ready to Get Started?',
        subtext: 'Contact us today to learn more about how we can help.',
        buttonText: 'Contact Us'
      },
      seo: {
        title: `${businessInfo.name} | ${industryKey}`,
        description: `${businessInfo.name} - Quality ${industryKey} services in your area.`,
        keywords: [industryKey, businessInfo.name?.split(' ')[0]?.toLowerCase()]
      },
      microcopy: {
        menuLink: 'Our Menu',
        contactLink: 'Contact',
        bookingCta: 'Book Now'
      },
      _fallback: true
    };
  }

  estimateCost(usage) {
    if (!usage) return 0;
    const inputCost = (usage.input_tokens || 0) * 0.003 / 1000;
    const outputCost = (usage.output_tokens || 0) * 0.015 / 1000;
    return inputCost + outputCost;
  }
}

module.exports = { AIContent };
