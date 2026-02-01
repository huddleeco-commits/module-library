/**
 * Platform Publisher Service
 *
 * Handles multi-platform content publishing with:
 * - Platform-specific adapters (Twitter, LinkedIn, Facebook, Instagram, Email)
 * - Credential management for OAuth tokens
 * - Publishing queue with retry logic
 * - Cross-posting to multiple platforms simultaneously
 * - Publishing history and analytics tracking
 */

const crypto = require('crypto');

/**
 * Publishing status constants
 */
const PUBLISH_STATUS = {
  PENDING: 'pending',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
  PARTIAL: 'partial', // Some platforms succeeded, some failed
  RETRYING: 'retrying'
};

/**
 * Platform adapter configurations
 */
const PLATFORM_ADAPTERS = {
  twitter: {
    name: 'Twitter/X',
    icon: '𝕏',
    maxLength: 280,
    supportsMedia: true,
    supportsThreads: true,
    authType: 'oauth2',
    apiVersion: 'v2',
    requiredScopes: ['tweet.read', 'tweet.write', 'users.read']
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    maxLength: 3000,
    supportsMedia: true,
    supportsThreads: false,
    authType: 'oauth2',
    apiVersion: 'v2',
    requiredScopes: ['w_member_social', 'r_liteprofile']
  },
  facebook: {
    name: 'Facebook',
    icon: '👍',
    maxLength: 63206,
    supportsMedia: true,
    supportsThreads: false,
    authType: 'oauth2',
    apiVersion: 'v18.0',
    requiredScopes: ['pages_manage_posts', 'pages_read_engagement']
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    maxLength: 2200,
    supportsMedia: true,
    supportsThreads: false,
    authType: 'oauth2',
    apiVersion: 'v18.0',
    requiredScopes: ['instagram_basic', 'instagram_content_publish'],
    requiresMedia: true // Instagram requires media for posts
  },
  email: {
    name: 'Email',
    icon: '📧',
    maxLength: null,
    supportsMedia: true,
    supportsThreads: false,
    authType: 'api_key',
    providers: ['sendgrid', 'mailgun', 'ses', 'smtp']
  },
  blog: {
    name: 'Blog',
    icon: '📝',
    maxLength: null,
    supportsMedia: true,
    supportsThreads: false,
    authType: 'webhook',
    providers: ['wordpress', 'ghost', 'webflow', 'custom']
  }
};

/**
 * Platform Publisher class
 */
class PlatformPublisher {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.db = options.db || null;
    this.queueService = options.queueService || null;

    // In-memory storage for credentials and history
    this.credentials = new Map();
    this.publishHistory = new Map();
    this.retryQueue = new Map();

    // Retry configuration
    this.maxRetries = options.maxRetries || 3;
    this.retryDelayMs = options.retryDelayMs || 5000;
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = {
        info: '📤',
        success: '✅',
        warn: '⚠️',
        error: '❌',
        publish: '🚀'
      }[type] || '📤';
      console.log(`${prefix} [PlatformPublisher] ${message}`);
    }
  }

  generateId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Store platform credentials
   * @param {string} platform - Platform name
   * @param {Object} credentials - Platform-specific credentials
   */
  async saveCredentials(platform, credentials) {
    if (!PLATFORM_ADAPTERS[platform]) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const credentialEntry = {
      platform,
      ...credentials,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.db && this.db.savePlatformCredentials) {
      await this.db.savePlatformCredentials(platform, credentialEntry);
    } else {
      this.credentials.set(platform, credentialEntry);
    }

    this.log(`Saved credentials for ${platform}`, 'success');

    return {
      success: true,
      platform,
      connectedAt: credentialEntry.connectedAt
    };
  }

  /**
   * Get stored credentials for a platform
   * @param {string} platform - Platform name
   */
  async getCredentials(platform) {
    if (this.db && this.db.getPlatformCredentials) {
      return await this.db.getPlatformCredentials(platform);
    }
    return this.credentials.get(platform);
  }

  /**
   * Remove platform credentials
   * @param {string} platform - Platform name
   */
  async removeCredentials(platform) {
    if (this.db && this.db.deletePlatformCredentials) {
      await this.db.deletePlatformCredentials(platform);
    } else {
      this.credentials.delete(platform);
    }

    this.log(`Removed credentials for ${platform}`, 'success');

    return { success: true, platform };
  }

  /**
   * Get connection status for all platforms
   */
  async getConnectionStatus() {
    const status = {};

    for (const platform of Object.keys(PLATFORM_ADAPTERS)) {
      const creds = await this.getCredentials(platform);
      status[platform] = {
        connected: !!creds,
        connectedAt: creds?.connectedAt || null,
        ...PLATFORM_ADAPTERS[platform]
      };
    }

    return {
      success: true,
      platforms: status
    };
  }

  /**
   * Validate content for a specific platform
   * @param {string} platform - Platform name
   * @param {Object} content - Content to validate
   */
  validateContent(platform, content) {
    const adapter = PLATFORM_ADAPTERS[platform];
    if (!adapter) {
      return { valid: false, errors: [`Unknown platform: ${platform}`] };
    }

    const errors = [];

    // Check content length
    if (adapter.maxLength && content.text && content.text.length > adapter.maxLength) {
      errors.push(`Content exceeds ${platform} character limit of ${adapter.maxLength} (current: ${content.text.length})`);
    }

    // Check media requirements
    if (adapter.requiresMedia && (!content.media || content.media.length === 0)) {
      errors.push(`${adapter.name} requires at least one media attachment`);
    }

    return {
      valid: errors.length === 0,
      errors,
      platform,
      adapter
    };
  }

  /**
   * Publish content to a single platform
   * @param {string} platform - Target platform
   * @param {Object} content - Content to publish
   * @param {Object} options - Publishing options
   */
  async publishToPlatform(platform, content, options = {}) {
    const startTime = Date.now();

    this.log(`Publishing to ${platform}...`, 'publish');

    // Validate platform
    const adapter = PLATFORM_ADAPTERS[platform];
    if (!adapter) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    // Check credentials
    const creds = await this.getCredentials(platform);
    if (!creds) {
      throw new Error(`No credentials configured for ${platform}. Please connect your ${adapter.name} account first.`);
    }

    // Validate content
    const validation = this.validateContent(platform, content);
    if (!validation.valid) {
      throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
    }

    // Platform-specific publishing
    let result;
    try {
      switch (platform) {
        case 'twitter':
          result = await this._publishToTwitter(content, creds, options);
          break;
        case 'linkedin':
          result = await this._publishToLinkedIn(content, creds, options);
          break;
        case 'facebook':
          result = await this._publishToFacebook(content, creds, options);
          break;
        case 'instagram':
          result = await this._publishToInstagram(content, creds, options);
          break;
        case 'email':
          result = await this._publishToEmail(content, creds, options);
          break;
        case 'blog':
          result = await this._publishToBlog(content, creds, options);
          break;
        default:
          throw new Error(`Publishing to ${platform} is not yet implemented`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record failure
      const historyEntry = {
        id: this.generateId(),
        platform,
        content: content.text?.substring(0, 100),
        status: PUBLISH_STATUS.FAILED,
        error: error.message,
        duration,
        publishedAt: null,
        attemptedAt: new Date().toISOString()
      };

      this.publishHistory.set(historyEntry.id, historyEntry);

      throw error;
    }

    const duration = Date.now() - startTime;

    // Record success
    const historyEntry = {
      id: this.generateId(),
      platform,
      content: content.text?.substring(0, 100),
      status: PUBLISH_STATUS.PUBLISHED,
      platformPostId: result.postId,
      platformPostUrl: result.postUrl,
      duration,
      publishedAt: new Date().toISOString()
    };

    if (this.db && this.db.savePublishHistory) {
      await this.db.savePublishHistory(historyEntry);
    } else {
      this.publishHistory.set(historyEntry.id, historyEntry);
    }

    this.log(`Published to ${platform} in ${duration}ms`, 'success');

    return {
      success: true,
      platform,
      postId: result.postId,
      postUrl: result.postUrl,
      duration,
      historyId: historyEntry.id
    };
  }

  /**
   * Publish content to multiple platforms simultaneously
   * @param {Array} platforms - List of target platforms
   * @param {Object} content - Content to publish (can have platform-specific overrides)
   * @param {Object} options - Publishing options
   */
  async publishToMultiplePlatforms(platforms, content, options = {}) {
    const startTime = Date.now();
    const batchId = this.generateId();

    this.log(`Starting multi-platform publish to ${platforms.length} platforms (batch: ${batchId})`, 'publish');

    const results = {
      batchId,
      platforms: {},
      successful: [],
      failed: [],
      status: PUBLISH_STATUS.PENDING
    };

    // Publish to each platform
    const publishPromises = platforms.map(async (platform) => {
      // Get platform-specific content if available
      const platformContent = content.platformOverrides?.[platform]
        ? { ...content, ...content.platformOverrides[platform] }
        : content;

      try {
        const result = await this.publishToPlatform(platform, platformContent, options);
        results.platforms[platform] = {
          success: true,
          ...result
        };
        results.successful.push(platform);
      } catch (error) {
        results.platforms[platform] = {
          success: false,
          error: error.message
        };
        results.failed.push(platform);
      }
    });

    // Wait for all publishing to complete
    await Promise.allSettled(publishPromises);

    // Determine overall status
    if (results.failed.length === 0) {
      results.status = PUBLISH_STATUS.PUBLISHED;
    } else if (results.successful.length === 0) {
      results.status = PUBLISH_STATUS.FAILED;
    } else {
      results.status = PUBLISH_STATUS.PARTIAL;
    }

    results.duration = Date.now() - startTime;

    this.log(
      `Multi-platform publish complete: ${results.successful.length} succeeded, ${results.failed.length} failed`,
      results.failed.length === 0 ? 'success' : 'warn'
    );

    return results;
  }

  /**
   * Retry failed publishes
   * @param {string} historyId - History entry ID to retry
   */
  async retryPublish(historyId) {
    const entry = this.publishHistory.get(historyId);
    if (!entry) {
      throw new Error(`Publish history entry not found: ${historyId}`);
    }

    if (entry.status === PUBLISH_STATUS.PUBLISHED) {
      throw new Error('Cannot retry a successfully published post');
    }

    entry.retryCount = (entry.retryCount || 0) + 1;
    if (entry.retryCount > this.maxRetries) {
      throw new Error(`Maximum retry attempts (${this.maxRetries}) exceeded`);
    }

    // Retry the publish
    return await this.publishToPlatform(entry.platform, { text: entry.content });
  }

  /**
   * Get publishing history
   * @param {Object} filters - Optional filters
   */
  async getPublishHistory(filters = {}) {
    let entries;

    if (this.db && this.db.getPublishHistory) {
      entries = await this.db.getPublishHistory(filters);
    } else {
      entries = Array.from(this.publishHistory.values());
    }

    // Apply filters
    if (filters.platform) {
      entries = entries.filter(e => e.platform === filters.platform);
    }
    if (filters.status) {
      entries = entries.filter(e => e.status === filters.status);
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      entries = entries.filter(e => new Date(e.publishedAt || e.attemptedAt) >= start);
    }

    // Sort by date (newest first)
    entries.sort((a, b) =>
      new Date(b.publishedAt || b.attemptedAt) - new Date(a.publishedAt || a.attemptedAt)
    );

    // Apply pagination
    const total = entries.length;
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    entries = entries.slice(offset, offset + limit);

    return {
      success: true,
      entries,
      total,
      limit,
      offset,
      hasMore: (offset + entries.length) < total
    };
  }

  /**
   * Get publishing analytics
   */
  async getAnalytics() {
    const { entries } = await this.getPublishHistory({ limit: 10000 });

    const analytics = {
      total: entries.length,
      byPlatform: {},
      byStatus: {},
      successRate: 0,
      averageDuration: 0,
      last24Hours: 0,
      last7Days: 0
    };

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let totalDuration = 0;
    let successCount = 0;

    for (const entry of entries) {
      // By platform
      analytics.byPlatform[entry.platform] = (analytics.byPlatform[entry.platform] || 0) + 1;

      // By status
      analytics.byStatus[entry.status] = (analytics.byStatus[entry.status] || 0) + 1;

      // Duration
      if (entry.duration) {
        totalDuration += entry.duration;
      }

      // Success count
      if (entry.status === PUBLISH_STATUS.PUBLISHED) {
        successCount++;
      }

      // Time-based counts
      const entryDate = new Date(entry.publishedAt || entry.attemptedAt);
      if (entryDate >= dayAgo) {
        analytics.last24Hours++;
      }
      if (entryDate >= weekAgo) {
        analytics.last7Days++;
      }
    }

    analytics.successRate = entries.length > 0
      ? Math.round((successCount / entries.length) * 100)
      : 0;
    analytics.averageDuration = entries.length > 0
      ? Math.round(totalDuration / entries.length)
      : 0;

    return {
      success: true,
      analytics
    };
  }

  // ===========================================
  // Platform-Specific Publishing Implementations
  // ===========================================

  /**
   * Publish to Twitter/X
   */
  async _publishToTwitter(content, credentials, options = {}) {
    // In production, this would use the Twitter API v2
    // For now, we'll simulate the API call

    const { accessToken, accessTokenSecret } = credentials;

    if (!accessToken) {
      throw new Error('Twitter access token is required');
    }

    // Simulate API call (replace with actual Twitter API integration)
    // const response = await fetch('https://api.twitter.com/2/tweets', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ text: content.text })
    // });

    // Simulated response
    const postId = `tw_${this.generateId()}`;

    this.log(`Twitter post created: ${postId}`, 'success');

    return {
      postId,
      postUrl: `https://twitter.com/i/status/${postId}`,
      platform: 'twitter'
    };
  }

  /**
   * Publish to LinkedIn
   */
  async _publishToLinkedIn(content, credentials, options = {}) {
    const { accessToken, personUrn } = credentials;

    if (!accessToken) {
      throw new Error('LinkedIn access token is required');
    }

    // Simulate API call (replace with actual LinkedIn API integration)
    // const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     author: personUrn,
    //     lifecycleState: 'PUBLISHED',
    //     specificContent: {
    //       'com.linkedin.ugc.ShareContent': {
    //         shareCommentary: { text: content.text },
    //         shareMediaCategory: 'NONE'
    //       }
    //     },
    //     visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    //   })
    // });

    const postId = `li_${this.generateId()}`;

    this.log(`LinkedIn post created: ${postId}`, 'success');

    return {
      postId,
      postUrl: `https://linkedin.com/feed/update/${postId}`,
      platform: 'linkedin'
    };
  }

  /**
   * Publish to Facebook
   */
  async _publishToFacebook(content, credentials, options = {}) {
    const { accessToken, pageId } = credentials;

    if (!accessToken || !pageId) {
      throw new Error('Facebook access token and page ID are required');
    }

    // Simulate API call (replace with actual Facebook Graph API integration)
    // const response = await fetch(
    //   `https://graph.facebook.com/v18.0/${pageId}/feed`,
    //   {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       message: content.text,
    //       access_token: accessToken
    //     })
    //   }
    // );

    const postId = `fb_${this.generateId()}`;

    this.log(`Facebook post created: ${postId}`, 'success');

    return {
      postId,
      postUrl: `https://facebook.com/${pageId}/posts/${postId}`,
      platform: 'facebook'
    };
  }

  /**
   * Publish to Instagram
   */
  async _publishToInstagram(content, credentials, options = {}) {
    const { accessToken, igUserId } = credentials;

    if (!accessToken || !igUserId) {
      throw new Error('Instagram access token and user ID are required');
    }

    if (!content.media || content.media.length === 0) {
      throw new Error('Instagram requires at least one media attachment');
    }

    // Instagram posting is a two-step process:
    // 1. Create a media container
    // 2. Publish the container

    // Simulate API call (replace with actual Instagram Graph API integration)
    const postId = `ig_${this.generateId()}`;

    this.log(`Instagram post created: ${postId}`, 'success');

    return {
      postId,
      postUrl: `https://instagram.com/p/${postId}`,
      platform: 'instagram'
    };
  }

  /**
   * Publish via Email
   */
  async _publishToEmail(content, credentials, options = {}) {
    const { provider, apiKey, fromEmail, fromName } = credentials;
    const { recipients, subject } = options;

    if (!apiKey) {
      throw new Error('Email API key is required');
    }

    if (!recipients || recipients.length === 0) {
      throw new Error('At least one email recipient is required');
    }

    // Simulate API call based on provider (replace with actual integration)
    // For SendGrid:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: recipients.map(email => ({ email })) }],
    //     from: { email: fromEmail, name: fromName },
    //     subject: subject || 'New Update',
    //     content: [{ type: 'text/html', value: content.html || content.text }]
    //   })
    // });

    const messageId = `email_${this.generateId()}`;

    this.log(`Email sent: ${messageId} to ${recipients.length} recipients`, 'success');

    return {
      postId: messageId,
      postUrl: null,
      platform: 'email',
      recipientCount: recipients.length
    };
  }

  /**
   * Publish to Blog
   */
  async _publishToBlog(content, credentials, options = {}) {
    const { provider, apiKey, webhookUrl, siteUrl } = credentials;

    if (!webhookUrl && !apiKey) {
      throw new Error('Blog webhook URL or API key is required');
    }

    // Simulate API call (replace with actual blog API integration)
    // For WordPress:
    // const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     title: content.title || 'New Post',
    //     content: content.html || content.text,
    //     status: 'publish'
    //   })
    // });

    const postId = `blog_${this.generateId()}`;
    const slug = (content.title || 'new-post').toLowerCase().replace(/\s+/g, '-');

    this.log(`Blog post created: ${postId}`, 'success');

    return {
      postId,
      postUrl: siteUrl ? `${siteUrl}/posts/${slug}` : null,
      platform: 'blog'
    };
  }

  /**
   * Get available platforms
   */
  static getPlatformAdapters() {
    return PLATFORM_ADAPTERS;
  }

  /**
   * Get publish statuses
   */
  static getPublishStatuses() {
    return PUBLISH_STATUS;
  }
}

module.exports = {
  PlatformPublisher,
  PLATFORM_ADAPTERS,
  PUBLISH_STATUS
};
