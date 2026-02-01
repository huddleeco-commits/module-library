/**
 * Video Generator Service
 *
 * Generates promotional videos for Blink projects using Remotion.
 * Extracts metadata from brain.json and renders industry-specific videos.
 *
 * Output:
 * - promo-video.mp4 (10 seconds, 1080p)
 * - social/instagram.mp4 (10 seconds, square)
 * - social/tiktok.mp4 (10 seconds, vertical)
 * - thumbnail.png
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Remotion project location
const REMOTION_PROJECT = path.join(__dirname, '../../../video-generator');

// Industry-specific video configs
const INDUSTRY_VIDEO_CONFIG = {
  // Food & Beverage - warm, appetizing
  'pizza': { template: 'food', mood: 'energetic', music: 'upbeat', accentAnimation: 'bounce' },
  'restaurant': { template: 'food', mood: 'warm', music: 'elegant', accentAnimation: 'fade' },
  'cafe': { template: 'food', mood: 'cozy', music: 'acoustic', accentAnimation: 'slide' },
  'bakery': { template: 'food', mood: 'warm', music: 'light', accentAnimation: 'fade' },
  'bar': { template: 'food', mood: 'vibrant', music: 'lounge', accentAnimation: 'pulse' },

  // Healthcare & Beauty - clean, trustworthy
  'spa-salon': { template: 'wellness', mood: 'relaxing', music: 'ambient', accentAnimation: 'fade' },
  'dental': { template: 'healthcare', mood: 'professional', music: 'corporate', accentAnimation: 'slide' },
  'healthcare': { template: 'healthcare', mood: 'caring', music: 'gentle', accentAnimation: 'fade' },
  'barbershop': { template: 'lifestyle', mood: 'cool', music: 'hiphop', accentAnimation: 'slide' },
  'fitness': { template: 'fitness', mood: 'energetic', music: 'workout', accentAnimation: 'bounce' },
  'yoga': { template: 'wellness', mood: 'calm', music: 'meditation', accentAnimation: 'fade' },

  // Professional Services - trustworthy, sophisticated
  'law-firm': { template: 'professional', mood: 'authoritative', music: 'corporate', accentAnimation: 'slide' },
  'real-estate': { template: 'lifestyle', mood: 'aspirational', music: 'inspiring', accentAnimation: 'zoom' },
  'accounting': { template: 'professional', mood: 'trustworthy', music: 'corporate', accentAnimation: 'fade' },
  'consulting': { template: 'professional', mood: 'innovative', music: 'tech', accentAnimation: 'slide' },

  // Trades & Services - reliable, practical
  'plumber': { template: 'service', mood: 'reliable', music: 'friendly', accentAnimation: 'slide' },
  'electrician': { template: 'service', mood: 'professional', music: 'corporate', accentAnimation: 'flash' },
  'cleaning': { template: 'service', mood: 'fresh', music: 'light', accentAnimation: 'sparkle' },
  'landscaping': { template: 'service', mood: 'natural', music: 'acoustic', accentAnimation: 'grow' },

  // Default
  'default': { template: 'business', mood: 'professional', music: 'corporate', accentAnimation: 'fade' }
};

class VideoGenerator {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.brain = this.loadBrain();
    // Output to frontend/public/videos so Vite serves them at /videos/*
    const frontendPublic = path.join(projectPath, 'frontend', 'public', 'videos');
    const rootVideos = path.join(projectPath, 'videos');
    // Use frontend/public if frontend exists, otherwise root
    this.outputDir = fs.existsSync(path.join(projectPath, 'frontend')) ? frontendPublic : rootVideos;
  }

  loadBrain() {
    const locations = [
      path.join(this.projectPath, 'brain.json'),
      path.join(this.projectPath, 'frontend', 'brain.json'),
      path.join(this.projectPath, 'full-test', 'brain.json')
    ];

    for (const loc of locations) {
      if (fs.existsSync(loc)) {
        return JSON.parse(fs.readFileSync(loc, 'utf-8'));
      }
    }

    return {
      business: { name: 'Business' },
      industry: { type: 'default' }
    };
  }

  /**
   * Check if Remotion is set up
   */
  isRemotionAvailable() {
    return fs.existsSync(REMOTION_PROJECT) &&
           fs.existsSync(path.join(REMOTION_PROJECT, 'package.json'));
  }

  /**
   * Extract video metadata from brain.json
   * Handles both nested (business.name) and flat (businessName) brain.json formats
   */
  extractMetadata() {
    // Handle both flat and nested brain.json formats
    const industry = this.brain.industry?.type || this.brain.industry || 'default';
    const videoConfig = INDUSTRY_VIDEO_CONFIG[industry] || INDUSTRY_VIDEO_CONFIG['default'];

    // Extract address parts from flat string if needed
    let city = '', state = '';
    const address = this.brain.address || this.brain.business?.address?.full || '';
    if (typeof address === 'string' && address.includes(',')) {
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        // Format: "Street, City, State ZIP, Country" or "Street, City, State ZIP"
        const cityStateZip = parts[parts.length - 2] || '';
        const stateMatch = cityStateZip.match(/([A-Z]{2})\s+\d{5}/);
        if (stateMatch) {
          state = stateMatch[1];
          city = cityStateZip.replace(/,?\s*[A-Z]{2}\s+\d{5}.*/, '').trim();
        } else {
          city = parts[parts.length - 2] || '';
        }
      }
    }

    return {
      // Business info (handle both flat and nested formats)
      businessName: this.brain.businessName || this.brain.business?.name || 'Business',
      tagline: this.brain.tagline || this.brain.business?.tagline || '',
      industry: industry,

      // Colors
      primaryColor: this.brain.theme?.primaryColor || this.brain.colors?.primary || this.brain.business?.colors?.primary || '#3b82f6',
      accentColor: this.brain.theme?.accentColor || this.brain.colors?.accent || this.brain.business?.colors?.accent || '#8b5cf6',
      backgroundColor: this.brain.theme?.backgroundColor || '#ffffff',

      // Contact (handle both flat and nested)
      phone: this.brain.phone || this.brain.business?.contact?.phone || '',
      email: this.brain.email || this.brain.business?.contact?.email || '',
      website: this.brain.website || this.brain.domain || this.brain.business?.contact?.website || this.brain.infrastructure?.domain || '',

      // Location
      city: city || this.brain.business?.address?.city || '',
      state: state || this.brain.business?.address?.state || '',

      // Features to highlight
      features: this.extractFeatures(),

      // Video style config
      ...videoConfig,

      // Logo (if available)
      logo: this.brain.logo || this.brain.business?.logo || null
    };
  }

  extractFeatures() {
    const features = [];
    const f = this.brain.business?.features || {};
    const industry = this.brain.industry?.type;

    // Common features
    if (f.onlineOrdering) features.push({ icon: 'ShoppingCart', text: 'Online Ordering' });
    if (f.delivery) features.push({ icon: 'Truck', text: 'Fast Delivery' });
    if (f.booking || f.reservations) features.push({ icon: 'Calendar', text: 'Easy Booking' });
    if (f.loyaltyProgram) features.push({ icon: 'Award', text: 'Rewards Program' });
    if (f.auth || f.accounts) features.push({ icon: 'User', text: 'Member Accounts' });

    // Industry-specific features
    if (['restaurant', 'pizza', 'cafe', 'bakery'].includes(industry)) {
      if (!features.find(f => f.icon === 'ShoppingCart')) {
        features.push({ icon: 'UtensilsCrossed', text: 'Fresh Menu' });
      }
    }

    if (['spa-salon', 'barbershop', 'dental', 'healthcare'].includes(industry)) {
      features.push({ icon: 'Clock', text: 'Flexible Hours' });
    }

    if (['law-firm', 'accounting', 'consulting'].includes(industry)) {
      features.push({ icon: 'Shield', text: 'Expert Team' });
    }

    if (['plumber', 'electrician', 'cleaning'].includes(industry)) {
      features.push({ icon: 'CheckCircle', text: 'Licensed & Insured' });
    }

    // Limit to 4 features for video
    return features.slice(0, 4);
  }

  /**
   * Generate all video assets
   */
  async generateVideos() {
    console.log('\n🎬 Video Generator starting...');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    fs.mkdirSync(path.join(this.outputDir, 'social'), { recursive: true });

    const metadata = this.extractMetadata();
    console.log(`   Business: ${metadata.businessName}`);
    console.log(`   Industry: ${metadata.industry}`);
    console.log(`   Template: ${metadata.template}`);
    console.log(`   Features: ${metadata.features.map(f => f.text).join(', ')}`);

    // Check if Remotion is available
    if (!this.isRemotionAvailable()) {
      console.log('\n   ⚠️ Remotion not installed. Generating placeholder assets...');
      return this.generatePlaceholderAssets(metadata);
    }

    try {
      // Generate main promo video (10 seconds, 1920x1080)
      console.log('\n   📹 Rendering main promo video (10s, 1080p)...');
      await this.renderVideo('BusinessPromo', metadata, 'promo-video.mp4', {
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 300 // 10 seconds
      });

      // Generate Instagram version (10 seconds, 1080x1080 square)
      console.log('   📹 Rendering Instagram video (10s, square)...');
      await this.renderVideo('SocialSquare', { ...metadata }, 'social/instagram.mp4', {
        width: 1080,
        height: 1080,
        fps: 30,
        durationInFrames: 300 // 10 seconds
      });

      // Generate TikTok version (10 seconds, 1080x1920 vertical)
      console.log('   📹 Rendering TikTok video (10s, vertical)...');
      await this.renderVideo('SocialVertical', { ...metadata }, 'social/tiktok.mp4', {
        width: 1080,
        height: 1920,
        fps: 30,
        durationInFrames: 300 // 10 seconds
      });

      // Generate thumbnail
      console.log('   🖼️ Generating thumbnail...');
      await this.generateThumbnail(metadata);

      console.log('\n   ✅ Video generation complete!');

      return {
        success: true,
        promo: path.join(this.outputDir, 'promo-video.mp4'),
        social: {
          instagram: path.join(this.outputDir, 'social', 'instagram.mp4'),
          tiktok: path.join(this.outputDir, 'social', 'tiktok.mp4')
        },
        thumbnail: path.join(this.outputDir, 'thumbnail.png'),
        metadata
      };

    } catch (err) {
      console.error('   ❌ Video generation failed:', err.message);
      console.log('   Falling back to placeholder assets...');
      return this.generatePlaceholderAssets(metadata);
    }
  }

  /**
   * Render a video using Remotion
   */
  async renderVideo(compositionId, props, outputFile, config) {
    const outputPath = path.join(this.outputDir, outputFile);

    // Write props to a temp file (Windows command line can't handle inline JSON)
    const propsFile = path.join(this.outputDir, `_props_${compositionId}.json`);
    fs.writeFileSync(propsFile, JSON.stringify(props, null, 2));

    return new Promise((resolve, reject) => {
      const args = [
        'remotion', 'render',
        compositionId,
        outputPath,
        `--props=${propsFile}`,
        `--width=${config.width}`,
        `--height=${config.height}`,
        `--fps=${config.fps}`,
        `--frames=0-${config.durationInFrames - 1}`
      ];

      const child = spawn('npx', args, {
        cwd: REMOTION_PROJECT,
        shell: true
      });

      child.stdout.on('data', (data) => {
        process.stdout.write(`      ${data}`);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(`      ${data}`);
      });

      child.on('close', (code) => {
        // Clean up props file
        try { fs.unlinkSync(propsFile); } catch (e) {}

        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`Remotion render failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Generate thumbnail image
   */
  async generateThumbnail(metadata) {
    const outputPath = path.join(this.outputDir, 'thumbnail.png');

    // If Remotion available, render first frame
    if (this.isRemotionAvailable()) {
      try {
        // Write props to temp file (Windows command line can't handle inline JSON)
        const propsFile = path.join(this.outputDir, '_props_thumbnail.json');
        fs.writeFileSync(propsFile, JSON.stringify(metadata, null, 2));

        execSync(`npx remotion still BusinessPromo "${outputPath}" --props="${propsFile}" --frame=30`, {
          cwd: REMOTION_PROJECT,
          stdio: 'pipe'
        });

        // Clean up props file
        try { fs.unlinkSync(propsFile); } catch (e) {}

        return outputPath;
      } catch (e) {
        // Fall through to placeholder
      }
    }

    // Generate placeholder thumbnail
    return this.generatePlaceholderThumbnail(metadata, outputPath);
  }

  /**
   * Generate placeholder assets when Remotion isn't available
   */
  async generatePlaceholderAssets(metadata) {
    console.log('\n   📝 Generating video metadata file (Remotion not installed)...');

    // Save metadata for future rendering
    const metadataPath = path.join(this.outputDir, 'video-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Generate placeholder thumbnail
    const thumbnailPath = await this.generatePlaceholderThumbnail(metadata);

    // Create a "video spec" file that describes what the video would contain
    const specPath = path.join(this.outputDir, 'video-spec.md');
    fs.writeFileSync(specPath, this.generateVideoSpec(metadata));

    console.log(`   ✅ Video metadata saved: ${metadataPath}`);
    console.log(`   ✅ Video spec saved: ${specPath}`);
    console.log(`   ✅ Placeholder thumbnail: ${thumbnailPath}`);
    console.log('\n   💡 To generate actual videos, install Remotion:');
    console.log(`      cd video-generator && npm install`);

    return {
      success: true,
      placeholder: true,
      metadataPath,
      specPath,
      thumbnailPath,
      metadata,
      note: 'Remotion not installed. Video metadata saved for future rendering.'
    };
  }

  /**
   * Generate a placeholder thumbnail (SVG that can be converted to PNG)
   */
  async generatePlaceholderThumbnail(metadata, outputPath = null) {
    const thumbnailPath = outputPath || path.join(this.outputDir, 'thumbnail.png');

    // Create an SVG placeholder
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${metadata.primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${metadata.accentColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="50%" y="40%" text-anchor="middle" fill="white" font-size="80" font-family="Arial, sans-serif" font-weight="bold">${metadata.businessName}</text>
  <text x="50%" y="52%" text-anchor="middle" fill="white" font-size="36" font-family="Arial, sans-serif" opacity="0.9">${metadata.tagline || metadata.industry}</text>
  <text x="50%" y="75%" text-anchor="middle" fill="white" font-size="28" font-family="Arial, sans-serif" opacity="0.7">${metadata.features.map(f => f.text).join(' • ')}</text>
  <text x="50%" y="90%" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" opacity="0.6">${metadata.website || metadata.phone}</text>
</svg>`;

    // Save as SVG (PNG conversion would require additional dependency like sharp)
    const svgPath = thumbnailPath.replace('.png', '.svg');
    fs.writeFileSync(svgPath, svg);

    return svgPath;
  }

  /**
   * Generate a markdown spec describing the video content
   */
  generateVideoSpec(metadata) {
    return `# Video Specification: ${metadata.businessName}

## Overview
- **Duration:** 10 seconds (fast-paced)
- **Template:** ${metadata.template}
- **Mood:** ${metadata.mood}
- **Music Style:** ${metadata.music}

## Brand Colors
- **Primary:** ${metadata.primaryColor}
- **Accent:** ${metadata.accentColor}

## Content Structure (10 seconds)

### 0-4 seconds: Impact Opening
- Business name: "${metadata.businessName}" (big, bold)
- Tagline: "${metadata.tagline || 'N/A'}"
- Location: ${metadata.city ? `${metadata.city}, ${metadata.state}` : 'N/A'}
- Animation: Spring-in with glow effect

### 4-7 seconds: Fast Feature Flash
${metadata.features.slice(0, 3).map((f, i) => `- Feature ${i + 1}: ${f.text} (${f.icon} icon)`).join('\n')}
- Animation: Quick card pop-in
- Horizontal layout, 3 features max

### 7-10 seconds: CTA + Logo
- Website: ${metadata.website || 'N/A'}
- Phone: ${metadata.phone || 'N/A'}
- Final logo lockup with glow
- "Blink by BE1st" branding

## Social Cuts

### Instagram (1:1 Square, 10s)
- Same content, square format

### TikTok (9:16 Vertical, 10s)
- Vertical layout optimized for mobile
- Larger text, bolder animations

## Assets Needed
- Logo (if available): ${metadata.logo ? 'Yes' : 'No - using text'}
- Background music: ${metadata.music} style
- Font: System default or brand font

---
Generated by Blink Video Generator
`;
  }
}

module.exports = { VideoGenerator, INDUSTRY_VIDEO_CONFIG };
