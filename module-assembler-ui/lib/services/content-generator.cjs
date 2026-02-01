/**
 * Content Generation Engine
 *
 * A versatile AI-powered content generation service that creates:
 * - Blog posts and articles
 * - Social media content (Twitter, LinkedIn, Instagram, Facebook)
 * - Email campaigns (newsletters, promotional, transactional)
 * - Product descriptions
 * - Marketing copy (headlines, taglines, CTAs)
 * - SEO content (meta descriptions, keywords)
 *
 * Uses Claude AI with industry-aware prompts and tone customization.
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

/**
 * Content type configurations with default settings
 */
const CONTENT_TYPES = {
  'blog-post': {
    name: 'Blog Post',
    icon: '📝',
    description: 'Long-form articles with SEO optimization',
    defaultLength: 'medium',
    lengths: {
      short: { words: 300, paragraphs: 3 },
      medium: { words: 800, paragraphs: 6 },
      long: { words: 1500, paragraphs: 10 }
    },
    outputFormat: 'markdown'
  },
  'social-twitter': {
    name: 'Twitter/X Post',
    icon: '𝕏',
    description: 'Concise posts with hashtags (280 chars)',
    maxLength: 280,
    includeHashtags: true,
    outputFormat: 'text'
  },
  'social-linkedin': {
    name: 'LinkedIn Post',
    icon: '💼',
    description: 'Professional content with engagement hooks',
    maxLength: 3000,
    includeHashtags: true,
    outputFormat: 'text'
  },
  'social-instagram': {
    name: 'Instagram Caption',
    icon: '📸',
    description: 'Visual-focused captions with emojis and hashtags',
    maxLength: 2200,
    includeHashtags: true,
    includeEmojis: true,
    outputFormat: 'text'
  },
  'social-facebook': {
    name: 'Facebook Post',
    icon: '👍',
    description: 'Engaging posts for community building',
    maxLength: 5000,
    outputFormat: 'text'
  },
  'email-newsletter': {
    name: 'Newsletter',
    icon: '📧',
    description: 'Engaging email newsletters',
    sections: ['subject', 'preview', 'greeting', 'body', 'cta', 'signature'],
    outputFormat: 'html'
  },
  'email-promotional': {
    name: 'Promotional Email',
    icon: '🎯',
    description: 'Sales and promotional emails',
    sections: ['subject', 'preview', 'headline', 'body', 'offer', 'cta', 'urgency'],
    outputFormat: 'html'
  },
  'email-welcome': {
    name: 'Welcome Email',
    icon: '👋',
    description: 'Onboarding welcome emails',
    sections: ['subject', 'preview', 'greeting', 'introduction', 'nextSteps', 'cta'],
    outputFormat: 'html'
  },
  'product-description': {
    name: 'Product Description',
    icon: '🏷️',
    description: 'Compelling product descriptions',
    sections: ['headline', 'shortDescription', 'features', 'benefits', 'specifications'],
    outputFormat: 'json'
  },
  'marketing-headline': {
    name: 'Headlines & Taglines',
    icon: '✨',
    description: 'Attention-grabbing headlines',
    variants: 5,
    outputFormat: 'json'
  },
  'seo-meta': {
    name: 'SEO Metadata',
    icon: '🔍',
    description: 'Meta titles, descriptions, and keywords',
    outputFormat: 'json'
  },
  'ad-copy': {
    name: 'Ad Copy',
    icon: '📢',
    description: 'Google, Facebook, and display ad copy',
    platforms: ['google', 'facebook', 'display'],
    outputFormat: 'json'
  }
};

/**
 * Tone presets for content generation
 */
const TONE_PRESETS = {
  professional: {
    name: 'Professional',
    description: 'Formal, authoritative, trustworthy',
    systemPromptAddition: 'Write in a professional, authoritative tone. Use industry terminology appropriately. Maintain formality while being approachable.'
  },
  casual: {
    name: 'Casual',
    description: 'Friendly, conversational, relatable',
    systemPromptAddition: 'Write in a casual, friendly tone. Use conversational language. Be relatable and approachable.'
  },
  witty: {
    name: 'Witty',
    description: 'Clever, humorous, memorable',
    systemPromptAddition: 'Write with wit and subtle humor. Be clever without being unprofessional. Make the content memorable through wordplay or unexpected angles.'
  },
  inspirational: {
    name: 'Inspirational',
    description: 'Motivating, empowering, uplifting',
    systemPromptAddition: 'Write in an inspirational, motivating tone. Empower the reader. Use uplifting language that drives action.'
  },
  urgent: {
    name: 'Urgent',
    description: 'Time-sensitive, action-oriented',
    systemPromptAddition: 'Create a sense of urgency. Use time-sensitive language. Emphasize scarcity and immediate action benefits.'
  },
  educational: {
    name: 'Educational',
    description: 'Informative, clear, helpful',
    systemPromptAddition: 'Write in an educational, informative tone. Explain concepts clearly. Be helpful and thorough.'
  },
  luxurious: {
    name: 'Luxurious',
    description: 'Premium, exclusive, sophisticated',
    systemPromptAddition: 'Write for a premium audience. Use sophisticated, exclusive language. Emphasize quality, craftsmanship, and exclusivity.'
  }
};

/**
 * Content Generation Engine class
 */
class ContentGenerator {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.client = null;
    this.model = options.model || 'claude-sonnet-4-20250514';
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = { info: '📝', success: '✅', warn: '⚠️', error: '❌', generate: '🤖' }[type] || '📝';
      console.log(`${prefix} [ContentGenerator] ${message}`);
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
   * Generate content based on type and parameters
   * @param {string} contentType - Type of content to generate (e.g., 'blog-post', 'social-twitter')
   * @param {Object} params - Generation parameters
   * @returns {Object} Generated content with metadata
   */
  async generate(contentType, params) {
    const {
      topic,
      businessInfo = {},
      industryKey = 'general',
      tone = 'professional',
      targetAudience = 'general',
      keywords = [],
      length = 'medium',
      customInstructions = '',
      variants = 1
    } = params;

    if (!topic) {
      throw new Error('Topic is required for content generation');
    }

    const typeConfig = CONTENT_TYPES[contentType];
    if (!typeConfig) {
      throw new Error(`Unknown content type: ${contentType}. Available types: ${Object.keys(CONTENT_TYPES).join(', ')}`);
    }

    this.log(`Generating ${typeConfig.name}: "${topic.substring(0, 50)}..."`, 'generate');

    const client = await this.initClient();
    const industry = INDUSTRIES[industryKey] || {};
    const toneConfig = TONE_PRESETS[tone] || TONE_PRESETS.professional;

    // Build the system prompt
    const systemPrompt = this.buildSystemPrompt(contentType, typeConfig, industry, toneConfig, businessInfo);

    // Build the user prompt
    const userPrompt = this.buildUserPrompt(contentType, typeConfig, {
      topic,
      businessInfo,
      industryKey,
      targetAudience,
      keywords,
      length,
      customInstructions,
      variants
    });

    try {
      const response = await client.messages.create({
        model: this.model,
        max_tokens: this.getMaxTokens(contentType, length),
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const rawContent = response.content[0].text;
      const parsedContent = this.parseResponse(contentType, typeConfig, rawContent);

      this.log(`Generated ${contentType} successfully`, 'success');

      return {
        success: true,
        contentType,
        content: parsedContent,
        metadata: {
          topic,
          tone,
          industryKey,
          targetAudience,
          keywords,
          generatedAt: new Date().toISOString(),
          model: this.model
        },
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
          estimatedCost: this.estimateCost(response.usage)
        }
      };

    } catch (error) {
      this.log(`Content generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Build system prompt based on content type
   */
  buildSystemPrompt(contentType, typeConfig, industry, toneConfig, businessInfo) {
    let systemPrompt = `You are an expert content creator and copywriter. You create high-quality, engaging content that converts.

${toneConfig.systemPromptAddition}

Industry context: ${industry.name || 'General'}
Industry vibe: ${industry.vibe || 'Professional and engaging'}
${businessInfo.name ? `Business: ${businessInfo.name}` : ''}
${businessInfo.description ? `Business description: ${businessInfo.description}` : ''}

Guidelines:
- Write authentic, human-sounding content (never generic or robotic)
- Optimize for the specific platform and format
- Include relevant calls-to-action where appropriate
- Follow best practices for ${typeConfig.name}`;

    // Add content-type specific guidelines
    switch (contentType) {
      case 'blog-post':
        systemPrompt += `
- Use proper heading hierarchy (H2, H3)
- Include an engaging introduction hook
- Break up text with subheadings and bullet points
- End with a clear conclusion or CTA`;
        break;

      case 'social-twitter':
        systemPrompt += `
- Keep within 280 characters
- Make it shareable and engaging
- Use 1-3 relevant hashtags
- Consider thread potential for complex topics`;
        break;

      case 'social-linkedin':
        systemPrompt += `
- Start with a hook that stops the scroll
- Use line breaks for readability
- Include professional insights
- End with a question or CTA to drive engagement`;
        break;

      case 'email-newsletter':
      case 'email-promotional':
      case 'email-welcome':
        systemPrompt += `
- Write compelling subject lines (40-60 chars)
- Preview text should complement, not repeat, subject
- Keep paragraphs short (2-3 sentences)
- Include clear, single CTA`;
        break;

      case 'product-description':
        systemPrompt += `
- Lead with benefits, follow with features
- Use sensory language where appropriate
- Address potential objections
- Include specifications in structured format`;
        break;

      case 'ad-copy':
        systemPrompt += `
- Follow platform character limits strictly
- Focus on one key benefit per ad
- Include urgency or exclusivity
- Use strong action verbs`;
        break;
    }

    return systemPrompt;
  }

  /**
   * Build user prompt based on content type
   */
  buildUserPrompt(contentType, typeConfig, params) {
    const { topic, businessInfo, industryKey, targetAudience, keywords, length, customInstructions, variants } = params;

    let prompt = `Create ${typeConfig.name} about: ${topic}

Target audience: ${targetAudience}
${keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''}
${customInstructions ? `Additional instructions: ${customInstructions}` : ''}`;

    // Add type-specific prompts
    switch (contentType) {
      case 'blog-post':
        const lengthConfig = typeConfig.lengths[length] || typeConfig.lengths.medium;
        prompt += `

Length: Approximately ${lengthConfig.words} words, ${lengthConfig.paragraphs} main sections.

Return the blog post in Markdown format with:
- An engaging title (H1)
- Meta description (for SEO)
- Introduction paragraph
- Main content with H2 subheadings
- Conclusion with CTA

Format as:
---
title: [Title]
metaDescription: [Meta description]
---

[Content in Markdown]`;
        break;

      case 'social-twitter':
        prompt += `

Generate ${variants} tweet variations. Each must be under 280 characters including hashtags.

Return as JSON:
{
  "tweets": [
    { "text": "Tweet text with #hashtags", "characterCount": 123 }
  ]
}`;
        break;

      case 'social-linkedin':
        prompt += `

Generate a LinkedIn post (${variants > 1 ? variants + ' variations' : '1 variation'}).

Return as JSON:
{
  "posts": [
    {
      "content": "Post content with line breaks for readability",
      "hashtags": ["relevant", "hashtags"],
      "hook": "The opening line"
    }
  ]
}`;
        break;

      case 'social-instagram':
        prompt += `

Generate an Instagram caption with emojis and hashtags.

Return as JSON:
{
  "caption": "Caption text with emojis 🎉",
  "hashtags": ["hashtag1", "hashtag2"],
  "suggestedImageConcept": "Description of ideal image"
}`;
        break;

      case 'email-newsletter':
        prompt += `

Create a newsletter email.

Return as JSON:
{
  "subject": "Email subject line",
  "previewText": "Preview text shown in inbox",
  "greeting": "Opening greeting",
  "body": ["Array of", "body paragraphs"],
  "cta": { "text": "Button text", "context": "Text around CTA" },
  "signature": "Closing signature"
}`;
        break;

      case 'email-promotional':
        prompt += `

Create a promotional email.

Return as JSON:
{
  "subject": "Email subject line",
  "previewText": "Preview text",
  "headline": "Main headline",
  "body": ["Array of", "body paragraphs"],
  "offer": { "title": "Offer headline", "description": "Offer details", "value": "Discount/value" },
  "cta": { "primary": "Main CTA text", "secondary": "Secondary CTA text" },
  "urgency": "Urgency message (deadline, limited, etc.)"
}`;
        break;

      case 'email-welcome':
        prompt += `

Create a welcome/onboarding email.

Return as JSON:
{
  "subject": "Welcome subject line",
  "previewText": "Preview text",
  "greeting": "Personalized greeting",
  "introduction": "Welcome message",
  "nextSteps": ["Step 1", "Step 2", "Step 3"],
  "cta": { "text": "Get started button text", "url": "suggested URL path" }
}`;
        break;

      case 'product-description':
        prompt += `

Create a product description.

Return as JSON:
{
  "headline": "Attention-grabbing headline",
  "shortDescription": "1-2 sentence summary",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "useCases": ["Use case 1", "Use case 2"],
  "specifications": { "key": "value" },
  "seoKeywords": ["keyword1", "keyword2"]
}`;
        break;

      case 'marketing-headline':
        const numVariants = variants || typeConfig.variants;
        prompt += `

Generate ${numVariants} headline/tagline variations.

Return as JSON:
{
  "headlines": [
    { "text": "Headline text", "type": "benefit|curiosity|urgency|social-proof", "characterCount": 50 }
  ],
  "taglines": [
    { "text": "Short tagline", "characterCount": 30 }
  ]
}`;
        break;

      case 'seo-meta':
        prompt += `

Generate SEO metadata.

Return as JSON:
{
  "title": "SEO title (50-60 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "h1": "Suggested H1 heading",
  "keywords": {
    "primary": "main keyword",
    "secondary": ["keyword2", "keyword3"],
    "longtail": ["long tail phrase 1", "long tail phrase 2"]
  },
  "schema": {
    "type": "Article|Product|LocalBusiness|etc",
    "suggestedProperties": ["property1", "property2"]
  }
}`;
        break;

      case 'ad-copy':
        prompt += `

Generate ad copy for multiple platforms.

Return as JSON:
{
  "google": {
    "headlines": ["Headline 1 (30 chars)", "Headline 2", "Headline 3"],
    "descriptions": ["Description 1 (90 chars)", "Description 2"]
  },
  "facebook": {
    "primaryText": "Main ad text",
    "headline": "Ad headline",
    "description": "Link description"
  },
  "display": {
    "headline": "Banner headline",
    "subheadline": "Supporting text",
    "cta": "Button text"
  }
}`;
        break;
    }

    return prompt;
  }

  /**
   * Parse the AI response based on content type
   */
  parseResponse(contentType, typeConfig, rawContent) {
    if (typeConfig.outputFormat === 'markdown' || typeConfig.outputFormat === 'text') {
      return rawContent.trim();
    }

    // For JSON responses, extract and parse
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      this.log(`JSON parsing failed, returning raw content`, 'warn');
    }

    return rawContent.trim();
  }

  /**
   * Get max tokens based on content type and length
   */
  getMaxTokens(contentType, length) {
    const baseTokens = {
      'blog-post': { short: 1000, medium: 2500, long: 5000 },
      'social-twitter': { short: 200, medium: 200, long: 200 },
      'social-linkedin': { short: 500, medium: 800, long: 1200 },
      'social-instagram': { short: 400, medium: 600, long: 800 },
      'social-facebook': { short: 500, medium: 1000, long: 1500 },
      'email-newsletter': { short: 800, medium: 1500, long: 2500 },
      'email-promotional': { short: 600, medium: 1000, long: 1500 },
      'email-welcome': { short: 500, medium: 800, long: 1200 },
      'product-description': { short: 500, medium: 1000, long: 1500 },
      'marketing-headline': { short: 500, medium: 800, long: 1000 },
      'seo-meta': { short: 500, medium: 800, long: 1000 },
      'ad-copy': { short: 600, medium: 1000, long: 1500 }
    };

    return baseTokens[contentType]?.[length] || 1500;
  }

  /**
   * Estimate API cost
   */
  estimateCost(usage) {
    if (!usage) return 0;
    // Claude Sonnet pricing (as of 2024)
    const inputCost = (usage.input_tokens || 0) * 0.003 / 1000;
    const outputCost = (usage.output_tokens || 0) * 0.015 / 1000;
    return inputCost + outputCost;
  }

  /**
   * Generate a full content package (multiple types at once)
   */
  async generateContentPackage(params) {
    const {
      topic,
      businessInfo = {},
      industryKey = 'general',
      tone = 'professional',
      targetAudience = 'general',
      keywords = [],
      contentTypes = ['blog-post', 'social-twitter', 'social-linkedin', 'seo-meta']
    } = params;

    this.log(`Generating content package with ${contentTypes.length} types`, 'generate');

    const results = {};
    const errors = [];

    // Generate each content type
    for (const contentType of contentTypes) {
      try {
        const result = await this.generate(contentType, {
          topic,
          businessInfo,
          industryKey,
          tone,
          targetAudience,
          keywords,
          variants: contentType.startsWith('social-') ? 3 : 1
        });
        results[contentType] = result;
      } catch (error) {
        this.log(`Failed to generate ${contentType}: ${error.message}`, 'error');
        errors.push({ contentType, error: error.message });
      }
    }

    return {
      success: errors.length === 0,
      topic,
      results,
      errors: errors.length > 0 ? errors : undefined,
      totalUsage: this.calculateTotalUsage(results)
    };
  }

  /**
   * Calculate total token usage across multiple generations
   */
  calculateTotalUsage(results) {
    let totalInput = 0;
    let totalOutput = 0;
    let totalCost = 0;

    for (const result of Object.values(results)) {
      if (result.usage) {
        totalInput += result.usage.inputTokens || 0;
        totalOutput += result.usage.outputTokens || 0;
        totalCost += result.usage.estimatedCost || 0;
      }
    }

    return {
      inputTokens: totalInput,
      outputTokens: totalOutput,
      totalTokens: totalInput + totalOutput,
      estimatedCost: totalCost
    };
  }

  /**
   * Get available content types
   */
  static getContentTypes() {
    return CONTENT_TYPES;
  }

  /**
   * Get available tones
   */
  static getTonePresets() {
    return TONE_PRESETS;
  }
}

module.exports = {
  ContentGenerator,
  CONTENT_TYPES,
  TONE_PRESETS
};
