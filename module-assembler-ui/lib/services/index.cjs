/**
 * Services Index
 * Re-exports all service functions
 */

const { extractPdfText } = require('./pdf.cjs');
const { fetchPexelsVideo, getIndustryVideo, videoCache } = require('./video.cjs');
const {
  TemplateEngine,
  TemplateError,
  getEngine,
  processTemplate,
  moodToCSS,
  interpretMood,
  interpolate,
  DEFAULT_MOOD_SLIDERS,
  DEFAULT_COLORS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_TERMINOLOGY
} = require('./template-engine.cjs');
const {
  ContentGenerator,
  CONTENT_TYPES,
  TONE_PRESETS
} = require('./content-generator.cjs');
const {
  ContentScheduler,
  PLATFORM_CONFIG,
  RECURRENCE_PATTERNS,
  SCHEDULE_STATUS
} = require('./content-scheduler.cjs');
const {
  PlatformPublisher,
  PLATFORM_ADAPTERS,
  PUBLISH_STATUS
} = require('./platform-publisher.cjs');
const {
  PlatformCredentials,
  OAUTH_CONFIG,
  EMAIL_PROVIDERS,
  BLOG_PROVIDERS
} = require('./platform-credentials.cjs');
const {
  TwitterIntegration,
  LinkedInIntegration,
  FacebookIntegration,
  InstagramIntegration,
  EmailIntegration,
  BlogIntegration,
  getIntegration
} = require('./platform-integrations.cjs');
const {
  SocialMediaService,
  PLATFORM_CONFIGS: SOCIAL_PLATFORM_CONFIGS,
  CONTENT_TYPE_PROMPTS,
  TONE_MODIFIERS
} = require('./social-media.cjs');
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  isEmailServiceAvailable,
  generateResetEmailHtml,
  generateResetEmailText
} = require('./password-reset.cjs');
const {
  OneClickDeployService,
  createOneClickDeployService,
  getOneClickDeployService,
  DEPLOY_PHASES
} = require('./one-click-deploy.cjs');

module.exports = {
  // PDF
  extractPdfText,
  // Video
  fetchPexelsVideo,
  getIndustryVideo,
  videoCache,
  // Template Engine
  TemplateEngine,
  TemplateError,
  getEngine,
  processTemplate,
  moodToCSS,
  interpretMood,
  interpolate,
  DEFAULT_MOOD_SLIDERS,
  DEFAULT_COLORS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_TERMINOLOGY,
  // Content Generator
  ContentGenerator,
  CONTENT_TYPES,
  TONE_PRESETS,
  // Content Scheduler
  ContentScheduler,
  PLATFORM_CONFIG,
  RECURRENCE_PATTERNS,
  SCHEDULE_STATUS,
  // Platform Publisher
  PlatformPublisher,
  PLATFORM_ADAPTERS,
  PUBLISH_STATUS,
  // Platform Credentials
  PlatformCredentials,
  OAUTH_CONFIG,
  EMAIL_PROVIDERS,
  BLOG_PROVIDERS,
  // Platform Integrations
  TwitterIntegration,
  LinkedInIntegration,
  FacebookIntegration,
  InstagramIntegration,
  EmailIntegration,
  BlogIntegration,
  getIntegration,
  // Social Media Service
  SocialMediaService,
  SOCIAL_PLATFORM_CONFIGS,
  CONTENT_TYPE_PROMPTS,
  TONE_MODIFIERS,
  // Password Reset Service
  sendPasswordResetEmail,
  sendWelcomeEmail,
  isEmailServiceAvailable,
  generateResetEmailHtml,
  generateResetEmailText,
  // One-Click Deploy Service
  OneClickDeployService,
  createOneClickDeployService,
  getOneClickDeployService,
  DEPLOY_PHASES
};
