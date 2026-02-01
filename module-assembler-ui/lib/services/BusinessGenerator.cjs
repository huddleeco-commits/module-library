/**
 * BusinessGenerator - Unified Business Generation System
 *
 * A clean, single-class approach to generating complete business presences.
 * Combines website + portal + companion app generation in one unified flow.
 *
 * Usage:
 *   const generator = new BusinessGenerator('cafe', { tier: 'premium', location: { city: 'Dallas', state: 'TX' } });
 *   const result = await generator.generate({ name: 'Coffee House Cafe' });
 */

const fs = require('fs');
const path = require('path');

// Load Anthropic SDK for AI content generation
let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch (e) {
  console.warn('[BusinessGenerator] Anthropic SDK not available, AI features disabled');
}

class BusinessGenerator {
  constructor(industry, options = {}) {
    // Load config from JSON
    this.config = this.loadConfig();

    // Validate and set industry
    this.industry = this.normalizeIndustry(industry);
    if (!this.config.industries[this.industry]) {
      const available = Object.keys(this.config.industries).join(', ');
      throw new Error(`Unknown industry: ${industry}. Available: ${available}`);
    }

    this.industryConfig = this.config.industries[this.industry];
    this.variant = options.variant || null;
    this.tier = options.tier || 'recommended';

    // AI Enhancement
    this.aiEnabled = options.aiEnabled !== false; // Default true
    this.claudeService = null;

    // Location context
    this.location = options.location || null;

    // Visual customization
    this.colors = options.colors || this.config.defaultColors;
    this.moodSliders = options.moodSliders || this.config.defaultMoodSliders;

    // Portal configuration
    this.includePortal = options.includePortal || false;
    this.portalTier = options.portalTier || 'basic';

    // Companion app
    this.includeCompanion = options.includeCompanion || false;
  }

  /**
   * Load configuration from JSON file
   */
  loadConfig() {
    const configPath = path.join(__dirname, '..', 'config', 'business-templates.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * Normalize industry key (handle variations like "coffee-shop" -> "cafe")
   */
  normalizeIndustry(industry) {
    const aliases = {
      'coffee-shop': 'cafe',
      'coffee': 'cafe',
      'spa': 'salon',
      'beauty': 'salon',
      'gym': 'fitness',
      'law': 'professional',
      'legal': 'professional',
      'accounting': 'professional',
      'medical': 'healthcare',
      'doctor': 'healthcare',
      'dentist': 'healthcare',
      'shop': 'retail',
      'store': 'retail',
      'plumber': 'home-services',
      'electrician': 'home-services',
      'mechanic': 'automotive'
    };
    return aliases[industry?.toLowerCase()] || industry?.toLowerCase() || 'cafe';
  }

  /**
   * Set Claude service for AI content generation
   */
  setClaudeService(service) {
    this.claudeService = service;
    console.log('[BusinessGenerator] AI service connected');
  }

  /**
   * Get terminology for this business type
   */
  getTerminology() {
    const base = this.industryConfig.terminology || {};
    const variant = this.variant && this.industryConfig.variants?.[this.variant]?.terminology || {};
    return { ...base, ...variant };
  }

  /**
   * Get pages for current tier
   */
  getPages() {
    // Check for variant-specific pages first
    if (this.variant && this.industryConfig.variants?.[this.variant]?.customPages?.[this.tier]) {
      return this.industryConfig.variants[this.variant].customPages[this.tier];
    }
    return this.industryConfig.tiers[this.tier]?.pages || ['home', 'about', 'contact'];
  }

  /**
   * Get portal pages for current portal tier
   */
  getPortalPages() {
    if (!this.includePortal) return [];
    return this.industryConfig.portalPages?.[this.portalTier] || [];
  }

  /**
   * Generate visual styles from mood sliders
   */
  generateVisualStyles() {
    const { vibe = 50, energy = 50, era = 50, density = 50, price = 50 } = this.moodSliders;

    // Border radius: playful (high vibe) = rounded, professional (low vibe) = sharp
    const borderRadius = vibe < 40 ? '4px' : vibe > 70 ? '20px' : `${Math.round(4 + (vibe - 40) * 0.5)}px`;
    const buttonRadius = vibe < 40 ? '4px' : vibe > 70 ? '9999px' : `${Math.round(4 + (vibe - 40) * 0.3)}px`;

    // Spacing: high energy = compact, low energy = spacious
    const sectionPadding = energy < 40 ? '80px' : energy > 70 ? '40px' : `${Math.round(80 - (energy - 40) * 1.3)}px`;
    const cardPadding = energy < 40 ? '32px' : energy > 70 ? '16px' : `${Math.round(32 - (energy - 40) * 0.5)}px`;

    // Typography: era influences font choice
    const headingFont = era < 35 ? 'Georgia, serif' : era > 65 ? 'Inter, system-ui, sans-serif' : 'Poppins, sans-serif';
    const bodyFont = era < 35 ? 'Georgia, serif' : 'Inter, system-ui, sans-serif';

    // Letter spacing: modern = tighter, classic = normal
    const letterSpacing = era > 60 ? '-0.02em' : 'normal';

    // Font weight: price tier influences boldness
    const headingWeight = price > 60 ? '600' : price < 40 ? '700' : '600';

    // Shadows: high vibe = softer/larger, low vibe = crisp/minimal
    const cardShadow = vibe < 40
      ? '0 1px 3px rgba(0,0,0,0.12)'
      : vibe > 70
        ? '0 8px 30px rgba(0,0,0,0.08)'
        : '0 4px 15px rgba(0,0,0,0.08)';

    return {
      borderRadius,
      buttonRadius,
      sectionPadding,
      cardPadding,
      headingFont,
      bodyFont,
      letterSpacing,
      headingWeight,
      cardShadow,
      // Computed CSS properties
      containerMaxWidth: density < 40 ? '1000px' : density > 70 ? '1400px' : '1200px',
      heroMinHeight: energy < 40 ? '90vh' : energy > 70 ? '60vh' : '80vh'
    };
  }

  /**
   * Generate location-aware content prompt for AI
   */
  generateLocationContext() {
    if (!this.location) return '';

    const { city, state, neighborhood, landmarks } = this.location;
    let context = '';

    if (city && state) {
      context += `Located in ${city}, ${state}. `;
    }
    if (neighborhood) {
      context += `Serving the ${neighborhood} area. `;
    }
    if (landmarks && landmarks.length > 0) {
      context += `Near ${landmarks.join(', ')}. `;
    }

    return context;
  }

  /**
   * Main generation method - creates complete business presence
   */
  async generate(businessData) {
    const startTime = Date.now();
    console.log(`[BusinessGenerator] Starting ${this.industry} generation: ${businessData.name}`);
    console.log(`[BusinessGenerator] Tier: ${this.tier}, Variant: ${this.variant || 'none'}`);
    console.log(`[BusinessGenerator] AI: ${this.aiEnabled && this.claudeService ? 'enabled' : 'disabled'}`);

    // Step 1: Generate business metadata
    const business = await this.generateBusinessMetadata(businessData);
    console.log('[BusinessGenerator] Business metadata generated');

    // Step 2: Generate theme/visual config
    const theme = this.generateTheme();
    console.log('[BusinessGenerator] Theme generated');

    // Step 3: Generate AI content (if enabled)
    let aiContent = null;
    if (this.aiEnabled && this.claudeService) {
      aiContent = await this.generateAIContent(business);
      console.log('[BusinessGenerator] AI content generated');
    }

    // Step 4: Generate website pages
    const pages = this.getPages();
    const websitePages = await this.generatePages(business, theme, aiContent);
    console.log(`[BusinessGenerator] Generated ${Object.keys(websitePages).length} website pages`);

    // Step 5: Generate portal pages (if included)
    const portalPages = this.getPortalPages();
    let portal = null;
    if (this.includePortal && portalPages.length > 0) {
      portal = {
        pages: portalPages,
        tier: this.portalTier
      };
      console.log(`[BusinessGenerator] Portal configured with ${portalPages.length} pages`);
    }

    // Step 6: Companion app config (if included)
    let companion = null;
    if (this.includeCompanion) {
      companion = {
        enabled: true,
        appName: `${business.name}`,
        quickActions: this.getQuickActions()
      };
      console.log('[BusinessGenerator] Companion app configured');
    }

    const generationTime = Date.now() - startTime;

    // Build the brain (complete project manifest)
    const brain = {
      version: '2.0.0',
      generatedAt: new Date().toISOString(),
      generationMode: 'unified',
      business,
      theme,
      content: aiContent || this.generateDefaultContent(business),
      pages,
      portalPages,
      pageTier: this.tier,
      industryConfig: {
        key: this.industry,
        terminology: this.getTerminology(),
        variant: this.variant
      },
      features: this.industryConfig.businessData?.features || []
    };

    console.log(`[BusinessGenerator] Complete! Generated in ${generationTime}ms`);

    return {
      brain,
      websitePages,
      portal,
      companion,
      generationTime,
      summary: {
        businessName: business.name,
        industry: this.industry,
        variant: this.variant,
        tier: this.tier,
        pageCount: pages.length,
        portalPageCount: portalPages.length,
        hasCompanion: this.includeCompanion,
        aiEnhanced: !!(this.aiEnabled && this.claudeService && aiContent)
      }
    };
  }

  /**
   * Generate business metadata
   */
  async generateBusinessMetadata(input) {
    const terminology = this.getTerminology();

    return {
      name: input.name || `My ${this.industryConfig.name}`,
      tagline: input.tagline || `Your trusted ${this.industryConfig.name.toLowerCase()} partner`,
      industry: this.industry,
      variant: this.variant,
      location: this.location?.city && this.location?.state
        ? `${this.location.city}, ${this.location.state}`
        : input.location || '',
      phone: input.phone || '(555) 123-4567',
      email: input.email || `hello@${this.slugify(input.name || 'business')}.com`,
      yearsInBusiness: input.yearsInBusiness || '5',
      terminology
    };
  }

  /**
   * Generate theme configuration
   */
  generateTheme() {
    return {
      colors: this.colors,
      moodSliders: this.moodSliders,
      moodInterpretation: this.interpretMood(),
      visualStyles: this.generateVisualStyles()
    };
  }

  /**
   * Interpret mood sliders into descriptive terms
   */
  interpretMood() {
    const { vibe = 50, energy = 50, era = 50, density = 50, price = 50 } = this.moodSliders;

    return {
      tone: vibe < 35 ? 'professional' : vibe > 65 ? 'playful' : 'balanced',
      energy: energy < 35 ? 'calm' : energy > 65 ? 'energetic' : 'moderate',
      style: era < 35 ? 'classic' : era > 65 ? 'modern' : 'contemporary',
      contentDensity: density < 35 ? 'minimal' : density > 65 ? 'rich' : 'balanced',
      marketPosition: price < 35 ? 'value-focused' : price > 65 ? 'premium' : 'quality-focused'
    };
  }

  /**
   * Generate AI-enhanced content
   */
  async generateAIContent(business) {
    // Check if Anthropic SDK is available and API key is set
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!Anthropic || !apiKey) {
      console.warn('[BusinessGenerator] AI not available (no SDK or API key)');
      return null;
    }

    try {
      const locationContext = this.generateLocationContext();
      const moodContext = this.interpretMood();
      const terminology = this.getTerminology();

      const prompt = `Generate website content for a ${this.industry} business called "${business.name}".
${locationContext}
Tone: ${moodContext.tone}, Energy: ${moodContext.energy}, Style: ${moodContext.style}
Market position: ${moodContext.marketPosition}

Generate JSON with this exact structure:
{
  "hero": {
    "tagline": "A compelling headline (5-10 words)",
    "subtext": "A supporting paragraph (20-30 words)",
    "ctas": ["Primary CTA text", "Secondary CTA text"]
  },
  "testimonials": [
    { "quote": "A realistic customer quote (15-25 words)", "name": "First name", "role": "Customer type" },
    { "quote": "Another realistic quote", "name": "First name", "role": "Customer type" },
    { "quote": "Third realistic quote", "name": "First name", "role": "Customer type" }
  ],
  "about": "About section paragraph (40-60 words) about the business history and mission",
  "locationContent": "Content specific to ${this.location?.city || 'the local area'} (30-50 words)"
}

IMPORTANT:
- Make content feel authentic and specific to ${business.name}
- Use ${terminology.services || 'services'} terminology for this ${this.industry}
- If location is provided, reference local landmarks, neighborhoods, or community
- Match the ${moodContext.tone} tone throughout
- Return ONLY valid JSON, no markdown or explanation`;

      console.log('[BusinessGenerator] Calling Claude API for content generation...');

      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0]?.text || '';
      console.log('[BusinessGenerator] AI response received, parsing...');

      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('[BusinessGenerator] AI content parsed successfully');
        return parsed;
      }

      console.warn('[BusinessGenerator] Could not parse AI response as JSON');
      return null;
    } catch (error) {
      console.warn('[BusinessGenerator] AI content generation failed:', error.message);
      return null;
    }
  }

  /**
   * Parse AI response into structured content
   */
  parseAIResponse(response) {
    // Basic parsing - can be enhanced based on actual Claude response format
    return {
      hero: {
        tagline: response?.hero?.tagline || 'Welcome to our business',
        subtext: response?.hero?.subtext || 'Quality service you can trust',
        ctas: response?.hero?.ctas || ['Get Started', 'Learn More']
      },
      testimonials: response?.testimonials || [],
      about: response?.about || '',
      locationContent: response?.locationContent || ''
    };
  }

  /**
   * Generate default content (when AI is not available)
   */
  generateDefaultContent(business) {
    const terminology = this.getTerminology();

    return {
      hero: {
        tagline: `Welcome to ${business.name}`,
        subtext: `Your trusted ${this.industryConfig.name.toLowerCase()} in ${business.location || 'your area'}`,
        ctas: [terminology.booking || 'Get Started', 'Learn More']
      },
      testimonials: [
        { quote: '[Customer testimonial]', name: 'Happy Customer', role: 'Local Resident' },
        { quote: '[Customer testimonial]', name: 'Valued Client', role: 'Regular Customer' },
        { quote: '[Customer testimonial]', name: 'Satisfied Guest', role: 'First-Time Visitor' }
      ],
      team: []
    };
  }

  /**
   * Generate all website pages
   */
  async generatePages(business, theme, aiContent) {
    const pages = {};
    const pageList = this.getPages();

    for (const pageId of pageList) {
      pages[`${this.capitalizeFirst(pageId)}Page.jsx`] = await this.generatePage(pageId, business, theme, aiContent);
    }

    return pages;
  }

  /**
   * Generate a single page component
   */
  async generatePage(pageId, business, theme, aiContent) {
    const terminology = this.getTerminology();
    const visualStyles = theme.visualStyles;
    const content = aiContent || this.generateDefaultContent(business);

    // Page-specific generation
    switch (pageId) {
      case 'home':
        return this.generateHomePage(business, theme, content);
      case 'about':
        return this.generateAboutPage(business, theme, content);
      case 'contact':
        return this.generateContactPage(business, theme);
      case 'menu':
      case 'services':
      case 'programs':
      case 'products':
        return this.generateServicesPage(business, theme, terminology.services || 'Services');
      case 'team':
      case 'providers':
      case 'trainers':
      case 'instructors':
        return this.generateTeamPage(business, theme, terminology.team || 'Our Team');
      case 'gallery':
        return this.generateGalleryPage(business, theme);
      case 'testimonials':
        return this.generateTestimonialsPage(business, theme, content);
      case 'reservations':
      case 'booking':
        return this.generateBookingPage(business, theme, terminology.booking || 'Book Now');
      case 'events':
      case 'schedule':
        return this.generateEventsPage(business, theme);
      case 'pricing':
        return this.generatePricingPage(business, theme);
      case 'faq':
        return this.generateFAQPage(business, theme);
      default:
        return this.generateGenericPage(pageId, business, theme);
    }
  }

  /**
   * Generate Home Page
   */
  generateHomePage(business, theme, content) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - Home Page
 * Generated with Unified Business Generator
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>${content.hero?.tagline || `Welcome to ${business.name}`}</h1>
          <p style={styles.heroSubtext}>${content.hero?.subtext || business.tagline}</p>
          <div style={styles.heroCtas}>
            <Link to="/contact" style={styles.primaryCta}>${content.hero?.ctas?.[0] || 'Get Started'}</Link>
            <Link to="/about" style={styles.secondaryCta}>${content.hero?.ctas?.[1] || 'Learn More'}</Link>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section style={styles.quickInfo}>
        <div style={styles.infoItem}><MapPin size={20} /> <span>${business.location || 'Your City'}</span></div>
        <div style={styles.infoItem}><Phone size={20} /> <span>${business.phone}</span></div>
      </section>

      {/* About Preview */}
      <section style={styles.aboutPreview}>
        <h2 style={styles.sectionTitle}>About ${business.name}</h2>
        <p style={styles.aboutText}>${content.about || `For ${business.yearsInBusiness} years, ${business.name} has been serving our community with dedication and excellence.`}</p>
        <Link to="/about" style={styles.link}>Read our story <ArrowRight size={16} /></Link>
      </section>

      {/* Testimonials */}
      ${content.testimonials?.length > 0 ? `
      <section style={styles.testimonials}>
        <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
        <div style={styles.testimonialGrid}>
          ${content.testimonials.map(t => `
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"${t.quote}"</p>
            <p style={styles.testimonialAuthor}>- ${t.name}, ${t.role}</p>
          </div>`).join('')}
        </div>
      </section>` : ''}

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <Link to="/contact" style={styles.primaryCta}>${content.hero?.ctas?.[0] || 'Contact Us'}</Link>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: {
    minHeight: '${vs.heroMinHeight}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, ${colors.primary}22 0%, ${colors.accent}22 100%)',
    padding: '${vs.sectionPadding} 24px'
  },
  heroContent: { textAlign: 'center', maxWidth: '800px' },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: '${vs.headingWeight}',
    fontFamily: '${vs.headingFont}',
    color: '${colors.text}',
    marginBottom: '24px',
    lineHeight: 1.2,
    letterSpacing: '${vs.letterSpacing}'
  },
  heroSubtext: { fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '${colors.text}', opacity: 0.8, marginBottom: '32px' },
  heroCtas: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryCta: {
    background: '${colors.primary}',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '${vs.buttonRadius}',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.25s ease',
    boxShadow: '${vs.cardShadow}'
  },
  secondaryCta: {
    background: 'transparent',
    color: '${colors.primary}',
    padding: '14px 32px',
    borderRadius: '${vs.buttonRadius}',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: '2px solid ${colors.primary}',
    transition: 'all 0.25s ease'
  },
  quickInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '24px',
    background: '${colors.primary}',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  infoItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  aboutPreview: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '${vs.headingWeight}',
    fontFamily: '${vs.headingFont}',
    color: '${colors.text}',
    marginBottom: '24px',
    letterSpacing: '${vs.letterSpacing}'
  },
  aboutText: { fontSize: '1.1rem', color: '${colors.text}', opacity: 0.8, lineHeight: 1.7, marginBottom: '16px' },
  link: { color: '${colors.primary}', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' },
  testimonials: { padding: '${vs.sectionPadding} 24px', background: '#f8fafc' },
  testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '${vs.containerMaxWidth}', margin: '0 auto' },
  testimonialCard: { background: '#ffffff', padding: '${vs.cardPadding}', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}' },
  testimonialQuote: { fontSize: '1rem', color: '${colors.text}', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.6 },
  testimonialAuthor: { color: '${colors.primary}', fontWeight: '600' },
  ctaSection: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)' },
  ctaTitle: { fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }
};
`;
  }

  /**
   * Generate About Page
   */
  generateAboutPage(business, theme, content) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - About Page
 */
import React from 'react';
import { Users, Award, Heart, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>About ${business.name}</h1>
        <p style={styles.subtitle}>${business.tagline}</p>
      </section>

      <section style={styles.story}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        <p style={styles.text}>
          For ${business.yearsInBusiness} years, ${business.name} has been dedicated to providing exceptional
          service to our community in ${business.location || 'the area'}. What started as a simple vision
          has grown into something we're truly proud of.
        </p>
      </section>

      <section style={styles.values}>
        <h2 style={styles.sectionTitle}>Our Values</h2>
        <div style={styles.valueGrid}>
          <div style={styles.valueCard}>
            <Heart size={32} color="${colors.primary}" />
            <h3>Passion</h3>
            <p>We love what we do and it shows in every interaction.</p>
          </div>
          <div style={styles.valueCard}>
            <Award size={32} color="${colors.primary}" />
            <h3>Excellence</h3>
            <p>We strive for the highest quality in everything we do.</p>
          </div>
          <div style={styles.valueCard}>
            <Users size={32} color="${colors.primary}" />
            <h3>Community</h3>
            <p>We're proud to serve and be part of ${business.location || 'our local community'}.</p>
          </div>
          <div style={styles.valueCard}>
            <Clock size={32} color="${colors.primary}" />
            <h3>Reliability</h3>
            <p>You can count on us to be there when you need us.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  story: { padding: '${vs.sectionPadding} 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '24px' },
  text: { fontSize: '1.1rem', color: '${colors.text}', opacity: 0.85, lineHeight: 1.8 },
  values: { padding: '${vs.sectionPadding} 24px', background: '#f8fafc' },
  valueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', maxWidth: '${vs.containerMaxWidth}', margin: '0 auto' },
  valueCard: { background: '#ffffff', padding: '${vs.cardPadding}', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}', textAlign: 'center' }
};
`;
  }

  /**
   * Generate Contact Page
   */
  generateContactPage(business, theme) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - Contact Page
 */
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>We'd love to hear from you</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.info}>
            <h2 style={styles.sectionTitle}>Get in Touch</h2>

            <div style={styles.infoItem}>
              <MapPin size={24} color="${colors.primary}" />
              <div>
                <strong>Location</strong>
                <p>${business.location || 'Your City, State'}</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <Phone size={24} color="${colors.primary}" />
              <div>
                <strong>Phone</strong>
                <p>${business.phone}</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <Mail size={24} color="${colors.primary}" />
              <div>
                <strong>Email</strong>
                <p>${business.email}</p>
              </div>
            </div>
          </div>

          <div style={styles.form}>
            <h2 style={styles.sectionTitle}>Send a Message</h2>
            <form>
              <input type="text" placeholder="Your Name" style={styles.input} />
              <input type="email" placeholder="Your Email" style={styles.input} />
              <textarea placeholder="Your Message" rows={5} style={styles.textarea}></textarea>
              <button type="submit" style={styles.button}>Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px', maxWidth: '${vs.containerMaxWidth}', margin: '0 auto' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '24px' },
  info: { padding: '${vs.cardPadding}' },
  infoItem: { display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' },
  form: { background: '#f8fafc', padding: '${vs.cardPadding}', borderRadius: '${vs.borderRadius}' },
  input: { width: '100%', padding: '14px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '${vs.borderRadius}', fontSize: '16px' },
  textarea: { width: '100%', padding: '14px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '${vs.borderRadius}', fontSize: '16px', resize: 'vertical' },
  button: { width: '100%', padding: '14px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '${vs.buttonRadius}', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }
};
`;
  }

  /**
   * Generate Services/Menu Page
   */
  generateServicesPage(business, theme, title) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - ${title} Page
 */
import React from 'react';

export default function ServicesPage() {
  const items = [
    { name: 'Service One', description: 'Description of this service or item.', price: '$XX' },
    { name: 'Service Two', description: 'Description of this service or item.', price: '$XX' },
    { name: 'Service Three', description: 'Description of this service or item.', price: '$XX' },
    { name: 'Service Four', description: 'Description of this service or item.', price: '$XX' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>${title}</h1>
        <p style={styles.subtitle}>Explore what we have to offer</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          {items.map((item, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardImage}></div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{item.name}</h3>
                <p style={styles.cardDesc}>{item.description}</p>
                <span style={styles.price}>{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '${vs.containerMaxWidth}', margin: '0 auto' },
  card: { background: '#fff', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}', overflow: 'hidden' },
  cardImage: { height: '180px', background: 'linear-gradient(135deg, ${colors.primary}30 0%, ${colors.accent}30 100%)' },
  cardContent: { padding: '${vs.cardPadding}' },
  cardTitle: { fontSize: '1.25rem', fontWeight: '600', color: '${colors.text}', marginBottom: '8px' },
  cardDesc: { fontSize: '0.95rem', color: '${colors.text}', opacity: 0.7, marginBottom: '12px' },
  price: { fontSize: '1.1rem', fontWeight: '700', color: '${colors.primary}' }
};
`;
  }

  /**
   * Generate Team Page
   */
  generateTeamPage(business, theme, title) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - ${title} Page
 */
import React from 'react';

export default function TeamPage() {
  const team = [
    { name: 'Team Member', role: 'Role/Title', bio: 'Brief bio or description.' },
    { name: 'Team Member', role: 'Role/Title', bio: 'Brief bio or description.' },
    { name: 'Team Member', role: 'Role/Title', bio: 'Brief bio or description.' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>${title}</h1>
        <p style={styles.subtitle}>Meet the people behind ${business.name}</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          {team.map((member, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.avatar}></div>
              <h3 style={styles.name}>{member.name}</h3>
              <p style={styles.role}>{member.role}</p>
              <p style={styles.bio}>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '${vs.containerMaxWidth}', margin: '0 auto' },
  card: { background: '#fff', padding: '${vs.cardPadding}', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}', textAlign: 'center' },
  avatar: { width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, ${colors.primary}40 0%, ${colors.accent}40 100%)', margin: '0 auto 20px' },
  name: { fontSize: '1.25rem', fontWeight: '600', color: '${colors.text}', marginBottom: '4px' },
  role: { fontSize: '0.95rem', color: '${colors.primary}', fontWeight: '500', marginBottom: '12px' },
  bio: { fontSize: '0.9rem', color: '${colors.text}', opacity: 0.7, lineHeight: 1.6 }
};
`;
  }

  /**
   * Generate Gallery Page
   */
  generateGalleryPage(business, theme) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - Gallery Page
 */
import React from 'react';

export default function GalleryPage() {
  const images = Array(9).fill(null);

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Gallery</h1>
        <p style={styles.subtitle}>A glimpse into ${business.name}</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          {images.map((_, i) => (
            <div key={i} style={styles.imageCard}>
              <div style={styles.placeholder}></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '${vs.containerMaxWidth}', margin: '0 auto' },
  imageCard: { borderRadius: '${vs.borderRadius}', overflow: 'hidden', boxShadow: '${vs.cardShadow}' },
  placeholder: { aspectRatio: '4/3', background: 'linear-gradient(135deg, ${colors.primary}25 0%, ${colors.accent}25 100%)' }
};
`;
  }

  /**
   * Generate Testimonials Page
   */
  generateTestimonialsPage(business, theme, content) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - Testimonials Page
 */
import React from 'react';
import { Star } from 'lucide-react';

export default function TestimonialsPage() {
  const testimonials = ${JSON.stringify(content.testimonials || [
    { quote: 'Amazing service!', name: 'Happy Customer', role: 'Local Resident' },
    { quote: 'Highly recommend!', name: 'Valued Client', role: 'Regular Customer' },
    { quote: 'Best in town!', name: 'Satisfied Guest', role: 'First-Time Visitor' }
  ])};

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>What Our Customers Say</h1>
        <p style={styles.subtitle}>Real feedback from real people</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          {testimonials.map((t, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.stars}>
                {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="${colors.primary}" color="${colors.primary}" />)}
              </div>
              <p style={styles.quote}>"{t.quote}"</p>
              <p style={styles.author}>- {t.name}</p>
              <p style={styles.role}>{t.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '${vs.containerMaxWidth}', margin: '0 auto' },
  card: { background: '#fff', padding: '${vs.cardPadding}', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}' },
  stars: { display: 'flex', gap: '4px', marginBottom: '16px' },
  quote: { fontSize: '1.1rem', color: '${colors.text}', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '16px' },
  author: { fontWeight: '600', color: '${colors.text}' },
  role: { fontSize: '0.9rem', color: '${colors.primary}' }
};
`;
  }

  /**
   * Generate Booking/Reservations Page
   */
  generateBookingPage(business, theme, title) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - ${title} Page
 */
import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';

export default function BookingPage() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>${title}</h1>
        <p style={styles.subtitle}>Schedule your visit with ${business.name}</p>
      </section>

      <section style={styles.content}>
        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}><User size={18} /> Name</label>
            <input type="text" placeholder="Your name" style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}><Calendar size={18} /> Date</label>
            <input type="date" style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}><Clock size={18} /> Time</label>
            <input type="time" style={styles.input} />
          </div>
          <button style={styles.button}>${title}</button>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px', display: 'flex', justifyContent: 'center' },
  form: { background: '#fff', padding: '40px', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}', width: '100%', maxWidth: '500px' },
  field: { marginBottom: '24px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '500', color: '${colors.text}' },
  input: { width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '${vs.borderRadius}', fontSize: '16px' },
  button: { width: '100%', padding: '16px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '${vs.buttonRadius}', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }
};
`;
  }

  /**
   * Generate Events Page
   */
  generateEventsPage(business, theme) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - Events Page
 */
import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function EventsPage() {
  const events = [
    { title: 'Upcoming Event', date: 'January 2026', time: '6:00 PM', description: 'Join us for this special event.' },
    { title: 'Special Occasion', date: 'February 2026', time: '7:00 PM', description: 'Don\\'t miss this exciting gathering.' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Events</h1>
        <p style={styles.subtitle}>What's happening at ${business.name}</p>
      </section>

      <section style={styles.content}>
        <div style={styles.list}>
          {events.map((event, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.dateBox}>
                <Calendar size={24} color="${colors.primary}" />
                <span>{event.date}</span>
              </div>
              <div style={styles.details}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                <p style={styles.eventTime}><Clock size={16} /> {event.time}</p>
                <p style={styles.eventDesc}>{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px' },
  list: { maxWidth: '800px', margin: '0 auto' },
  card: { display: 'flex', gap: '24px', background: '#fff', padding: '${vs.cardPadding}', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}', marginBottom: '20px' },
  dateBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: '${colors.primary}10', borderRadius: '${vs.borderRadius}' },
  details: { flex: 1 },
  eventTitle: { fontSize: '1.25rem', fontWeight: '600', color: '${colors.text}', marginBottom: '8px' },
  eventTime: { display: 'flex', alignItems: 'center', gap: '6px', color: '${colors.primary}', fontSize: '0.9rem', marginBottom: '8px' },
  eventDesc: { color: '${colors.text}', opacity: 0.7 }
};
`;
  }

  /**
   * Generate Pricing Page
   */
  generatePricingPage(business, theme) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - Pricing Page
 */
import React from 'react';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    { name: 'Basic', price: '$XX', features: ['Feature one', 'Feature two', 'Feature three'] },
    { name: 'Standard', price: '$XX', features: ['Everything in Basic', 'Feature four', 'Feature five'], popular: true },
    { name: 'Premium', price: '$XX', features: ['Everything in Standard', 'Feature six', 'Feature seven'] }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Pricing</h1>
        <p style={styles.subtitle}>Transparent pricing for every need</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          {plans.map((plan, i) => (
            <div key={i} style={{...styles.card, ...(plan.popular ? styles.popularCard : {})}}>
              {plan.popular && <span style={styles.badge}>Most Popular</span>}
              <h3 style={styles.planName}>{plan.name}</h3>
              <p style={styles.price}>{plan.price}</p>
              <ul style={styles.features}>
                {plan.features.map((f, j) => (
                  <li key={j} style={styles.feature}><Check size={18} color="${colors.primary}" /> {f}</li>
                ))}
              </ul>
              <button style={styles.button}>Get Started</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '${vs.containerMaxWidth}', margin: '0 auto' },
  card: { background: '#fff', padding: '${vs.cardPadding}', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}', textAlign: 'center', position: 'relative' },
  popularCard: { border: '2px solid ${colors.primary}', transform: 'scale(1.05)' },
  badge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '${colors.primary}', color: '#fff', padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  planName: { fontSize: '1.25rem', fontWeight: '600', color: '${colors.text}', marginBottom: '8px' },
  price: { fontSize: '2.5rem', fontWeight: '700', color: '${colors.primary}', marginBottom: '24px' },
  features: { listStyle: 'none', padding: 0, marginBottom: '24px', textAlign: 'left' },
  feature: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', color: '${colors.text}' },
  button: { width: '100%', padding: '14px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '${vs.buttonRadius}', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }
};
`;
  }

  /**
   * Generate FAQ Page
   */
  generateFAQPage(business, theme) {
    const { colors } = theme;
    const vs = theme.visualStyles;

    return `/**
 * ${business.name} - FAQ Page
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    { q: 'What are your hours?', a: 'We are open Monday through Friday, 9am to 5pm.' },
    { q: 'Do you offer consultations?', a: 'Yes, we offer free consultations. Contact us to schedule.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards and cash.' },
    { q: 'How can I contact you?', a: 'You can reach us by phone at ${business.phone} or email at ${business.email}.' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Frequently Asked Questions</h1>
        <p style={styles.subtitle}>Find answers to common questions</p>
      </section>

      <section style={styles.content}>
        <div style={styles.faqList}>
          {faqs.map((faq, i) => (
            <div key={i} style={styles.faqItem} onClick={() => setOpenIndex(openIndex === i ? -1 : i)}>
              <div style={styles.question}>
                <span>{faq.q}</span>
                {openIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {openIndex === i && <p style={styles.answer}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px' },
  faqList: { maxWidth: '800px', margin: '0 auto' },
  faqItem: { background: '#fff', borderRadius: '${vs.borderRadius}', boxShadow: '${vs.cardShadow}', marginBottom: '12px', cursor: 'pointer', overflow: 'hidden' },
  question: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px ${vs.cardPadding}', fontWeight: '600', color: '${colors.text}' },
  answer: { padding: '0 ${vs.cardPadding} 20px', color: '${colors.text}', opacity: 0.8, lineHeight: 1.7 }
};
`;
  }

  /**
   * Generate Generic Page (fallback)
   */
  generateGenericPage(pageId, business, theme) {
    const { colors } = theme;
    const vs = theme.visualStyles;
    const title = this.capitalizeFirst(pageId.replace(/-/g, ' '));

    return `/**
 * ${business.name} - ${title} Page
 */
import React from 'react';

export default function ${this.capitalizeFirst(pageId)}Page() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>${title}</h1>
        <p style={styles.subtitle}>${business.name}</p>
      </section>

      <section style={styles.content}>
        <p>Content for the ${title} page coming soon.</p>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: '${vs.bodyFont}' },
  hero: { padding: '${vs.sectionPadding} 24px', textAlign: 'center', background: 'linear-gradient(135deg, ${colors.primary}15 0%, ${colors.accent}15 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '${vs.headingWeight}', fontFamily: '${vs.headingFont}', color: '${colors.text}', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '${colors.text}', opacity: 0.8 },
  content: { padding: '${vs.sectionPadding} 24px', textAlign: 'center' }
};
`;
  }

  /**
   * Get quick actions for companion app
   */
  getQuickActions() {
    const terminology = this.getTerminology();
    const industryActions = {
      cafe: [
        { id: 'order', label: 'Order Ahead', icon: 'coffee' },
        { id: 'rewards', label: 'View Rewards', icon: 'gift' },
        { id: 'menu', label: terminology.services || 'Menu', icon: 'book-open' }
      ],
      restaurant: [
        { id: 'reserve', label: terminology.booking || 'Reserve', icon: 'calendar' },
        { id: 'menu', label: terminology.services || 'Menu', icon: 'utensils' },
        { id: 'rewards', label: 'Rewards', icon: 'star' }
      ],
      healthcare: [
        { id: 'book', label: terminology.booking || 'Book Appointment', icon: 'calendar' },
        { id: 'records', label: 'My Records', icon: 'file-text' },
        { id: 'message', label: 'Message', icon: 'message-circle' }
      ],
      fitness: [
        { id: 'schedule', label: 'Class Schedule', icon: 'calendar' },
        { id: 'book', label: terminology.booking || 'Book Class', icon: 'check-circle' },
        { id: 'progress', label: 'My Progress', icon: 'trending-up' }
      ],
      salon: [
        { id: 'book', label: terminology.booking || 'Book', icon: 'calendar' },
        { id: 'services', label: terminology.services || 'Services', icon: 'scissors' },
        { id: 'rewards', label: 'Rewards', icon: 'gift' }
      ]
    };

    return industryActions[this.industry] || [
      { id: 'contact', label: 'Contact', icon: 'phone' },
      { id: 'services', label: terminology.services || 'Services', icon: 'list' },
      { id: 'about', label: 'About', icon: 'info' }
    ];
  }

  // Utility methods
  slugify(text) {
    return text?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'business';
  }

  capitalizeFirst(text) {
    return text?.charAt(0).toUpperCase() + text?.slice(1) || '';
  }
}

module.exports = BusinessGenerator;
