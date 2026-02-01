/**
 * Content Generator Routes
 *
 * API endpoints for the content generation engine.
 * Handles: generate, generate-package, content-types, tones
 */

const express = require('express');

/**
 * Create content generator routes
 * @param {Object} deps - Dependencies (db for tracking, etc.)
 */
function createContentGeneratorRoutes(deps = {}) {
  const router = express.Router();
  const { db } = deps;

  // Rate limiter for generation endpoints
  const generationRateLimiter = require('express-rate-limit')({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: { success: false, error: 'Too many requests. Please wait a moment before trying again.' }
  });

  /**
   * GET /api/content/types
   * Get available content types with their configurations
   */
  router.get('/types', (req, res) => {
    const { CONTENT_TYPES } = require('../services/content-generator.cjs');

    const types = Object.entries(CONTENT_TYPES).map(([key, config]) => ({
      key,
      ...config
    }));

    res.json({
      success: true,
      types,
      count: types.length
    });
  });

  /**
   * GET /api/content/tones
   * Get available tone presets
   */
  router.get('/tones', (req, res) => {
    const { TONE_PRESETS } = require('../services/content-generator.cjs');

    const tones = Object.entries(TONE_PRESETS).map(([key, config]) => ({
      key,
      ...config
    }));

    res.json({
      success: true,
      tones,
      count: tones.length
    });
  });

  /**
   * POST /api/content/generate
   * Generate a single piece of content
   *
   * Request body:
   * {
   *   contentType: 'blog-post' | 'social-twitter' | 'email-newsletter' | etc.,
   *   topic: 'Your content topic',
   *   businessInfo: { name: 'Business Name', description: '...' },
   *   industryKey: 'restaurant' | 'healthcare' | etc.,
   *   tone: 'professional' | 'casual' | 'witty' | etc.,
   *   targetAudience: 'Description of target audience',
   *   keywords: ['keyword1', 'keyword2'],
   *   length: 'short' | 'medium' | 'long',
   *   customInstructions: 'Additional instructions',
   *   variants: 1-5 (for social content)
   * }
   */
  router.post('/generate', generationRateLimiter, async (req, res) => {
    const startTime = Date.now();
    const {
      contentType,
      topic,
      businessInfo = {},
      industryKey = 'general',
      tone = 'professional',
      targetAudience = 'general',
      keywords = [],
      length = 'medium',
      customInstructions = '',
      variants = 1
    } = req.body;

    // Validation
    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: 'contentType is required'
      });
    }

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'topic is required (minimum 3 characters)'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 CONTENT GENERATION');
    console.log('='.repeat(60));
    console.log(`   Type: ${contentType}`);
    console.log(`   Topic: "${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}"`);
    console.log(`   Tone: ${tone}`);
    console.log(`   Industry: ${industryKey}`);
    console.log('─'.repeat(40));

    try {
      const { ContentGenerator } = require('../services/content-generator.cjs');
      const generator = new ContentGenerator();

      const result = await generator.generate(contentType, {
        topic,
        businessInfo,
        industryKey,
        tone,
        targetAudience,
        keywords,
        length,
        customInstructions,
        variants
      });

      const duration = Date.now() - startTime;

      // Track generation if db available
      if (db && db.trackContentGeneration) {
        try {
          await db.trackContentGeneration({
            contentType,
            topic,
            industryKey,
            tone,
            duration,
            usage: result.usage
          });
        } catch (trackErr) {
          console.warn('   ⚠️ Content generation tracking failed:', trackErr.message);
        }
      }

      console.log(`   ✅ Generated in ${duration}ms`);
      console.log(`   📊 Tokens: ${result.usage.inputTokens} in / ${result.usage.outputTokens} out`);
      console.log('='.repeat(60));

      res.json({
        ...result,
        duration
      });

    } catch (error) {
      console.error(`   ❌ Generation failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Content generation failed: ${error.message}`
      });
    }
  });

  /**
   * POST /api/content/generate-package
   * Generate multiple content types at once for a topic
   *
   * Request body:
   * {
   *   topic: 'Your content topic',
   *   businessInfo: { name: 'Business Name', description: '...' },
   *   industryKey: 'restaurant' | etc.,
   *   tone: 'professional' | etc.,
   *   targetAudience: 'Description of target audience',
   *   keywords: ['keyword1', 'keyword2'],
   *   contentTypes: ['blog-post', 'social-twitter', 'social-linkedin', 'seo-meta']
   * }
   */
  router.post('/generate-package', generationRateLimiter, async (req, res) => {
    const startTime = Date.now();
    const {
      topic,
      businessInfo = {},
      industryKey = 'general',
      tone = 'professional',
      targetAudience = 'general',
      keywords = [],
      contentTypes = ['blog-post', 'social-twitter', 'social-linkedin', 'seo-meta']
    } = req.body;

    // Validation
    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'topic is required (minimum 3 characters)'
      });
    }

    if (!Array.isArray(contentTypes) || contentTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'contentTypes array is required'
      });
    }

    if (contentTypes.length > 8) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 8 content types per package'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('📦 CONTENT PACKAGE GENERATION');
    console.log('='.repeat(60));
    console.log(`   Topic: "${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}"`);
    console.log(`   Types: ${contentTypes.join(', ')}`);
    console.log(`   Tone: ${tone}`);
    console.log(`   Industry: ${industryKey}`);
    console.log('─'.repeat(40));

    try {
      const { ContentGenerator } = require('../services/content-generator.cjs');
      const generator = new ContentGenerator();

      const result = await generator.generateContentPackage({
        topic,
        businessInfo,
        industryKey,
        tone,
        targetAudience,
        keywords,
        contentTypes
      });

      const duration = Date.now() - startTime;

      // Track generation if db available
      if (db && db.trackContentGeneration) {
        try {
          await db.trackContentGeneration({
            contentType: 'package',
            topic,
            industryKey,
            tone,
            duration,
            usage: result.totalUsage,
            packageTypes: contentTypes
          });
        } catch (trackErr) {
          console.warn('   ⚠️ Content package tracking failed:', trackErr.message);
        }
      }

      const successCount = Object.keys(result.results).length;
      const errorCount = result.errors?.length || 0;

      console.log(`   ✅ Generated ${successCount} content types`);
      if (errorCount > 0) {
        console.log(`   ⚠️ ${errorCount} failed`);
      }
      console.log(`   📊 Total tokens: ${result.totalUsage.totalTokens}`);
      console.log(`   ⏱️ Duration: ${duration}ms`);
      console.log('='.repeat(60));

      res.json({
        ...result,
        duration
      });

    } catch (error) {
      console.error(`   ❌ Package generation failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Content package generation failed: ${error.message}`
      });
    }
  });

  /**
   * POST /api/content/repurpose
   * Take existing content and repurpose it for different platforms
   *
   * Request body:
   * {
   *   sourceContent: 'Your existing blog post or content...',
   *   sourceType: 'blog-post',
   *   targetTypes: ['social-twitter', 'social-linkedin', 'email-newsletter'],
   *   businessInfo: { name: 'Business Name' },
   *   tone: 'professional'
   * }
   */
  router.post('/repurpose', generationRateLimiter, async (req, res) => {
    const startTime = Date.now();
    const {
      sourceContent,
      sourceType = 'blog-post',
      targetTypes = ['social-twitter', 'social-linkedin'],
      businessInfo = {},
      tone = 'professional'
    } = req.body;

    // Validation
    if (!sourceContent || sourceContent.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'sourceContent is required (minimum 50 characters)'
      });
    }

    if (!Array.isArray(targetTypes) || targetTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'targetTypes array is required'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔄 CONTENT REPURPOSING');
    console.log('='.repeat(60));
    console.log(`   Source: ${sourceType} (${sourceContent.length} chars)`);
    console.log(`   Targets: ${targetTypes.join(', ')}`);
    console.log('─'.repeat(40));

    try {
      const { ContentGenerator } = require('../services/content-generator.cjs');
      const generator = new ContentGenerator();

      // Generate repurposed content for each target type
      const results = {};
      const errors = [];

      for (const targetType of targetTypes) {
        try {
          // Create a topic from the source content (first 100 chars or first sentence)
          const firstSentence = sourceContent.split(/[.!?]/)[0].trim();
          const topic = firstSentence.length > 100 ? firstSentence.substring(0, 100) + '...' : firstSentence;

          const result = await generator.generate(targetType, {
            topic,
            businessInfo,
            tone,
            customInstructions: `Repurpose this existing ${sourceType} content for ${targetType} format. Source content:\n\n${sourceContent.substring(0, 2000)}`,
            variants: targetType.startsWith('social-') ? 3 : 1
          });

          results[targetType] = result;
        } catch (error) {
          errors.push({ targetType, error: error.message });
        }
      }

      const duration = Date.now() - startTime;

      console.log(`   ✅ Repurposed to ${Object.keys(results).length} formats`);
      console.log(`   ⏱️ Duration: ${duration}ms`);
      console.log('='.repeat(60));

      res.json({
        success: errors.length === 0,
        sourceType,
        results,
        errors: errors.length > 0 ? errors : undefined,
        duration
      });

    } catch (error) {
      console.error(`   ❌ Repurposing failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Content repurposing failed: ${error.message}`
      });
    }
  });

  /**
   * POST /api/content/improve
   * Improve existing content (rewrite, expand, condense, change tone)
   *
   * Request body:
   * {
   *   content: 'Your existing content...',
   *   contentType: 'blog-post',
   *   action: 'rewrite' | 'expand' | 'condense' | 'change-tone',
   *   targetTone: 'casual' (for change-tone action),
   *   instructions: 'Additional improvement instructions'
   * }
   */
  router.post('/improve', generationRateLimiter, async (req, res) => {
    const startTime = Date.now();
    const {
      content,
      contentType = 'blog-post',
      action = 'rewrite',
      targetTone = 'professional',
      instructions = ''
    } = req.body;

    // Validation
    if (!content || content.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'content is required (minimum 20 characters)'
      });
    }

    const validActions = ['rewrite', 'expand', 'condense', 'change-tone'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ CONTENT IMPROVEMENT');
    console.log('='.repeat(60));
    console.log(`   Action: ${action}`);
    console.log(`   Type: ${contentType}`);
    console.log(`   Content length: ${content.length} chars`);
    console.log('─'.repeat(40));

    try {
      const { ContentGenerator } = require('../services/content-generator.cjs');
      const generator = new ContentGenerator();

      // Build action-specific instructions
      let actionInstructions = '';
      switch (action) {
        case 'rewrite':
          actionInstructions = 'Rewrite this content to be clearer, more engaging, and better structured while keeping the same message and length.';
          break;
        case 'expand':
          actionInstructions = 'Expand this content by adding more detail, examples, and depth. Make it approximately 50% longer.';
          break;
        case 'condense':
          actionInstructions = 'Condense this content to be more concise while keeping all key points. Reduce length by approximately 50%.';
          break;
        case 'change-tone':
          actionInstructions = `Rewrite this content in a ${targetTone} tone while keeping the same message and approximate length.`;
          break;
      }

      const result = await generator.generate(contentType, {
        topic: 'Content improvement',
        tone: action === 'change-tone' ? targetTone : 'professional',
        customInstructions: `${actionInstructions}

${instructions ? `Additional instructions: ${instructions}` : ''}

Original content to improve:
${content}`
      });

      const duration = Date.now() - startTime;

      console.log(`   ✅ Improved in ${duration}ms`);
      console.log('='.repeat(60));

      res.json({
        success: true,
        action,
        originalLength: content.length,
        improvedContent: result.content,
        improvedLength: typeof result.content === 'string' ? result.content.length : null,
        usage: result.usage,
        duration
      });

    } catch (error) {
      console.error(`   ❌ Improvement failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Content improvement failed: ${error.message}`
      });
    }
  });

  return router;
}

module.exports = { createContentGeneratorRoutes };
