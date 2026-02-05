/**
 * Structural Page Generator
 *
 * Generates pages with STRUCTURALLY different layouts based on
 * the design research configs. This is NOT just color/font changes -
 * the actual page structure, sections, and components are different.
 *
 * Key differences from archetype-pages.cjs:
 * - Different HERO COMPONENTS (video vs story-split vs gallery)
 * - Different SECTION TYPES (scroll-reveal menu vs visual cards)
 * - Different SECTION ORDER
 * - Different FEATURES (merchandise shop, instagram feed, etc.)
 */

const path = require('path');
const fs = require('fs');

const {
  buildStructuralConfig,
  getHeroComponent,
  getSectionComponent,
  HERO_TYPES,
  SECTION_TYPES
} = require('../../config/industry-design-research.cjs');

// Import hero images library
const { getHeroImages, getHeroImage } = require('../config/hero-images.cjs');

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, '../../test-fixtures');

/**
 * Load test fixture for an industry
 */
function loadFixture(industryId) {
  const fixturePath = path.join(FIXTURES_DIR, `${industryId}.json`);
  if (fs.existsSync(fixturePath)) {
    try {
      return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    } catch (e) {
      console.warn(`Failed to load fixture for ${industryId}:`, e.message);
    }
  }
  return null;
}

/**
 * Build rich business data from fixture + images + overrides
 */
function buildRichBusinessData(industryId, businessDataOverrides = {}) {
  const fixture = loadFixture(industryId);
  const images = {
    hero: getHeroImages(industryId, 'primary'),
    interior: getHeroImages(industryId, 'interior'),
    products: getHeroImages(industryId, 'products'),
    team: getHeroImages(industryId, 'team')
  };

  // Start with fixture data or defaults
  const base = fixture ? {
    name: fixture.business?.name || `Test ${industryId}`,
    tagline: fixture.business?.tagline || 'Welcome to our business',
    phone: fixture.business?.phone || '(555) 123-4567',
    email: fixture.business?.email || 'hello@business.com',
    address: fixture.business?.address || '123 Main St',
    location: fixture.business?.location || 'Your City', // Fixture's location for replacement
    _fixtureLocation: fixture.business?.location || 'Austin', // Store original for text replacement
    hours: fixture.business?.hours || {},
    established: fixture.business?.established || '2020',
    // Pages data
    menu: fixture.pages?.menu || null,
    about: fixture.pages?.about || null,
    gallery: fixture.pages?.gallery || null,
    contact: fixture.pages?.contact || null,
    home: fixture.pages?.home || null,
    // Theme
    theme: fixture.theme || {},
    // Raw fixture for advanced use
    _fixture: fixture
  } : {
    name: 'Business Name',
    tagline: 'Your tagline here',
    phone: '(555) 123-4567',
    email: 'hello@business.com',
    address: '123 Main St',
    hours: {},
    established: '2020',
    menu: null,
    about: null,
    gallery: null,
    contact: null,
    home: null,
    theme: {},
    _fixture: null
  };

  // Merge in images
  base.images = images;
  base.heroImage = images.hero?.[0] || '/images/hero.jpg';
  base.heroImages = images.hero || [];

  // Apply overrides and store them for reference
  const result = { ...base, ...businessDataOverrides };
  result._overrides = businessDataOverrides; // Keep track of what was overridden
  result.industry = industryId; // Store industry for CTA logic
  return result;
}

// ============================================
// TREND-AWARE SMART HELPERS
// ============================================

/**
 * Get smart CTA text based on trending features
 * Falls back to industry-appropriate defaults
 */
function getSmartCTA(businessData) {
  const features = businessData.trendingFeatures || [];
  const industry = businessData.industry || '';

  // Check trending features for action keywords
  for (const feature of features) {
    const f = feature.toLowerCase();
    if (f.includes('order') || f.includes('delivery')) return 'Order Online';
    if (f.includes('book') || f.includes('appointment')) return 'Book Now';
    if (f.includes('quote')) return 'Get Quote';
    if (f.includes('schedule')) return 'Schedule Now';
    if (f.includes('reserve') || f.includes('reservation')) return 'Reserve Table';
    if (f.includes('consult')) return 'Free Consultation';
    if (f.includes('trial') || f.includes('demo')) return 'Start Free Trial';
    if (f.includes('membership') || f.includes('join')) return 'Join Now';
  }

  // Industry-specific defaults
  const industryDefaults = {
    'pizza-restaurant': 'Order Online',
    'steakhouse': 'Reserve Table',
    'coffee-cafe': 'Order Ahead',
    'restaurant': 'View Menu',
    'bakery': 'Order Now',
    'salon-spa': 'Book Appointment',
    'fitness-gym': 'Start Free Trial',
    'dental': 'Book Appointment',
    'healthcare': 'Schedule Visit',
    'yoga': 'Join a Class',
    'barbershop': 'Book Now',
    'law-firm': 'Free Consultation',
    'real-estate': 'View Listings',
    'plumber': 'Get Quote',
    'cleaning': 'Get Quote',
    'auto-shop': 'Schedule Service',
    'saas': 'Start Free Trial',
    'ecommerce': 'Shop Now',
    'school': 'Apply Now'
  };

  return businessData.heroCta || industryDefaults[industry] || 'Get Started';
}

/**
 * Get smart CTA path based on industry
 * Maps CTA actions to actual pages that exist for each industry
 */
function getSmartCtaPath(businessData) {
  const industry = businessData.industry || '';

  // Industry-specific CTA paths - must match actual pages from INDUSTRY_PAGES
  const industryPaths = {
    'pizza-restaurant': '/order',
    'steakhouse': '/reservations',
    'coffee-cafe': '/order',
    'restaurant': '/menu',
    'bakery': '/order',
    'salon-spa': '/book',
    'fitness-gym': '/membership',
    'dental': '/book',
    'healthcare': '/book',
    'yoga': '/classes',
    'barbershop': '/book',
    'law-firm': '/consultation',
    'real-estate': '/listings',
    'plumber': '/quote',
    'cleaning': '/quote',
    'auto-shop': '/appointment',
    'saas': '/demo',
    'ecommerce': '/shop',
    'school': '/apply'
  };

  return industryPaths[industry] || '/menu';
}

/**
 * Get secondary CTA path (usually About or Contact)
 */
function getSecondaryCtaPath(businessData) {
  const industry = businessData.industry || '';

  // For food industries, secondary CTA goes to menu
  // For service industries, secondary CTA goes to services or about
  const foodIndustries = ['pizza-restaurant', 'steakhouse', 'coffee-cafe', 'restaurant', 'bakery'];

  if (foodIndustries.includes(industry)) {
    return '/menu';
  }

  return '/about';
}

/**
 * Get smart tagline incorporating trust signals and features
 * Returns enhanced tagline or original
 */
function getSmartTagline(businessData) {
  const trust = businessData.trendingTrustSignals || [];
  const features = businessData.trendingFeatures || [];
  const originalTagline = businessData.tagline || '';
  const industry = businessData.industry || '';

  // If there's already a good tagline, don't override
  if (originalTagline && originalTagline.length > 20) {
    return originalTagline;
  }

  let prefix = '';
  let suffix = '';

  // Add trust element as prefix from trends
  for (const t of trust) {
    const tLower = t.toLowerCase();
    if (tLower.includes('family')) { prefix = 'Family-Owned '; break; }
    if (tLower.includes('local')) { prefix = 'Locally Owned '; break; }
    if (tLower.includes('award')) { prefix = 'Award-Winning '; break; }
    if (tLower.includes('certif')) { prefix = 'Certified '; break; }
    if (tLower.includes('artisan') || tLower.includes('craft')) { prefix = 'Artisan '; break; }
  }

  // Add feature element as suffix from trends
  for (const f of features) {
    const fLower = f.toLowerCase();
    if (fLower.includes('delivery')) { suffix = ' • Fast Delivery Available'; break; }
    if (fLower.includes('online order') || fLower.includes('mobile order')) { suffix = ' • Order Online'; break; }
    if (fLower.includes('24') || fLower.includes('emergency')) { suffix = ' • 24/7 Service'; break; }
    if (fLower.includes('same day')) { suffix = ' • Same Day Service'; break; }
    if (fLower.includes('loyalty') || fLower.includes('reward')) { suffix = ' • Earn Rewards'; break; }
  }

  // Industry-specific defaults when no trends applied
  if (!prefix && !suffix) {
    const industryDefaults = {
      'coffee-cafe': { prefix: '', suffix: ' • Locally Roasted' },
      'pizza-restaurant': { prefix: '', suffix: ' • Fresh Daily' },
      'steakhouse': { prefix: 'Premium ', suffix: '' },
      'restaurant': { prefix: '', suffix: ' • Farm to Table' },
      'bakery': { prefix: 'Artisan ', suffix: '' },
      'salon-spa': { prefix: '', suffix: ' • Book Online' },
      'fitness-gym': { prefix: '', suffix: ' • Start Your Journey' },
      'dental': { prefix: '', suffix: ' • Accepting New Patients' },
      'healthcare': { prefix: '', suffix: ' • Compassionate Care' },
      'yoga': { prefix: '', suffix: ' • Find Your Balance' },
      'barbershop': { prefix: '', suffix: ' • Walk-Ins Welcome' },
      'law-firm': { prefix: '', suffix: ' • Free Consultation' },
      'real-estate': { prefix: '', suffix: ' • Your Dream Home Awaits' },
      'plumber': { prefix: '', suffix: ' • 24/7 Emergency Service' },
      'cleaning': { prefix: '', suffix: ' • Free Estimates' },
      'auto-shop': { prefix: '', suffix: ' • Honest & Reliable' },
      'saas': { prefix: '', suffix: ' • Start Free Today' },
      'ecommerce': { prefix: '', suffix: ' • Free Shipping' },
      'school': { prefix: '', suffix: ' • Enroll Now' }
    };

    const defaults = industryDefaults[industry] || {};
    prefix = defaults.prefix || '';
    suffix = defaults.suffix || '';
  }

  // Build enhanced tagline
  if (prefix || suffix) {
    const base = originalTagline || `Welcome to ${businessData.name}`;
    return prefix + base + suffix;
  }

  return originalTagline || `Welcome to ${businessData.name}`;
}

/**
 * Get features - use trending features as fallback when fixture is empty
 */
function getSmartFeatures(businessData, maxFeatures = 6) {
  // 1. Try fixture/business data first
  if (businessData.features && businessData.features.length > 0) {
    return businessData.features.slice(0, maxFeatures);
  }

  // 2. Try home page features from fixture
  if (businessData.home?.features && businessData.home.features.length > 0) {
    return businessData.home.features.slice(0, maxFeatures);
  }

  // 3. Fallback to trending features
  if (businessData.trendingFeatures && businessData.trendingFeatures.length > 0) {
    return businessData.trendingFeatures.slice(0, maxFeatures).map((feature, idx) => ({
      title: feature,
      description: `Industry-leading ${feature.toLowerCase()} for your convenience`,
      icon: getFeatureIcon(feature, idx)
    }));
  }

  // 4. Final fallback - generic features
  return [
    { title: 'Quality Service', description: 'Committed to excellence in everything we do', icon: 'Star' },
    { title: 'Expert Team', description: 'Experienced professionals ready to help', icon: 'Users' },
    { title: 'Customer First', description: 'Your satisfaction is our priority', icon: 'Heart' }
  ];
}

/**
 * Get appropriate icon for a feature based on keywords
 */
function getFeatureIcon(feature, fallbackIndex = 0) {
  const f = feature.toLowerCase();
  if (f.includes('order') || f.includes('delivery')) return 'ShoppingBag';
  if (f.includes('book') || f.includes('schedule')) return 'Calendar';
  if (f.includes('quality') || f.includes('premium')) return 'Award';
  if (f.includes('fast') || f.includes('quick')) return 'Zap';
  if (f.includes('support') || f.includes('service')) return 'Headphones';
  if (f.includes('secure') || f.includes('safe')) return 'Shield';
  if (f.includes('local') || f.includes('location')) return 'MapPin';
  if (f.includes('review') || f.includes('rating')) return 'Star';
  if (f.includes('mobile') || f.includes('app')) return 'Smartphone';
  if (f.includes('team') || f.includes('staff')) return 'Users';

  // Fallback icons by index
  const fallbackIcons = ['Star', 'Award', 'Zap', 'Heart', 'Check', 'ArrowRight'];
  return fallbackIcons[fallbackIndex % fallbackIcons.length];
}

/**
 * Get footer trust text based on trending trust signals
 */
function getSmartFooterTrust(businessData) {
  const trust = businessData.trendingTrustSignals || [];
  const parts = [];

  for (const t of trust) {
    const tLower = t.toLowerCase();
    if (tLower.includes('family') && !parts.some(p => p.includes('family'))) {
      parts.push('A family-owned business');
    }
    if (tLower.includes('licens') && !parts.some(p => p.includes('Licensed'))) {
      parts.push('Licensed and insured');
    }
    if (tLower.includes('years') || tLower.includes('established')) {
      const yearMatch = t.match(/(\d+)/);
      if (yearMatch) {
        const years = parseInt(yearMatch[1]);
        const since = new Date().getFullYear() - years;
        parts.push(`Serving since ${since}`);
      }
    }
    if (tLower.includes('certified') && !parts.some(p => p.includes('Certified'))) {
      parts.push('Certified professionals');
    }
    if (tLower.includes('guarantee') && !parts.some(p => p.includes('guarantee'))) {
      parts.push('Satisfaction guaranteed');
    }
  }

  return parts.slice(0, 3).join(' • ');
}

// ============================================
// HERO COMPONENT GENERATORS
// ============================================

/**
 * Generate VideoHero component code
 */
function generateVideoHero(config, colors, businessData) {
  const { autoplay = true, content = 'action', overlay = 'gradient-bottom' } = config;
  const businessName = businessData.name || 'Business';
  const tagline = getSmartTagline(businessData);
  const cta = getSmartCTA(businessData);
  const ctaPath = getSmartCtaPath(businessData);
  const secondaryPath = getSecondaryCtaPath(businessData);

  return `
{/* Video Hero Section */}
<section style={styles.videoHero}>
  <div style={styles.videoContainer}>
    <video
      autoPlay={${autoplay}}
      muted
      loop
      playsInline
      style={styles.heroVideo}
      poster="${businessData.heroImage || '/images/hero-placeholder.jpg'}"
    >
      <source src="${businessData.heroVideo || '/videos/hero.mp4'}" type="video/mp4" />
    </video>
    <div style={styles.videoOverlay} />
  </div>
  <div style={styles.heroContent}>
    <h1 style={styles.heroTitle}>${businessName}</h1>
    <p style={styles.heroTagline}>${tagline}</p>
    <div style={styles.heroCtas}>
      <Link to="${ctaPath}" style={styles.primaryBtn}>${cta}</Link>
      <Link to="/contact" style={styles.secondaryBtn}>Contact Us</Link>
    </div>
  </div>
</section>`;
}

/**
 * Generate StorySplitHero component code
 */
function generateStorySplitHero(config, colors, businessData) {
  const { narrative = 'origin', imagePosition = 'right' } = config;
  const businessName = businessData.name || 'Business';
  const tagline = getSmartTagline(businessData);
  const storyText = businessData.storyText || 'Every great business has a story. Ours began with a simple idea...';

  const imageFirst = imagePosition === 'left';

  return `
{/* Story Split Hero Section */}
<section style={styles.storySplitHero}>
  <div style={styles.storySplitContainer}>
    ${imageFirst ? `
    <div style={styles.storyImageSide}>
      <img
        src="${businessData.heroImage || '/images/story-hero.jpg'}"
        alt="${businessName}"
        style={styles.storyImage}
      />
    </div>` : ''}
    <div style={styles.storyContentSide}>
      <span style={styles.storyLabel}>Our Story</span>
      <h1 style={styles.storyTitle}>${businessName}</h1>
      <p style={styles.storyText}>${storyText}</p>
      <p style={styles.storyTagline}>${tagline}</p>
      <Link to="/about" style={styles.storyBtn}>Read Our Story</Link>
    </div>
    ${!imageFirst ? `
    <div style={styles.storyImageSide}>
      <img
        src="${businessData.heroImage || '/images/story-hero.jpg'}"
        alt="${businessName}"
        style={styles.storyImage}
      />
    </div>` : ''}
  </div>
</section>`;
}

/**
 * Generate GalleryHero component code
 */
function generateGalleryHero(config, colors, businessData) {
  const { parallax = true, slideshow = true } = config;
  const businessName = businessData.name || 'Business';
  const tagline = getSmartTagline(businessData);

  return `
{/* Gallery Full-Bleed Hero Section */}
<section style={styles.galleryHero}>
  <div style={styles.gallerySlideshow}>
    {heroImages.map((img, idx) => (
      <div
        key={idx}
        style={{
          ...styles.gallerySlide,
          opacity: currentSlide === idx ? 1 : 0,
          transform: ${parallax} ? \`translateY(\${scrollY * 0.3}px)\` : 'none'
        }}
      >
        <img src={img} alt={\`${businessName} \${idx + 1}\`} style={styles.galleryImage} />
      </div>
    ))}
  </div>
  <div style={styles.galleryOverlay} />
  <div style={styles.galleryContent}>
    <h1 style={styles.galleryTitle}>${businessName}</h1>
    <p style={styles.galleryTagline}>${tagline}</p>
    <div style={styles.galleryIndicators}>
      {heroImages.map((_, idx) => (
        <button
          key={idx}
          onClick={() => setCurrentSlide(idx)}
          style={{
            ...styles.galleryDot,
            background: currentSlide === idx ? '${colors.primary}' : 'rgba(255,255,255,0.5)'
          }}
        />
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate MinimalHero component code
 */
function generateMinimalHero(config, colors, businessData) {
  const { contrast = 'high', typography = 'elegant' } = config;
  const businessName = businessData.name || 'Business';
  const tagline = getSmartTagline(businessData);
  const cta = getSmartCTA(businessData);
  const ctaPath = getSmartCtaPath(businessData);

  return `
{/* Minimal Text Hero Section */}
<section style={styles.minimalHero}>
  <div style={styles.minimalContainer}>
    <h1 style={styles.minimalTitle}>${businessName}</h1>
    <div style={styles.minimalDivider} />
    <p style={styles.minimalTagline}>${tagline}</p>
    <Link to="${ctaPath}" style={styles.minimalBtn}>${cta}</Link>
  </div>
</section>`;
}

/**
 * Generate DarkLuxuryHero component code
 */
function generateDarkLuxuryHero(config, colors, businessData) {
  const { goldAccents = true, subtleAnimations = true } = config;
  const businessName = businessData.name || 'Business';
  const tagline = getSmartTagline(businessData);
  const cta = getSmartCTA(businessData);

  return `
{/* Dark Luxury Hero Section */}
<section style={styles.darkLuxuryHero}>
  <div style={styles.darkLuxuryBg}>
    <img
      src="${businessData.heroImage || '/images/hero-dark.jpg'}"
      alt="${businessName}"
      style={styles.darkLuxuryImage}
    />
    <div style={styles.darkLuxuryOverlay} />
  </div>
  <div style={styles.darkLuxuryContent}>
    <div style={styles.luxuryAccent} />
    <h1 style={styles.darkLuxuryTitle}>${businessName}</h1>
    <p style={styles.darkLuxuryTagline}>${tagline}</p>
    <div style={styles.luxuryAccent} />
    <Link to="/menu" style={styles.luxuryBtn}>${cta}</Link>
  </div>
</section>`;
}

/**
 * Generate SplitAnimatedHero component code
 */
function generateSplitAnimatedHero(config, colors, businessData) {
  const { animations = 'dynamic', personality = true } = config;
  const businessName = businessData.name || 'Business';
  const tagline = getSmartTagline(businessData);
  const cta = getSmartCTA(businessData);
  const ctaPath = getSmartCtaPath(businessData);

  return `
{/* Split Animated Hero Section */}
<section style={styles.splitAnimatedHero}>
  <div style={styles.splitLeft}>
    <div style={styles.splitContent}>
      <h1 style={styles.splitTitle}>${businessName}</h1>
      <p style={styles.splitTagline}>${tagline}</p>
      <Link to="${ctaPath}" style={styles.splitBtn}>${cta}</Link>
    </div>
  </div>
  <div style={styles.splitRight}>
    <img
      src="${businessData.heroImage || '/images/hero-split.jpg'}"
      alt="${businessName}"
      style={styles.splitImage}
    />
  </div>
</section>`;
}

/**
 * Generate ImageOverlayHero component code
 */
function generateImageOverlayHero(config, colors, businessData) {
  const businessName = businessData.name || 'Business';
  const tagline = getSmartTagline(businessData);
  const cta = getSmartCTA(businessData);
  const ctaPath = getSmartCtaPath(businessData);

  return `
{/* Image Overlay Hero Section */}
<section style={styles.imageOverlayHero}>
  <img
    src="${businessData.heroImage || '/images/hero.jpg'}"
    alt="${businessName}"
    style={styles.overlayImage}
  />
  <div style={styles.overlayGradient} />
  <div style={styles.overlayContent}>
    <h1 style={styles.overlayTitle}>${businessName}</h1>
    <p style={styles.overlayTagline}>${tagline}</p>
    <Link to="${ctaPath}" style={styles.overlayBtn}>${cta}</Link>
  </div>
</section>`;
}

/**
 * Generate CenteredCtaHero component code
 */
function generateCenteredCtaHero(config, colors, businessData) {
  const businessName = businessData.name || 'Business';
  const tagline = getSmartTagline(businessData);
  const cta = getSmartCTA(businessData);
  const ctaPath = getSmartCtaPath(businessData);

  return `
{/* Centered CTA Hero Section */}
<section style={styles.centeredCtaHero}>
  <div style={styles.centeredBg}>
    <img
      src="${businessData.heroImage || '/images/hero.jpg'}"
      alt="${businessName}"
      style={styles.centeredBgImage}
    />
    <div style={styles.centeredOverlay} />
  </div>
  <div style={styles.centeredContent}>
    <h1 style={styles.centeredTitle}>${businessName}</h1>
    <p style={styles.centeredTagline}>${tagline}</p>
    <div style={styles.centeredCtas}>
      <Link to="${ctaPath}" style={styles.centeredPrimaryBtn}>${cta}</Link>
      <Link to="/about" style={styles.centeredSecondaryBtn}>Learn More</Link>
    </div>
  </div>
</section>`;
}

// Hero generator map
const HERO_GENERATORS = {
  'video': generateVideoHero,
  'story-split': generateStorySplitHero,
  'gallery-fullbleed': generateGalleryHero,
  'minimal-text': generateMinimalHero,
  'dark-luxury': generateDarkLuxuryHero,
  'split-animated': generateSplitAnimatedHero,
  'image-overlay': generateImageOverlayHero,
  'centered-cta': generateCenteredCtaHero
};

// ============================================
// SECTION COMPONENT GENERATORS
// ============================================

/**
 * Generate MenuScrollReveal section
 */
function generateMenuScrollReveal(config, colors, businessData) {
  return `
{/* Menu Scroll Reveal Section */}
<section style={styles.menuScrollReveal}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>Our Menu</h2>
    <div style={styles.menuGrid}>
      {menuCategories.map((category, idx) => (
        <div
          key={idx}
          style={{
            ...styles.menuCategory,
            opacity: scrollProgress > idx * 0.2 ? 1 : 0,
            transform: scrollProgress > idx * 0.2 ? 'translateY(0)' : 'translateY(30px)'
          }}
        >
          <h3 style={styles.categoryTitle}>{category.name}</h3>
          <div style={styles.categoryItems}>
            {category.items.map((item, i) => (
              <div key={i} style={styles.menuItem}>
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.itemDots} />
                <span style={styles.itemPrice}>{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate MenuVisualCards section
 * Includes image fallback handling for broken/503 images
 */
function generateMenuVisualCards(config, colors, businessData) {
  // Placeholder fallback image (simple gradient or placeholder service)
  const fallbackImage = 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Image+Unavailable';
  // Limit to 3 items for clean homepage layout (fills row evenly)
  const maxItems = config?.maxItems || 3;

  return `
{/* Menu Visual Cards Section - Homepage Preview */}
<section style={styles.menuVisualCards}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>Menu Highlights</h2>
    <div style={styles.visualCardsGrid}>
      {menuItems.slice(0, ${maxItems}).map((item, idx) => (
        <div key={idx} style={styles.visualCard}>
          <div style={styles.visualCardImage}>
            <img
              src={item.image}
              alt={item.name}
              style={styles.cardImg}
              onError={(e) => { e.target.src = '${fallbackImage}'; e.target.onerror = null; }}
            />
            {item.badge && <span style={styles.cardBadge}>{item.badge}</span>}
          </div>
          <div style={styles.visualCardContent}>
            <h3 style={styles.cardTitle}>{item.name}</h3>
            <p style={styles.cardDesc}>{item.description}</p>
            <span style={styles.cardPrice}>{item.price}</span>
          </div>
        </div>
      ))}
    </div>
    <Link to="/menu" style={styles.viewAllBtn}>View Full Menu</Link>
  </div>
</section>`;
}

/**
 * Generate MenuBestPractices section
 *
 * Research-backed implementation:
 * - Golden Triangle layout
 * - No $ pricing (Cornell psychology study)
 * - Popular/New/Chef's Pick badges (+44% sales with photos)
 * - Dietary icons and filters
 * - Sticky category tabs
 * - Hero items with photos, regular items text-only
 * - Mobile-first (48px tap targets)
 */
function generateMenuBestPractices(config, colors, businessData) {
  const primary = colors.primary || '#3B82F6';

  return `
{/* Menu Best Practices Section - Research-Backed */}
<section style={styles.menuBestPractices}>
  {/* Sticky Category Tabs */}
  <nav style={styles.menuCategoryNav}>
    <div style={styles.menuCategoryTabs}>
      {menuCategories.map((cat, idx) => (
        <button
          key={idx}
          onClick={() => scrollToMenuCategory(idx)}
          style={{
            ...styles.menuCategoryTab,
            background: activeMenuCategory === idx ? '${primary}' : 'transparent',
            color: activeMenuCategory === idx ? '#fff' : '#374151',
            borderColor: activeMenuCategory === idx ? '${primary}' : '#e5e7eb'
          }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  </nav>

  {/* Dietary Filters */}
  <div style={styles.menuFilters}>
    <div style={styles.menuFilterButtons}>
      {[
        { key: 'vegetarian', icon: '🌱', label: 'Vegetarian' },
        { key: 'vegan', icon: '🌿', label: 'Vegan' },
        { key: 'gluten-free', icon: '🌾', label: 'GF' }
      ].map(filter => (
        <button
          key={filter.key}
          onClick={() => toggleMenuFilter(filter.key)}
          style={{
            ...styles.menuFilterBtn,
            background: menuFilters.includes(filter.key) ? '${primary}' : '#f3f4f6',
            color: menuFilters.includes(filter.key) ? '#fff' : '#374151'
          }}
        >
          {filter.icon} {filter.label}
        </button>
      ))}
    </div>
  </div>

  {/* Menu Content */}
  <div style={styles.menuContent}>
    {menuCategories.map((category, catIdx) => (
      <div
        key={catIdx}
        ref={el => menuCategoryRefs.current[catIdx] = el}
        style={styles.menuCategorySection}
      >
        <div style={styles.menuCategoryHeader}>
          <h2 style={styles.menuCategoryTitle}>{category.name}</h2>
          {category.description && (
            <p style={styles.menuCategoryDesc}>{category.description}</p>
          )}
        </div>

        <div style={styles.menuItemsList}>
          {filterMenuItems(category.items).map((item, idx) => (
            item.image ? (
              /* Hero Item - With Photo */
              <div key={idx} style={styles.menuHeroItem}>
                <div style={styles.menuItemImageWrap}>
                  <img src={item.image} alt={item.name} style={styles.menuItemImage} />
                  {item.badges?.includes('popular') && (
                    <span style={styles.menuBadgePopular}>⭐ Popular</span>
                  )}
                  {item.badges?.includes('new') && (
                    <span style={styles.menuBadgeNew}>✨ New</span>
                  )}
                  {item.badges?.includes('chef-pick') && (
                    <span style={styles.menuBadgeChef}>👨‍🍳 Chef's Pick</span>
                  )}
                </div>
                <div style={styles.menuItemDetails}>
                  <div style={styles.menuItemHeader}>
                    <h3 style={styles.menuItemName}>
                      {item.name}
                      {item.dietary?.map((d, i) => (
                        <span key={i} style={styles.menuDietaryIcon}>
                          {d === 'vegetarian' && '🌱'}
                          {d === 'vegan' && '🌿'}
                          {d === 'gluten-free' && '🌾'}
                          {d === 'spicy' && '🌶️'}
                        </span>
                      ))}
                    </h3>
                    <span style={styles.menuItemPrice}>{item.price}</span>
                  </div>
                  <p style={styles.menuItemDesc}>{item.description}</p>
                  <button style={styles.menuAddBtn}>Add +</button>
                </div>
              </div>
            ) : (
              /* Regular Item - Text Only */
              <div key={idx} style={styles.menuTextItem}>
                <div style={styles.menuItemHeader}>
                  <h3 style={styles.menuItemName}>
                    {item.name}
                    {item.badges?.includes('popular') && <span style={styles.menuBadgeInline}>⭐</span>}
                    {item.badges?.includes('new') && <span style={styles.menuBadgeInline}>✨</span>}
                    {item.dietary?.map((d, i) => (
                      <span key={i} style={styles.menuDietaryIcon}>
                        {d === 'vegetarian' && '🌱'}
                        {d === 'vegan' && '🌿'}
                        {d === 'gluten-free' && '🌾'}
                        {d === 'spicy' && '🌶️'}
                      </span>
                    ))}
                  </h3>
                  <span style={styles.menuItemPrice}>{item.price}</span>
                </div>
                <p style={styles.menuItemDesc}>{item.description}</p>
              </div>
            )
          ))}
        </div>
      </div>
    ))}
  </div>

  {/* Allergen Legend */}
  <div style={styles.menuAllergenLegend}>
    <h4 style={styles.menuLegendTitle}>Dietary & Allergen Information</h4>
    <div style={styles.menuLegendGrid}>
      <span style={styles.menuLegendItem}>🌱 Vegetarian</span>
      <span style={styles.menuLegendItem}>🌿 Vegan</span>
      <span style={styles.menuLegendItem}>🌾 Gluten-Free</span>
      <span style={styles.menuLegendItem}>🌶️ Spicy</span>
    </div>
    <p style={styles.menuLegendNote}>
      Please inform your server of any allergies. Our kitchen handles eggs, dairy, wheat, nuts, shellfish, and soy.
    </p>
  </div>
</section>`;
}

/**
 * Generate MenuPreviewCards section - for homepage previews
 */
function generateMenuPreviewCards(config, colors, businessData) {
  const primary = colors.primary || '#3B82F6';
  // Show exactly 3 items for clean homepage layout (fills row evenly)
  const maxItems = config?.maxItems || 3;

  return `
{/* Menu Preview Cards - Homepage */}
<section style={styles.menuPreviewSection}>
  <div style={styles.container}>
    <div style={styles.menuPreviewHeader}>
      <h2 style={styles.sectionTitle}>Customer Favorites</h2>
      <p style={styles.menuPreviewSubtitle}>Our most loved dishes</p>
    </div>
    <div style={styles.menuPreviewGrid}>
      {menuItems.slice(0, ${maxItems}).map((item, idx) => (
        <div key={idx} style={styles.menuPreviewCard}>
          {item.image && (
            <div style={styles.menuPreviewImageWrap}>
              <img src={item.image} alt={item.name} style={styles.menuPreviewImage} />
              {item.badges?.includes('popular') && (
                <span style={styles.menuPreviewBadge}>⭐ Popular</span>
              )}
            </div>
          )}
          <div style={styles.menuPreviewContent}>
            <div style={styles.menuPreviewTop}>
              <h3 style={styles.menuPreviewName}>{item.name}</h3>
              <span style={styles.menuPreviewPrice}>{item.price}</span>
            </div>
            <p style={styles.menuPreviewDesc}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
    <Link to="/menu" style={styles.menuPreviewCta}>View Full Menu</Link>
  </div>
</section>`;
}

/**
 * Generate OriginTimeline section
 */
function generateOriginTimeline(config, colors, businessData) {
  return `
{/* Origin Timeline Section */}
<section style={styles.originTimeline}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>Our Story</h2>
    <div style={styles.timeline}>
      {timelineEvents.map((event, idx) => (
        <div key={idx} style={styles.timelineItem}>
          <div style={styles.timelineYear}>{event.year}</div>
          <div style={styles.timelineLine} />
          <div style={styles.timelineContent}>
            <h3 style={styles.timelineTitle}>{event.title}</h3>
            <p style={styles.timelineText}>{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate GalleryHoverZoom section
 * Includes image fallback handling for broken/503 images
 */
function generateGalleryHoverZoom(config, colors, businessData) {
  const { columns = 3 } = config;
  const fallbackImage = 'https://placehold.co/400x300/f3f4f6/9ca3af?text=Image+Unavailable';

  return `
{/* Gallery Hover Zoom Section */}
<section style={styles.galleryHoverZoom}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>Gallery</h2>
    <div style={{...styles.galleryGrid, gridTemplateColumns: 'repeat(${columns}, 1fr)'}}>
      {galleryImages.map((img, idx) => (
        <div key={idx} style={styles.galleryItem}>
          <img
            src={img.src}
            alt={img.alt}
            style={styles.galleryImg}
            onError={(e) => { e.target.src = '${fallbackImage}'; e.target.onerror = null; }}
          />
          <div style={styles.galleryOverlayHover}>
            <span style={styles.galleryCaption}>{img.caption}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate LocationsShowcase section
 */
function generateLocationsShowcase(config, colors, businessData) {
  return `
{/* Locations Showcase Section */}
<section style={styles.locationsShowcase}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>Our Locations</h2>
    <div style={styles.locationsGrid}>
      {locations.map((loc, idx) => (
        <div key={idx} style={styles.locationCard}>
          <img src={loc.image} alt={loc.name} style={styles.locationImage} />
          <div style={styles.locationInfo}>
            <h3 style={styles.locationName}>{loc.name}</h3>
            <p style={styles.locationAddress}>{loc.address}</p>
            <p style={styles.locationHours}>{loc.hours}</p>
            <a href={loc.directionsUrl} style={styles.directionsLink}>Get Directions</a>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate MerchandiseShop section
 * Note: Links to /contact for inquiries since most industries don't have a dedicated shop page
 * Includes image fallback handling for broken/503 images
 */
function generateMerchandiseShop(config, colors, businessData) {
  const fallbackImage = 'https://placehold.co/300x300/f3f4f6/9ca3af?text=Product';

  return `
{/* Merchandise Shop Section */}
<section style={styles.merchandiseShop}>
  <div style={styles.container}>
    <div style={styles.shopHeader}>
      <h2 style={styles.sectionTitle}>Shop Our Merch</h2>
      <p style={styles.shopSubtitle}>Take a piece of us home with you</p>
    </div>
    <div style={styles.shopGrid}>
      {merchandise.map((item, idx) => (
        <div key={idx} style={styles.merchCard}>
          <img
            src={item.image}
            alt={item.name}
            style={styles.merchImage}
            onError={(e) => { e.target.src = '${fallbackImage}'; e.target.onerror = null; }}
          />
          <h3 style={styles.merchName}>{item.name}</h3>
          <p style={styles.merchPrice}>{item.price}</p>
          <button style={styles.addToCartBtn}>Add to Cart</button>
        </div>
      ))}
    </div>
    <Link to="/contact" style={styles.viewAllBtn}>Inquire About Merchandise</Link>
  </div>
</section>`;
}

/**
 * Generate InstagramFeed section
 */
function generateInstagramFeed(config, colors, businessData) {
  const { columns = 4 } = config;
  return `
{/* Instagram Feed Section */}
<section style={styles.instagramFeed}>
  <div style={styles.container}>
    <div style={styles.instaHeader}>
      <h2 style={styles.sectionTitle}>Follow Us @${businessData.instagramHandle || 'ourbusiness'}</h2>
    </div>
    <div style={{...styles.instaGrid, gridTemplateColumns: 'repeat(${columns}, 1fr)'}}>
      {instagramPosts.map((post, idx) => (
        <a key={idx} href={post.url} target="_blank" rel="noopener" style={styles.instaPost}>
          <img src={post.image} alt="Instagram post" style={styles.instaImage} />
          <div style={styles.instaOverlay}>
            <span style={styles.instaLikes}>{post.likes} likes</span>
          </div>
        </a>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate GiftCardsProminent section
 */
function generateGiftCardsProminent(config, colors, businessData) {
  return `
{/* Gift Cards Section */}
<section style={styles.giftCardsSection}>
  <div style={styles.container}>
    <div style={styles.giftCardContent}>
      <div style={styles.giftCardText}>
        <h2 style={styles.giftCardTitle}>Give the Gift of Great Food</h2>
        <p style={styles.giftCardDesc}>Perfect for any occasion. Digital gift cards delivered instantly.</p>
        <Link to="/gift-cards" style={styles.giftCardBtn}>Purchase Gift Card</Link>
      </div>
      <div style={styles.giftCardVisual}>
        <div style={styles.giftCardPreview}>
          <span style={styles.giftCardLogo}>${businessData.name || 'Business'}</span>
          <span style={styles.giftCardAmount}>$50</span>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Generate ReviewsCarousel section
 */
function generateReviewsCarousel(config, colors, businessData) {
  return `
{/* Reviews Carousel Section */}
<section style={styles.reviewsCarousel}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
    <div style={styles.carouselContainer}>
      <button onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))} style={styles.carouselBtn}>
        <ChevronLeft size={24} />
      </button>
      <div style={styles.reviewSlide}>
        <div style={styles.reviewStars}>
          {'★'.repeat(reviews[reviewIndex]?.rating || 5)}
        </div>
        <p style={styles.reviewText}>"{reviews[reviewIndex]?.text}"</p>
        <p style={styles.reviewAuthor}>— {reviews[reviewIndex]?.author}</p>
      </div>
      <button onClick={() => setReviewIndex(Math.min(reviews.length - 1, reviewIndex + 1))} style={styles.carouselBtn}>
        <ChevronRight size={24} />
      </button>
    </div>
  </div>
</section>`;
}

/**
 * Generate ServicesGrid section
 */
function generateServicesGrid(config, colors, businessData) {
  return `
{/* Services Grid Section */}
<section style={styles.servicesGrid}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>Our Services</h2>
    <div style={styles.servicesCards}>
      {services.map((service, idx) => (
        <div key={idx} style={styles.serviceCard}>
          <div style={styles.serviceIcon}><RenderIcon name={service.icon} size={28} color={styles.serviceIcon?.color} /></div>
          <h3 style={styles.serviceTitle}>{service.name}</h3>
          <p style={styles.serviceDesc}>{service.description}</p>
          {service.price && <span style={styles.servicePrice}>{service.price}</span>}
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate BookingWidget section - INDUSTRY AWARE
 */
function generateBookingWidget(config, colors, businessData) {
  // Determine industry type for appropriate CTA
  const industry = businessData.industry || '';
  const isRestaurant = ['pizza', 'restaurant', 'steakhouse', 'bakery', 'coffee', 'cafe'].some(k => industry.includes(k));
  const isService = ['salon', 'spa', 'dental', 'healthcare', 'barber', 'fitness', 'yoga'].some(k => industry.includes(k));

  if (isRestaurant) {
    return `
{/* Order CTA Section */}
<section style={styles.bookingWidget}>
  <div style={styles.container}>
    <div style={styles.bookingContent}>
      <h2 style={styles.bookingTitle}>Ready to Order?</h2>
      <p style={styles.bookingSubtitle}>Fresh, hot, and delivered right to your door</p>
      <div style={styles.bookingForm}>
        <Link to="/menu" style={styles.bookingBtn}>View Menu</Link>
        <a href="tel:${businessData.phone || '(555) 123-4567'}" style={{...styles.bookingBtn, background: 'transparent', color: '#fff', border: '2px solid #fff'}}>Call to Order</a>
      </div>
    </div>
  </div>
</section>`;
  }

  if (isService) {
    return `
{/* Booking Widget Section */}
<section style={styles.bookingWidget}>
  <div style={styles.container}>
    <div style={styles.bookingContent}>
      <h2 style={styles.bookingTitle}>Book Your Appointment</h2>
      <p style={styles.bookingSubtitle}>Select a date and time that works for you</p>
      <div style={styles.bookingForm}>
        <select style={styles.bookingSelect}>
          <option>Select Service</option>
          {services.map((s, i) => <option key={i}>{s.name}</option>)}
        </select>
        <input type="date" style={styles.bookingInput} />
        <input type="time" style={styles.bookingInput} />
        <button style={styles.bookingBtn}>Book Now</button>
      </div>
    </div>
  </div>
</section>`;
  }

  // Default - generic CTA
  return `
{/* CTA Section */}
<section style={styles.bookingWidget}>
  <div style={styles.container}>
    <div style={styles.bookingContent}>
      <h2 style={styles.bookingTitle}>Get Started Today</h2>
      <p style={styles.bookingSubtitle}>We're here to help with all your needs</p>
      <div style={styles.bookingForm}>
        <Link to="/contact" style={styles.bookingBtn}>Contact Us</Link>
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Generate AboutTeamGrid section
 */
function generateAboutTeamGrid(config, colors, businessData) {
  return `
{/* Team Grid Section */}
<section style={styles.teamGrid}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>Meet Our Team</h2>
    <div style={styles.teamCards}>
      {teamMembers.map((member, idx) => (
        <div key={idx} style={styles.teamCard}>
          <img src={member.image} alt={member.name} style={styles.teamImage} />
          <h3 style={styles.teamName}>{member.name}</h3>
          <p style={styles.teamRole}>{member.role}</p>
          {member.bio && <p style={styles.teamBio}>{member.bio}</p>}
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate FaqAccordion section
 */
function generateFaqAccordion(config, colors, businessData) {
  return `
{/* FAQ Accordion Section */}
<section style={styles.faqSection}>
  <div style={styles.container}>
    <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
    <div style={styles.faqList}>
      {faqs.map((faq, idx) => (
        <div key={idx} style={styles.faqItem}>
          <button
            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            style={styles.faqQuestion}
          >
            {faq.question}
            <span style={styles.faqIcon}>{openFaq === idx ? '−' : '+'}</span>
          </button>
          {openFaq === idx && (
            <div style={styles.faqAnswer}>{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate StatsAnimated section
 */
function generateStatsAnimated(config, colors, businessData) {
  return `
{/* Animated Stats Section */}
<section style={styles.statsSection}>
  <div style={styles.container}>
    <div style={styles.statsGrid}>
      {stats.map((stat, idx) => (
        <div key={idx} style={styles.statCard}>
          <span style={styles.statNumber}>{stat.value}</span>
          <span style={styles.statLabel}>{stat.label}</span>
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate Highlights Strip - Quick action tiles after hero
 * Research: Section priority #2 - links to key destinations
 */
function generateHighlightsStrip(config, colors, businessData) {
  const primary = colors.primary || '#3B82F6';
  return `
{/* Highlights Strip - Quick Actions */}
<section style={styles.highlightsStrip}>
  <div style={styles.container}>
    <div style={styles.highlightsGrid}>
      {highlights.map((item, idx) => (
        <Link key={idx} to={item.link} style={styles.highlightTile}>
          <span style={styles.highlightIcon}>{item.icon}</span>
          <span style={styles.highlightLabel}>{item.label}</span>
          <ArrowRight size={16} style={styles.highlightArrow} />
        </Link>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate Social Proof Strip - Compact ratings/reviews near top
 * Research: Place social proof near hero/before menu preview for trust
 */
function generateSocialProofStrip(config, colors, businessData) {
  const primary = colors.primary || '#3B82F6';
  return `
{/* Social Proof Strip - Trust Builders */}
<section style={styles.socialProofStrip}>
  <div style={styles.container}>
    <div style={styles.proofContent}>
      <div style={styles.proofRating}>
        <div style={styles.proofStars}>
          {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#F59E0B" stroke="#F59E0B" />)}
        </div>
        <span style={styles.proofScore}>4.9</span>
        <span style={styles.proofCount}>Based on 500+ reviews</span>
      </div>
      <div style={styles.proofDivider} />
      <div style={styles.proofBadges}>
        {socialProof.map((item, idx) => (
          <div key={idx} style={styles.proofBadge}>
            <span style={styles.proofBadgeIcon}>{item.icon}</span>
            <span style={styles.proofBadgeText}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Generate Coffee Program Section - Sourcing/roasting story
 * Research: Coffee-specific section highlighting bean origins, roasting, sustainability
 */
function generateCoffeeProgramSection(config, colors, businessData) {
  const primary = colors.primary || '#3B82F6';
  return `
{/* Coffee Program Section */}
<section style={styles.coffeeProgramSection}>
  <div style={styles.container}>
    <div style={styles.coffeeProgramGrid}>
      <div style={styles.coffeeProgramContent}>
        <span style={styles.sectionLabel}>Our Coffee Program</span>
        <h2 style={styles.coffeeProgramTitle}>{coffeeProgram.title}</h2>
        <p style={styles.coffeeProgramDesc}>{coffeeProgram.description}</p>
        <div style={styles.coffeeProgramFeatures}>
          {coffeeProgram.features.map((feature, idx) => (
            <div key={idx} style={styles.coffeeProgramFeature}>
              <Check size={20} style={styles.coffeeProgramIcon} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <Link to="/about" style={styles.storyBtn}>Learn Our Story</Link>
      </div>
      <div style={styles.coffeeProgramImageWrap}>
        <img
          src={coffeeProgram.image}
          alt="Our coffee journey"
          style={styles.coffeeProgramImage}
        />
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Generate Seasonal Featured Section - Limited time offers
 * Research: Prominent placement for seasonal/LTO items drives trial
 */
function generateSeasonalFeatured(config, colors, businessData) {
  const primary = colors.primary || '#3B82F6';
  return `
{/* Seasonal Featured Section */}
<section style={styles.seasonalSection}>
  <div style={styles.container}>
    <div style={styles.seasonalHeader}>
      <span style={styles.seasonalBadge}>✨ Limited Time</span>
      <h2 style={styles.seasonalTitle}>Seasonal Favorites</h2>
      <p style={styles.seasonalSubtitle}>Available for a limited time only</p>
    </div>
    <div style={styles.seasonalGrid}>
      {seasonalItems.map((item, idx) => (
        <div key={idx} style={styles.seasonalCard}>
          <div style={styles.seasonalImageWrap}>
            <img src={item.image} alt={item.name} style={styles.seasonalImage} />
            <span style={styles.seasonalTag}>{item.tag || 'Seasonal'}</span>
          </div>
          <div style={styles.seasonalContent}>
            <h3 style={styles.seasonalName}>{item.name}</h3>
            <p style={styles.seasonalDesc}>{item.description}</p>
            <div style={styles.seasonalFooter}>
              <span style={styles.seasonalPrice}>{item.price}</span>
              <Link to="/order" style={styles.seasonalOrderBtn}>Order Now</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>`;
}

// ============================================
// SALON-SPA SPECIFIC SECTION GENERATORS
// ============================================

/**
 * Generate Salon/Spa Program Section - Philosophy and approach
 * Research: Process/philosophy sections build trust for high-touch services
 */
function generateSalonSpaProgram(config, colors, businessData) {
  const primary = colors.primary || '#9D8189';
  return `
{/* Salon/Spa Program - Our Approach */}
<section style={styles.salonProgramSection}>
  <div style={styles.container}>
    <div style={styles.salonProgramGrid}>
      <div style={styles.salonProgramContent}>
        <span style={styles.sectionLabel}>Our Philosophy</span>
        <h2 style={styles.salonProgramTitle}>{salonProgram.title}</h2>
        <p style={styles.salonProgramDesc}>{salonProgram.description}</p>
        <div style={styles.salonProgramPillars}>
          {salonProgram.pillars.map((pillar, idx) => (
            <div key={idx} style={styles.salonPillar}>
              <span style={styles.salonPillarIcon}>{pillar.icon}</span>
              <div>
                <h4 style={styles.salonPillarTitle}>{pillar.title}</h4>
                <p style={styles.salonPillarDesc}>{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/about" style={styles.salonProgramCta}>Learn More About Us</Link>
      </div>
      <div style={styles.salonProgramImageWrap}>
        <img
          src={salonProgram.image}
          alt="Our approach to beauty"
          style={styles.salonProgramImage}
        />
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Generate New Client Guide Section - Reduces anxiety for first-timers
 * Research: High-anxiety services benefit from "what to expect" content
 */
function generateNewClientGuide(config, colors, businessData) {
  const primary = colors.primary || '#9D8189';
  return `
{/* New Client Guide - What to Expect */}
<section style={styles.newClientSection}>
  <div style={styles.container}>
    <div style={styles.newClientHeader}>
      <span style={styles.sectionLabel}>First Visit?</span>
      <h2 style={styles.newClientTitle}>{newClientGuide.title}</h2>
      <p style={styles.newClientIntro}>{newClientGuide.introText}</p>
    </div>
    <div style={styles.newClientSteps}>
      {newClientGuide.steps.map((step, idx) => (
        <div key={idx} style={styles.newClientStep}>
          <div style={styles.stepNumber}>{idx + 1}</div>
          <div style={styles.stepContent}>
            <h4 style={styles.stepTitle}>{step.title}</h4>
            <p style={styles.stepDesc}>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
    {newClientGuide.tips && newClientGuide.tips.length > 0 && (
      <div style={styles.newClientTips}>
        <h4 style={styles.tipsTitle}>Tips for Your Visit</h4>
        <ul style={styles.tipsList}>
          {newClientGuide.tips.map((tip, idx) => (
            <li key={idx} style={styles.tipItem}>{tip}</li>
          ))}
        </ul>
      </div>
    )}
    <div style={styles.newClientCta}>
      <Link to="/book" style={styles.bookFirstVisitBtn}>Book Your First Visit</Link>
    </div>
  </div>
</section>`;
}

/**
 * Generate Membership Comparison Section - Clear plan comparison
 * Research: Transparent pricing and comparison grids convert better
 */
function generateMembershipComparison(config, colors, businessData) {
  const primary = colors.primary || '#9D8189';
  return `
{/* Membership Comparison */}
<section style={styles.membershipSection}>
  <div style={styles.container}>
    <div style={styles.membershipHeader}>
      <span style={styles.sectionLabel}>Memberships</span>
      <h2 style={styles.membershipTitle}>Choose Your Plan</h2>
      <p style={styles.membershipSubtitle}>Save more with our membership programs</p>
    </div>
    <div style={styles.membershipGrid}>
      {memberships.map((plan, idx) => (
        <div
          key={idx}
          style={{
            ...styles.membershipCard,
            ...(plan.highlighted ? styles.membershipCardHighlighted : {})
          }}
        >
          {plan.highlighted && (
            <span style={styles.membershipBadge}>Most Popular</span>
          )}
          <h3 style={styles.membershipName}>{plan.name}</h3>
          <div style={styles.membershipPrice}>
            <span style={styles.membershipAmount}>{plan.price}</span>
            <span style={styles.membershipFreq}>/{plan.frequency}</span>
          </div>
          <p style={styles.membershipDesc}>{plan.description}</p>
          <ul style={styles.membershipFeatures}>
            {plan.benefits.map((benefit, i) => (
              <li key={i} style={styles.membershipFeature}>
                <Check size={16} style={{ color: '${primary}', flexShrink: 0 }} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/book"
            style={plan.highlighted ? styles.membershipCtaPrimary : styles.membershipCtaSecondary}
          >
            {plan.ctaLabel || 'Get Started'}
          </Link>
        </div>
      ))}
    </div>
  </div>
</section>`;
}

/**
 * Generate Transformation Stories Section - Before/after with testimonials
 * Research: Social proof + visual outcomes boost conversions for transformation services
 */
function generateTransformationStories(config, colors, businessData) {
  const primary = colors.primary || '#9D8189';
  return `
{/* Transformation Stories */}
<section style={styles.transformationSection}>
  <div style={styles.container}>
    <div style={styles.transformationHeader}>
      <span style={styles.sectionLabel}>Real Results</span>
      <h2 style={styles.transformationTitle}>Transformation Stories</h2>
      <p style={styles.transformationSubtitle}>See what's possible with our expert team</p>
    </div>
    <div style={styles.transformationGrid}>
      {transformations.map((story, idx) => (
        <div key={idx} style={styles.transformationCard}>
          <div style={styles.transformationImages}>
            <div style={styles.transformationBefore}>
              <img src={story.beforeImage} alt="Before" style={styles.transformationImg} />
              <span style={styles.transformationLabel}>Before</span>
            </div>
            <div style={styles.transformationAfter}>
              <img src={story.afterImage} alt="After" style={styles.transformationImg} />
              <span style={styles.transformationLabel}>After</span>
            </div>
          </div>
          <div style={styles.transformationContent}>
            <span style={styles.transformationService}>{story.serviceTag}</span>
            <p style={styles.transformationQuote}>"{story.quote}"</p>
            <span style={styles.transformationName}>— {story.name}</span>
          </div>
        </div>
      ))}
    </div>
    <div style={styles.transformationCta}>
      <Link to="/gallery" style={styles.viewMoreBtn}>View More Transformations</Link>
    </div>
  </div>
</section>`;
}

// ============================================
// FITNESS/GYM SPECIFIC SECTIONS
// ============================================

/**
 * Generate Fitness Program Section - Training methodology/philosophy
 * Research: Gyms with clear methodology differentiate from commodity facilities
 */
function generateFitnessProgram(config, colors, businessData) {
  const primary = colors.primary || '#00B4D8';
  return `
{/* Fitness Program - Our Training Approach */}
<section style={styles.fitnessProgramSection}>
  <div style={styles.container}>
    <div style={styles.fitnessProgramGrid}>
      <div style={styles.fitnessProgramContent}>
        <span style={styles.sectionLabel}>Our Methodology</span>
        <h2 style={styles.fitnessProgramTitle}>{fitnessProgram.title}</h2>
        <p style={styles.fitnessProgramDesc}>{fitnessProgram.description}</p>
        <div style={styles.fitnessProgramPillars}>
          {fitnessProgram.pillars.map((pillar, idx) => (
            <div key={idx} style={styles.fitnessPillar}>
              <span style={styles.fitnessPillarIcon}>{pillar.icon}</span>
              <div>
                <h4 style={styles.fitnessPillarTitle}>{pillar.title}</h4>
                <p style={styles.fitnessPillarDesc}>{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/programs" style={styles.fitnessProgramCta}>Explore Our Programs</Link>
      </div>
      <div style={styles.fitnessProgramImageWrap}>
        <img
          src={fitnessProgram.image}
          alt="Our training approach"
          style={styles.fitnessProgramImage}
        />
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Generate Class Schedule Preview - Upcoming classes teaser
 * Research: Class-based gyms convert better when schedule is visible on homepage
 */
function generateClassSchedulePreview(config, colors, businessData) {
  const primary = colors.primary || '#00B4D8';
  return `
{/* Class Schedule Preview */}
<section style={styles.classScheduleSection}>
  <div style={styles.container}>
    <div style={styles.classScheduleHeader}>
      <span style={styles.sectionLabel}>Today's Classes</span>
      <h2 style={styles.classScheduleTitle}>Join a Class</h2>
      <p style={styles.classScheduleSubtitle}>Find the perfect workout for your schedule</p>
    </div>
    <div style={styles.classScheduleGrid}>
      {classSchedule.map((classItem, idx) => (
        <div key={idx} style={styles.classCard}>
          <div style={styles.classTime}>
            <span style={styles.classTimeText}>{classItem.time}</span>
            <span style={styles.classDuration}>{classItem.duration}</span>
          </div>
          <div style={styles.classInfo}>
            <h4 style={styles.className}>{classItem.name}</h4>
            <p style={styles.classTrainer}>with {classItem.trainer}</p>
            <div style={styles.classDetails}>
              <span style={styles.classIntensity}>{classItem.intensity}</span>
              <span style={styles.classSpots}>{classItem.spots} spots left</span>
            </div>
          </div>
          <Link to="/book-class" style={styles.classBookBtn}>Book</Link>
        </div>
      ))}
    </div>
    <div style={styles.classScheduleCta}>
      <Link to="/schedule" style={styles.viewScheduleBtn}>View Full Schedule</Link>
    </div>
  </div>
</section>`;
}

/**
 * Generate Free Trial CTA Section - Prominent trial signup
 * Research: Fitness industry converts best with low-barrier trial offers
 */
function generateFreeTrialCta(config, colors, businessData) {
  const primary = colors.primary || '#00B4D8';
  return `
{/* Free Trial CTA */}
<section style={styles.freeTrialSection}>
  <div style={styles.container}>
    <div style={styles.freeTrialCard}>
      <div style={styles.freeTrialContent}>
        <span style={styles.freeTrialBadge}>{freeTrial.badge}</span>
        <h2 style={styles.freeTrialTitle}>{freeTrial.title}</h2>
        <p style={styles.freeTrialDesc}>{freeTrial.description}</p>
        <ul style={styles.freeTrialFeatures}>
          {freeTrial.includes.map((item, idx) => (
            <li key={idx} style={styles.freeTrialFeature}>
              <Check size={18} style={{ color: '${primary}', flexShrink: 0 }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link to="/free-trial" style={styles.freeTrialBtn}>{freeTrial.cta}</Link>
        <p style={styles.freeTrialNote}>{freeTrial.note}</p>
      </div>
      <div style={styles.freeTrialImageWrap}>
        <img
          src={freeTrial.image}
          alt="Start your fitness journey"
          style={styles.freeTrialImage}
        />
      </div>
    </div>
  </div>
</section>`;
}

/**
 * Generate Trainer Spotlight Section - Featured trainer profiles
 * Research: Personal connection with trainers increases membership retention
 */
function generateTrainerSpotlight(config, colors, businessData) {
  const primary = colors.primary || '#00B4D8';
  return `
{/* Trainer Spotlight */}
<section style={styles.trainerSpotlightSection}>
  <div style={styles.container}>
    <div style={styles.trainerSpotlightHeader}>
      <span style={styles.sectionLabel}>Meet Our Team</span>
      <h2 style={styles.trainerSpotlightTitle}>Expert Trainers</h2>
      <p style={styles.trainerSpotlightSubtitle}>Certified professionals dedicated to your success</p>
    </div>
    <div style={styles.trainerSpotlightGrid}>
      {trainers.slice(0, 4).map((trainer, idx) => (
        <div key={idx} style={styles.trainerCard}>
          <div style={styles.trainerImageWrap}>
            <img src={trainer.image} alt={trainer.name} style={styles.trainerImage} />
          </div>
          <div style={styles.trainerInfo}>
            <h4 style={styles.trainerName}>{trainer.name}</h4>
            <span style={styles.trainerRole}>{trainer.role}</span>
            <p style={styles.trainerBio}>{trainer.bio}</p>
            {trainer.certifications && (
              <div style={styles.trainerCerts}>
                {trainer.certifications.map((cert, i) => (
                  <span key={i} style={styles.trainerCert}>{cert}</span>
                ))}
              </div>
            )}
            <Link to={\`/trainers/\${trainer.id || idx}\`} style={styles.trainerBookBtn}>Book Session</Link>
          </div>
        </div>
      ))}
    </div>
    <div style={styles.trainerSpotlightCta}>
      <Link to="/trainers" style={styles.viewTrainersBtn}>Meet All Trainers</Link>
    </div>
  </div>
</section>`;
}

// Section generator map
const SECTION_GENERATORS = {
  'menu-scroll-reveal': generateMenuScrollReveal,
  'menu-visual-cards': generateMenuVisualCards,
  'menu-best-practices': generateMenuBestPractices, // Research-backed menu
  'menu-preview-cards': generateMenuPreviewCards, // Homepage preview
  'menu-integrated-ordering': generateMenuBestPractices, // Upgraded to best practices
  'menu-tabs': generateMenuBestPractices, // Upgraded to best practices
  'menu-categories': generateMenuBestPractices, // Upgraded to best practices
  'origin-timeline': generateOriginTimeline,
  'origin-story': generateOriginTimeline, // Alias
  'about-chef': generateAboutTeamGrid, // Similar
  'about-team-grid': generateAboutTeamGrid,
  'about-values': generateAboutTeamGrid, // Similar
  'philosophy-section': generateAboutTeamGrid, // Similar
  'gallery-hover-zoom': generateGalleryHoverZoom,
  'gallery-masonry': generateGalleryHoverZoom, // Similar
  'gallery-carousel': generateGalleryHoverZoom, // Similar
  'before-after-slider': generateGalleryHoverZoom, // Similar
  'instagram-feed': generateInstagramFeed,
  'video-showcase': generateInstagramFeed, // Similar
  'locations-map': generateLocationsShowcase,
  'locations-showcase': generateLocationsShowcase,
  'multi-location-cards': generateLocationsShowcase, // Alias
  'contact-split': generateLocationsShowcase, // Similar
  'contact-minimal': generateLocationsShowcase, // Similar
  'reviews-carousel': generateReviewsCarousel,
  'reviews-grid': generateReviewsCarousel, // Similar
  'testimonials-featured': generateReviewsCarousel, // Similar
  'press-mentions': generateReviewsCarousel, // Similar
  'awards-badges': generateReviewsCarousel, // Similar
  'trust-strip': generateReviewsCarousel, // Similar
  'cta-order-online': generateBookingWidget, // Similar
  'cta-book-appointment': generateBookingWidget, // Similar
  'cta-contact-form': generateBookingWidget, // Similar
  'cta-newsletter': generateBookingWidget, // Similar
  'merchandise-shop': generateMerchandiseShop,
  'gift-cards-prominent': generateGiftCardsProminent,
  'product-grid': generateMerchandiseShop, // Similar
  'services-grid': generateServicesGrid,
  'services-list-pricing': generateServicesGrid, // Similar
  'services-bento': generateServicesGrid, // Similar
  'services-tabs': generateServicesGrid, // Similar
  'booking-widget': generateBookingWidget,
  'class-schedule': generateBookingWidget, // Similar
  'appointment-calendar': generateBookingWidget, // Similar
  'wine-pairing': generateServicesGrid, // Similar
  'private-events': generateServicesGrid, // Similar
  'catering-info': generateServicesGrid, // Similar
  'membership-teaser': generateGiftCardsProminent, // Similar
  'pricing-tiers': generateServicesGrid, // Similar
  'faq-accordion': generateFaqAccordion,
  'stats-animated': generateStatsAnimated,
  'stats-bar': generateStatsAnimated, // Alias for stats-bar
  'features-grid': generateServicesGrid, // Similar
  // Research-backed homepage sections
  'highlights-strip': generateHighlightsStrip,
  'social-proof-strip': generateSocialProofStrip,
  'coffee-program': generateCoffeeProgramSection,
  'seasonal-featured': generateSeasonalFeatured,
  // Salon-Spa specific sections
  'salon-spa-program': generateSalonSpaProgram,
  'new-client-guide': generateNewClientGuide,
  'membership-comparison': generateMembershipComparison,
  'transformation-stories': generateTransformationStories,

  // Fitness/Gym Specific Sections
  'fitness-program': generateFitnessProgram,
  'class-schedule-preview': generateClassSchedulePreview,
  'free-trial-cta': generateFreeTrialCta,
  'trainer-spotlight': generateTrainerSpotlight
};

// ============================================
// STYLE GENERATORS
// ============================================

/**
 * Generate comprehensive styles for the structural page
 */
function generateStructuralStyles(config, moodSliders = {}) {
  const { colorGuidance = {}, variant = {} } = config;
  const mood = variant.mood || 'default';

  // Default colors - can be overridden by mood sliders
  const primary = moodSliders.primaryColor || colorGuidance.warm?.[0] || colorGuidance.dark?.[0] || '#3B82F6';
  const background = moodSliders.isDark ? '#0f172a' : '#ffffff';
  const text = moodSliders.isDark ? '#f8fafc' : '#1f2937';
  const textMuted = moodSliders.isDark ? '#94a3b8' : '#6b7280';
  const cardBg = moodSliders.isDark ? '#1e293b' : '#ffffff';
  const borderRadius = moodSliders.borderRadius || '12px';
  const fontHeading = moodSliders.fontHeading || "'Inter', system-ui, sans-serif";
  const fontBody = moodSliders.fontBody || "system-ui, sans-serif";

  return `
const styles = {
  // Video Hero Styles
  videoHero: { position: 'relative', height: '100vh', overflow: 'hidden' },
  videoContainer: { position: 'absolute', inset: 0 },
  heroVideo: { width: '100%', height: '100%', objectFit: 'cover' },
  videoOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8))' },
  heroContent: { position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' },
  heroTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  heroTagline: { fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' },
  heroCtas: { display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' },
  primaryBtn: { background: '${primary}', color: '#fff', padding: '16px 32px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', fontSize: '1.1rem' },
  secondaryBtn: { background: 'transparent', color: '#fff', padding: '16px 32px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.5)' },

  // Story Split Hero Styles
  storySplitHero: { minHeight: '80vh', background: '${background}' },
  storySplitContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', minHeight: '80vh' },
  storyImageSide: { position: 'relative', overflow: 'hidden' },
  storyImage: { width: '100%', height: '100%', objectFit: 'cover' },
  storyContentSide: { display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', background: '${background}' },
  storyLabel: { color: '${primary}', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' },
  storyTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', color: '${text}', marginBottom: '24px' },
  storyText: { fontSize: '1.1rem', color: '${textMuted}', lineHeight: 1.8, marginBottom: '16px' },
  storyTagline: { fontSize: '1.25rem', color: '${text}', fontStyle: 'italic', marginBottom: '32px' },
  storyBtn: { alignSelf: 'flex-start', background: '${primary}', color: '#fff', padding: '14px 28px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none' },

  // Gallery Hero Styles
  galleryHero: { position: 'relative', height: '100vh', overflow: 'hidden' },
  gallerySlideshow: { position: 'absolute', inset: 0 },
  gallerySlide: { position: 'absolute', inset: 0, transition: 'opacity 1s ease' },
  galleryImage: { width: '100%', height: '100%', objectFit: 'cover' },
  galleryOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' },
  galleryContent: { position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  galleryTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  galleryTagline: { fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' },
  galleryIndicators: { display: 'flex', gap: '12px' },
  galleryDot: { width: '12px', height: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.3s' },

  // Minimal Hero Styles
  minimalHero: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '${background}', padding: '80px 20px' },
  minimalContainer: { textAlign: 'center', maxWidth: '800px' },
  minimalTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '300', color: '${text}', letterSpacing: '-0.02em', marginBottom: '24px' },
  minimalDivider: { width: '60px', height: '2px', background: '${primary}', margin: '0 auto 24px' },
  minimalTagline: { fontSize: '1.25rem', color: '${textMuted}', marginBottom: '32px' },
  minimalBtn: { background: '${primary}', color: '#fff', padding: '14px 32px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none' },

  // Dark Luxury Hero Styles
  darkLuxuryHero: { position: 'relative', minHeight: '100vh', background: '#0a0a0a' },
  darkLuxuryBg: { position: 'absolute', inset: 0 },
  darkLuxuryImage: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 },
  darkLuxuryOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))' },
  darkLuxuryContent: { position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' },
  luxuryAccent: { width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, #D4A574, transparent)', margin: '20px 0' },
  darkLuxuryTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '300', color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' },
  darkLuxuryTagline: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase' },
  luxuryBtn: { marginTop: '40px', background: 'transparent', color: '#D4A574', padding: '14px 40px', border: '1px solid #D4A574', fontWeight: '500', letterSpacing: '0.1em', textDecoration: 'none' },

  // Split Animated Hero Styles
  splitAnimatedHero: { display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' },
  splitLeft: { background: '${primary}', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
  splitContent: { maxWidth: '500px' },
  splitTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', color: '#fff', marginBottom: '20px' },
  splitTagline: { fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' },
  splitBtn: { background: '#fff', color: '${primary}', padding: '14px 28px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none' },
  splitRight: { position: 'relative', overflow: 'hidden' },
  splitImage: { width: '100%', height: '100%', objectFit: 'cover' },

  // Image Overlay Hero Styles
  imageOverlayHero: { position: 'relative', minHeight: '80vh' },
  overlayImage: { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 },
  overlayGradient: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))' },
  overlayContent: { position: 'relative', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', maxWidth: '600px' },
  overlayTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  overlayTagline: { fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' },
  overlayBtn: { alignSelf: 'flex-start', background: '${primary}', color: '#fff', padding: '14px 28px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none' },

  // Centered CTA Hero Styles
  centeredCtaHero: { position: 'relative', minHeight: '80vh' },
  centeredBg: { position: 'absolute', inset: 0 },
  centeredBgImage: { width: '100%', height: '100%', objectFit: 'cover' },
  centeredOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' },
  centeredContent: { position: 'relative', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' },
  centeredTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  centeredTagline: { fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', maxWidth: '600px' },
  centeredCtas: { display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' },
  centeredPrimaryBtn: { background: '${primary}', color: '#fff', padding: '16px 32px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none' },
  centeredSecondaryBtn: { background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '16px 32px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', backdropFilter: 'blur(4px)' },

  // Section Styles
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  sectionTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: '${text}', marginBottom: '32px', textAlign: 'center' },

  // Menu Scroll Reveal
  menuScrollReveal: { padding: '80px 0', background: '${background}' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' },
  menuCategory: { transition: 'all 0.6s ease' },
  categoryTitle: { fontFamily: "${fontHeading}", fontSize: '1.5rem', fontWeight: '600', color: '${text}', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid ${primary}' },
  categoryItems: { display: 'flex', flexDirection: 'column', gap: '12px' },
  menuItem: { display: 'flex', alignItems: 'baseline', gap: '8px' },
  itemName: { fontWeight: '500', color: '${text}' },
  itemDots: { flex: 1, borderBottom: '1px dotted ${textMuted}', margin: '0 8px 4px' },
  itemPrice: { fontWeight: '600', color: '${primary}' },

  // Menu Visual Cards
  menuVisualCards: { padding: '80px 0', background: '${cardBg}' },
  visualCardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
  visualCard: { background: '${background}', borderRadius: '${borderRadius}', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  visualCardImage: { position: 'relative', height: '200px' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardBadge: { position: 'absolute', top: '12px', right: '12px', background: '${primary}', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  visualCardContent: { padding: '20px' },
  cardTitle: { fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', marginBottom: '8px' },
  cardDesc: { fontSize: '14px', color: '${textMuted}', marginBottom: '12px' },
  cardPrice: { fontWeight: '700', color: '${primary}', fontSize: '1.1rem' },
  viewAllBtn: { display: 'block', textAlign: 'center', marginTop: '32px', color: '${primary}', fontWeight: '600', textDecoration: 'none' },

  // Origin Timeline
  originTimeline: { padding: '80px 0', background: '${background}' },
  timeline: { position: 'relative', maxWidth: '800px', margin: '0 auto' },
  timelineItem: { display: 'grid', gridTemplateColumns: '100px 2px 1fr', gap: '20px', marginBottom: '40px' },
  timelineYear: { fontFamily: "${fontHeading}", fontWeight: '700', color: '${primary}', fontSize: '1.25rem', textAlign: 'right' },
  timelineLine: { background: '${primary}', opacity: 0.3 },
  timelineContent: {},
  timelineTitle: { fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', marginBottom: '8px' },
  timelineText: { color: '${textMuted}', lineHeight: 1.6 },

  // Gallery Hover Zoom
  galleryHoverZoom: { padding: '80px 0', background: '${cardBg}' },
  galleryGrid: { display: 'grid', gap: '16px' },
  galleryItem: { position: 'relative', overflow: 'hidden', borderRadius: '${borderRadius}', aspectRatio: '1' },
  galleryImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' },
  galleryOverlayHover: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  galleryCaption: { color: '#fff', fontWeight: '600' },

  // Locations Showcase
  locationsShowcase: { padding: '80px 0', background: '${background}' },
  locationsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  locationCard: { background: '${cardBg}', borderRadius: '${borderRadius}', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  locationImage: { width: '100%', height: '200px', objectFit: 'cover' },
  locationInfo: { padding: '20px' },
  locationName: { fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', marginBottom: '8px' },
  locationAddress: { fontSize: '14px', color: '${textMuted}', marginBottom: '4px' },
  locationHours: { fontSize: '14px', color: '${textMuted}', marginBottom: '12px' },
  directionsLink: { color: '${primary}', fontWeight: '600', textDecoration: 'none' },

  // Merchandise Shop
  merchandiseShop: { padding: '80px 0', background: '${cardBg}' },
  shopHeader: { textAlign: 'center', marginBottom: '40px' },
  shopSubtitle: { color: '${textMuted}', fontSize: '1.1rem' },
  shopGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' },
  merchCard: { background: '${background}', borderRadius: '${borderRadius}', padding: '20px', textAlign: 'center' },
  merchImage: { width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' },
  merchName: { fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', marginBottom: '8px' },
  merchPrice: { color: '${primary}', fontWeight: '700', marginBottom: '16px' },
  addToCartBtn: { background: '${primary}', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '${borderRadius}', fontWeight: '600', cursor: 'pointer', width: '100%' },

  // Instagram Feed
  instagramFeed: { padding: '80px 0', background: '${background}' },
  instaHeader: { textAlign: 'center', marginBottom: '32px' },
  instaGrid: { display: 'grid', gap: '8px' },
  instaPost: { position: 'relative', display: 'block', aspectRatio: '1' },
  instaImage: { width: '100%', height: '100%', objectFit: 'cover' },
  instaOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  instaLikes: { color: '#fff', fontWeight: '600' },

  // Gift Cards
  giftCardsSection: { padding: '80px 0', background: '${primary}' },
  giftCardContent: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' },
  giftCardText: { color: '#fff' },
  giftCardTitle: { fontFamily: "${fontHeading}", fontSize: '2rem', fontWeight: '700', marginBottom: '16px' },
  giftCardDesc: { fontSize: '1.1rem', opacity: 0.9, marginBottom: '24px' },
  giftCardBtn: { display: 'inline-block', background: '#fff', color: '${primary}', padding: '14px 28px', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none' },
  giftCardVisual: { display: 'flex', justifyContent: 'center' },
  giftCardPreview: { background: '#fff', borderRadius: '${borderRadius}', padding: '40px 60px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', textAlign: 'center' },
  giftCardLogo: { display: 'block', fontFamily: "${fontHeading}", fontWeight: '700', fontSize: '1.5rem', color: '${primary}', marginBottom: '12px' },
  giftCardAmount: { fontSize: '2.5rem', fontWeight: '700', color: '${text}' },

  // Reviews Carousel
  reviewsCarousel: { padding: '80px 0', background: '${cardBg}' },
  carouselContainer: { display: 'flex', alignItems: 'center', gap: '24px', maxWidth: '800px', margin: '0 auto' },
  carouselBtn: { background: 'transparent', border: '1px solid ${textMuted}', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '${textMuted}' },
  reviewSlide: { flex: 1, textAlign: 'center', padding: '20px' },
  reviewStars: { color: '#F59E0B', fontSize: '1.5rem', marginBottom: '16px' },
  reviewText: { fontSize: '1.25rem', color: '${text}', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.6 },
  reviewAuthor: { color: '${textMuted}', fontWeight: '600' },

  // Services Grid
  servicesGrid: { padding: '80px 0', background: '${background}' },
  servicesCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' },
  serviceCard: { background: '${cardBg}', borderRadius: '${borderRadius}', padding: '32px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  serviceIcon: { fontSize: '2.5rem', marginBottom: '16px' },
  serviceTitle: { fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', marginBottom: '12px' },
  serviceDesc: { color: '${textMuted}', fontSize: '14px', marginBottom: '16px' },
  servicePrice: { fontWeight: '700', color: '${primary}', fontSize: '1.25rem' },

  // Booking Widget
  bookingWidget: { padding: '80px 0', background: '${primary}' },
  bookingContent: { textAlign: 'center', color: '#fff' },
  bookingTitle: { fontFamily: "${fontHeading}", fontSize: '2rem', fontWeight: '700', marginBottom: '8px' },
  bookingSubtitle: { opacity: 0.9, marginBottom: '32px' },
  bookingForm: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '600px', margin: '0 auto' },
  bookingSelect: { padding: '14px 20px', borderRadius: '${borderRadius}', border: 'none', fontSize: '1rem', minWidth: '180px' },
  bookingInput: { padding: '14px 20px', borderRadius: '${borderRadius}', border: 'none', fontSize: '1rem' },
  bookingBtn: { background: '#fff', color: '${primary}', padding: '14px 28px', borderRadius: '${borderRadius}', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' },

  // Team Grid
  teamGrid: { padding: '80px 0', background: '${cardBg}' },
  teamCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
  teamCard: { textAlign: 'center', background: '${background}', borderRadius: '${borderRadius}', padding: '24px' },
  teamImage: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' },
  teamName: { fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', marginBottom: '4px' },
  teamRole: { color: '${primary}', fontSize: '14px', fontWeight: '500', marginBottom: '12px' },
  teamBio: { color: '${textMuted}', fontSize: '14px' },

  // FAQ Accordion
  faqSection: { padding: '80px 0', background: '${background}' },
  faqList: { maxWidth: '800px', margin: '0 auto' },
  faqItem: { borderBottom: '1px solid ${textMuted}20', marginBottom: '8px' },
  faqQuestion: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', fontSize: '1.1rem', textAlign: 'left' },
  faqIcon: { fontSize: '1.5rem', color: '${primary}' },
  faqAnswer: { padding: '0 0 20px', color: '${textMuted}', lineHeight: 1.6 },

  // Stats Section
  statsSection: { padding: '60px 0', background: '${primary}' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '32px', textAlign: 'center' },
  statCard: { color: '#fff' },
  statNumber: { display: 'block', fontFamily: "${fontHeading}", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '700', marginBottom: '8px' },
  statLabel: { fontSize: '14px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' },

  // Menu Best Practices Styles (Research-backed)
  menuBestPractices: { background: '${background}', minHeight: '100vh' },
  menuCategoryNav: { position: 'sticky', top: '72px', background: '${background}', borderBottom: '1px solid #e5e7eb', zIndex: 40, padding: '12px 0' },
  menuCategoryTabs: { display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' },
  menuCategoryTab: { padding: '10px 20px', border: '2px solid #e5e7eb', borderRadius: '24px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', minHeight: '44px', flexShrink: 0, transition: 'all 0.2s' },
  menuFilters: { background: '#f9fafb', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' },
  menuFilterButtons: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  menuFilterBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', minHeight: '36px', transition: 'all 0.2s' },
  menuContent: { maxWidth: '900px', margin: '0 auto', padding: '24px 16px 60px' },
  menuCategorySection: { marginBottom: '48px' },
  menuCategoryHeader: { marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid ${primary}' },
  menuCategoryTitle: { fontFamily: "${fontHeading}", fontSize: '1.5rem', fontWeight: '700', color: '${text}', marginBottom: '4px' },
  menuCategoryDesc: { fontSize: '0.9rem', color: '${textMuted}', fontStyle: 'italic' },
  menuItemsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  menuHeroItem: { display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', padding: '16px', background: '${cardBg}', border: '1px solid #e5e7eb', borderRadius: '${borderRadius}' },
  menuItemImageWrap: { position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden' },
  menuItemImage: { width: '100%', height: '100%', objectFit: 'cover' },
  menuBadgePopular: { position: 'absolute', top: '8px', left: '8px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: '#FEF3C7', color: '#D97706' },
  menuBadgeNew: { position: 'absolute', top: '8px', left: '8px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: '#EDE9FE', color: '#7C3AED' },
  menuBadgeChef: { position: 'absolute', top: '8px', left: '8px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: '#D1FAE5', color: '#059669' },
  menuItemDetails: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  menuItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' },
  menuItemName: { fontSize: '1rem', fontWeight: '600', color: '${text}', display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' },
  menuItemPrice: { fontSize: '1.1rem', fontWeight: '700', color: '${primary}', whiteSpace: 'nowrap' },
  menuDietaryIcon: { display: 'inline-flex', marginLeft: '2px', fontSize: '14px' },
  menuBadgeInline: { display: 'inline-flex', marginLeft: '4px', fontSize: '12px' },
  menuItemDesc: { fontSize: '0.875rem', color: '${textMuted}', lineHeight: 1.5, margin: 0 },
  menuAddBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '${primary}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', alignSelf: 'flex-start', minHeight: '44px' },
  menuTextItem: { padding: '16px', background: '#f9fafb', borderRadius: '${borderRadius}' },
  menuAllergenLegend: { background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '40px 16px', maxWidth: '900px', margin: '0 auto' },
  menuLegendTitle: { fontSize: '1rem', fontWeight: '600', color: '${text}', marginBottom: '16px' },
  menuLegendGrid: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' },
  menuLegendItem: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '${textMuted}' },
  menuLegendNote: { fontSize: '0.875rem', color: '${textMuted}', lineHeight: 1.6, margin: 0 },

  // Menu Preview Cards (Homepage)
  menuPreviewSection: { padding: '80px 0', background: '${cardBg}' },
  menuPreviewHeader: { textAlign: 'center', marginBottom: '40px' },
  menuPreviewSubtitle: { fontSize: '1.1rem', color: '${textMuted}' },
  menuPreviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
  menuPreviewCard: { background: '${background}', borderRadius: '${borderRadius}', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  menuPreviewImageWrap: { position: 'relative', height: '200px' },
  menuPreviewImage: { width: '100%', height: '100%', objectFit: 'cover' },
  menuPreviewBadge: { position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#FEF3C7', color: '#D97706' },
  menuPreviewContent: { padding: '20px' },
  menuPreviewTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  menuPreviewName: { fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', marginBottom: '0' },
  menuPreviewPrice: { fontWeight: '700', color: '${primary}', fontSize: '1.1rem' },
  menuPreviewDesc: { fontSize: '14px', color: '${textMuted}', lineHeight: 1.5, margin: 0 },
  menuPreviewCta: { display: 'block', textAlign: 'center', marginTop: '32px', color: '${primary}', fontWeight: '600', textDecoration: 'none', fontSize: '1rem' },

  // Highlights Strip (Research: Quick-action tiles near hero)
  highlightsStrip: { padding: '20px 0', background: '${cardBg}', borderBottom: '1px solid ${textMuted}15' },
  highlightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' },
  highlightTile: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '${background}', borderRadius: '${borderRadius}', textDecoration: 'none', color: '${text}', border: '1px solid ${textMuted}15', transition: 'all 0.2s' },
  highlightIcon: { fontSize: '1.5rem' },
  highlightLabel: { flex: 1, fontWeight: '600', fontSize: '14px' },
  highlightArrow: { color: '${textMuted}', transition: 'transform 0.2s' },

  // Social Proof Strip (Research: Trust signals above fold)
  socialProofStrip: { padding: '16px 0', background: '#fef3c7', borderBottom: '1px solid #fcd34d' },
  proofContent: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' },
  proofRating: { display: 'flex', alignItems: 'center', gap: '8px' },
  proofStars: { display: 'flex', gap: '2px' },
  proofScore: { fontWeight: '700', fontSize: '1.1rem', color: '#92400e' },
  proofCount: { fontSize: '14px', color: '#78350f' },
  proofDivider: { width: '1px', height: '24px', background: '#d97706' },
  proofBadges: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  proofBadge: { display: 'flex', alignItems: 'center', gap: '6px' },
  proofBadgeIcon: { fontSize: '1rem' },
  proofBadgeText: { fontWeight: '600', fontSize: '13px', color: '#78350f' },

  // Coffee Program Section (Research: Origin story + sustainability)
  coffeeProgramSection: { padding: '80px 0', background: '${cardBg}' },
  coffeeProgramGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' },
  coffeeProgramContent: {},
  coffeeProgramTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: '${text}', marginBottom: '16px' },
  coffeeProgramDesc: { fontSize: '1.1rem', color: '${textMuted}', lineHeight: 1.7, marginBottom: '24px' },
  coffeeProgramFeatures: { display: 'flex', flexDirection: 'column', gap: '12px' },
  coffeeProgramFeature: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '${text}' },
  coffeeProgramIcon: { color: '${primary}', flexShrink: 0 },
  coffeeProgramImageWrap: { position: 'relative', borderRadius: '${borderRadius}', overflow: 'hidden' },
  coffeeProgramImage: { width: '100%', height: '400px', objectFit: 'cover' },

  // Seasonal Featured Section (Research: Limited-time urgency)
  seasonalSection: { padding: '80px 0', background: 'linear-gradient(to bottom, ${primary}10, ${background})' },
  seasonalHeader: { textAlign: 'center', marginBottom: '48px' },
  seasonalBadge: { display: 'inline-block', padding: '6px 16px', background: '${primary}', color: '#fff', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' },
  seasonalTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: '${text}', marginBottom: '8px' },
  seasonalSubtitle: { fontSize: '1rem', color: '${textMuted}' },
  seasonalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  seasonalCard: { background: '${cardBg}', borderRadius: '${borderRadius}', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  seasonalImageWrap: { position: 'relative', height: '200px' },
  seasonalImage: { width: '100%', height: '100%', objectFit: 'cover' },
  seasonalTag: { position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', background: '#DC2626', color: '#fff', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  seasonalContent: { padding: '20px' },
  seasonalName: { fontFamily: "${fontHeading}", fontWeight: '600', color: '${text}', marginBottom: '8px', fontSize: '1.1rem' },
  seasonalDesc: { fontSize: '14px', color: '${textMuted}', lineHeight: 1.5, marginBottom: '16px' },
  seasonalFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  seasonalPrice: { fontWeight: '700', color: '${text}', fontSize: '1.1rem' },
  seasonalOrderBtn: { padding: '10px 20px', background: '${primary}', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },

  // ============================================
  // SALON-SPA SPECIFIC STYLES
  // ============================================

  // Salon/Spa Program Section
  salonProgramSection: { padding: '80px 0', background: '${cardBg}' },
  salonProgramGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' },
  salonProgramContent: {},
  salonProgramTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '600', color: '${text}', marginBottom: '16px' },
  salonProgramDesc: { fontSize: '1.1rem', color: '${textMuted}', lineHeight: 1.7, marginBottom: '32px' },
  salonProgramPillars: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' },
  salonPillar: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  salonPillarIcon: { fontSize: '1.5rem', flexShrink: 0 },
  salonPillarTitle: { fontWeight: '600', color: '${text}', marginBottom: '4px', fontSize: '1rem' },
  salonPillarDesc: { fontSize: '0.9rem', color: '${textMuted}', margin: 0, lineHeight: 1.5 },
  salonProgramCta: { display: 'inline-block', padding: '14px 28px', background: '${primary}', color: '#fff', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none' },
  salonProgramImageWrap: { position: 'relative', borderRadius: '${borderRadius}', overflow: 'hidden' },
  salonProgramImage: { width: '100%', height: '400px', objectFit: 'cover' },

  // New Client Guide Section
  newClientSection: { padding: '80px 0', background: '${background}' },
  newClientHeader: { textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px' },
  newClientTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '600', color: '${text}', marginBottom: '16px' },
  newClientIntro: { fontSize: '1.1rem', color: '${textMuted}', lineHeight: 1.6 },
  newClientSteps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto 40px' },
  newClientStep: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  stepNumber: { width: '40px', height: '40px', borderRadius: '50%', background: '${primary}', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 },
  stepContent: {},
  stepTitle: { fontWeight: '600', color: '${text}', marginBottom: '8px', fontSize: '1rem' },
  stepDesc: { fontSize: '0.9rem', color: '${textMuted}', margin: 0, lineHeight: 1.5 },
  newClientTips: { background: '${cardBg}', padding: '24px', borderRadius: '${borderRadius}', maxWidth: '600px', margin: '0 auto 32px', border: '1px solid ${textMuted}15' },
  tipsTitle: { fontWeight: '600', color: '${text}', marginBottom: '12px', fontSize: '1rem' },
  tipsList: { margin: 0, paddingLeft: '20px' },
  tipItem: { fontSize: '0.9rem', color: '${textMuted}', marginBottom: '8px', lineHeight: 1.5 },
  newClientCta: { textAlign: 'center' },
  bookFirstVisitBtn: { display: 'inline-block', padding: '16px 32px', background: '${primary}', color: '#fff', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', fontSize: '1rem' },

  // Membership Comparison Section
  membershipSection: { padding: '80px 0', background: 'linear-gradient(to bottom, ${primary}08, ${background})' },
  membershipHeader: { textAlign: 'center', marginBottom: '48px' },
  membershipTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '600', color: '${text}', marginBottom: '12px' },
  membershipSubtitle: { fontSize: '1.1rem', color: '${textMuted}' },
  membershipGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
  membershipCard: { background: '${cardBg}', borderRadius: '${borderRadius}', padding: '32px', textAlign: 'center', border: '2px solid ${textMuted}15', position: 'relative' },
  membershipCardHighlighted: { border: '2px solid ${primary}', transform: 'scale(1.02)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' },
  membershipBadge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '6px 16px', background: '${primary}', color: '#fff', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  membershipName: { fontFamily: "${fontHeading}", fontSize: '1.5rem', fontWeight: '600', color: '${text}', marginBottom: '16px' },
  membershipPrice: { marginBottom: '8px' },
  membershipAmount: { fontSize: '2.5rem', fontWeight: '700', color: '${primary}' },
  membershipFreq: { fontSize: '1rem', color: '${textMuted}' },
  membershipDesc: { fontSize: '0.9rem', color: '${textMuted}', marginBottom: '24px' },
  membershipFeatures: { listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' },
  membershipFeature: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '${text}', marginBottom: '12px' },
  membershipCtaPrimary: { display: 'block', padding: '14px 24px', background: '${primary}', color: '#fff', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', fontSize: '1rem' },
  membershipCtaSecondary: { display: 'block', padding: '14px 24px', background: 'transparent', color: '${primary}', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', fontSize: '1rem', border: '2px solid ${primary}' },

  // Transformation Stories Section
  transformationSection: { padding: '80px 0', background: '${cardBg}' },
  transformationHeader: { textAlign: 'center', marginBottom: '48px' },
  transformationTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '600', color: '${text}', marginBottom: '12px' },
  transformationSubtitle: { fontSize: '1.1rem', color: '${textMuted}' },
  transformationGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' },
  transformationCard: { background: '${background}', borderRadius: '${borderRadius}', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  transformationImages: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' },
  transformationBefore: { position: 'relative' },
  transformationAfter: { position: 'relative' },
  transformationImg: { width: '100%', height: '200px', objectFit: 'cover' },
  transformationLabel: { position: 'absolute', bottom: '8px', left: '8px', padding: '4px 10px', background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  transformationContent: { padding: '20px', textAlign: 'center' },
  transformationService: { display: 'inline-block', padding: '4px 12px', background: '${primary}15', color: '${primary}', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' },
  transformationQuote: { fontSize: '0.95rem', color: '${text}', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '12px' },
  transformationName: { fontSize: '0.9rem', color: '${textMuted}', fontWeight: '500' },
  transformationCta: { textAlign: 'center', marginTop: '32px' },
  viewMoreBtn: { display: 'inline-block', padding: '14px 28px', background: 'transparent', color: '${primary}', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', border: '2px solid ${primary}' },

  // Fitness Program Section
  fitnessProgramSection: { padding: '80px 0', background: '${cardBg}' },
  fitnessProgramGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' },
  fitnessProgramContent: {},
  fitnessProgramTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: '${text}', marginBottom: '16px' },
  fitnessProgramDesc: { fontSize: '1.1rem', color: '${textMuted}', lineHeight: 1.7, marginBottom: '32px' },
  fitnessProgramPillars: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' },
  fitnessPillar: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  fitnessPillarIcon: { fontSize: '1.5rem', flexShrink: 0 },
  fitnessPillarTitle: { fontWeight: '600', color: '${text}', marginBottom: '4px', fontSize: '1rem' },
  fitnessPillarDesc: { fontSize: '0.9rem', color: '${textMuted}', margin: 0, lineHeight: 1.5 },
  fitnessProgramCta: { display: 'inline-block', padding: '14px 28px', background: '${primary}', color: '#fff', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none' },
  fitnessProgramImageWrap: { position: 'relative', borderRadius: '${borderRadius}', overflow: 'hidden' },
  fitnessProgramImage: { width: '100%', height: '400px', objectFit: 'cover' },

  // Class Schedule Preview Section
  classScheduleSection: { padding: '80px 0', background: '${background}' },
  classScheduleHeader: { textAlign: 'center', marginBottom: '48px' },
  classScheduleTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: '${text}', marginBottom: '12px' },
  classScheduleSubtitle: { fontSize: '1.1rem', color: '${textMuted}' },
  classScheduleGrid: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px', margin: '0 auto' },
  classCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px', background: '${cardBg}', borderRadius: '${borderRadius}', border: '1px solid ${textMuted}15', transition: 'transform 0.2s, box-shadow 0.2s' },
  classTime: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' },
  classTimeText: { fontWeight: '700', fontSize: '1.1rem', color: '${text}' },
  classDuration: { fontSize: '0.8rem', color: '${textMuted}' },
  classInfo: { flex: 1 },
  className: { fontWeight: '600', color: '${text}', marginBottom: '4px', fontSize: '1rem' },
  classTrainer: { fontSize: '0.9rem', color: '${textMuted}', marginBottom: '8px' },
  classDetails: { display: 'flex', gap: '12px' },
  classIntensity: { padding: '2px 8px', background: '${primary}15', color: '${primary}', borderRadius: '4px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  classSpots: { fontSize: '0.85rem', color: '${textMuted}' },
  classBookBtn: { padding: '10px 20px', background: '${primary}', color: '#fff', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' },
  classScheduleCta: { textAlign: 'center', marginTop: '32px' },
  viewScheduleBtn: { display: 'inline-block', padding: '14px 28px', background: 'transparent', color: '${primary}', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', border: '2px solid ${primary}' },

  // Free Trial CTA Section
  freeTrialSection: { padding: '80px 0', background: 'linear-gradient(135deg, ${primary}10, ${primary}05)' },
  freeTrialCard: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px', alignItems: 'center', maxWidth: '1100px', margin: '0 auto' },
  freeTrialContent: {},
  freeTrialBadge: { display: 'inline-block', padding: '6px 16px', background: '${primary}', color: '#fff', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' },
  freeTrialTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', color: '${text}', marginBottom: '16px', lineHeight: 1.2 },
  freeTrialDesc: { fontSize: '1.15rem', color: '${textMuted}', lineHeight: 1.7, marginBottom: '24px' },
  freeTrialFeatures: { listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' },
  freeTrialFeature: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: '${text}' },
  freeTrialBtn: { display: 'inline-block', padding: '18px 36px', background: '${primary}', color: '#fff', borderRadius: '${borderRadius}', fontWeight: '700', textDecoration: 'none', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  freeTrialNote: { fontSize: '0.85rem', color: '${textMuted}', marginTop: '16px' },
  freeTrialImageWrap: { position: 'relative', borderRadius: '${borderRadius}', overflow: 'hidden' },
  freeTrialImage: { width: '100%', height: '450px', objectFit: 'cover' },

  // Trainer Spotlight Section
  trainerSpotlightSection: { padding: '80px 0', background: '${background}' },
  trainerSpotlightHeader: { textAlign: 'center', marginBottom: '48px' },
  trainerSpotlightTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: '${text}', marginBottom: '12px' },
  trainerSpotlightSubtitle: { fontSize: '1.1rem', color: '${textMuted}' },
  trainerSpotlightGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  trainerCard: { background: '${cardBg}', borderRadius: '${borderRadius}', overflow: 'hidden', border: '1px solid ${textMuted}10' },
  trainerImageWrap: { width: '100%', height: '280px', overflow: 'hidden' },
  trainerImage: { width: '100%', height: '100%', objectFit: 'cover' },
  trainerInfo: { padding: '24px' },
  trainerName: { fontWeight: '700', color: '${text}', fontSize: '1.1rem', marginBottom: '4px' },
  trainerRole: { display: 'block', color: '${primary}', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px' },
  trainerBio: { fontSize: '0.9rem', color: '${textMuted}', lineHeight: 1.6, marginBottom: '16px' },
  trainerCerts: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' },
  trainerCert: { padding: '3px 8px', background: '${textMuted}10', color: '${textMuted}', borderRadius: '4px', fontSize: '11px', fontWeight: '500' },
  trainerBookBtn: { display: 'inline-block', padding: '10px 20px', background: '${primary}', color: '#fff', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' },
  trainerSpotlightCta: { textAlign: 'center', marginTop: '32px' },
  viewTrainersBtn: { display: 'inline-block', padding: '14px 28px', background: 'transparent', color: '${primary}', borderRadius: '${borderRadius}', fontWeight: '600', textDecoration: 'none', border: '2px solid ${primary}' }
};`;
}

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================

/**
 * Generate a structural page based on industry and variant
 *
 * @param {string} industryId - Industry identifier (e.g., 'pizza-restaurant')
 * @param {string} variant - Layout variant ('A', 'B', or 'C')
 * @param {object} moodSliders - UI mood slider values (colors, dark mode, etc.)
 * @param {object} businessData - Business-specific data (name, tagline, images, etc.)
 * @returns {string} - Generated React component code
 */
function generateStructuralPage(industryId, variant = 'A', moodSliders = {}, businessData = {}) {
  // Build rich business data from fixtures + images
  const richData = buildRichBusinessData(industryId, businessData);

  // Build the structural config
  const config = buildStructuralConfig(industryId, variant, richData);

  // Get colors from mood sliders, fixture theme, or config defaults
  const fixtureColors = richData.theme?.colors || {};
  const colors = {
    primary: moodSliders.primaryColor || fixtureColors.primary || config.colorGuidance?.warm?.[0] || '#3B82F6',
    secondary: fixtureColors.secondary || '#6366F1',
    accent: fixtureColors.accent || '#10B981',
    text: moodSliders.isDark ? '#f8fafc' : (fixtureColors.text || '#1f2937'),
    textMuted: moodSliders.isDark ? '#94a3b8' : '#6b7280',
    background: moodSliders.isDark ? '#0f172a' : (fixtureColors.background || '#ffffff'),
    cardBg: moodSliders.isDark ? '#1e293b' : '#ffffff'
  };

  // Generate hero section
  const heroGenerator = HERO_GENERATORS[config.hero.type] || generateImageOverlayHero;
  const heroCode = heroGenerator(config.hero.config, colors, richData);

  // Generate sections
  const sectionsCode = config.sections.map(section => {
    const sectionGenerator = SECTION_GENERATORS[section.type];
    if (sectionGenerator) {
      return sectionGenerator(section.config, colors, richData);
    }
    return `{/* Section: ${section.type} - TODO */}`;
  }).join('\n');

  // Generate styles
  const stylesCode = generateStructuralStyles(config, moodSliders);

  // Generate REAL data from fixtures
  const dataCode = generateDataFromFixture(richData, industryId);

  // Assemble the full component
  const componentCode = `/**
 * Structural Page: ${config.industry.name} - Layout ${variant} (${config.variant.name})
 * Reference: ${config.variant.reference}
 * Mood: ${config.variant.mood}
 *
 * Generated by structural-generator.cjs
 * This is a STRUCTURALLY different layout, not just color changes.
 *
 * Business: ${richData.name}
 * Industry: ${industryId}
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, MapPin, Phone, Clock, ArrowRight, Check, Users, Heart, Award, Zap, ShoppingBag, Calendar, Headphones, Shield, Smartphone } from 'lucide-react';

// Icon map for rendering string icon names as components
const iconMap = {
  Star, Users, Heart, Award, Zap, ShoppingBag, Calendar, Headphones, Shield, Smartphone,
  MapPin, Phone, Clock, ArrowRight, Check, ChevronLeft, ChevronRight
};

// Helper: render icon from string name, emoji, or component
const RenderIcon = ({ name, size = 24, color, style: iconStyle }) => {
  if (!name) return <Star size={size} color={color} style={iconStyle} />;
  const IconComp = iconMap[name];
  if (IconComp) return <IconComp size={size} color={color} style={iconStyle} />;
  // Fallback: render as text (handles emoji strings like ✨, 💪, etc.)
  return <span style={{ fontSize: size, ...iconStyle }}>{name}</span>;
};

export default function HomePage() {
  // State for interactive elements
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // Menu section state
  const [activeMenuCategory, setActiveMenuCategory] = useState(0);
  const [menuFilters, setMenuFilters] = useState([]);
  const menuCategoryRefs = React.useRef([]);

  // Menu helper functions
  const scrollToMenuCategory = (idx) => {
    setActiveMenuCategory(idx);
    menuCategoryRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleMenuFilter = (filter) => {
    setMenuFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filterMenuItems = (items) => {
    if (menuFilters.length === 0) return items;
    return items.filter(item =>
      menuFilters.some(f => item.dietary?.includes(f))
    );
  };

  // ===== BUSINESS DATA (from fixture) =====
${dataCode}

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(window.scrollY / docHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div style={{ background: '${colors.background}' }}>
      ${heroCode}
      ${sectionsCode}
    </div>
  );
}

${stylesCode}
`;

  return componentCode;
}

/**
 * Generate REAL data arrays from fixture content
 */
function generateDataFromFixture(richData, industryId) {
  const fixture = richData._fixture;
  const images = richData.images || {};

  // ============================================
  // INDUSTRY-AWARE HIGHLIGHTS STRIP
  // ============================================
  const industryHighlights = {
    'fitness-gym': [
      { icon: '💪', label: 'Free Trial', link: '/free-trial' },
      { icon: '📅', label: 'Classes', link: '/schedule' },
      { icon: '💳', label: 'Memberships', link: '/membership' },
      { icon: '👥', label: 'Trainers', link: '/trainers' }
    ],
    'salon-spa': [
      { icon: '📅', label: 'Book Now', link: '/book' },
      { icon: '✨', label: 'Services', link: '/services' },
      { icon: '🎁', label: 'Gift Cards', link: '/gift-cards' },
      { icon: '📍', label: 'Locations', link: '/contact' }
    ],
    'coffee-cafe': [
      { icon: '☕', label: 'Order Ahead', link: '/order' },
      { icon: '📍', label: 'Find Us', link: '/contact' },
      { icon: '🎁', label: 'Gift Cards', link: '/gift-cards' },
      { icon: '⭐', label: 'Rewards', link: '/rewards' }
    ],
    'barbershop': [
      { icon: '✂️', label: 'Book Now', link: '/book' },
      { icon: '💈', label: 'Services', link: '/services' },
      { icon: '👤', label: 'Barbers', link: '/team' },
      { icon: '📍', label: 'Find Us', link: '/contact' }
    ]
  };
  const defaultHighlights = [
    { icon: '📅', label: 'Book Now', link: '/book' },
    { icon: '📍', label: 'Find Us', link: '/contact' },
    { icon: '🎁', label: 'Gift Cards', link: '/gift-cards' },
    { icon: '⭐', label: 'Rewards', link: '/rewards' }
  ];
  const highlightsData = industryHighlights[industryId] || defaultHighlights;
  const highlightsCode = JSON.stringify(highlightsData, null, 4).replace(/"([^"]+)":/g, '$1:');

  // ============================================
  // SOCIAL PROOF STRIP (from fixture or generated)
  // ============================================
  let socialProofCode;
  if (fixture?.pages?.socialProof?.awards && fixture.pages.socialProof.awards.length > 0) {
    socialProofCode = JSON.stringify(fixture.pages.socialProof.awards, null, 4).replace(/"([^"]+)":/g, '$1:');
  } else {
    const rating = fixture?.pages?.socialProof?.rating || 4.9;
    const reviewCount = fixture?.pages?.socialProof?.reviewCount || 500;
    const location = escapeQuotes(richData.location || 'Town');
    socialProofCode = `[
    { icon: '🏆', text: 'Best in ${location} ${new Date().getFullYear()}' },
    { icon: '⭐', text: '${rating} Star Rating' },
    { icon: '💬', text: '${reviewCount}+ Reviews' }
  ]`;
  }

  // ============================================
  // MEMBERSHIPS (from fixture or defaults)
  // ============================================
  let membershipsCode;
  if (fixture?.pages?.memberships && fixture.pages.memberships.length > 0) {
    const membershipsData = fixture.pages.memberships.map(m => ({
      name: m.name,
      price: String(m.price).replace(/^\$/, ''),
      frequency: m.frequency || 'month',
      description: m.description,
      benefits: m.benefits || [],
      ctaLabel: m.ctaLabel || `Join ${m.name}`,
      highlighted: m.highlighted || false
    }));
    membershipsCode = JSON.stringify(membershipsData, null, 4).replace(/"([^"]+)":/g, '$1:');
  } else {
    membershipsCode = `[
    {
      name: 'Basic',
      price: '49',
      frequency: 'month',
      description: 'Perfect for getting started',
      benefits: ['Full access during business hours', '10% off additional services', 'Priority booking'],
      ctaLabel: 'Join Basic',
      highlighted: false
    },
    {
      name: 'Premium',
      price: '99',
      frequency: 'month',
      description: 'Our most popular membership',
      benefits: ['Unlimited access', '20% off additional services', 'Priority booking', 'Free birthday treatment', 'Guest passes (2/year)'],
      ctaLabel: 'Join Premium',
      highlighted: true
    },
    {
      name: 'VIP',
      price: '199',
      frequency: 'month',
      description: 'The ultimate experience',
      benefits: ['All Premium benefits', '30% off everything', 'Dedicated concierge', 'Exclusive events access'],
      ctaLabel: 'Join VIP',
      highlighted: false
    }
  ]`;
  }

  // ============================================
  // TRANSFORMATIONS (from fixture or defaults)
  // ============================================
  let transformationsCode;
  if (fixture?.pages?.transformations && fixture.pages.transformations.length > 0) {
    const transformationsData = fixture.pages.transformations.slice(0, 3).map(t => ({
      name: t.name,
      beforeImage: t.beforeImage,
      afterImage: t.afterImage,
      quote: t.quote,
      serviceTag: t.serviceTag
    }));
    transformationsCode = JSON.stringify(transformationsData, null, 4).replace(/"([^"]+)":/g, '$1:');
  } else {
    transformationsCode = `[
    {
      name: 'Happy Customer',
      beforeImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      afterImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
      quote: 'Amazing results! I could not be happier with my transformation.',
      serviceTag: 'Signature Service'
    },
    {
      name: 'Satisfied Client',
      beforeImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      afterImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
      quote: 'The team here truly cares about results. Highly recommend!',
      serviceTag: 'Premium Package'
    },
    {
      name: 'Loyal Member',
      beforeImage: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400',
      afterImage: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400',
      quote: 'Best decision I ever made. The results speak for themselves!',
      serviceTag: 'VIP Program'
    }
  ]`;
  }

  // Hero Images - from industry image library
  const heroImagesArray = (images.hero || []).slice(0, 4);
  const heroImagesCode = heroImagesArray.length > 0
    ? heroImagesArray.map(url => `'${url}'`).join(',\n    ')
    : "'/images/hero-1.jpg', '/images/hero-2.jpg', '/images/hero-3.jpg'";

  // Menu Categories - from fixture
  // Note: No $ symbol per Cornell pricing psychology research
  let menuCategoriesCode = '';
  if (fixture?.pages?.menu?.categories) {
    const cats = fixture.pages.menu.categories.slice(0, 4).map(cat => {
      const items = (cat.items || []).slice(0, 5).map(item => {
        // Format price without $ symbol (pricing psychology)
        const priceVal = typeof item.price === 'number' ? item.price.toFixed(2) : String(item.price).replace(/^\$/, '');
        return `{ name: '${escapeQuotes(item.name)}', price: '${priceVal}' }`;
      }).join(',\n        ');
      return `{ name: '${escapeQuotes(cat.name)}', items: [\n        ${items}\n      ]}`;
    }).join(',\n    ');
    menuCategoriesCode = cats;
  } else {
    menuCategoriesCode = `{ name: 'Featured', items: [
        { name: 'Signature Item', price: '15.99' },
        { name: 'House Special', price: '18.99' },
        { name: 'Classic Favorite', price: '12.99' }
      ]}`;
  }

  // Menu Items (visual cards) - first items from menu with images
  // Note: No $ symbol per Cornell pricing psychology research
  let menuItemsCode = '';
  // Generic food placeholder URLs by category type
  const foodPlaceholders = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', // Salad bowl
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', // Pizza
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80', // Colorful food
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80', // Pancakes
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80', // Fruit bowl
    'https://images.unsplash.com/photo-1482049016gy1-af1k05249gy1?w=400&q=80'  // Sandwich
  ];

  if (fixture?.pages?.menu?.categories) {
    const allItems = [];
    fixture.pages.menu.categories.forEach((cat, catIdx) => {
      (cat.items || []).slice(0, 2).forEach((item, idx) => {
        // Format price without $ symbol (pricing psychology)
        const priceVal = typeof item.price === 'number' ? item.price.toFixed(2) : String(item.price).replace(/^\$/, '');
        // Use item's own image first, then products images, then food placeholder (NOT hero images)
        const itemImage = item.image || images.products?.[allItems.length] || foodPlaceholders[allItems.length % foodPlaceholders.length];
        allItems.push({
          name: item.name,
          description: item.description || `Delicious ${item.name}`,
          price: priceVal,
          image: itemImage,
          badge: idx === 0 && catIdx === 0 ? 'Best Seller' : (idx === 0 ? 'Popular' : null)
        });
      });
    });
    menuItemsCode = allItems.slice(0, 6).map(item =>
      `{ name: '${escapeQuotes(item.name)}', description: '${escapeQuotes(item.description)}', price: '${item.price}', image: '${item.image}'${item.badge ? `, badge: '${item.badge}'` : ''} }`
    ).join(',\n    ');
  } else {
    menuItemsCode = `{ name: 'Signature Item', description: 'Our most popular choice', price: '12.99', image: '${foodPlaceholders[0]}', badge: 'Best Seller' },
    { name: 'Chef Special', description: 'Made with love', price: '15.99', image: '${foodPlaceholders[1]}' },
    { name: 'Classic Favorite', description: 'A timeless classic', price: '10.99', image: '${foodPlaceholders[2]}' }`;
  }

  // Timeline from about story or established year
  const established = richData.established || '2020';
  const establishedYear = parseInt(established) || 2020;
  const timelineCode = `{ year: '${establishedYear}', title: 'The Beginning', description: '${escapeQuotes(richData.name)} was founded with a passion for excellence.' },
    { year: '${establishedYear + 3}', title: 'Growing', description: 'Expanded our services and built a loyal customer base.' },
    { year: '${new Date().getFullYear()}', title: 'Today', description: 'Proudly serving our community with dedication.' }`;

  // Gallery Images - from fixture or industry images
  // Always ensure exactly 6 images for clean 3-column grid display
  const DEFAULT_CAPTIONS = ['Our Space', 'Fresh Daily', 'Made with Love', 'Quality First', 'Crafted Care', 'Excellence'];
  const FALLBACK_GALLERY_IMAGES = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
    'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800'
  ];

  let galleryCode = '';
  let galleryItems = [];

  if (fixture?.pages?.gallery?.images) {
    galleryItems = fixture.pages.gallery.images.map((img, idx) => ({
      src: img.url || img,
      caption: img.caption || DEFAULT_CAPTIONS[idx] || 'Our Work'
    }));
  } else {
    const industryImages = [...(images.interior || []), ...(images.products || []), ...(images.hero || [])];
    galleryItems = industryImages.map((url, idx) => ({
      src: url,
      caption: DEFAULT_CAPTIONS[idx] || 'Gallery'
    }));
  }

  // Pad to exactly 6 images for clean 3-column grid
  while (galleryItems.length < 6) {
    const idx = galleryItems.length;
    galleryItems.push({
      src: FALLBACK_GALLERY_IMAGES[idx] || FALLBACK_GALLERY_IMAGES[0],
      caption: DEFAULT_CAPTIONS[idx] || 'Gallery'
    });
  }

  galleryCode = galleryItems.slice(0, 6).map((item, idx) =>
    `{ src: '${item.src}', alt: '${escapeQuotes(item.caption)}', caption: '${escapeQuotes(item.caption)}' }`
  ).join(',\n    ');

  // Location - from fixture
  const locationCode = `{ name: '${escapeQuotes(richData.name)}', address: '${escapeQuotes(richData.address)}', hours: '${formatHours(richData.hours)}', image: '${images.interior?.[0] || images.hero?.[0] || '/images/location.jpg'}', directionsUrl: '#' }`;

  // Reviews/Testimonials - from fixture (with location replacement)
  let reviewsCode = '';
  const userLocation = richData._overrides?.location || richData.location || 'town';
  const fixtureLocation = richData._fixtureLocation || fixture?.business?.location || 'Austin';
  // Also handle "Austin, TX" format - extract just the city
  const fixtureCity = fixtureLocation.split(',')[0].trim();

  if (fixture?.pages?.home?.sections) {
    const testimonialSection = fixture.pages.home.sections.find(s => s.type === 'testimonials');
    if (testimonialSection?.items) {
      reviewsCode = testimonialSection.items.slice(0, 5).map(item => {
        // Replace fixture location with user's location in review text
        let reviewText = item.text || '';
        reviewText = reviewText.replace(new RegExp(fixtureCity, 'gi'), userLocation);
        return `{ text: '${escapeQuotes(reviewText)}', author: '${escapeQuotes(item.name)}', rating: ${item.rating || 5} }`;
      }).join(',\n    ');
    }
  }
  if (!reviewsCode) {
    reviewsCode = `{ text: 'Absolutely amazing experience! Will definitely be back.', author: 'Sarah M.', rating: 5 },
    { text: 'Best in ${userLocation}. The quality is unmatched.', author: 'John D.', rating: 5 },
    { text: 'Great service and attention to detail.', author: 'Emily R.', rating: 5 }`;
  }

  // Team Members - from fixture
  let teamCode = '';
  if (fixture?.pages?.about?.team) {
    teamCode = fixture.pages.about.team.slice(0, 4).map(member =>
      `{ name: '${escapeQuotes(member.name)}', role: '${escapeQuotes(member.role)}', image: '${member.image || images.team?.[0] || '/images/team.jpg'}', bio: '${escapeQuotes(member.bio || '')}' }`
    ).join(',\n    ');
  } else {
    teamCode = `{ name: 'Our Team', role: 'Dedicated Professionals', image: '${images.team?.[0] || '/images/team.jpg'}', bio: 'Passionate about quality.' }`;
  }

  // Services/Features - from fixture home sections
  let servicesCode = '';
  if (fixture?.pages?.home?.sections) {
    const featuresSection = fixture.pages.home.sections.find(s => s.type === 'features');
    if (featuresSection?.items) {
      servicesCode = featuresSection.items.slice(0, 4).map(item =>
        `{ name: '${escapeQuotes(item.title)}', description: '${escapeQuotes(item.description)}', icon: '${item.icon || '✨'}' }`
      ).join(',\n    ');
    }
  }
  if (!servicesCode) {
    servicesCode = `{ name: 'Quality Service', description: 'We deliver excellence in everything we do', icon: '✨' },
    { name: 'Expert Team', description: 'Skilled professionals ready to help', icon: '🎯' },
    { name: 'Fast & Reliable', description: 'Quick turnaround without compromising quality', icon: '🚀' }`;
  }

  // Stats - calculated or from fixture
  const yearsInBusiness = new Date().getFullYear() - establishedYear;
  const statsCode = `{ value: '${yearsInBusiness}+', label: 'Years Experience' },
    { value: '5000+', label: 'Happy Customers' },
    { value: '4.9', label: 'Average Rating' },
    { value: '${fixture?.pages?.menu?.categories?.reduce((sum, cat) => sum + (cat.items?.length || 0), 0) || 50}+', label: '${industryId.includes('restaurant') || industryId.includes('pizza') || industryId.includes('cafe') ? 'Menu Items' : 'Services'}' }`;

  // FAQs - generic but relevant
  const faqsCode = `{ question: 'What are your hours?', answer: '${formatHoursLong(richData.hours)}' },
    { question: 'How can I contact you?', answer: 'You can reach us at ${richData.phone} or email ${richData.email}.' },
    { question: 'Where are you located?', answer: 'We are located at ${escapeQuotes(richData.address)}.' }`;

  return `  // Hero slideshow images
  const heroImages = [
    ${heroImagesCode}
  ];

  // Menu categories with items
  const menuCategories = [
    ${menuCategoriesCode}
  ];

  // Featured menu items (visual cards)
  const menuItems = [
    ${menuItemsCode}
  ];

  // Business timeline/history
  const timelineEvents = [
    ${timelineCode}
  ];

  // Gallery images
  const galleryImages = [
    ${galleryCode}
  ];

  // Location(s)
  const locations = [
    ${locationCode}
  ];

  // Instagram/social posts (using gallery images)
  const instagramPosts = galleryImages.slice(0, 4).map((img, idx) => ({
    image: img.src,
    likes: Math.floor(Math.random() * 300) + 100,
    url: '#'
  }));

  // Customer reviews
  const reviews = [
    ${reviewsCode}
  ];

  // Services/features
  const services = [
    ${servicesCode}
  ];

  // Team members
  const teamMembers = [
    ${teamCode}
  ];

  // Business stats
  const stats = [
    ${statsCode}
  ];

  // FAQs
  const faqs = [
    ${faqsCode}
  ];

  // Merchandise (placeholder) - using Unsplash placeholders for missing images
  const merchandise = [
    { name: 'T-Shirt', price: '$25', image: '${images.products?.[0] || heroImages[0]}' },
    { name: 'Hat', price: '$20', image: '${images.products?.[1] || heroImages[1]}' },
    { name: 'Mug', price: '$15', image: '${images.products?.[2] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400'}' }
  ];

  // Research-backed Homepage Sections Data
  // Highlights Strip - Quick action tiles (industry-aware)
  const highlights = ${highlightsCode};

  // Social Proof Strip - Trust badges (from fixture or defaults)
  const socialProof = ${socialProofCode};

  // ============================================
  // INDUSTRY-SPECIFIC DATA BLOCKS
  // Only include data relevant to the current industry
  // ============================================
  const _isCoffee = '${industryId}'.includes('coffee') || '${industryId}'.includes('cafe');
  const _isFood = ['pizza', 'restaurant', 'steakhouse', 'bakery'].some(k => '${industryId}'.includes(k)) || _isCoffee;
  const _isSalon = ['salon', 'spa', 'barber'].some(k => '${industryId}'.includes(k));
  const _isFitness = ['fitness', 'gym', 'yoga'].some(k => '${industryId}'.includes(k));
${industryId === 'coffee-cafe' || industryId.includes('coffee') || industryId.includes('cafe') ? `
  // Seasonal Featured Items (coffee/cafe only)
  const seasonalItems = [
    { name: 'Pumpkin Spice Latte', description: 'Fall favorite with real pumpkin and warm spices', price: '5.95', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400', tag: 'Fall Special' },
    { name: 'Maple Pecan Cold Brew', description: 'Smooth cold brew with maple syrup and toasted pecans', price: '6.25', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', tag: 'Limited Time' },
    { name: 'Spiced Apple Cider', description: 'Hot pressed apple cider with cinnamon and clove', price: '4.95', image: 'https://images.unsplash.com/photo-1510431198580-7727c9fa1e3a?w=400', tag: 'Seasonal' }
  ];

  // Coffee Program Features
  const coffeeProgram = {
    title: 'Our Coffee Journey',
    description: 'We partner directly with farmers in Ethiopia, Colombia, and Guatemala to source the finest single-origin beans. Each batch is carefully roasted in small lots to bring out unique flavor profiles.',
    features: [
      'Direct trade partnerships with 12 family farms',
      'Roasted fresh daily in small batches',
      'Single-origin and custom blends available',
      'Free brewing classes every Saturday'
    ],
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800'
  };` : ''}
${['salon-spa', 'barbershop'].includes(industryId) || industryId.includes('salon') || industryId.includes('spa') || industryId.includes('barber') ? `
  // Seasonal Featured Items (salon/spa - seasonal packages)
  const seasonalItems = [
    { name: 'Summer Glow Package', description: 'Radiant skin and sun-kissed highlights for the season', price: '149', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6c?w=400', tag: 'Summer Special' },
    { name: 'Holiday Refresh', description: 'Complete rejuvenation for the holiday season', price: '199', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', tag: 'Limited Time' },
    { name: 'Bridal Beauty Prep', description: 'Wedding-ready skin, hair, and nails package', price: '299', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', tag: 'Seasonal' }
  ];

  // Salon/Spa Program - Philosophy and approach
  const salonProgram = {
    title: 'Our Approach to Beauty',
    description: 'We believe true beauty comes from within. Our holistic approach combines expert technique with personalized care, creating experiences that nurture both body and soul.',
    pillars: [
      { icon: '✨', title: 'Personalized Care', description: 'Every treatment is customized to your unique needs and goals' },
      { icon: '🌿', title: 'Clean Beauty', description: 'We use only organic, cruelty-free products that are gentle yet effective' },
      { icon: '💎', title: 'Expert Artistry', description: 'Our team brings decades of combined experience and ongoing education' }
    ],
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
  };

  // New Client Guide
  const newClientGuide = {
    title: 'What to Expect on Your First Visit',
    introText: 'We want your first experience to be relaxing and stress-free. Here\\'s everything you need to know.',
    steps: [
      { title: 'Book Online', description: 'Select your service and preferred stylist/therapist. First-timers get 15% off!' },
      { title: 'Arrive Early', description: 'Please arrive 10-15 minutes early to complete a brief consultation form and enjoy our relaxation lounge.' },
      { title: 'Consultation', description: 'Your provider will discuss your goals, preferences, and any concerns before beginning.' },
      { title: 'Your Service', description: 'Sit back and relax while our experts work their magic. Refreshments are complimentary.' }
    ],
    tips: [
      'Wear comfortable clothing for spa services',
      'Let us know about any allergies or sensitivities',
      'Photos of desired styles are always welcome',
      'Gratuity is not included but appreciated'
    ]
  };` : ''}
${['salon-spa', 'barbershop', 'fitness-gym', 'yoga'].includes(industryId) || industryId.includes('salon') || industryId.includes('spa') || industryId.includes('barber') || industryId.includes('fitness') || industryId.includes('gym') || industryId.includes('yoga') ? `
  // Membership Plans (shared: salon + fitness industries)
  const memberships = ${membershipsCode};

  // Transformation Stories (shared: salon + fitness industries)
  const transformations = ${transformationsCode};` : ''}
${['fitness-gym', 'yoga'].includes(industryId) || industryId.includes('fitness') || industryId.includes('gym') || industryId.includes('yoga') ? `
  // Fitness Program - Training methodology
  const fitnessProgram = ${fixture?.pages?.fitnessProgram ? JSON.stringify({
    title: fixture.pages.fitnessProgram.title || 'Our Training Philosophy',
    description: fixture.pages.fitnessProgram.description || 'We believe in sustainable fitness through science-backed training methods.',
    pillars: fixture.pages.fitnessProgram.pillars || [
      { icon: '💪', title: 'Strength Foundation', description: 'Build functional strength that transfers to everyday life' },
      { icon: '🔥', title: 'Metabolic Conditioning', description: 'High-intensity intervals that maximize calorie burn' },
      { icon: '🎯', title: 'Progressive Overload', description: 'Structured progression to ensure continuous improvement' }
    ],
    image: fixture.pages.fitnessProgram.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
  }, null, 2).replace(/"([^"]+)":/g, '$1:') : `{
    title: 'Our Training Philosophy',
    description: 'We believe in sustainable fitness through science-backed training methods. Our approach combines proven techniques with personalized attention to help you achieve your goals.',
    pillars: [
      { icon: '💪', title: 'Strength Foundation', description: 'Build functional strength that transfers to everyday life' },
      { icon: '🔥', title: 'Metabolic Conditioning', description: 'High-intensity intervals that maximize calorie burn' },
      { icon: '🎯', title: 'Progressive Overload', description: 'Structured progression to ensure continuous improvement' }
    ],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
  }`};

  // Class Schedule
  const classSchedule = ${fixture?.pages?.classSchedule ? JSON.stringify(fixture.pages.classSchedule.slice(0, 5), null, 2).replace(/"([^"]+)":/g, '$1:') : `[
    { time: '6:00 AM', duration: '45 min', name: 'HIIT Blast', trainer: 'Coach Mike', intensity: 'High', spots: 4 },
    { time: '7:30 AM', duration: '50 min', name: 'Spin Cycle', trainer: 'Sarah K.', intensity: 'Medium', spots: 8 },
    { time: '12:00 PM', duration: '60 min', name: 'Power Yoga', trainer: 'Jen L.', intensity: 'Medium', spots: 12 },
    { time: '5:30 PM', duration: '45 min', name: 'Strength Circuit', trainer: 'Marcus C.', intensity: 'High', spots: 2 },
    { time: '7:00 PM', duration: '30 min', name: 'Core & Stretch', trainer: 'Amy R.', intensity: 'Low', spots: 15 }
  ]`};

  // Free Trial Offer
  const freeTrial = ${fixture?.pages?.freeTrial ? JSON.stringify(fixture.pages.freeTrial, null, 2).replace(/"([^"]+)":/g, '$1:') : `{
    badge: 'Limited Time Offer',
    title: 'Try Us Free for 7 Days',
    description: 'Experience everything we have to offer with no commitment. Access all classes, equipment, and amenities.',
    includes: [
      'Unlimited class access',
      'Full gym equipment use',
      'Free fitness assessment',
      'Personal trainer consultation',
      'Locker room amenities'
    ],
    cta: 'Start Your Free Trial',
    note: 'No credit card required. Cancel anytime.',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800'
  }`};

  // Trainers Array
  const trainers = ${fixture?.pages?.about?.team ? JSON.stringify(fixture.pages.about.team.slice(0, 4).map((t, i) => ({
    id: i + 1,
    name: t.name,
    role: t.role,
    bio: t.bio,
    image: t.image,
    certifications: t.certifications || []
  })), null, 2).replace(/"([^"]+)":/g, '$1:') : `[
    { id: 1, name: 'Marcus Chen', role: 'Head Trainer', bio: 'NASM-CPT with 15 years of experience.', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', certifications: ['NASM-CPT', 'CrossFit L2'] },
    { id: 2, name: 'Sarah Mitchell', role: 'Spin & HIIT Instructor', bio: 'Certified spin and HIIT coach.', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400', certifications: ['ACE', 'Les Mills'] },
    { id: 3, name: 'James Rodriguez', role: 'Strength Coach', bio: 'Former competitive powerlifter.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', certifications: ['CSCS', 'USAW'] },
    { id: 4, name: 'Amy Roberts', role: 'Yoga & Recovery', bio: 'RYT-500 yoga instructor.', image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400', certifications: ['RYT-500', 'FRC'] }
  ]`};` : ''}`;
}

/**
 * Escape quotes in strings for JS output
 */
function escapeQuotes(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');
}

/**
 * Format hours object to short string
 */
function formatHours(hours) {
  if (!hours || typeof hours !== 'object') return 'Mon-Sun 9am-9pm';
  const days = Object.keys(hours);
  if (days.length === 0) return 'Mon-Sun 9am-9pm';
  // Get first day's hours as representative
  return hours[days[0]] || 'Mon-Sun 9am-9pm';
}

/**
 * Format hours object to long string
 */
function formatHoursLong(hours) {
  if (!hours || typeof hours !== 'object') return 'We are open Monday through Sunday, 9am to 9pm.';
  const entries = Object.entries(hours);
  if (entries.length === 0) return 'We are open Monday through Sunday, 9am to 9pm.';
  // Check if all same
  const first = entries[0][1];
  const allSame = entries.every(([_, h]) => h === first);
  if (allSame) {
    return `We are open every day, ${first}.`;
  }
  return `Our hours vary by day. Please call for details.`;
}

/**
 * Generate all three variants for an industry
 */
function generateAllVariants(industryId, moodSliders = {}, businessData = {}) {
  return {
    A: generateStructuralPage(industryId, 'A', moodSliders, businessData),
    B: generateStructuralPage(industryId, 'B', moodSliders, businessData),
    C: generateStructuralPage(industryId, 'C', moodSliders, businessData)
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  generateStructuralPage,
  generateAllVariants,
  HERO_GENERATORS,
  SECTION_GENERATORS
};
