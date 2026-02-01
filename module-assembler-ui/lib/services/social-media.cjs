/**
 * Social Media Service
 *
 * A comprehensive service for managing social media operations:
 * - Setup configuration and persistence
 * - Content generation (captions, hashtags, ideas)
 * - Post scheduling and management
 * - Analytics and insights
 * - AI assistant for wizard guidance
 *
 * Uses Claude AI for intelligent content generation.
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic();

/**
 * Platform configurations with limits and best practices
 */
const PLATFORM_CONFIGS = {
  instagram: {
    name: 'Instagram',
    icon: '📸',
    maxCaptionLength: 2200,
    maxHashtags: 30,
    recommendedHashtags: 11,
    mediaRequired: true,
    supportedMedia: ['image', 'video', 'carousel', 'reel', 'story'],
    bestTimes: ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'],
    audienceAge: '18-34',
    tone: 'visual, authentic, trendy'
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    maxCaptionLength: 2200,
    maxHashtags: 5,
    recommendedHashtags: 4,
    mediaRequired: true,
    supportedMedia: ['video'],
    bestTimes: ['7:00 AM', '12:00 PM', '3:00 PM', '7:00 PM'],
    audienceAge: '16-34',
    tone: 'fun, trendy, authentic, fast-paced'
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    maxCaptionLength: 63206,
    maxHashtags: 10,
    recommendedHashtags: 3,
    mediaRequired: false,
    supportedMedia: ['image', 'video', 'link', 'story', 'event'],
    bestTimes: ['9:00 AM', '1:00 PM', '4:00 PM'],
    audienceAge: '25-54',
    tone: 'community-focused, informative, engaging'
  },
  twitter: {
    name: 'X / Twitter',
    icon: '🐦',
    maxCaptionLength: 280,
    maxHashtags: 5,
    recommendedHashtags: 2,
    mediaRequired: false,
    supportedMedia: ['image', 'video', 'gif', 'poll'],
    bestTimes: ['8:00 AM', '12:00 PM', '5:00 PM'],
    audienceAge: '18-49',
    tone: 'concise, witty, current, conversational'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    maxCaptionLength: 3000,
    maxHashtags: 5,
    recommendedHashtags: 3,
    mediaRequired: false,
    supportedMedia: ['image', 'video', 'document', 'article', 'poll'],
    bestTimes: ['7:00 AM', '10:00 AM', '12:00 PM', '5:00 PM'],
    audienceAge: '25-54',
    tone: 'professional, insightful, thought-leadership'
  },
  youtube: {
    name: 'YouTube',
    icon: '▶️',
    maxTitleLength: 100,
    maxDescriptionLength: 5000,
    maxTags: 500,
    mediaRequired: true,
    supportedMedia: ['video', 'short', 'livestream'],
    bestTimes: ['2:00 PM', '4:00 PM', '9:00 PM'],
    audienceAge: '18-44',
    tone: 'engaging, informative, personality-driven'
  },
  pinterest: {
    name: 'Pinterest',
    icon: '📌',
    maxCaptionLength: 500,
    maxHashtags: 20,
    recommendedHashtags: 5,
    mediaRequired: true,
    supportedMedia: ['image', 'video', 'idea-pin'],
    bestTimes: ['8:00 PM', '9:00 PM', '11:00 PM'],
    audienceAge: '25-44',
    tone: 'inspirational, aspirational, helpful'
  },
  threads: {
    name: 'Threads',
    icon: '🧵',
    maxCaptionLength: 500,
    maxHashtags: 5,
    recommendedHashtags: 2,
    mediaRequired: false,
    supportedMedia: ['image', 'video'],
    bestTimes: ['7:00 AM', '8:00 AM', '12:00 PM'],
    audienceAge: '18-34',
    tone: 'conversational, authentic, personal'
  }
};

/**
 * Content type descriptions for AI context
 */
const CONTENT_TYPE_PROMPTS = {
  educational: 'Create educational content that teaches, informs, or provides valuable insights. Focus on tips, how-tos, and expert knowledge.',
  promotional: 'Create promotional content that highlights products, services, or offers. Focus on benefits and calls-to-action.',
  entertainment: 'Create entertaining content that engages, amuses, or captivates. Focus on trends, humor, and shareability.',
  'behind-scenes': 'Create behind-the-scenes content that shows authenticity and personality. Focus on the human side of the brand.',
  'user-generated': 'Create content that encourages user participation, testimonials, or community engagement.',
  news: 'Create news and announcement content about updates, launches, or industry developments.'
};

/**
 * Tone modifiers for content generation
 */
const TONE_MODIFIERS = {
  professional: 'Use a professional, polished tone. Be authoritative but approachable.',
  casual: 'Use a casual, conversational tone. Be friendly and relatable.',
  witty: 'Use a witty, clever tone. Include subtle humor and wordplay.',
  inspirational: 'Use an inspirational, motivating tone. Empower and uplift the audience.',
  friendly: 'Use a warm, friendly tone. Be personable and welcoming.',
  bold: 'Use a bold, confident tone. Make strong statements and be direct.'
};

/**
 * Storage paths
 */
const DATA_DIR = path.join(__dirname, '../../data');
const SETUP_FILE = path.join(DATA_DIR, 'social-media-setup.json');
const SCHEDULED_POSTS_FILE = path.join(DATA_DIR, 'scheduled-posts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Social Media Service Class
 */
class SocialMediaService {
  constructor() {
    this.setup = this.loadSetup();
    this.scheduledPosts = this.loadScheduledPosts();
  }

  /**
   * Load setup from file
   */
  loadSetup() {
    try {
      if (fs.existsSync(SETUP_FILE)) {
        return JSON.parse(fs.readFileSync(SETUP_FILE, 'utf-8'));
      }
    } catch (e) {
      console.warn('Could not load social media setup:', e.message);
    }
    return null;
  }

  /**
   * Save setup to file
   */
  saveSetup(setupData) {
    const setup = {
      ...setupData,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(SETUP_FILE, JSON.stringify(setup, null, 2));
    this.setup = setup;
    return setup;
  }

  /**
   * Get current setup
   */
  getSetup() {
    return this.setup;
  }

  /**
   * Load scheduled posts from file
   */
  loadScheduledPosts() {
    try {
      if (fs.existsSync(SCHEDULED_POSTS_FILE)) {
        return JSON.parse(fs.readFileSync(SCHEDULED_POSTS_FILE, 'utf-8'));
      }
    } catch (e) {
      console.warn('Could not load scheduled posts:', e.message);
    }
    return [];
  }

  /**
   * Save scheduled posts to file
   */
  saveScheduledPosts() {
    fs.writeFileSync(SCHEDULED_POSTS_FILE, JSON.stringify(this.scheduledPosts, null, 2));
  }

  /**
   * Generate a caption for a social media post
   */
  async generateCaption(options) {
    const {
      platform,
      topic,
      contentType = 'promotional',
      tone = 'friendly',
      includeHashtags = true,
      includeEmojis = true,
      brandVoice = '',
      customInstructions = ''
    } = options;

    const platformConfig = PLATFORM_CONFIGS[platform];
    if (!platformConfig) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const contentTypePrompt = CONTENT_TYPE_PROMPTS[contentType] || '';
    const toneModifier = TONE_MODIFIERS[tone] || TONE_MODIFIERS.friendly;

    const systemPrompt = `You are an expert social media content creator specializing in ${platformConfig.name}.

Platform Guidelines:
- Maximum caption length: ${platformConfig.maxCaptionLength} characters
- Recommended hashtags: ${platformConfig.recommendedHashtags}
- Target audience age: ${platformConfig.audienceAge}
- Platform tone: ${platformConfig.tone}

${contentTypePrompt}
${toneModifier}

${brandVoice ? `Brand Voice: ${brandVoice}` : ''}

Create engaging, platform-optimized content that drives engagement.`;

    const userPrompt = `Create a ${platformConfig.name} caption about: ${topic}

Requirements:
${includeEmojis ? '- Include relevant emojis' : '- Do not use emojis'}
${includeHashtags ? `- Include ${platformConfig.recommendedHashtags} relevant hashtags` : '- Do not include hashtags'}
- Keep within ${platformConfig.maxCaptionLength} characters
${customInstructions ? `- Additional instructions: ${customInstructions}` : ''}

Provide the caption only, ready to post.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt
    });

    const caption = response.content[0].text;

    // Extract hashtags from the caption
    const hashtagMatch = caption.match(/#\w+/g);
    const hashtags = hashtagMatch || [];

    return {
      caption,
      hashtags,
      platform,
      characterCount: caption.length,
      maxAllowed: platformConfig.maxCaptionLength,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  }

  /**
   * Generate hashtags for a topic
   */
  async generateHashtags(options) {
    const {
      topic,
      platform = 'instagram',
      industry = '',
      count = 15
    } = options;

    const platformConfig = PLATFORM_CONFIGS[platform];
    const maxHashtags = Math.min(count, platformConfig?.maxHashtags || 30);

    const systemPrompt = `You are a social media hashtag expert. Generate relevant, trending hashtags that maximize reach and engagement.`;

    const userPrompt = `Generate ${maxHashtags} hashtags for ${platform} about: ${topic}
${industry ? `Industry: ${industry}` : ''}

Provide a mix of:
- 3-4 high-volume hashtags (popular, competitive)
- 5-6 medium-volume hashtags (moderate competition)
- 4-5 niche hashtags (specific, less competitive)

Format: Return only the hashtags, one per line, including the # symbol.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt
    });

    const text = response.content[0].text;
    const hashtags = text.match(/#\w+/g) || [];

    return {
      hashtags,
      platform,
      topic,
      count: hashtags.length
    };
  }

  /**
   * Generate content ideas
   */
  async generateContentIdeas(options) {
    const {
      brandName,
      industry = '',
      platforms = ['instagram'],
      contentTypes = ['educational', 'promotional'],
      targetAudience = 'general',
      count = 10
    } = options;

    const platformNames = platforms.map(p => PLATFORM_CONFIGS[p]?.name || p).join(', ');
    const contentTypeDescriptions = contentTypes.map(t => CONTENT_TYPE_PROMPTS[t] || t).join('\n');

    const systemPrompt = `You are a creative social media strategist. Generate engaging content ideas that drive engagement and brand awareness.`;

    const userPrompt = `Generate ${count} social media content ideas for ${brandName}.

Brand Details:
- Industry: ${industry || 'Not specified'}
- Platforms: ${platformNames}
- Target Audience: ${targetAudience}

Content Types to Include:
${contentTypeDescriptions}

For each idea, provide:
1. A catchy title/hook
2. The content type (educational, promotional, etc.)
3. Best platform for this content
4. A brief description of the post
5. Suggested call-to-action

Format as a numbered list with clear sections for each idea.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt
    });

    const text = response.content[0].text;

    // Parse ideas from the response (simplified parsing)
    const ideas = text.split(/\d+\.\s+/).filter(Boolean).map((idea, index) => ({
      id: index + 1,
      content: idea.trim()
    }));

    return {
      ideas,
      brandName,
      platforms,
      contentTypes,
      count: ideas.length
    };
  }

  /**
   * Schedule a post
   */
  schedulePost(options) {
    const {
      platform,
      content,
      mediaUrls = [],
      scheduledTime,
      hashtags = [],
      location = null
    } = options;

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const post = {
      postId,
      platform,
      content,
      mediaUrls,
      scheduledTime,
      hashtags,
      location,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.scheduledPosts.push(post);
    this.saveScheduledPosts();

    return post;
  }

  /**
   * Get scheduled posts
   */
  getScheduledPosts(options = {}) {
    const { platform, status = 'pending' } = options;

    let posts = this.scheduledPosts;

    if (platform) {
      posts = posts.filter(p => p.platform === platform);
    }

    if (status) {
      posts = posts.filter(p => p.status === status);
    }

    return posts.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  }

  /**
   * Cancel a scheduled post
   */
  cancelScheduledPost(postId) {
    const index = this.scheduledPosts.findIndex(p => p.postId === postId);

    if (index === -1) {
      throw new Error('Post not found');
    }

    this.scheduledPosts[index].status = 'cancelled';
    this.saveScheduledPosts();

    return this.scheduledPosts[index];
  }

  /**
   * Handle AI assistant chat for the wizard
   */
  async handleAssistantChat(options) {
    const {
      message,
      currentStep,
      wizardContext = {},
      conversationHistory = []
    } = options;

    const systemPrompt = `You are a friendly and knowledgeable social media expert helping someone set up their social media management hub.

Current Setup Step: ${currentStep}

User's Current Configuration:
- Platforms: ${wizardContext.platforms?.join(', ') || 'Not selected'}
- Brand Name: ${wizardContext.brandName || 'Not provided'}
- Industry: ${wizardContext.industry || 'Not specified'}
- Content Types: ${wizardContext.contentTypes?.join(', ') || 'Not selected'}
- Target Audience: ${wizardContext.targetAudience || 'Not specified'}
- Posting Frequency: ${wizardContext.postingFrequency || 'Not selected'}
- Best Times: ${wizardContext.bestTimes || 'Not selected'}

Your role:
1. Answer questions about social media strategy and best practices
2. Provide recommendations based on their industry and goals
3. Help them make decisions during the setup process
4. Be encouraging and supportive

Keep responses concise and actionable. If you have specific recommendations for their setup, you can suggest values for platforms, contentTypes, targetAudience, postingFrequency, or bestTimes.`;

    // Build conversation messages
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    messages.push({ role: 'user', content: message });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages,
      system: systemPrompt
    });

    const responseText = response.content[0].text;

    // Check if the response contains suggestions
    let suggestions = null;

    // Simple detection for suggestions (could be enhanced)
    if (responseText.toLowerCase().includes('recommend') ||
        responseText.toLowerCase().includes('suggest')) {
      // Try to extract suggestions based on context
      if (currentStep === 'platforms' && responseText.match(/instagram|tiktok|facebook|linkedin|twitter/i)) {
        const platforms = [];
        if (responseText.toLowerCase().includes('instagram')) platforms.push('instagram');
        if (responseText.toLowerCase().includes('tiktok')) platforms.push('tiktok');
        if (responseText.toLowerCase().includes('facebook')) platforms.push('facebook');
        if (responseText.toLowerCase().includes('linkedin')) platforms.push('linkedin');
        if (responseText.toLowerCase().includes('twitter')) platforms.push('twitter');
        if (platforms.length > 0) {
          suggestions = { platforms };
        }
      }

      if (currentStep === 'scheduling' && responseText.match(/daily|weekly|3x|multiple/i)) {
        if (responseText.toLowerCase().includes('daily')) {
          suggestions = { ...suggestions, postingFrequency: 'daily' };
        } else if (responseText.toLowerCase().includes('3x')) {
          suggestions = { ...suggestions, postingFrequency: '3x-week' };
        }
      }
    }

    return {
      response: responseText,
      suggestions
    };
  }

  /**
   * Get analytics (placeholder for future implementation)
   */
  getAnalytics(options = {}) {
    const { platform, period = '7d' } = options;

    // Placeholder analytics data
    return {
      period,
      platform: platform || 'all',
      metrics: {
        followers: {
          total: 1250,
          growth: 45,
          growthPercent: 3.7
        },
        engagement: {
          total: 3420,
          rate: 4.2,
          change: 0.5
        },
        reach: {
          total: 15600,
          change: 1200
        },
        posts: {
          total: 12,
          scheduled: 5
        }
      },
      topPosts: [],
      recommendations: [
        'Post more Reels to increase reach',
        'Engage with comments within the first hour',
        'Use trending hashtags in your niche'
      ]
    };
  }
}

module.exports = {
  SocialMediaService,
  PLATFORM_CONFIGS,
  CONTENT_TYPE_PROMPTS,
  TONE_MODIFIERS
};
