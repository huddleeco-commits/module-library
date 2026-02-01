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
 * @param {Array<string>} config.features - List of enabled features (e.g., ['auth', 'portal', 'loyalty'])
 * @param {Object} config.portalConfig - Portal configuration (type, sections)
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
    metadata = {},
    features = [],
    portalConfig = null
  } = config;

  // Check if portal is enabled
  const hasPortal = features.includes('portal') || features.includes('auth');
  const hasLoyalty = features.includes('loyalty');

  // Determine portal type based on industry
  const portalType = portalConfig?.type || getPortalType(industry);

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

  // Generate navigation items (main site pages only)
  const mainNavPages = pages.filter(p => !['login', 'register', 'profile', 'portal', 'dashboard'].includes(p.toLowerCase()));
  const navItems = mainNavPages.map(page => {
    const label = page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<a href="#${page.toLowerCase()}" class="nav-link">${label}</a>`;
  }).join('\n            ');

  // Generate portal dropdown items based on industry/features
  const portalDropdownItems = hasPortal ? getPortalDropdownItems(industry, features) : [];
  const portalDropdownHtml = portalDropdownItems.map(item =>
    `<a href="#${item.href}" class="portal-dropdown-item">${item.icon} ${item.label}</a>`
  ).join('\n                  ');

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
  const industryFeatures = getIndustryFeatures(industry);
  const featureItems = industryFeatures.map(f => `
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

    /* ===== Responsive Header ===== */
    .site-header-preview {
      background: var(--background);
      border-radius: 16px 16px 0 0;
      padding: 0 16px;
      height: 70px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      position: relative;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .brand-icon {
      font-size: 28px;
    }

    .brand-name {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary);
      white-space: nowrap;
    }

    /* Desktop Navigation */
    .nav-links {
      display: none;
      align-items: center;
      gap: 8px;
    }

    @media (min-width: 769px) {
      .nav-links {
        display: flex;
      }
    }

    .nav-link {
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 8px;
      opacity: 0.75;
      transition: all 0.2s;
    }

    .nav-link:hover {
      opacity: 1;
      background: rgba(0,0,0,0.05);
    }

    /* Header Right Section */
    .header-right {
      display: none;
      align-items: center;
      gap: 12px;
    }

    @media (min-width: 769px) {
      .header-right {
        display: flex;
      }
    }

    /* Portal Dropdown */
    .portal-dropdown {
      position: relative;
    }

    .portal-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px 6px 6px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 100px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      transition: all 0.2s;
    }

    .portal-trigger:hover {
      background: #e5e7eb;
    }

    .portal-avatar {
      width: 28px;
      height: 28px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .portal-arrow {
      font-size: 10px;
      color: #6b7280;
      transition: transform 0.2s;
    }

    .portal-dropdown:hover .portal-arrow {
      transform: rotate(180deg);
    }

    .portal-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 220px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 0.2s;
      z-index: 100;
      overflow: hidden;
    }

    .portal-dropdown:hover .portal-dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .portal-dropdown-header {
      padding: 12px 16px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
    }

    .portal-dropdown-header-title {
      font-size: 14px;
      font-weight: 600;
    }

    .portal-dropdown-header-sub {
      font-size: 11px;
      opacity: 0.85;
    }

    .portal-dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      color: #374151;
      text-decoration: none;
      font-size: 13px;
      transition: background 0.15s;
    }

    .portal-dropdown-item:hover {
      background: #f9fafb;
    }

    .cta-button {
      background: var(--primary);
      color: white;
      padding: 8px 18px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cta-button:hover {
      filter: brightness(1.1);
    }

    /* Mobile Menu Button */
    .mobile-menu-btn {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      padding: 8px;
      background: none;
      border: none;
      cursor: pointer;
    }

    @media (min-width: 769px) {
      .mobile-menu-btn {
        display: none;
      }
    }

    .hamburger-line {
      display: block;
      width: 22px;
      height: 2px;
      background: #374151;
      border-radius: 2px;
      transition: all 0.3s;
    }

    /* Mobile Menu Overlay */
    .mobile-menu-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 200;
    }

    .mobile-menu-overlay.active {
      display: block;
    }

    .mobile-menu {
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      max-width: 85vw;
      height: 100%;
      background: white;
      padding: 20px 0;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
    }

    .mobile-menu-overlay.active .mobile-menu {
      transform: translateX(0);
    }

    .mobile-menu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px 16px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 8px;
    }

    .mobile-close {
      width: 32px;
      height: 32px;
      background: #f3f4f6;
      border: none;
      border-radius: 50%;
      font-size: 18px;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-section-label {
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #374151;
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
    }

    .mobile-nav-link:hover {
      background: #f3f4f6;
    }

    .mobile-portal-section {
      background: #f9fafb;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
    }

    .mobile-menu-footer {
      margin-top: auto;
      padding: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .mobile-login-btn {
      width: 100%;
      padding: 12px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }

    @media (max-width: 400px) {
      .brand-name {
        font-size: 16px;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
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
      <a href="#home" class="brand">
        <span class="brand-icon">${industryIcon}</span>
        <span class="brand-name">${businessName}</span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="nav-links">
        ${navItems}
      </nav>

      <!-- Header Right Section -->
      <div class="header-right">
        ${hasPortal ? `
        <!-- Portal Dropdown -->
        <div class="portal-dropdown">
          <button class="portal-trigger">
            <span class="portal-avatar">JD</span>
            <span>My ${portalType}</span>
            <span class="portal-arrow">▼</span>
          </button>
          <div class="portal-dropdown-menu">
            <div class="portal-dropdown-header">
              <div class="portal-dropdown-header-title">John Demo</div>
              <div class="portal-dropdown-header-sub">${portalType} Portal</div>
            </div>
            ${portalDropdownHtml}
            <a href="#logout" class="portal-dropdown-item" style="border-top: 1px solid #e5e7eb; color: #6b7280;">🚪 Sign Out</a>
          </div>
        </div>
        ` : `
        <a href="#contact" class="cta-button">Contact Us</a>
        `}
      </div>

      <!-- Mobile Menu Button -->
      <button class="mobile-menu-btn" onclick="document.getElementById('mobileMenu').classList.add('active')">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </header>

    <!-- Mobile Menu Overlay -->
    <div id="mobileMenu" class="mobile-menu-overlay" onclick="if(event.target === this) this.classList.remove('active')">
      <div class="mobile-menu">
        <div class="mobile-menu-header">
          <a href="#home" class="brand">
            <span class="brand-icon">${industryIcon}</span>
            <span class="brand-name" style="font-size: 16px;">${businessName}</span>
          </a>
          <button class="mobile-close" onclick="document.getElementById('mobileMenu').classList.remove('active')">✕</button>
        </div>

        <div class="mobile-section-label">Menu</div>
        ${mainNavPages.map(page => {
          const label = page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return `<a href="#${page.toLowerCase()}" class="mobile-nav-link" onclick="document.getElementById('mobileMenu').classList.remove('active')">${label}</a>`;
        }).join('\n        ')}

        ${hasPortal ? `
        <div class="mobile-portal-section">
          <div class="mobile-section-label">My ${portalType}</div>
          ${portalDropdownItems.map(item =>
            `<a href="#${item.href}" class="mobile-nav-link" onclick="document.getElementById('mobileMenu').classList.remove('active')">${item.icon} ${item.label}</a>`
          ).join('\n          ')}
        </div>
        ` : ''}

        <div class="mobile-menu-footer">
          ${hasPortal
            ? '<button class="mobile-login-btn" style="background: #f3f4f6; color: #6b7280;">Sign Out</button>'
            : '<button class="mobile-login-btn">Sign In</button>'
          }
        </div>
      </div>
    </div>

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

/**
 * Get portal type name based on industry
 */
function getPortalType(industry) {
  const portalTypes = {
    'restaurant': 'Account',
    'pizzeria': 'Account',
    'cafe': 'Account',
    'bakery': 'Account',
    'healthcare': 'Patient',
    'dental': 'Patient',
    'medical': 'Patient',
    'law-firm': 'Client',
    'legal': 'Client',
    'accounting': 'Client',
    'insurance': 'Policy',
    'real-estate': 'Client',
    'fitness': 'Member',
    'gym': 'Member',
    'spa-salon': 'Client',
    'salon': 'Client',
    'consulting': 'Client',
    'construction': 'Project',
    'automotive': 'Service',
    'pet-services': 'Pet',
    'default': 'Account'
  };

  return portalTypes[industry] || portalTypes['default'];
}

/**
 * Get portal dropdown items based on industry and features
 */
function getPortalDropdownItems(industry, features = []) {
  const hasLoyalty = features.includes('loyalty');
  const hasOrdering = features.includes('ordering');
  const hasAppointments = features.includes('appointments');
  const hasReservations = features.includes('reservations');

  // Base portal items for all industries
  const baseItems = [
    { icon: '👤', label: 'My Profile', href: 'profile' },
  ];

  // Industry-specific items
  const industryItems = {
    'restaurant': [
      ...(hasOrdering ? [{ icon: '📦', label: 'My Orders', href: 'orders' }] : []),
      ...(hasReservations ? [{ icon: '📅', label: 'Reservations', href: 'reservations' }] : []),
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: 'rewards' }] : []),
      { icon: '❤️', label: 'Favorites', href: 'favorites' },
    ],
    'pizzeria': [
      { icon: '📦', label: 'Order History', href: 'orders' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards Points', href: 'rewards' }] : []),
      { icon: '📍', label: 'Saved Addresses', href: 'addresses' },
    ],
    'cafe': [
      { icon: '📦', label: 'Order History', href: 'orders' },
      ...(hasLoyalty ? [{ icon: '☕', label: 'Coffee Club', href: 'rewards' }] : []),
    ],
    'healthcare': [
      { icon: '📅', label: 'Appointments', href: 'appointments' },
      { icon: '📋', label: 'Medical Records', href: 'records' },
      { icon: '💊', label: 'Prescriptions', href: 'prescriptions' },
      { icon: '🧪', label: 'Lab Results', href: 'labs' },
      { icon: '💳', label: 'Billing', href: 'billing' },
    ],
    'dental': [
      { icon: '📅', label: 'Appointments', href: 'appointments' },
      { icon: '🦷', label: 'Treatment History', href: 'treatments' },
      { icon: '📄', label: 'Forms', href: 'forms' },
      { icon: '💳', label: 'Billing', href: 'billing' },
    ],
    'law-firm': [
      { icon: '📁', label: 'My Cases', href: 'cases' },
      { icon: '📄', label: 'Documents', href: 'documents' },
      { icon: '💬', label: 'Messages', href: 'messages' },
      { icon: '💳', label: 'Billing', href: 'billing' },
    ],
    'real-estate': [
      { icon: '❤️', label: 'Saved Homes', href: 'saved' },
      { icon: '🔔', label: 'Search Alerts', href: 'alerts' },
      { icon: '📅', label: 'Showings', href: 'showings' },
      { icon: '📄', label: 'Documents', href: 'documents' },
    ],
    'accounting': [
      { icon: '📄', label: 'Tax Returns', href: 'returns' },
      { icon: '📁', label: 'Documents', href: 'documents' },
      { icon: '📊', label: 'Financial Reports', href: 'reports' },
      { icon: '💳', label: 'Invoices', href: 'invoices' },
    ],
    'insurance': [
      { icon: '📋', label: 'My Policies', href: 'policies' },
      { icon: '📝', label: 'Claims', href: 'claims' },
      { icon: '🪪', label: 'ID Cards', href: 'cards' },
      { icon: '💳', label: 'Payments', href: 'payments' },
    ],
    'fitness': [
      { icon: '📅', label: 'Class Schedule', href: 'schedule' },
      { icon: '💳', label: 'Membership', href: 'membership' },
      { icon: '📊', label: 'Progress', href: 'progress' },
      ...(hasLoyalty ? [{ icon: '🏆', label: 'Rewards', href: 'rewards' }] : []),
    ],
    'spa-salon': [
      { icon: '📅', label: 'Appointments', href: 'appointments' },
      { icon: '📦', label: 'Purchase History', href: 'history' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: 'rewards' }] : []),
    ],
    'construction': [
      { icon: '🏗️', label: 'My Projects', href: 'projects' },
      { icon: '📄', label: 'Documents', href: 'documents' },
      { icon: '📅', label: 'Schedule', href: 'schedule' },
      { icon: '💳', label: 'Invoices', href: 'invoices' },
    ],
    'automotive': [
      { icon: '🚗', label: 'My Vehicles', href: 'vehicles' },
      { icon: '🔧', label: 'Service History', href: 'history' },
      { icon: '📅', label: 'Appointments', href: 'appointments' },
      { icon: '💳', label: 'Invoices', href: 'invoices' },
    ],
    'pet-services': [
      { icon: '🐕', label: 'My Pets', href: 'pets' },
      { icon: '📅', label: 'Appointments', href: 'appointments' },
      { icon: '📋', label: 'Vaccine Records', href: 'records' },
      ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: 'rewards' }] : []),
    ],
  };

  // Get industry-specific items or default
  const specificItems = industryItems[industry] || [
    ...(hasOrdering ? [{ icon: '📦', label: 'Orders', href: 'orders' }] : []),
    ...(hasAppointments ? [{ icon: '📅', label: 'Appointments', href: 'appointments' }] : []),
    ...(hasLoyalty ? [{ icon: '⭐', label: 'Rewards', href: 'rewards' }] : []),
    { icon: '💬', label: 'Messages', href: 'messages' },
  ];

  return [...baseItems, ...specificItems, { icon: '⚙️', label: 'Settings', href: 'settings' }];
}

module.exports = {
  generatePreviewHtml,
  getPortalType,
  getPortalDropdownItems
};
