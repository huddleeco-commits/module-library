/**
 * Platform Integrations
 *
 * Actual API implementations for each social media platform.
 * Each integration handles:
 * - API authentication
 * - Content formatting
 * - Media uploads
 * - Error handling
 * - Rate limiting
 */

/**
 * Base class for platform integrations
 */
class BasePlatformIntegration {
  constructor(credentials, options = {}) {
    this.credentials = credentials;
    this.verbose = options.verbose !== false;
    this.baseUrl = '';
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' }[type] || 'ℹ️';
      console.log(`${prefix} [${this.constructor.name}] ${message}`);
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Error: ${error.message || error.error || response.statusText}`);
    }

    return response.json();
  }

  getAuthHeaders() {
    return {};
  }

  async publish(content, options = {}) {
    throw new Error('publish() must be implemented by subclass');
  }

  async uploadMedia(mediaUrl, mediaType) {
    throw new Error('uploadMedia() must be implemented by subclass');
  }
}

/**
 * Twitter/X Integration (API v2)
 * https://developer.twitter.com/en/docs/twitter-api
 */
class TwitterIntegration extends BasePlatformIntegration {
  constructor(credentials, options = {}) {
    super(credentials, options);
    this.baseUrl = 'https://api.twitter.com/2';
    this.uploadUrl = 'https://upload.twitter.com/1.1';
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.credentials.accessToken}`
    };
  }

  async publish(content, options = {}) {
    this.log('Publishing to Twitter...');

    const payload = {
      text: content.text
    };

    // Handle media attachments
    if (content.media && content.media.length > 0) {
      const mediaIds = [];
      for (const media of content.media) {
        const mediaId = await this.uploadMedia(media.url, media.type);
        mediaIds.push(mediaId);
      }
      payload.media = { media_ids: mediaIds };
    }

    // Handle reply
    if (options.replyToId) {
      payload.reply = { in_reply_to_tweet_id: options.replyToId };
    }

    // Handle quote tweet
    if (options.quoteTweetId) {
      payload.quote_tweet_id = options.quoteTweetId;
    }

    const response = await this.makeRequest('/tweets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const tweetId = response.data.id;

    this.log(`Tweet published: ${tweetId}`, 'success');

    return {
      postId: tweetId,
      postUrl: `https://twitter.com/i/status/${tweetId}`,
      platform: 'twitter',
      raw: response
    };
  }

  async uploadMedia(mediaUrl, mediaType = 'image') {
    // Twitter media upload is a multi-step process:
    // 1. INIT - Initialize the upload
    // 2. APPEND - Upload the media in chunks
    // 3. FINALIZE - Complete the upload

    this.log(`Uploading media: ${mediaType}`);

    // Fetch the media file
    const mediaResponse = await fetch(mediaUrl);
    const mediaBuffer = await mediaResponse.arrayBuffer();
    const mediaBase64 = Buffer.from(mediaBuffer).toString('base64');

    // For images, we can use the simple upload
    const formData = new URLSearchParams();
    formData.append('media_data', mediaBase64);

    const response = await fetch(`${this.uploadUrl}/media/upload.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error('Failed to upload media to Twitter');
    }

    const data = await response.json();
    return data.media_id_string;
  }

  async createThread(tweets) {
    this.log(`Creating thread with ${tweets.length} tweets`);

    const results = [];
    let previousTweetId = null;

    for (const tweet of tweets) {
      const options = previousTweetId ? { replyToId: previousTweetId } : {};
      const result = await this.publish({ text: tweet }, options);
      results.push(result);
      previousTweetId = result.postId;
    }

    return {
      threadId: results[0].postId,
      tweets: results,
      platform: 'twitter'
    };
  }
}

/**
 * LinkedIn Integration (API v2)
 * https://docs.microsoft.com/en-us/linkedin/marketing/
 */
class LinkedInIntegration extends BasePlatformIntegration {
  constructor(credentials, options = {}) {
    super(credentials, options);
    this.baseUrl = 'https://api.linkedin.com/v2';
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.credentials.accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0'
    };
  }

  async getPersonUrn() {
    if (this.credentials.personUrn) {
      return this.credentials.personUrn;
    }

    // Fetch the person URN from the API
    const response = await this.makeRequest('/me');
    return `urn:li:person:${response.id}`;
  }

  async publish(content, options = {}) {
    this.log('Publishing to LinkedIn...');

    const author = await this.getPersonUrn();

    const payload = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': options.visibility || 'PUBLIC'
      }
    };

    // Handle media attachments
    if (content.media && content.media.length > 0) {
      const mediaAssets = [];
      for (const media of content.media) {
        const asset = await this.uploadMedia(media.url, media.type);
        mediaAssets.push({
          status: 'READY',
          media: asset.asset,
          title: {
            text: media.title || ''
          },
          description: {
            text: media.description || ''
          }
        });
      }

      payload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
      payload.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets;
    }

    // Handle article sharing
    if (content.articleUrl) {
      payload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      payload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        originalUrl: content.articleUrl,
        title: { text: content.articleTitle || '' },
        description: { text: content.articleDescription || '' }
      }];
    }

    const response = await this.makeRequest('/ugcPosts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const postId = response.id;

    this.log(`LinkedIn post published: ${postId}`, 'success');

    return {
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${postId}`,
      platform: 'linkedin',
      raw: response
    };
  }

  async uploadMedia(mediaUrl, mediaType = 'image') {
    this.log(`Uploading media to LinkedIn: ${mediaType}`);

    const owner = await this.getPersonUrn();

    // Step 1: Register the upload
    const registerResponse = await this.makeRequest('/assets?action=registerUpload', {
      method: 'POST',
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }]
        }
      })
    });

    const uploadUrl = registerResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    const asset = registerResponse.value.asset;

    // Step 2: Upload the media file
    const mediaResponse = await fetch(mediaUrl);
    const mediaBuffer = await mediaResponse.arrayBuffer();

    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`
      },
      body: Buffer.from(mediaBuffer)
    });

    return { asset };
  }
}

/**
 * Facebook Integration (Graph API)
 * https://developers.facebook.com/docs/graph-api/
 */
class FacebookIntegration extends BasePlatformIntegration {
  constructor(credentials, options = {}) {
    super(credentials, options);
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.pageId = credentials.pageId;
    this.pageAccessToken = credentials.pageAccessToken || credentials.accessToken;
  }

  getAuthHeaders() {
    return {}; // Facebook uses query param for auth
  }

  async publish(content, options = {}) {
    this.log('Publishing to Facebook...');

    if (!this.pageId) {
      throw new Error('Facebook Page ID is required');
    }

    const params = new URLSearchParams({
      access_token: this.pageAccessToken,
      message: content.text
    });

    // Handle link sharing
    if (content.link) {
      params.append('link', content.link);
    }

    let endpoint = `/${this.pageId}/feed`;

    // Handle photo posts
    if (content.media && content.media.length > 0 && content.media[0].type === 'image') {
      endpoint = `/${this.pageId}/photos`;
      params.append('url', content.media[0].url);
      params.delete('message');
      params.append('caption', content.text);
    }

    // Handle video posts
    if (content.media && content.media.length > 0 && content.media[0].type === 'video') {
      endpoint = `/${this.pageId}/videos`;
      params.append('file_url', content.media[0].url);
      params.append('description', content.text);
      params.delete('message');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const postId = data.id || data.post_id;

    this.log(`Facebook post published: ${postId}`, 'success');

    return {
      postId,
      postUrl: `https://www.facebook.com/${postId}`,
      platform: 'facebook',
      raw: data
    };
  }

  async getPages() {
    const response = await fetch(
      `${this.baseUrl}/me/accounts?access_token=${this.credentials.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook pages');
    }

    const data = await response.json();
    return data.data.map(page => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token
    }));
  }
}

/**
 * Instagram Integration (Instagram Graph API)
 * https://developers.facebook.com/docs/instagram-api/
 */
class InstagramIntegration extends BasePlatformIntegration {
  constructor(credentials, options = {}) {
    super(credentials, options);
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.igUserId = credentials.igUserId;
    this.accessToken = credentials.accessToken;
  }

  async publish(content, options = {}) {
    this.log('Publishing to Instagram...');

    if (!this.igUserId) {
      throw new Error('Instagram Business Account ID is required');
    }

    if (!content.media || content.media.length === 0) {
      throw new Error('Instagram requires at least one image or video');
    }

    const media = content.media[0];

    // Step 1: Create a media container
    const containerParams = new URLSearchParams({
      access_token: this.accessToken,
      caption: content.text
    });

    if (media.type === 'video') {
      containerParams.append('video_url', media.url);
      containerParams.append('media_type', 'VIDEO');
    } else {
      containerParams.append('image_url', media.url);
    }

    const containerResponse = await fetch(
      `${this.baseUrl}/${this.igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: containerParams.toString()
      }
    );

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(`Instagram API Error: ${error.error?.message || 'Failed to create media container'}`);
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    // Step 2: Wait for media to be ready (for videos)
    if (media.type === 'video') {
      await this.waitForMediaReady(containerId);
    }

    // Step 3: Publish the media container
    const publishParams = new URLSearchParams({
      access_token: this.accessToken,
      creation_id: containerId
    });

    const publishResponse = await fetch(
      `${this.baseUrl}/${this.igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: publishParams.toString()
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(`Instagram API Error: ${error.error?.message || 'Failed to publish'}`);
    }

    const publishData = await publishResponse.json();
    const postId = publishData.id;

    this.log(`Instagram post published: ${postId}`, 'success');

    return {
      postId,
      postUrl: `https://www.instagram.com/p/${postId}`,
      platform: 'instagram',
      raw: publishData
    };
  }

  async waitForMediaReady(containerId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const statusResponse = await fetch(
        `${this.baseUrl}/${containerId}?fields=status_code&access_token=${this.accessToken}`
      );
      const statusData = await statusResponse.json();

      if (statusData.status_code === 'FINISHED') {
        return true;
      }

      if (statusData.status_code === 'ERROR') {
        throw new Error('Instagram media processing failed');
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Instagram media processing timed out');
  }

  async createCarousel(content) {
    this.log('Creating Instagram carousel...');

    if (!content.media || content.media.length < 2) {
      throw new Error('Carousel requires at least 2 media items');
    }

    // Step 1: Create individual media containers
    const childrenIds = [];

    for (const media of content.media) {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        is_carousel_item: 'true'
      });

      if (media.type === 'video') {
        params.append('video_url', media.url);
        params.append('media_type', 'VIDEO');
      } else {
        params.append('image_url', media.url);
      }

      const response = await fetch(
        `${this.baseUrl}/${this.igUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        }
      );

      const data = await response.json();
      childrenIds.push(data.id);
    }

    // Step 2: Create carousel container
    const carouselParams = new URLSearchParams({
      access_token: this.accessToken,
      media_type: 'CAROUSEL',
      caption: content.text,
      children: childrenIds.join(',')
    });

    const carouselResponse = await fetch(
      `${this.baseUrl}/${this.igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: carouselParams.toString()
      }
    );

    const carouselData = await carouselResponse.json();

    // Step 3: Publish the carousel
    const publishParams = new URLSearchParams({
      access_token: this.accessToken,
      creation_id: carouselData.id
    });

    const publishResponse = await fetch(
      `${this.baseUrl}/${this.igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: publishParams.toString()
      }
    );

    const publishData = await publishResponse.json();

    return {
      postId: publishData.id,
      postUrl: `https://www.instagram.com/p/${publishData.id}`,
      platform: 'instagram',
      type: 'carousel'
    };
  }
}

/**
 * Email Integration (SendGrid, Mailgun, SES)
 */
class EmailIntegration extends BasePlatformIntegration {
  constructor(credentials, options = {}) {
    super(credentials, options);
    this.provider = credentials.provider;
    this.apiKey = credentials.apiKey;
    this.fromEmail = credentials.fromEmail;
    this.fromName = credentials.fromName;

    switch (this.provider) {
      case 'sendgrid':
        this.baseUrl = 'https://api.sendgrid.com/v3';
        break;
      case 'mailgun':
        this.baseUrl = `https://api.mailgun.net/v3/${credentials.domain}`;
        break;
      default:
        this.baseUrl = '';
    }
  }

  async publish(content, options = {}) {
    const { recipients, subject, template } = options;

    if (!recipients || recipients.length === 0) {
      throw new Error('At least one recipient email is required');
    }

    this.log(`Sending email to ${recipients.length} recipient(s)...`);

    switch (this.provider) {
      case 'sendgrid':
        return await this.sendViaSendGrid(content, recipients, subject, template);
      case 'mailgun':
        return await this.sendViaMailgun(content, recipients, subject);
      default:
        throw new Error(`Email provider ${this.provider} not implemented`);
    }
  }

  async sendViaSendGrid(content, recipients, subject, template) {
    const payload = {
      personalizations: [{
        to: recipients.map(email => ({ email }))
      }],
      from: {
        email: this.fromEmail,
        name: this.fromName
      },
      subject: subject || 'New Update',
      content: []
    };

    if (content.html) {
      payload.content.push({ type: 'text/html', value: content.html });
    }
    if (content.text) {
      payload.content.push({ type: 'text/plain', value: content.text });
    }

    if (template) {
      payload.template_id = template;
      delete payload.content;
    }

    const response = await fetch(`${this.baseUrl}/mail/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`SendGrid Error: ${error.errors?.[0]?.message || response.statusText}`);
    }

    const messageId = response.headers.get('x-message-id') || `sg_${Date.now()}`;

    this.log(`Email sent via SendGrid: ${messageId}`, 'success');

    return {
      postId: messageId,
      postUrl: null,
      platform: 'email',
      provider: 'sendgrid',
      recipientCount: recipients.length
    };
  }

  async sendViaMailgun(content, recipients, subject) {
    const formData = new URLSearchParams();
    formData.append('from', `${this.fromName} <${this.fromEmail}>`);
    formData.append('to', recipients.join(','));
    formData.append('subject', subject || 'New Update');

    if (content.html) {
      formData.append('html', content.html);
    }
    if (content.text) {
      formData.append('text', content.text);
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`api:${this.apiKey}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Mailgun Error: ${error.message || response.statusText}`);
    }

    const data = await response.json();

    this.log(`Email sent via Mailgun: ${data.id}`, 'success');

    return {
      postId: data.id,
      postUrl: null,
      platform: 'email',
      provider: 'mailgun',
      recipientCount: recipients.length
    };
  }
}

/**
 * Blog Integration (WordPress, Ghost, Webflow, Webhook)
 */
class BlogIntegration extends BasePlatformIntegration {
  constructor(credentials, options = {}) {
    super(credentials, options);
    this.provider = credentials.provider;
    this.siteUrl = credentials.siteUrl;
    this.apiKey = credentials.apiKey;
    this.webhookUrl = credentials.webhookUrl;

    switch (this.provider) {
      case 'wordpress':
        this.baseUrl = `${this.siteUrl}/wp-json/wp/v2`;
        break;
      case 'ghost':
        this.baseUrl = `${this.siteUrl}/ghost/api/admin`;
        break;
      default:
        this.baseUrl = this.siteUrl || '';
    }
  }

  async publish(content, options = {}) {
    this.log(`Publishing to ${this.provider}...`);

    switch (this.provider) {
      case 'wordpress':
        return await this.publishToWordPress(content, options);
      case 'ghost':
        return await this.publishToGhost(content, options);
      case 'custom':
      case 'webhook':
        return await this.publishViaWebhook(content, options);
      default:
        throw new Error(`Blog provider ${this.provider} not implemented`);
    }
  }

  async publishToWordPress(content, options = {}) {
    const payload = {
      title: content.title || 'New Post',
      content: content.html || content.text,
      status: options.draft ? 'draft' : 'publish',
      categories: options.categories || [],
      tags: options.tags || []
    };

    if (content.excerpt) {
      payload.excerpt = content.excerpt;
    }

    if (content.featuredImage) {
      // Would need to upload media first and get ID
      // payload.featured_media = mediaId;
    }

    const response = await fetch(`${this.baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken || this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`WordPress Error: ${error.message || response.statusText}`);
    }

    const data = await response.json();

    this.log(`WordPress post published: ${data.id}`, 'success');

    return {
      postId: data.id.toString(),
      postUrl: data.link,
      platform: 'blog',
      provider: 'wordpress',
      raw: data
    };
  }

  async publishToGhost(content, options = {}) {
    // Ghost Admin API uses JWT for auth
    const token = this.generateGhostJWT();

    const payload = {
      posts: [{
        title: content.title || 'New Post',
        html: content.html || `<p>${content.text}</p>`,
        status: options.draft ? 'draft' : 'published',
        tags: options.tags?.map(tag => ({ name: tag })) || []
      }]
    };

    if (content.excerpt) {
      payload.posts[0].custom_excerpt = content.excerpt;
    }

    const response = await fetch(`${this.baseUrl}/posts/?source=html`, {
      method: 'POST',
      headers: {
        'Authorization': `Ghost ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Ghost Error: ${error.errors?.[0]?.message || response.statusText}`);
    }

    const data = await response.json();
    const post = data.posts[0];

    this.log(`Ghost post published: ${post.id}`, 'success');

    return {
      postId: post.id,
      postUrl: post.url,
      platform: 'blog',
      provider: 'ghost',
      raw: post
    };
  }

  generateGhostJWT() {
    // Ghost Admin API key format: {id}:{secret}
    const [id, secret] = this.apiKey.split(':');

    // In production, use a proper JWT library
    // For now, return the key as-is (simplified)
    return this.apiKey;
  }

  async publishViaWebhook(content, options = {}) {
    if (!this.webhookUrl) {
      throw new Error('Webhook URL is required for custom blog integration');
    }

    const payload = {
      title: content.title,
      content: content.html || content.text,
      text: content.text,
      excerpt: content.excerpt,
      tags: options.tags,
      categories: options.categories,
      metadata: options.metadata,
      publishedAt: new Date().toISOString()
    };

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook Error: ${response.statusText}`);
    }

    const data = await response.json().catch(() => ({}));

    this.log(`Blog post published via webhook`, 'success');

    return {
      postId: data.id || `webhook_${Date.now()}`,
      postUrl: data.url || null,
      platform: 'blog',
      provider: 'webhook',
      raw: data
    };
  }
}

/**
 * Factory function to get the appropriate integration
 */
function getIntegration(platform, credentials, options = {}) {
  switch (platform) {
    case 'twitter':
      return new TwitterIntegration(credentials, options);
    case 'linkedin':
      return new LinkedInIntegration(credentials, options);
    case 'facebook':
      return new FacebookIntegration(credentials, options);
    case 'instagram':
      return new InstagramIntegration(credentials, options);
    case 'email':
      return new EmailIntegration(credentials, options);
    case 'blog':
      return new BlogIntegration(credentials, options);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

module.exports = {
  BasePlatformIntegration,
  TwitterIntegration,
  LinkedInIntegration,
  FacebookIntegration,
  InstagramIntegration,
  EmailIntegration,
  BlogIntegration,
  getIntegration
};
