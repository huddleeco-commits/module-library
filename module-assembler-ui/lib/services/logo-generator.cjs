/**
 * Logo Generator Service
 *
 * Generates programmatic SVG logos for Blink projects.
 * Creates multiple variants based on business name, industry, and colors.
 *
 * Output:
 * - logo-icon.svg       (symbol only)
 * - logo-text.svg       (styled business name)
 * - logo-horizontal.svg (icon + text side by side)
 * - logo-stacked.svg    (icon above text)
 * - logo-favicon.svg    (small square for favicon)
 */

const fs = require('fs');
const path = require('path');

// Industry-specific icons (SVG paths)
const INDUSTRY_ICONS = {
  // Food & Beverage
  'pizza': {
    viewBox: '0 0 24 24',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
    emoji: '🍕'
  },
  'restaurant': {
    viewBox: '0 0 24 24',
    path: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
    emoji: '🍽️'
  },
  'cafe': {
    viewBox: '0 0 24 24',
    path: 'M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z',
    emoji: '☕'
  },
  'bakery': {
    viewBox: '0 0 24 24',
    path: 'M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
    emoji: '🥐'
  },
  'bar': {
    viewBox: '0 0 24 24',
    path: 'M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z',
    emoji: '🍸'
  },

  // Healthcare & Beauty
  'barbershop': {
    viewBox: '0 0 24 24',
    path: 'M20 6h-2V4h-3v2H9V4H6v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z',
    emoji: '💈'
  },
  'spa-salon': {
    viewBox: '0 0 24 24',
    path: 'M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z',
    emoji: '💆'
  },
  'dental': {
    viewBox: '0 0 24 24',
    path: 'M12 2C9.5 2 8 3.12 8 5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2-1 3-1 5 0 2.5 1 4 2 5 .5.5 1 1 1 1s.5-.5 1-1c1-1 2-2.5 2-5 0-2-1-3-1-5 0-1.5.5-2.5 1-3.5.5-1 1-2 1-3.5 0-1.88-1.5-3-4-3z',
    emoji: '🦷'
  },
  'healthcare': {
    viewBox: '0 0 24 24',
    path: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z',
    emoji: '🏥'
  },
  'fitness': {
    viewBox: '0 0 24 24',
    path: 'M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z',
    emoji: '💪'
  },
  'yoga': {
    viewBox: '0 0 24 24',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    emoji: '🧘'
  },

  // Professional Services
  'law-firm': {
    viewBox: '0 0 24 24',
    path: 'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z',
    emoji: '⚖️'
  },
  'real-estate': {
    viewBox: '0 0 24 24',
    path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    emoji: '🏠'
  },
  'accounting': {
    viewBox: '0 0 24 24',
    path: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
    emoji: '📊'
  },
  'consulting': {
    viewBox: '0 0 24 24',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
    emoji: '💼'
  },

  // Trades & Services
  'plumber': {
    viewBox: '0 0 24 24',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33C4.62 15.49 4 13.82 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6z',
    emoji: '🔧'
  },
  'electrician': {
    viewBox: '0 0 24 24',
    path: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z',
    emoji: '⚡'
  },
  'cleaning': {
    viewBox: '0 0 24 24',
    path: 'M19.36 2.72L20.78 4.14l-1.42 1.42 2.12 2.12-1.42 1.42-2.12-2.12-1.41 1.41 2.12 2.12-1.42 1.42-2.12-2.12L12 13.41V17h3.59l3.59-3.59 1.42 1.42L17 18.41V22H7v-3.59l-3.59 3.59-1.42-1.42 3.18-3.18L2 14.23l1.42-1.42 3.17 3.17L10 12.59V8.41L6.41 12 5 10.59l4.59-4.59 1.42 1.42L7.59 11 10 13.41l6-6-1.42-1.42 1.42-1.42L12.59 8l.71-.71 1.42 1.42 3.17-3.17 1.42 1.42-3.17 3.17 1.42 1.42z',
    emoji: '🧹'
  },
  'landscaping': {
    viewBox: '0 0 24 24',
    path: 'M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z',
    emoji: '🌿'
  },
  'auto-repair': {
    viewBox: '0 0 24 24',
    path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
    emoji: '🚗'
  },

  // Default
  'default': {
    viewBox: '0 0 24 24',
    path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    emoji: '✨'
  }
};

// Font styles for different vibes
const FONT_STYLES = {
  modern: { fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '700', letterSpacing: '-0.02em' },
  classic: { fontFamily: 'Georgia, Times New Roman, serif', fontWeight: '600', letterSpacing: '0.05em' },
  bold: { fontFamily: 'Impact, Haettenschweiler, sans-serif', fontWeight: '900', letterSpacing: '0.02em' },
  elegant: { fontFamily: 'Palatino, Book Antiqua, serif', fontWeight: '500', letterSpacing: '0.08em' },
  playful: { fontFamily: 'Comic Sans MS, cursive, sans-serif', fontWeight: '700', letterSpacing: '0' },
  tech: { fontFamily: 'Consolas, Monaco, monospace', fontWeight: '600', letterSpacing: '0.03em' }
};

// Get font style based on industry
function getFontStyle(industry) {
  const industryFonts = {
    'pizza': 'bold',
    'restaurant': 'elegant',
    'cafe': 'modern',
    'bakery': 'playful',
    'bar': 'modern',
    'barbershop': 'bold',
    'spa-salon': 'elegant',
    'dental': 'modern',
    'healthcare': 'modern',
    'fitness': 'bold',
    'yoga': 'elegant',
    'law-firm': 'classic',
    'real-estate': 'modern',
    'accounting': 'classic',
    'consulting': 'modern',
    'plumber': 'bold',
    'electrician': 'bold',
    'cleaning': 'modern',
    'landscaping': 'modern',
    'auto-repair': 'bold',
    'saas': 'tech',
    'startup': 'tech'
  };
  return FONT_STYLES[industryFonts[industry] || 'modern'];
}

class LogoGenerator {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.brain = this.loadBrain();
    this.outputDir = path.join(projectPath, 'logos');
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
   * Generate all logo variants
   * Handles both nested (business.name) and flat (businessName) brain.json formats
   */
  async generateLogos() {
    console.log('\n🎨 Logo Generator starting...');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Handle both flat and nested brain.json formats
    const businessName = this.brain.businessName || this.brain.business?.name || 'Business';
    const industry = this.brain.industry?.type || this.brain.industry || 'default';
    const primaryColor = this.brain.theme?.primaryColor || this.brain.colors?.primary || this.brain.business?.colors?.primary || '#3b82f6';
    const accentColor = this.brain.theme?.accentColor || this.brain.colors?.accent || this.brain.business?.colors?.accent || '#1e40af';

    console.log(`   Business: ${businessName}`);
    console.log(`   Industry: ${industry}`);
    console.log(`   Primary: ${primaryColor}`);
    console.log(`   Accent: ${accentColor}`);

    const iconData = INDUSTRY_ICONS[industry] || INDUSTRY_ICONS['default'];
    const fontStyle = getFontStyle(industry);

    // Generate all variants
    const results = {};

    // 1. Icon only
    results.icon = this.generateIconLogo(iconData, primaryColor, accentColor);
    fs.writeFileSync(path.join(this.outputDir, 'logo-icon.svg'), results.icon);

    // 2. Text only
    results.text = this.generateTextLogo(businessName, primaryColor, fontStyle);
    fs.writeFileSync(path.join(this.outputDir, 'logo-text.svg'), results.text);

    // 3. Horizontal (icon + text)
    results.horizontal = this.generateHorizontalLogo(businessName, iconData, primaryColor, accentColor, fontStyle);
    fs.writeFileSync(path.join(this.outputDir, 'logo-horizontal.svg'), results.horizontal);

    // 4. Stacked (icon above text)
    results.stacked = this.generateStackedLogo(businessName, iconData, primaryColor, accentColor, fontStyle);
    fs.writeFileSync(path.join(this.outputDir, 'logo-stacked.svg'), results.stacked);

    // 5. Favicon (simplified icon)
    results.favicon = this.generateFavicon(businessName, iconData, primaryColor, accentColor);
    fs.writeFileSync(path.join(this.outputDir, 'logo-favicon.svg'), results.favicon);

    // 6. White versions for dark backgrounds
    results.iconWhite = this.generateIconLogo(iconData, '#ffffff', '#ffffff');
    fs.writeFileSync(path.join(this.outputDir, 'logo-icon-white.svg'), results.iconWhite);

    results.horizontalWhite = this.generateHorizontalLogo(businessName, iconData, '#ffffff', '#ffffff', fontStyle);
    fs.writeFileSync(path.join(this.outputDir, 'logo-horizontal-white.svg'), results.horizontalWhite);

    console.log('\n   ✅ Logo variants generated:');
    console.log(`      - logo-icon.svg`);
    console.log(`      - logo-text.svg`);
    console.log(`      - logo-horizontal.svg`);
    console.log(`      - logo-stacked.svg`);
    console.log(`      - logo-favicon.svg`);
    console.log(`      - logo-icon-white.svg`);
    console.log(`      - logo-horizontal-white.svg`);

    return {
      success: true,
      outputDir: this.outputDir,
      files: [
        'logo-icon.svg',
        'logo-text.svg',
        'logo-horizontal.svg',
        'logo-stacked.svg',
        'logo-favicon.svg',
        'logo-icon-white.svg',
        'logo-horizontal-white.svg'
      ],
      metadata: {
        businessName,
        industry,
        primaryColor,
        accentColor
      }
    };
  }

  /**
   * Generate icon-only logo
   */
  generateIconLogo(iconData, primaryColor, accentColor) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#iconGradient)"/>
  <g transform="translate(26, 26) scale(2)" fill="white">
    <path d="${iconData.path}"/>
  </g>
</svg>`;
  }

  /**
   * Generate text-only logo
   */
  generateTextLogo(businessName, primaryColor, fontStyle) {
    const fontSize = businessName.length > 15 ? 28 : businessName.length > 10 ? 36 : 42;
    const width = Math.max(200, businessName.length * (fontSize * 0.6));

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="60" viewBox="0 0 ${width} 60" xmlns="http://www.w3.org/2000/svg">
  <text
    x="50%"
    y="50%"
    dominant-baseline="middle"
    text-anchor="middle"
    fill="${primaryColor}"
    font-family="${fontStyle.fontFamily}"
    font-weight="${fontStyle.fontWeight}"
    font-size="${fontSize}"
    letter-spacing="${fontStyle.letterSpacing}"
  >${this.escapeXml(businessName)}</text>
</svg>`;
  }

  /**
   * Generate horizontal logo (icon + text)
   */
  generateHorizontalLogo(businessName, iconData, primaryColor, accentColor, fontStyle) {
    const fontSize = businessName.length > 15 ? 24 : businessName.length > 10 ? 28 : 32;
    const textWidth = businessName.length * (fontSize * 0.6);
    const width = 60 + textWidth + 20;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="60" viewBox="0 0 ${width} 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Icon circle -->
  <circle cx="30" cy="30" r="26" fill="url(#hGradient)"/>
  <g transform="translate(14, 14) scale(1.33)" fill="white">
    <path d="${iconData.path}"/>
  </g>

  <!-- Business name -->
  <text
    x="70"
    y="50%"
    dominant-baseline="middle"
    text-anchor="start"
    fill="${primaryColor}"
    font-family="${fontStyle.fontFamily}"
    font-weight="${fontStyle.fontWeight}"
    font-size="${fontSize}"
    letter-spacing="${fontStyle.letterSpacing}"
  >${this.escapeXml(businessName)}</text>
</svg>`;
  }

  /**
   * Generate stacked logo (icon above text)
   */
  generateStackedLogo(businessName, iconData, primaryColor, accentColor, fontStyle) {
    const fontSize = businessName.length > 15 ? 20 : businessName.length > 10 ? 24 : 28;
    const textWidth = businessName.length * (fontSize * 0.6);
    const width = Math.max(120, textWidth + 20);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="140" viewBox="0 0 ${width} 140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Icon circle -->
  <circle cx="${width/2}" cy="45" r="40" fill="url(#sGradient)"/>
  <g transform="translate(${width/2 - 24}, 21) scale(2)" fill="white">
    <path d="${iconData.path}"/>
  </g>

  <!-- Business name -->
  <text
    x="50%"
    y="115"
    dominant-baseline="middle"
    text-anchor="middle"
    fill="${primaryColor}"
    font-family="${fontStyle.fontFamily}"
    font-weight="${fontStyle.fontWeight}"
    font-size="${fontSize}"
    letter-spacing="${fontStyle.letterSpacing}"
  >${this.escapeXml(businessName)}</text>
</svg>`;
  }

  /**
   * Generate favicon (small square icon)
   */
  generateFavicon(businessName, iconData, primaryColor, accentColor) {
    // Get first letter for text fallback
    const initial = businessName.charAt(0).toUpperCase();

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#fGradient)"/>
  <g transform="translate(4, 4) scale(1)" fill="white">
    <path d="${iconData.path}"/>
  </g>
</svg>`;
  }

  /**
   * Escape XML special characters
   */
  escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

module.exports = { LogoGenerator, INDUSTRY_ICONS };
