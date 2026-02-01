/**
 * Social Media Routes
 *
 * API endpoints for the social media management hub.
 * Handles: setup, platforms, content generation, scheduling, analytics
 */

const express = require('express');

/**
 * Create social media routes
 * @param {Object} deps - Dependencies (db for tracking, etc.)
 */
function createSocialMediaRoutes(deps = {}) {
  const router = express.Router();
  const { db } = deps;

  // Rate limiter for generation endpoints
  const generationRateLimiter = require('express-rate-limit')({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: { success: false, error: 'Too many requests. Please wait a moment before trying again.' }
  });

  /**
   * GET /api/social-media/setup
   * Get the current social media setup configuration
   */
  router.get('/setup', (req, res) => {
    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const setup = service.getSetup();

      res.json({
        success: true,
        setup,
        isConfigured: !!setup
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to get setup: ${error.message}`
      });
    }
  });

  /**
   * POST /api/social-media/setup
   * Save the social media setup configuration
   */
  router.post('/setup', async (req, res) => {
    const setupData = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('📱 SOCIAL MEDIA SETUP');
    console.log('='.repeat(60));
    console.log(`   Brand: ${setupData.brandName}`);
    console.log(`   Platforms: ${setupData.platforms?.join(', ')}`);
    console.log(`   Content Types: ${setupData.contentTypes?.join(', ')}`);
    console.log('─'.repeat(40));

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const result = service.saveSetup(setupData);

      console.log('   ✅ Setup saved successfully');
      console.log('='.repeat(60));

      res.json({
        success: true,
        message: 'Social media setup saved successfully',
        setup: result
      });
    } catch (error) {
      console.error(`   ❌ Setup failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Failed to save setup: ${error.message}`
      });
    }
  });

  /**
   * GET /api/social-media/platforms
   * Get available social media platforms and their configurations
   */
  router.get('/platforms', (req, res) => {
    const { PLATFORM_CONFIGS } = require('../services/social-media.cjs');

    const platforms = Object.entries(PLATFORM_CONFIGS).map(([key, config]) => ({
      key,
      ...config
    }));

    res.json({
      success: true,
      platforms,
      count: platforms.length
    });
  });

  /**
   * POST /api/social-media/generate-caption
   * Generate a caption for a social media post
   */
  router.post('/generate-caption', generationRateLimiter, async (req, res) => {
    const startTime = Date.now();
    const {
      platform,
      topic,
      contentType = 'promotional',
      tone = 'friendly',
      includeHashtags = true,
      includeEmojis = true,
      brandVoice = '',
      customInstructions = ''
    } = req.body;

    // Validation
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'platform is required'
      });
    }

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'topic is required (minimum 3 characters)'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 CAPTION GENERATION');
    console.log('='.repeat(60));
    console.log(`   Platform: ${platform}`);
    console.log(`   Topic: "${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}"`);
    console.log(`   Tone: ${tone}`);
    console.log('─'.repeat(40));

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const result = await service.generateCaption({
        platform,
        topic,
        contentType,
        tone,
        includeHashtags,
        includeEmojis,
        brandVoice,
        customInstructions
      });

      const duration = Date.now() - startTime;

      console.log(`   ✅ Generated in ${duration}ms`);
      console.log('='.repeat(60));

      res.json({
        success: true,
        ...result,
        duration
      });

    } catch (error) {
      console.error(`   ❌ Generation failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Caption generation failed: ${error.message}`
      });
    }
  });

  /**
   * POST /api/social-media/generate-hashtags
   * Generate hashtags for a topic or content
   */
  router.post('/generate-hashtags', generationRateLimiter, async (req, res) => {
    const {
      topic,
      platform = 'instagram',
      industry = '',
      count = 15
    } = req.body;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'topic is required (minimum 3 characters)'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('#️⃣ HASHTAG GENERATION');
    console.log('='.repeat(60));
    console.log(`   Platform: ${platform}`);
    console.log(`   Topic: "${topic.substring(0, 50)}"`);
    console.log('─'.repeat(40));

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const result = await service.generateHashtags({
        topic,
        platform,
        industry,
        count
      });

      console.log(`   ✅ Generated ${result.hashtags?.length || 0} hashtags`);
      console.log('='.repeat(60));

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error(`   ❌ Hashtag generation failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Hashtag generation failed: ${error.message}`
      });
    }
  });

  /**
   * POST /api/social-media/generate-content-ideas
   * Generate content ideas for social media
   */
  router.post('/generate-content-ideas', generationRateLimiter, async (req, res) => {
    const {
      brandName,
      industry,
      platforms = ['instagram'],
      contentTypes = ['educational', 'promotional'],
      targetAudience = 'general',
      count = 10
    } = req.body;

    if (!brandName) {
      return res.status(400).json({
        success: false,
        error: 'brandName is required'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('💡 CONTENT IDEAS GENERATION');
    console.log('='.repeat(60));
    console.log(`   Brand: ${brandName}`);
    console.log(`   Platforms: ${platforms.join(', ')}`);
    console.log(`   Content Types: ${contentTypes.join(', ')}`);
    console.log('─'.repeat(40));

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const result = await service.generateContentIdeas({
        brandName,
        industry,
        platforms,
        contentTypes,
        targetAudience,
        count
      });

      console.log(`   ✅ Generated ${result.ideas?.length || 0} ideas`);
      console.log('='.repeat(60));

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error(`   ❌ Ideas generation failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Content ideas generation failed: ${error.message}`
      });
    }
  });

  /**
   * POST /api/social-media/schedule-post
   * Schedule a post for publishing
   */
  router.post('/schedule-post', async (req, res) => {
    const {
      platform,
      content,
      mediaUrls = [],
      scheduledTime,
      hashtags = [],
      location = null
    } = req.body;

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'platform is required'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'content is required'
      });
    }

    if (!scheduledTime) {
      return res.status(400).json({
        success: false,
        error: 'scheduledTime is required'
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('📅 SCHEDULING POST');
    console.log('='.repeat(60));
    console.log(`   Platform: ${platform}`);
    console.log(`   Scheduled: ${scheduledTime}`);
    console.log(`   Content: "${content.substring(0, 50)}..."`);
    console.log('─'.repeat(40));

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const result = await service.schedulePost({
        platform,
        content,
        mediaUrls,
        scheduledTime,
        hashtags,
        location
      });

      console.log(`   ✅ Post scheduled: ${result.postId}`);
      console.log('='.repeat(60));

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error(`   ❌ Scheduling failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: `Post scheduling failed: ${error.message}`
      });
    }
  });

  /**
   * GET /api/social-media/scheduled-posts
   * Get all scheduled posts
   */
  router.get('/scheduled-posts', (req, res) => {
    const { platform, status = 'pending' } = req.query;

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const posts = service.getScheduledPosts({ platform, status });

      res.json({
        success: true,
        posts,
        count: posts.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to get scheduled posts: ${error.message}`
      });
    }
  });

  /**
   * DELETE /api/social-media/scheduled-posts/:postId
   * Cancel a scheduled post
   */
  router.delete('/scheduled-posts/:postId', (req, res) => {
    const { postId } = req.params;

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const result = service.cancelScheduledPost(postId);

      res.json({
        success: true,
        message: 'Scheduled post cancelled',
        postId
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to cancel scheduled post: ${error.message}`
      });
    }
  });

  /**
   * POST /api/ai/social-media-chat
   * AI chat endpoint for the Social Media Assistant
   */
  router.post('/ai/social-media-chat', generationRateLimiter, async (req, res) => {
    const {
      message,
      currentStep,
      wizardContext = {},
      conversationHistory = []
    } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const result = await service.handleAssistantChat({
        message,
        currentStep,
        wizardContext,
        conversationHistory
      });

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('Social Media AI chat error:', error);
      res.status(500).json({
        success: false,
        error: `Chat failed: ${error.message}`
      });
    }
  });

  /**
   * GET /api/social-media/analytics
   * Get analytics for social media accounts
   */
  router.get('/analytics', (req, res) => {
    const { platform, period = '7d' } = req.query;

    try {
      const { SocialMediaService } = require('../services/social-media.cjs');
      const service = new SocialMediaService();

      const analytics = service.getAnalytics({ platform, period });

      res.json({
        success: true,
        ...analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to get analytics: ${error.message}`
      });
    }
  });

  /**
   * GET /api/social-media/best-times
   * Get recommended posting times
   */
  router.get('/best-times', (req, res) => {
    const { platform } = req.query;

    try {
      const { SocialMediaService, PLATFORM_CONFIGS } = require('../services/social-media.cjs');

      let bestTimes;
      if (platform && PLATFORM_CONFIGS[platform]) {
        bestTimes = { [platform]: PLATFORM_CONFIGS[platform].bestTimes };
      } else {
        bestTimes = Object.fromEntries(
          Object.entries(PLATFORM_CONFIGS).map(([key, config]) => [key, config.bestTimes])
        );
      }

      res.json({
        success: true,
        bestTimes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to get best times: ${error.message}`
      });
    }
  });

  return router;
}

module.exports = { createSocialMediaRoutes };
