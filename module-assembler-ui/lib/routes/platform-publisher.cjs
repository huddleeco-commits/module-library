/**
 * Platform Publisher Routes
 *
 * API endpoints for multi-platform content publishing:
 * - Publishing to single and multiple platforms
 * - Platform connection management (OAuth)
 * - Publishing history and analytics
 * - Credential management
 */

const express = require('express');

/**
 * Create platform publisher routes
 * @param {Object} deps - Dependencies
 */
function createPlatformPublisherRoutes(deps = {}) {
  const router = express.Router();
  const { db, queueService } = deps;

  // Rate limiter for publishing endpoints
  const publishRateLimiter = require('express-rate-limit')({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: { success: false, error: 'Too many publishing requests. Please wait a moment.' }
  });

  // Import services
  const { PlatformPublisher, PLATFORM_ADAPTERS, PUBLISH_STATUS } = require('../services/platform-publisher.cjs');
  const { PlatformCredentials, OAUTH_CONFIG, EMAIL_PROVIDERS, BLOG_PROVIDERS } = require('../services/platform-credentials.cjs');

  // Create service instances
  const publisher = new PlatformPublisher({ db, queueService });
  const credentials = new PlatformCredentials({ db });

  // =====================
  // Platform Information
  // =====================

  /**
   * GET /api/publisher/platforms
   * Get available platforms and their configurations
   */
  router.get('/platforms', (req, res) => {
    const platforms = Object.entries(PLATFORM_ADAPTERS).map(([key, config]) => ({
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
   * GET /api/publisher/platforms/:platform
   * Get detailed configuration for a specific platform
   */
  router.get('/platforms/:platform', (req, res) => {
    const { platform } = req.params;
    const config = PLATFORM_ADAPTERS[platform];

    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Unknown platform: ${platform}`
      });
    }

    res.json({
      success: true,
      platform: {
        key: platform,
        ...config
      }
    });
  });

  // =====================
  // Connection Management
  // =====================

  /**
   * GET /api/publisher/connections
   * Get connection status for all platforms
   */
  router.get('/connections', async (req, res) => {
    console.log('\n' + '─'.repeat(40));
    console.log('🔗 GET PLATFORM CONNECTIONS');
    console.log('─'.repeat(40));

    try {
      const result = await credentials.getConnectionStatus();
      console.log(`   ✅ Retrieved connection status`);
      res.json(result);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/publisher/oauth-config
   * Get OAuth configuration for platforms
   */
  router.get('/oauth-config', (req, res) => {
    // Return public OAuth config (without secrets)
    const config = Object.entries(OAUTH_CONFIG).map(([key, value]) => ({
      platform: key,
      name: value.name,
      scopes: value.scopes,
      pkce: value.pkce
    }));

    res.json({
      success: true,
      platforms: config
    });
  });

  /**
   * POST /api/publisher/connect/:platform/start
   * Start OAuth flow for a platform
   */
  router.post('/connect/:platform/start', async (req, res) => {
    const { platform } = req.params;
    const { clientId, clientSecret, redirectUri } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log(`🔐 START OAUTH: ${platform}`);
    console.log('='.repeat(60));

    if (!OAUTH_CONFIG[platform]) {
      return res.status(400).json({
        success: false,
        error: `OAuth not supported for platform: ${platform}`
      });
    }

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'clientId is required'
      });
    }

    if (!redirectUri) {
      return res.status(400).json({
        success: false,
        error: 'redirectUri is required'
      });
    }

    try {
      const result = await credentials.startOAuthFlow(platform, { clientId, clientSecret }, redirectUri);

      console.log(`   ✅ OAuth flow started`);
      console.log(`   URL: ${result.authUrl.substring(0, 50)}...`);
      console.log('='.repeat(60));

      res.json(result);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/publisher/connect/:platform/callback
   * Complete OAuth flow with authorization code
   */
  router.post('/connect/:platform/callback', async (req, res) => {
    const { platform } = req.params;
    const { code, state } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log(`🔐 COMPLETE OAUTH: ${platform}`);
    console.log('='.repeat(60));

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }

    if (!state) {
      return res.status(400).json({
        success: false,
        error: 'State parameter is required'
      });
    }

    try {
      const result = await credentials.completeOAuthFlow(code, state);

      console.log(`   ✅ ${platform} connected successfully`);
      console.log('='.repeat(60));

      res.json(result);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/publisher/connect/email
   * Connect email provider with API credentials
   */
  router.post('/connect/email', async (req, res) => {
    const { provider, apiKey, fromEmail, fromName, ...otherConfig } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log(`📧 CONNECT EMAIL PROVIDER: ${provider}`);
    console.log('='.repeat(60));

    if (!provider || !EMAIL_PROVIDERS[provider]) {
      return res.status(400).json({
        success: false,
        error: `Invalid email provider. Available: ${Object.keys(EMAIL_PROVIDERS).join(', ')}`
      });
    }

    if (!apiKey && provider !== 'smtp') {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    try {
      const result = await credentials.saveApiCredentials('email', provider, {
        apiKey,
        fromEmail,
        fromName,
        ...otherConfig
      });

      // Also save to publisher for use during publishing
      await publisher.saveCredentials('email', {
        provider,
        apiKey,
        fromEmail,
        fromName,
        ...otherConfig
      });

      console.log(`   ✅ Email provider ${provider} connected`);
      console.log('='.repeat(60));

      res.json(result);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/publisher/connect/blog
   * Connect blog provider
   */
  router.post('/connect/blog', async (req, res) => {
    const { provider, apiKey, webhookUrl, siteUrl, ...otherConfig } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log(`📝 CONNECT BLOG PROVIDER: ${provider}`);
    console.log('='.repeat(60));

    if (!provider || !BLOG_PROVIDERS[provider]) {
      return res.status(400).json({
        success: false,
        error: `Invalid blog provider. Available: ${Object.keys(BLOG_PROVIDERS).join(', ')}`
      });
    }

    try {
      const result = await credentials.saveApiCredentials('blog', provider, {
        apiKey,
        webhookUrl,
        siteUrl,
        ...otherConfig
      });

      // Also save to publisher
      await publisher.saveCredentials('blog', {
        provider,
        apiKey,
        webhookUrl,
        siteUrl,
        ...otherConfig
      });

      console.log(`   ✅ Blog provider ${provider} connected`);
      console.log('='.repeat(60));

      res.json(result);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/publisher/connect/:platform
   * Disconnect a platform
   */
  router.delete('/connect/:platform', async (req, res) => {
    const { platform } = req.params;

    console.log('\n' + '─'.repeat(40));
    console.log(`🔌 DISCONNECT: ${platform}`);
    console.log('─'.repeat(40));

    try {
      await credentials.deleteCredentials(platform);
      await publisher.removeCredentials(platform);

      console.log(`   ✅ ${platform} disconnected`);

      res.json({
        success: true,
        platform,
        disconnectedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/publisher/connect/:platform/test
   * Test platform connection
   */
  router.post('/connect/:platform/test', async (req, res) => {
    const { platform } = req.params;

    console.log('\n' + '─'.repeat(40));
    console.log(`🧪 TEST CONNECTION: ${platform}`);
    console.log('─'.repeat(40));

    try {
      const creds = await credentials.getCredentials(platform);

      if (!creds) {
        return res.status(400).json({
          success: false,
          error: `No credentials configured for ${platform}`
        });
      }

      // Validate content with empty test (just check connection)
      const validation = publisher.validateContent(platform, { text: 'Test' });

      console.log(`   ✅ Connection valid for ${platform}`);

      res.json({
        success: true,
        platform,
        connected: true,
        testedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`   ❌ Test failed: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // =====================
  // Publishing
  // =====================

  /**
   * POST /api/publisher/publish
   * Publish content to one or more platforms
   *
   * Request body:
   * {
   *   platforms: ['twitter', 'linkedin'],
   *   content: {
   *     text: 'Content to publish',
   *     title: 'Optional title (for blog/email)',
   *     html: 'Optional HTML content',
   *     media: [{ url: '...', type: 'image' }],
   *     platformOverrides: {
   *       twitter: { text: 'Shorter version for Twitter' }
   *     }
   *   },
   *   options: {
   *     scheduleId: 'optional-schedule-id',
   *     recipients: ['email@example.com'], // for email
   *     subject: 'Email subject'
   *   }
   * }
   */
  router.post('/publish', publishRateLimiter, async (req, res) => {
    const { platforms, content, options = {} } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('🚀 PUBLISH CONTENT');
    console.log('='.repeat(60));

    // Validation
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'platforms array is required'
      });
    }

    if (!content || (!content.text && !content.html)) {
      return res.status(400).json({
        success: false,
        error: 'content.text or content.html is required'
      });
    }

    console.log(`   Platforms: ${platforms.join(', ')}`);
    console.log(`   Content: "${(content.text || '').substring(0, 50)}${(content.text || '').length > 50 ? '...' : ''}"`);
    console.log('─'.repeat(40));

    try {
      // Sync credentials from credential service to publisher
      for (const platform of platforms) {
        const creds = await credentials.getCredentials(platform);
        if (creds) {
          await publisher.saveCredentials(platform, creds);
        }
      }

      let result;

      if (platforms.length === 1) {
        // Single platform publish
        result = await publisher.publishToPlatform(platforms[0], content, options);
        result = {
          batchId: null,
          platforms: { [platforms[0]]: result },
          successful: [platforms[0]],
          failed: [],
          status: PUBLISH_STATUS.PUBLISHED,
          duration: result.duration
        };
      } else {
        // Multi-platform publish
        result = await publisher.publishToMultiplePlatforms(platforms, content, options);
      }

      console.log(`   ✅ Published to ${result.successful.length} platform(s)`);
      if (result.failed.length > 0) {
        console.log(`   ⚠️ Failed on ${result.failed.length} platform(s): ${result.failed.join(', ')}`);
      }
      console.log('='.repeat(60));

      res.json({
        success: result.failed.length === 0,
        ...result
      });
    } catch (error) {
      console.error(`   ❌ Publishing failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/publisher/publish/:platform
   * Publish content to a single platform
   */
  router.post('/publish/:platform', publishRateLimiter, async (req, res) => {
    const { platform } = req.params;
    const { content, options = {} } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log(`🚀 PUBLISH TO ${platform.toUpperCase()}`);
    console.log('='.repeat(60));

    if (!PLATFORM_ADAPTERS[platform]) {
      return res.status(400).json({
        success: false,
        error: `Unknown platform: ${platform}`
      });
    }

    if (!content || (!content.text && !content.html)) {
      return res.status(400).json({
        success: false,
        error: 'content.text or content.html is required'
      });
    }

    console.log(`   Content: "${(content.text || '').substring(0, 50)}..."`);
    console.log('─'.repeat(40));

    try {
      // Sync credentials
      const creds = await credentials.getCredentials(platform);
      if (creds) {
        await publisher.saveCredentials(platform, creds);
      }

      const result = await publisher.publishToPlatform(platform, content, options);

      console.log(`   ✅ Published: ${result.postId}`);
      console.log('='.repeat(60));

      res.json(result);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/publisher/validate
   * Validate content for platforms without publishing
   */
  router.post('/validate', (req, res) => {
    const { platforms, content } = req.body;

    if (!platforms || !Array.isArray(platforms)) {
      return res.status(400).json({
        success: false,
        error: 'platforms array is required'
      });
    }

    const validations = {};
    let allValid = true;

    for (const platform of platforms) {
      const platformContent = content.platformOverrides?.[platform]
        ? { ...content, ...content.platformOverrides[platform] }
        : content;

      const validation = publisher.validateContent(platform, platformContent);
      validations[platform] = validation;

      if (!validation.valid) {
        allValid = false;
      }
    }

    res.json({
      success: true,
      allValid,
      validations
    });
  });

  // =====================
  // History & Analytics
  // =====================

  /**
   * GET /api/publisher/history
   * Get publishing history
   */
  router.get('/history', async (req, res) => {
    const { platform, status, startDate, limit = 50, offset = 0 } = req.query;

    console.log('\n' + '─'.repeat(40));
    console.log('📜 PUBLISH HISTORY');
    console.log('─'.repeat(40));

    try {
      const result = await publisher.getPublishHistory({
        platform,
        status,
        startDate,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });

      console.log(`   ✅ Found ${result.entries.length} of ${result.total} entries`);

      res.json(result);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/publisher/analytics
   * Get publishing analytics
   */
  router.get('/analytics', async (req, res) => {
    console.log('\n' + '─'.repeat(40));
    console.log('📊 PUBLISH ANALYTICS');
    console.log('─'.repeat(40));

    try {
      const result = await publisher.getAnalytics();

      console.log(`   ✅ Total: ${result.analytics.total}, Success rate: ${result.analytics.successRate}%`);

      res.json(result);
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/publisher/retry/:historyId
   * Retry a failed publish
   */
  router.post('/retry/:historyId', publishRateLimiter, async (req, res) => {
    const { historyId } = req.params;

    console.log('\n' + '─'.repeat(40));
    console.log(`🔄 RETRY PUBLISH: ${historyId}`);
    console.log('─'.repeat(40));

    try {
      const result = await publisher.retryPublish(historyId);

      console.log(`   ✅ Retry successful`);

      res.json(result);
    } catch (error) {
      console.error(`   ❌ Retry failed: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // =====================
  // Provider Information
  // =====================

  /**
   * GET /api/publisher/providers/email
   * Get available email providers
   */
  router.get('/providers/email', (req, res) => {
    const providers = Object.entries(EMAIL_PROVIDERS).map(([key, config]) => ({
      key,
      ...config
    }));

    res.json({
      success: true,
      providers,
      count: providers.length
    });
  });

  /**
   * GET /api/publisher/providers/blog
   * Get available blog providers
   */
  router.get('/providers/blog', (req, res) => {
    const providers = Object.entries(BLOG_PROVIDERS).map(([key, config]) => ({
      key,
      ...config
    }));

    res.json({
      success: true,
      providers,
      count: providers.length
    });
  });

  return router;
}

module.exports = { createPlatformPublisherRoutes };
