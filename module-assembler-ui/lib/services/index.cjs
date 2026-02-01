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
  DEFAULT_TERMINOLOGY
};
