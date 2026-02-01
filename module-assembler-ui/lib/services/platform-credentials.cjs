/**
 * Platform Credentials Service
 *
 * Handles OAuth flows and credential management for social platforms:
 * - OAuth 2.0 authorization flows
 * - Token storage and refresh
 * - Platform connection status
 * - Secure credential handling
 */

const crypto = require('crypto');

/**
 * OAuth configuration for each platform
 */
const OAUTH_CONFIG = {
  twitter: {
    name: 'Twitter/X',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    pkce: true
  },
  linkedin: {
    name: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    revokeUrl: null,
    scopes: ['w_member_social', 'r_liteprofile', 'r_emailaddress'],
    pkce: false
  },
  facebook: {
    name: 'Facebook',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    revokeUrl: null,
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    pkce: false
  },
  instagram: {
    name: 'Instagram',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    longLivedTokenUrl: 'https://graph.instagram.com/access_token',
    revokeUrl: null,
    scopes: ['user_profile', 'user_media'],
    pkce: false
  }
};

/**
 * Email provider configurations
 */
const EMAIL_PROVIDERS = {
  sendgrid: {
    name: 'SendGrid',
    type: 'api_key',
    testEndpoint: 'https://api.sendgrid.com/v3/user/credits',
    docsUrl: 'https://sendgrid.com/docs/API_Reference/api_v3.html'
  },
  mailgun: {
    name: 'Mailgun',
    type: 'api_key',
    testEndpoint: 'https://api.mailgun.net/v3/domains',
    docsUrl: 'https://documentation.mailgun.com/'
  },
  ses: {
    name: 'Amazon SES',
    type: 'aws_credentials',
    docsUrl: 'https://docs.aws.amazon.com/ses/'
  },
  smtp: {
    name: 'Custom SMTP',
    type: 'smtp',
    docsUrl: null
  }
};

/**
 * Blog provider configurations
 */
const BLOG_PROVIDERS = {
  wordpress: {
    name: 'WordPress',
    type: 'oauth2',
    authUrl: 'https://public-api.wordpress.com/oauth2/authorize',
    tokenUrl: 'https://public-api.wordpress.com/oauth2/token',
    apiBase: '/wp-json/wp/v2'
  },
  ghost: {
    name: 'Ghost',
    type: 'admin_api_key',
    docsUrl: 'https://ghost.org/docs/admin-api/'
  },
  webflow: {
    name: 'Webflow',
    type: 'api_token',
    authUrl: 'https://webflow.com/oauth/authorize',
    tokenUrl: 'https://api.webflow.com/oauth/access_token',
    apiBase: 'https://api.webflow.com'
  },
  custom: {
    name: 'Custom Webhook',
    type: 'webhook',
    docsUrl: null
  }
};

/**
 * Platform Credentials Manager class
 */
class PlatformCredentials {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.db = options.db || null;
    this.encryptionKey = options.encryptionKey || process.env.CREDENTIALS_ENCRYPTION_KEY;

    // In-memory storage
    this.credentials = new Map();
    this.pendingAuth = new Map(); // Stores state for OAuth flows
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = {
        info: '🔑',
        success: '✅',
        warn: '⚠️',
        error: '❌',
        auth: '🔐'
      }[type] || '🔑';
      console.log(`${prefix} [PlatformCredentials] ${message}`);
    }
  }

  /**
   * Generate a random state for OAuth
   */
  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');

    return { verifier, challenge };
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data) {
    if (!this.encryptionKey) {
      return JSON.stringify(data);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    });
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    if (!this.encryptionKey) {
      return JSON.parse(encryptedData);
    }

    const { iv, encrypted, authTag } = JSON.parse(encryptedData);
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Start OAuth flow for a platform
   * @param {string} platform - Platform name
   * @param {Object} config - OAuth client configuration
   * @param {string} redirectUri - OAuth redirect URI
   */
  async startOAuthFlow(platform, config, redirectUri) {
    const oauthConfig = OAUTH_CONFIG[platform];
    if (!oauthConfig) {
      throw new Error(`OAuth not supported for platform: ${platform}`);
    }

    const { clientId } = config;
    if (!clientId) {
      throw new Error('OAuth client ID is required');
    }

    // Generate state for CSRF protection
    const state = this.generateState();

    // Generate PKCE if required
    let pkce = null;
    if (oauthConfig.pkce) {
      pkce = this.generatePKCE();
    }

    // Store pending auth data
    this.pendingAuth.set(state, {
      platform,
      clientId,
      clientSecret: config.clientSecret,
      redirectUri,
      pkce,
      createdAt: new Date().toISOString()
    });

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: oauthConfig.scopes.join(' '),
      state
    });

    if (pkce) {
      params.set('code_challenge', pkce.challenge);
      params.set('code_challenge_method', 'S256');
    }

    const authUrl = `${oauthConfig.authUrl}?${params.toString()}`;

    this.log(`Started OAuth flow for ${platform}`, 'auth');

    return {
      success: true,
      platform,
      authUrl,
      state
    };
  }

  /**
   * Complete OAuth flow by exchanging code for tokens
   * @param {string} code - Authorization code
   * @param {string} state - State from authorization
   */
  async completeOAuthFlow(code, state) {
    const pendingAuth = this.pendingAuth.get(state);
    if (!pendingAuth) {
      throw new Error('Invalid or expired OAuth state');
    }

    const { platform, clientId, clientSecret, redirectUri, pkce } = pendingAuth;
    const oauthConfig = OAUTH_CONFIG[platform];

    // Build token request
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId
    });

    if (clientSecret) {
      tokenParams.set('client_secret', clientSecret);
    }

    if (pkce) {
      tokenParams.set('code_verifier', pkce.verifier);
    }

    // Exchange code for tokens
    // In production, this would make an actual HTTP request
    // const response = await fetch(oauthConfig.tokenUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: tokenParams.toString()
    // });
    // const tokens = await response.json();

    // Simulated token response
    const tokens = {
      access_token: `${platform}_access_${crypto.randomBytes(16).toString('hex')}`,
      refresh_token: `${platform}_refresh_${crypto.randomBytes(16).toString('hex')}`,
      expires_in: 7200,
      token_type: 'Bearer',
      scope: oauthConfig.scopes.join(' ')
    };

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Store credentials
    const credentials = {
      platform,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.saveCredentials(platform, credentials);

    // Clean up pending auth
    this.pendingAuth.delete(state);

    this.log(`Completed OAuth flow for ${platform}`, 'success');

    return {
      success: true,
      platform,
      connectedAt: credentials.connectedAt,
      expiresAt
    };
  }

  /**
   * Refresh OAuth tokens
   * @param {string} platform - Platform name
   */
  async refreshTokens(platform) {
    const credentials = await this.getCredentials(platform);
    if (!credentials) {
      throw new Error(`No credentials found for ${platform}`);
    }

    if (!credentials.refreshToken) {
      throw new Error(`No refresh token available for ${platform}`);
    }

    const oauthConfig = OAUTH_CONFIG[platform];
    if (!oauthConfig) {
      throw new Error(`OAuth not supported for platform: ${platform}`);
    }

    // In production, this would make an actual HTTP request
    // const response = await fetch(oauthConfig.tokenUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams({
    //     grant_type: 'refresh_token',
    //     refresh_token: credentials.refreshToken,
    //     client_id: credentials.clientId
    //   }).toString()
    // });

    // Simulated refresh response
    const tokens = {
      access_token: `${platform}_access_${crypto.randomBytes(16).toString('hex')}`,
      refresh_token: credentials.refreshToken, // Some platforms return new refresh token
      expires_in: 7200
    };

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Update credentials
    credentials.accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      credentials.refreshToken = tokens.refresh_token;
    }
    credentials.expiresAt = expiresAt;
    credentials.updatedAt = new Date().toISOString();

    await this.saveCredentials(platform, credentials);

    this.log(`Refreshed tokens for ${platform}`, 'success');

    return {
      success: true,
      platform,
      expiresAt
    };
  }

  /**
   * Save credentials for a platform
   * @param {string} platform - Platform name
   * @param {Object} credentials - Credentials to save
   */
  async saveCredentials(platform, credentials) {
    const encryptedData = this.encrypt(credentials);

    if (this.db && this.db.savePlatformCredentials) {
      await this.db.savePlatformCredentials(platform, encryptedData);
    } else {
      this.credentials.set(platform, encryptedData);
    }

    this.log(`Saved credentials for ${platform}`, 'success');
  }

  /**
   * Get credentials for a platform
   * @param {string} platform - Platform name
   */
  async getCredentials(platform) {
    let encryptedData;

    if (this.db && this.db.getPlatformCredentials) {
      encryptedData = await this.db.getPlatformCredentials(platform);
    } else {
      encryptedData = this.credentials.get(platform);
    }

    if (!encryptedData) {
      return null;
    }

    return this.decrypt(encryptedData);
  }

  /**
   * Delete credentials for a platform
   * @param {string} platform - Platform name
   */
  async deleteCredentials(platform) {
    // Revoke tokens if possible
    const credentials = await this.getCredentials(platform);
    if (credentials?.accessToken) {
      const oauthConfig = OAUTH_CONFIG[platform];
      if (oauthConfig?.revokeUrl) {
        // In production, revoke the token
        // await fetch(oauthConfig.revokeUrl, { ... });
      }
    }

    if (this.db && this.db.deletePlatformCredentials) {
      await this.db.deletePlatformCredentials(platform);
    } else {
      this.credentials.delete(platform);
    }

    this.log(`Deleted credentials for ${platform}`, 'success');

    return { success: true, platform };
  }

  /**
   * Save API key credentials (for email/blog providers)
   * @param {string} platform - Platform name (email or blog)
   * @param {string} provider - Provider name
   * @param {Object} credentials - API credentials
   */
  async saveApiCredentials(platform, provider, credentials) {
    const providers = platform === 'email' ? EMAIL_PROVIDERS : BLOG_PROVIDERS;
    const providerConfig = providers[provider];

    if (!providerConfig) {
      throw new Error(`Unknown ${platform} provider: ${provider}`);
    }

    const credentialEntry = {
      platform,
      provider,
      providerName: providerConfig.name,
      ...credentials,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.saveCredentials(platform, credentialEntry);

    return {
      success: true,
      platform,
      provider,
      connectedAt: credentialEntry.connectedAt
    };
  }

  /**
   * Test API credentials
   * @param {string} platform - Platform name
   * @param {string} provider - Provider name
   */
  async testCredentials(platform, provider) {
    const credentials = await this.getCredentials(platform);
    if (!credentials) {
      return { success: false, error: 'No credentials configured' };
    }

    // In production, this would test the actual connection
    // For now, we'll simulate a successful test

    this.log(`Tested credentials for ${platform}/${provider}`, 'success');

    return {
      success: true,
      platform,
      provider,
      testedAt: new Date().toISOString()
    };
  }

  /**
   * Get connection status for all platforms
   */
  async getConnectionStatus() {
    const status = {
      social: {},
      email: null,
      blog: null
    };

    // Check social platforms
    for (const platform of Object.keys(OAUTH_CONFIG)) {
      const credentials = await this.getCredentials(platform);
      status.social[platform] = {
        connected: !!credentials,
        name: OAUTH_CONFIG[platform].name,
        connectedAt: credentials?.connectedAt || null,
        expiresAt: credentials?.expiresAt || null,
        needsRefresh: credentials?.expiresAt
          ? new Date(credentials.expiresAt) < new Date(Date.now() + 5 * 60 * 1000)
          : false
      };
    }

    // Check email
    const emailCreds = await this.getCredentials('email');
    if (emailCreds) {
      status.email = {
        connected: true,
        provider: emailCreds.provider,
        providerName: emailCreds.providerName,
        connectedAt: emailCreds.connectedAt
      };
    }

    // Check blog
    const blogCreds = await this.getCredentials('blog');
    if (blogCreds) {
      status.blog = {
        connected: true,
        provider: blogCreds.provider,
        providerName: blogCreds.providerName,
        connectedAt: blogCreds.connectedAt
      };
    }

    return {
      success: true,
      status
    };
  }

  /**
   * Check if tokens need refresh and refresh if necessary
   * @param {string} platform - Platform name
   */
  async ensureValidTokens(platform) {
    const credentials = await this.getCredentials(platform);
    if (!credentials) {
      throw new Error(`No credentials configured for ${platform}`);
    }

    // Check if token is expiring soon (within 5 minutes)
    if (credentials.expiresAt) {
      const expiresAt = new Date(credentials.expiresAt);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

      if (expiresAt < fiveMinutesFromNow) {
        await this.refreshTokens(platform);
      }
    }

    return await this.getCredentials(platform);
  }

  /**
   * Get OAuth configuration
   */
  static getOAuthConfig() {
    return OAUTH_CONFIG;
  }

  /**
   * Get email providers
   */
  static getEmailProviders() {
    return EMAIL_PROVIDERS;
  }

  /**
   * Get blog providers
   */
  static getBlogProviders() {
    return BLOG_PROVIDERS;
  }
}

module.exports = {
  PlatformCredentials,
  OAUTH_CONFIG,
  EMAIL_PROVIDERS,
  BLOG_PROVIDERS
};
