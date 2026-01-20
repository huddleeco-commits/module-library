/**
 * Preview Generator
 * Creates a static HTML preview of a generated site
 *
 * Phase 1: Preview Only - Shows site structure without editing
 */

/**
 * Generate a static HTML preview of the site
 * @param {Object} config - Site configuration
 * @param {string} config.businessName - Business name
 * @param {string} config.industry - Industry key
 * @param {string} config.industryName - Display name for industry
 * @param {Array<string>} config.pages - List of pages
 * @param {Object} config.colors - Color scheme
 * @param {string} config.tagline - Business tagline
 * @param {string} config.location - Business location
 * @param {Object} config.metadata - Additional metadata
 * @returns {string} HTML content for preview
 */
function generatePreviewHtml(config) {
  const {
    businessName = 'My Business',
    industry = 'business',
    industryName = 'Business',
    pages = ['Home', 'About', 'Services', 'Contact'],
    colors = { primary: '#3b82f6', secondary: '#1e40af', accent: '#f59e0b', text: '#1a1a2e', background: '#ffffff' },
    tagline = '',
    location = '',
    metadata = {}
  } = config;

  // Industry-specific icons
  const industryIcons = {
    'restaurant': '🍽️',
    'pizzeria': '🍕',
    'cafe': '☕',
    'bakery': '🥐',
    'bar': '🍸',
    'food-truck': '🚚',
    'healthcare': '🏥',
    'dental': '🦷',
    'fitness': '💪',
    'spa-salon': '💆',
    'real-estate': '🏠',
    'law-firm': '⚖️',
    'ecommerce': '🛒',
    'retail': '🏪',
    'photography': '📸',
    'construction': '🏗️',
    'automotive': '🚗',
    'education': '📚',
    'default': '🏢'
  };

  const industryIcon = industryIcons[industry] || industryIcons['default'];

  // Generate navigation items
  const navItems = pages.map(page => {
    const label = page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<a href="#${page.toLowerCase()}" class="nav-link">${label}</a>`;
  }).join('\n            ');

  // Generate page preview cards
  const pageCards = pages.map((page, index) => {
    const label = page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const pageIcons = {
      'home': '🏠',
      'about': 'ℹ️',
      'services': '⚙️',
      'contact': '📧',
      'menu': '📋',
      'gallery': '🖼️',
      'team': '👥',
      'pricing': '💰',
      'faq': '❓',
      'blog': '📝',
      'testimonials': '⭐',
      'portfolio': '📁',
      'products': '📦',
      'booking': '📅',
      'reservations': '🗓️'
    };
    const icon = pageIcons[page.toLowerCase()] || '📄';

    return `
          <div class="page-card" style="animation-delay: ${index * 0.1}s">
            <div class="page-icon">${icon}</div>
            <h3 class="page-title">${label}</h3>
            <p class="page-desc">AI-generated content with industry-specific sections</p>
          </div>`;
  }).join('\n');

  // Features based on industry
  const features = getIndustryFeatures(industry);
  const featureItems = features.map(f => `
          <div class="feature-item">
            <span class="feature-icon">${f.icon}</span>
            <span class="feature-text">${f.text}</span>
          </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${businessName}</title>
  <style>
    :root {
      --primary: ${colors.primary || '#3b82f6'};
      --secondary: ${colors.secondary || '#1e40af'};
      --accent: ${colors.accent || '#f59e0b'};
      --text: ${colors.text || '#1a1a2e'};
      --background: ${colors.background || '#ffffff'};
      --muted: #64748b;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      color: #e2e8f0;
    }

    /* Preview Banner */
    .preview-banner {
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      color: white;
      padding: 12px 24px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .preview-badge {
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* Site Preview Container */
    .preview-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px;
    }

    /* Header Preview */
    .site-header-preview {
      background: var(--background);
      border-radius: 16px 16px 0 0;
      padding: 20px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      font-size: 32px;
    }

    .brand-name {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
    }

    .nav-links {
      display: flex;
      gap: 24px;
    }

    .nav-link {
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .nav-link:hover {
      opacity: 1;
    }

    .cta-button {
      background: var(--primary);
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }

    /* Hero Preview */
    .hero-preview {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      padding: 80px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero-preview::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    .hero-content {
      position: relative;
      z-index: 1;
    }

    .hero-title {
      font-size: 48px;
      font-weight: 800;
      color: white;
      margin-bottom: 16px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .hero-tagline {
      font-size: 20px;
      color: rgba(255,255,255,0.9);
      max-width: 600px;
      margin: 0 auto 24px;
    }

    .hero-location {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.15);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      color: rgba(255,255,255,0.9);
    }

    /* Content Preview */
    .content-preview {
      background: var(--background);
      padding: 60px 40px;
      border-radius: 0 0 16px 16px;
    }

    /* Info Section */
    .info-section {
      background: #f8fafc;
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 40px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .info-item {
      text-align: center;
    }

    .info-label {
      font-size: 12px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
    }

    /* Pages Section */
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    .section-subtitle {
      color: var(--muted);
      margin-bottom: 32px;
    }

    .pages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .page-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      animation: fadeInUp 0.5s ease forwards;
      opacity: 0;
    }

    .page-card:hover {
      border-color: var(--primary);
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .page-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .page-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    .page-desc {
      font-size: 12px;
      color: var(--muted);
    }

    /* Features Section */
    .features-section {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
      border-radius: 12px;
      padding: 32px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .feature-icon {
      font-size: 20px;
    }

    .feature-text {
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
    }

    /* Colors Preview */
    .colors-section {
      margin-top: 40px;
    }

    .colors-grid {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .color-swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .color-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .color-label {
      font-size: 12px;
      color: var(--muted);
      text-transform: capitalize;
    }

    /* Footer Preview */
    .footer-preview {
      background: var(--primary);
      color: rgba(255,255,255,0.8);
      padding: 24px;
      text-align: center;
      font-size: 14px;
      border-radius: 0 0 16px 16px;
      margin-top: -16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .site-header-preview {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
      }

      .hero-title {
        font-size: 32px;
      }

      .pages-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="preview-banner">
    <span class="preview-badge">PREVIEW</span>
    <span>This is how your site will look after deployment</span>
  </div>

  <div class="preview-container">
    <!-- Header Preview -->
    <header class="site-header-preview">
      <div class="brand">
        <span class="brand-icon">${industryIcon}</span>
        <span class="brand-name">${businessName}</span>
      </div>
      <nav class="nav-links">
        ${navItems}
      </nav>
      <a href="#contact" class="cta-button">Contact Us</a>
    </header>

    <!-- Hero Preview -->
    <section class="hero-preview">
      <div class="hero-content">
        <h1 class="hero-title">${businessName}</h1>
        ${tagline ? `<p class="hero-tagline">${tagline}</p>` : `<p class="hero-tagline">Professional ${industryName} services tailored to your needs</p>`}
        ${location ? `<div class="hero-location">📍 ${location}</div>` : ''}
      </div>
    </section>

    <!-- Content Preview -->
    <section class="content-preview">
      <!-- Info Summary -->
      <div class="info-section">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Industry</div>
            <div class="info-value">${industryIcon} ${industryName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Pages</div>
            <div class="info-value">${pages.length} Pages</div>
          </div>
          <div class="info-item">
            <div class="info-label">Theme</div>
            <div class="info-value">Custom Colors</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">✅ Ready to Deploy</div>
          </div>
        </div>
      </div>

      <!-- Pages Grid -->
      <div class="pages-section">
        <h2 class="section-title">Generated Pages</h2>
        <p class="section-subtitle">Each page includes AI-generated content optimized for ${industryName}</p>
        <div class="pages-grid">
          ${pageCards}
        </div>
      </div>

      <!-- Features -->
      <div class="features-section">
        <h2 class="section-title">Included Features</h2>
        <p class="section-subtitle">Built-in functionality for your ${industryName.toLowerCase()} website</p>
        <div class="features-grid">
          ${featureItems}
        </div>
      </div>

      <!-- Colors -->
      <div class="colors-section">
        <h2 class="section-title">Color Scheme</h2>
        <p class="section-subtitle">Your site's color palette</p>
        <div class="colors-grid">
          <div class="color-swatch">
            <div class="color-circle" style="background: ${colors.primary || '#3b82f6'}"></div>
            <span class="color-label">Primary</span>
          </div>
          <div class="color-swatch">
            <div class="color-circle" style="background: ${colors.secondary || '#1e40af'}"></div>
            <span class="color-label">Secondary</span>
          </div>
          <div class="color-swatch">
            <div class="color-circle" style="background: ${colors.accent || '#f59e0b'}"></div>
            <span class="color-label">Accent</span>
          </div>
          <div class="color-swatch">
            <div class="color-circle" style="background: ${colors.text || '#1a1a2e'}"></div>
            <span class="color-label">Text</span>
          </div>
          <div class="color-swatch">
            <div class="color-circle" style="background: ${colors.background || '#ffffff'}; border-color: #e5e7eb;"></div>
            <span class="color-label">Background</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Preview -->
    <footer class="footer-preview">
      <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Get industry-specific features
 */
function getIndustryFeatures(industry) {
  const featureMap = {
    'restaurant': [
      { icon: '📋', text: 'Online Menu' },
      { icon: '📅', text: 'Reservations' },
      { icon: '🛒', text: 'Online Ordering' },
      { icon: '📍', text: 'Location & Hours' },
      { icon: '⭐', text: 'Reviews Section' },
      { icon: '📸', text: 'Photo Gallery' }
    ],
    'pizzeria': [
      { icon: '🍕', text: 'Pizza Menu Builder' },
      { icon: '🛒', text: 'Online Ordering' },
      { icon: '🚗', text: 'Delivery Tracking' },
      { icon: '💰', text: 'Deals & Specials' },
      { icon: '📞', text: 'Quick Order Phone' },
      { icon: '📍', text: 'Store Locator' }
    ],
    'healthcare': [
      { icon: '📅', text: 'Appointment Booking' },
      { icon: '👨‍⚕️', text: 'Provider Directory' },
      { icon: '🏥', text: 'Services Overview' },
      { icon: '📋', text: 'Patient Portal' },
      { icon: '📞', text: 'Contact Forms' },
      { icon: '🗺️', text: 'Location Maps' }
    ],
    'real-estate': [
      { icon: '🏠', text: 'Property Listings' },
      { icon: '🔍', text: 'Search & Filter' },
      { icon: '👤', text: 'Agent Profiles' },
      { icon: '📅', text: 'Showing Scheduler' },
      { icon: '💰', text: 'Mortgage Calculator' },
      { icon: '📧', text: 'Lead Capture' }
    ],
    'ecommerce': [
      { icon: '🛒', text: 'Shopping Cart' },
      { icon: '💳', text: 'Secure Checkout' },
      { icon: '📦', text: 'Product Catalog' },
      { icon: '🔍', text: 'Search & Filter' },
      { icon: '⭐', text: 'Product Reviews' },
      { icon: '❤️', text: 'Wishlist' }
    ],
    'spa-salon': [
      { icon: '📅', text: 'Online Booking' },
      { icon: '💆', text: 'Services Menu' },
      { icon: '👤', text: 'Staff Profiles' },
      { icon: '💳', text: 'Gift Cards' },
      { icon: '📸', text: 'Gallery' },
      { icon: '⭐', text: 'Testimonials' }
    ],
    'law-firm': [
      { icon: '⚖️', text: 'Practice Areas' },
      { icon: '👨‍💼', text: 'Attorney Profiles' },
      { icon: '📋', text: 'Case Studies' },
      { icon: '📞', text: 'Free Consultation' },
      { icon: '📚', text: 'Legal Resources' },
      { icon: '🏆', text: 'Awards & Recognition' }
    ],
    'fitness': [
      { icon: '📅', text: 'Class Schedule' },
      { icon: '👤', text: 'Trainer Profiles' },
      { icon: '💪', text: 'Programs' },
      { icon: '💳', text: 'Membership Plans' },
      { icon: '📸', text: 'Facility Tour' },
      { icon: '📱', text: 'Mobile App Link' }
    ],
    'default': [
      { icon: '📱', text: 'Mobile Responsive' },
      { icon: '🎨', text: 'Custom Design' },
      { icon: '📧', text: 'Contact Form' },
      { icon: '📍', text: 'Location Map' },
      { icon: '📱', text: 'Social Links' },
      { icon: '🔍', text: 'SEO Optimized' }
    ]
  };

  return featureMap[industry] || featureMap['default'];
}

module.exports = {
  generatePreviewHtml
};
