/**
 * AI Pipeline Service
 *
 * Orchestrates the AI generation levels:
 * - Level 0: Test Mode (no AI, uses fixtures)
 * - Level 1: AI Composer (picks sections/layout)
 * - Level 2: AI Content (writes copy)
 * - Level 3: Composer + Content
 * - Level 4: Full Freedom (composer + content + color/typography tweaks)
 *
 * This service sits between the unified-generate endpoint and the generators,
 * enhancing the configuration based on the AI level selected.
 */

const { AIComposer } = require('./ai-composer.cjs');
const { AIContent } = require('./ai-content.cjs');

// AI Level definitions
const AI_LEVELS = {
  0: { name: 'Test Mode', composer: false, content: false, fullFreedom: false },
  1: { name: 'AI Composer', composer: true, content: false, fullFreedom: false },
  2: { name: 'AI Content', composer: false, content: true, fullFreedom: false },
  3: { name: 'Composer + Content', composer: true, content: true, fullFreedom: false },
  4: { name: 'Full Freedom', composer: true, content: true, fullFreedom: true }
};

class AIPipeline {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.composer = new AIComposer({ verbose: this.verbose });
    this.contentGenerator = new AIContent({ verbose: this.verbose });
    this.totalCost = 0;
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = { info: '🔮', success: '✅', warn: '⚠️', error: '❌', cost: '💰' }[type] || '🔮';
      console.log(`${prefix} [AIPipeline] ${message}`);
    }
  }

  /**
   * Main enhancement method - called before generation
   *
   * @param {Object} config - Current generation config
   * @param {Object} prospect - Prospect data
   * @param {number} aiLevel - AI level (0-4)
   * @param {Function} onProgress - Progress callback
   * @returns {Object} Enhanced config with AI decisions
   */
  async enhance(config, prospect, aiLevel = 0, onProgress = () => {}) {
    const level = AI_LEVELS[aiLevel] || AI_LEVELS[0];
    this.log(`Enhancing with ${level.name} (Level ${aiLevel})`);
    this.totalCost = 0;

    // Level 0: No AI, return config as-is
    if (aiLevel === 0) {
      this.log('Test mode - no AI enhancement', 'info');
      return { ...config, aiEnhanced: false, aiLevel: 0 };
    }

    const enhanced = { ...config, aiEnhanced: true, aiLevel };
    const industryKey = prospect.fixtureId || 'restaurant';

    // Level 1 or 3 or 4: Run AI Composer
    if (level.composer) {
      onProgress({ step: 'ai-composer', status: 'AI is designing site structure...', progress: 15 });

      try {
        const composition = await this.composer.compose(
          {
            name: prospect.name,
            address: prospect.address,
            description: prospect.description,
            rating: prospect.rating,
            reviewCount: prospect.reviewCount
          },
          industryKey
        );

        enhanced.aiComposition = composition;
        enhanced.heroStyle = composition.heroStyle;
        enhanced.sectionOrder = composition.sections?.map(s => s.id) || [];
        enhanced.creativeBrief = composition.creativeBrief;

        // Extract archetype (AI picks the best one for this business)
        enhanced.aiArchetype = composition.archetype;
        enhanced.aiArchetypeReason = composition.archetypeReason;

        // Extract visual strategy
        enhanced.aiColorStrategy = composition.colorStrategy;
        enhanced.aiTypographyStrategy = composition.typographyStrategy;
        enhanced.aiImageryGuidance = composition.imageryGuidance;
        enhanced.aiLocationAnalysis = composition.locationAnalysis;

        if (composition._usage) {
          this.totalCost += composition._usage.estimatedCost || 0;
          this.log(`Composer cost: $${composition._usage.estimatedCost?.toFixed(4)}`, 'cost');
        }

        this.log(`Archetype: ${composition.archetype} (${composition.archetypeReason})`, 'success');
        this.log(`Colors: ${composition.colorStrategy?.suggestion}`, 'success');
        this.log(`Composed ${enhanced.sectionOrder.length} sections`, 'success');

      } catch (error) {
        this.log(`Composer failed: ${error.message}`, 'error');
        // Continue without composition
      }
    }

    // Level 2 or 3 or 4: Run AI Content
    if (level.content) {
      onProgress({ step: 'ai-content', status: 'AI is writing content...', progress: 25 });

      try {
        const content = await this.contentGenerator.generateContent(
          {
            name: prospect.name,
            address: prospect.address,
            phone: prospect.phone,
            description: prospect.description,
            rating: prospect.rating,
            reviewCount: prospect.reviewCount,
            hours: prospect.hours
          },
          industryKey
        );

        enhanced.aiContent = content;

        if (content._usage) {
          this.totalCost += content._usage.estimatedCost || 0;
          this.log(`Content cost: $${content._usage.estimatedCost?.toFixed(4)}`, 'cost');
        }

        this.log('Generated custom content', 'success');

        // For food businesses, also generate menu
        const foodIndustries = ['bakery', 'restaurant', 'cafe', 'coffee-cafe', 'pizza-restaurant', 'bar'];
        if (foodIndustries.includes(industryKey)) {
          onProgress({ step: 'ai-menu', status: 'AI is creating menu...', progress: 30 });

          const menuContent = await this.contentGenerator.generateMenuContent(
            { name: prospect.name, address: prospect.address },
            industryKey
          );

          if (menuContent) {
            enhanced.aiMenu = menuContent;
            if (menuContent._usage) {
              this.totalCost += menuContent._usage.estimatedCost || 0;
            }
            this.log('Generated custom menu', 'success');
          }
        }

      } catch (error) {
        this.log(`Content generation failed: ${error.message}`, 'error');
      }
    }

    // Level 4: Full Freedom - additional color/typography tweaks
    if (level.fullFreedom) {
      onProgress({ step: 'ai-styling', status: 'AI is customizing brand styling...', progress: 35 });

      try {
        const brandTweaks = await this.generateBrandTweaks(prospect, industryKey);
        if (brandTweaks) {
          enhanced.aiBrandTweaks = brandTweaks;
          if (brandTweaks._usage) {
            this.totalCost += brandTweaks._usage.estimatedCost || 0;
          }
          this.log('Generated brand customizations', 'success');
        }
      } catch (error) {
        this.log(`Brand tweaks failed: ${error.message}`, 'error');
      }
    }

    enhanced.aiTotalCost = this.totalCost;
    this.log(`Total AI cost: $${this.totalCost.toFixed(4)}`, 'cost');

    return enhanced;
  }

  /**
   * Generate brand-specific color and typography tweaks
   */
  async generateBrandTweaks(prospect, industryKey) {
    const client = await this.contentGenerator.initClient();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: 'You are a brand designer creating custom color and typography recommendations.',
      messages: [{
        role: 'user',
        content: `Suggest brand colors and typography for "${prospect.name}" (${industryKey}).
Consider their location (${prospect.address || 'unknown'}) and vibe.

Return JSON:
{
  "colors": {
    "primary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "reason": "Why these colors"
  },
  "typography": {
    "headingStyle": "serif|sans|display",
    "bodyStyle": "serif|sans",
    "reason": "Why this typography"
  },
  "mood": "Description of overall brand mood"
}`
      }]
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const tweaks = JSON.parse(jsonMatch[0]);
      tweaks._usage = {
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        estimatedCost: (response.usage?.input_tokens || 0) * 0.003 / 1000 +
                       (response.usage?.output_tokens || 0) * 0.015 / 1000
      };
      return tweaks;
    }

    return null;
  }

  /**
   * Apply AI enhancements to fixture data
   * This merges AI-generated content into the fixture
   */
  applyToFixture(fixture, enhancedConfig) {
    if (!enhancedConfig.aiEnhanced) {
      return fixture;
    }

    const enhanced = { ...fixture };

    // Apply AI content if available
    if (enhancedConfig.aiContent) {
      const content = enhancedConfig.aiContent;

      // Override hero content
      if (content.hero) {
        enhanced.hero = {
          ...enhanced.hero,
          headline: content.hero.headline,
          subheadline: content.hero.subheadline,
          ctaText: content.hero.cta,
          secondaryCtaText: content.hero.secondaryCta
        };
      }

      // Override about content
      if (content.about) {
        enhanced.about = {
          ...enhanced.about,
          headline: content.about.headline,
          paragraphs: content.about.paragraphs,
          highlights: content.about.highlights
        };
      }

      // Override SEO
      if (content.seo) {
        enhanced.seo = content.seo;
      }
    }

    // Apply AI menu if available
    if (enhancedConfig.aiMenu?.categories) {
      enhanced.menu = {
        ...enhanced.menu,
        categories: enhancedConfig.aiMenu.categories
      };
    }

    // Apply brand tweaks if available
    if (enhancedConfig.aiBrandTweaks) {
      const tweaks = enhancedConfig.aiBrandTweaks;

      if (tweaks.colors) {
        enhanced.colors = {
          ...enhanced.colors,
          primary: tweaks.colors.primary,
          accent: tweaks.colors.accent,
          background: tweaks.colors.background
        };
      }
    }

    // Mark as AI-enhanced
    enhanced._aiEnhanced = true;
    enhanced._aiLevel = enhancedConfig.aiLevel;
    enhanced._aiCost = enhancedConfig.aiTotalCost;

    return enhanced;
  }

  /**
   * Get cost estimate for an AI level
   */
  static getEstimatedCost(aiLevel) {
    const estimates = {
      0: 0,
      1: 0.15,
      2: 0.40,
      3: 0.55,
      4: 1.00
    };
    return estimates[aiLevel] || 0;
  }
}

module.exports = { AIPipeline, AI_LEVELS };
