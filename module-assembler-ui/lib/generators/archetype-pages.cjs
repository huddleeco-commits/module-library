/**
 * Archetype-Based Page Generators
 *
 * Generates pages based on the 3 layout archetypes:
 * - ecommerce: Modern, conversion-focused
 * - luxury: Elegant, editorial
 * - local: Warm, community-focused
 */

const { getArchetype, detectArchetype, getArchetypeStyles } = require('../config/layout-archetypes.cjs');
const { getHeroImage, getHeroImages } = require('../config/hero-images.cjs');
const { getWinningElementsForIndustry, getElementsByPlacement, getHighPriorityElements } = require('../../config/winning-elements.cjs');
const { getResearchLayout, getResearchLayoutVariants, getResearchSectionOrder, getResearchLayoutFeatures } = require('../../config/industry-layouts.cjs');

/**
 * Generate HomePage based on archetype
 * @param {object} styleOverrides - Theme/mood settings from UI (isDark, fontHeading, fontBody, borderRadius, etc.)
 */
function generateHomePage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const address = businessData.address || '';
  const phone = businessData.phone || '';
  const tagline = businessData.tagline || `Your trusted local ${businessData.industry || 'business'}`;
  const year = businessData.yearFounded || '2020';

  // Merge archetype colors with provided colors, then apply theme overrides
  let c = { ...style.colors, ...colors };

  // Apply dark/medium theme if specified
  const isDark = styleOverrides.isDark || false;
  const isMedium = styleOverrides.isMedium || false;

  if (isDark) {
    c = {
      ...c,
      background: '#0f172a',
      backgroundAlt: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      cardBg: '#1e293b',
      borderColor: '#334155',
      secondary: '#3b82f6'
    };
  } else if (isMedium) {
    c = {
      ...c,
      background: '#f0f0f0',
      backgroundAlt: '#e5e5e5',
      text: '#1f2937',
      textMuted: '#4b5563',
      cardBg: '#ffffff',
      borderColor: '#d1d5db'
    };
  }

  // ALWAYS apply styleOverrides.colors (design research themes) - they take precedence
  if (styleOverrides.colors) {
    c = { ...c, ...styleOverrides.colors };
  }

  if (!c.backgroundAlt) {
    c.backgroundAlt = isDark ? '#1e293b' : (isMedium ? '#e5e5e5' : '#f8fafc');
  }

  const themeStyle = {
    ...style,
    fontHeading: styleOverrides.fontHeading || style.fontHeading || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || style.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '32px',
    headlineStyle: styleOverrides.headlineStyle || 'none',
    buttonPadding: styleOverrides.buttonStyle?.padding || '16px 32px',
    isDark: isDark,
    isMedium: isMedium
  };

  if (arch.id === 'ecommerce') {
    return generateEcommerceHomePage(businessName, tagline, address, phone, c, themeStyle, businessData);
  } else if (arch.id === 'luxury') {
    return generateLuxuryHomePage(businessName, tagline, address, phone, c, themeStyle, businessData);
  } else {
    return generateLocalHomePage(businessName, tagline, address, phone, year, c, themeStyle, businessData);
  }
}

/**
 * E-Commerce Focus HomePage
 */
function generateEcommerceHomePage(businessName, tagline, address, phone, colors, style, businessData = {}) {
  const industry = businessData.industry || 'bakery';
  // Use fixture hero image first, fall back to generic industry image
  const genericHeroImage = getHeroImage(industry, 'primary');
  const heroImageUrl = businessData.heroImage || genericHeroImage;
  const heroImages = getHeroImages(industry, 'primary');
  const productImages = getHeroImages(industry, 'products') || heroImages;

  // Extract AI-generated content if available
  const aiContent = businessData.aiContent || null;
  const aiMenu = businessData.aiMenu || null;
  const hasAI = businessData.hasAIContent || false;

  // Extract AI visual strategies
  const aiImagery = businessData.aiImageryGuidance || null;
  const aiTypography = businessData.aiTypographyStrategy || null;

  // Determine image filter based on AI imagery guidance
  // ecommerce archetype - crisp, high-contrast by default
  let imageFilter = 'none';
  if (aiImagery?.style === 'moody-dark') {
    imageFilter = 'brightness(0.92) contrast(1.1)';
  } else if (aiImagery?.style === 'bright-airy') {
    imageFilter = 'brightness(1.05) saturate(1.1)';
  } else if (aiImagery?.style === 'soft-muted') {
    imageFilter = 'saturate(0.85) brightness(1.02)';
  } else if (aiImagery?.style === 'high-contrast') {
    imageFilter = 'contrast(1.15) saturate(1.1)';
  } else if (aiImagery?.style === 'natural-light') {
    imageFilter = 'brightness(1.03) saturate(1.05)';
  }

  // Log AI visual decisions if present
  if (hasAI && aiImagery) {
    console.log(`      🖼️ AI imagery (ecommerce): ${aiImagery.style} → filter: ${imageFilter}`);
  }

  // Priority: fixture data > AI content > defaults
  const heroHeadline = businessData.heroHeadline || aiContent?.hero?.headline || tagline;
  const heroSubheadline = businessData.heroSubheadline || aiContent?.hero?.subheadline || 'Fresh-baked happiness delivered to your door. Order online for pickup or nationwide shipping.';
  const heroCta = businessData.heroCta || aiContent?.hero?.cta || 'Order Pickup';
  const heroSecondaryCta = businessData.heroSecondaryCta || aiContent?.hero?.secondaryCta || 'Ship Nationwide';

  // AI-enhanced menu items (fall back to defaults)
  const menuItems = aiMenu?.categories?.[0]?.items || [];
  const product1 = menuItems[0] || { name: 'Signature Item', price: 4.50 };
  const product2 = menuItems[1] || { name: 'Popular Pick', price: 6.00 };
  const product3 = menuItems[2] || { name: 'Fresh Daily', price: 4.00 };
  const product4 = menuItems[3] || { name: 'New Arrival', price: 3.50 };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Award, Star, Clock } from 'lucide-react';

export default function HomePage() {
  const featuredProducts = [
    { id: 1, name: '${product1.name.replace(/'/g, "\\'")}', price: '$${typeof product1.price === 'number' ? product1.price.toFixed(2) : product1.price}', image: '${productImages[0] || heroImages[0]}', badge: 'Best Seller' },
    { id: 2, name: '${product2.name.replace(/'/g, "\\'")}', price: '$${typeof product2.price === 'number' ? product2.price.toFixed(2) : product2.price}', image: '${productImages[1] || heroImages[1] || heroImages[0]}', badge: 'Popular' },
    { id: 3, name: '${product3.name.replace(/'/g, "\\'")}', price: '$${typeof product3.price === 'number' ? product3.price.toFixed(2) : product3.price}', image: '${productImages[2] || heroImages[2] || heroImages[0]}', badge: null },
    { id: 4, name: '${product4.name.replace(/'/g, "\\'")}', price: '$${typeof product4.price === 'number' ? product4.price.toFixed(2) : product4.price}', image: '${productImages[3] || heroImages[0]}', badge: 'New' }
  ];

  const categories = [
    { name: 'Featured', image: '${heroImages[0]}', link: '/menu?cat=featured' },
    { name: 'Specialties', image: '${heroImages[1] || heroImages[0]}', link: '/menu?cat=specialties' },
    { name: 'Popular', image: '${heroImages[2] || heroImages[0]}', link: '/menu?cat=popular' }
  ];

  return (
    <div style={{ background: '${colors.background}' }}>
      {/* Announcement Bar */}
      <div style={styles.announcementBar}>
        <span>Free shipping on orders over $50! Use code SWEET20 for 20% off</span>
      </div>

      {/* Hero Section - Split Layout */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroImages}>
            <img src="${heroImageUrl}" alt="Featured" style={styles.heroMainImage} />
          </div>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>${heroHeadline.replace(/'/g, "\\'")}</h1>
            <p style={styles.heroSubtitle}>${heroSubheadline.replace(/'/g, "\\'")}</p>
            <div style={styles.heroCtas}>
              <Link to="/menu" style={styles.primaryBtn}>
                <ShoppingBag size={18} /> ${heroCta.replace(/'/g, "\\'")}
              </Link>
              <Link to="/menu" style={styles.secondaryBtn}>
                <Truck size={18} /> ${heroSecondaryCta.replace(/'/g, "\\'")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div style={styles.trustStrip}>
        <div style={styles.trustItem}><Star size={16} /> Baked Fresh Daily</div>
        <div style={styles.trustItem}><Truck size={16} /> Free Shipping $50+</div>
        <div style={styles.trustItem}><Award size={16} /> 100% Satisfaction</div>
        <div style={styles.trustItem}><Clock size={16} /> Same-Day Pickup</div>
      </div>

      {/* Featured Products */}
      <section style={styles.featured}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Fan Favorites</h2>
            <Link to="/menu" style={styles.viewAllLink}>Shop All <ArrowRight size={16} /></Link>
          </div>
          <div style={styles.productGrid}>
            {featuredProducts.map(product => (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.productImageWrap}>
                  <img src={product.image} alt={product.name} style={styles.productImage} />
                  {product.badge && <span style={styles.productBadge}>{product.badge}</span>}
                </div>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>{product.price}</p>
                <button style={styles.addToCartBtn}>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={styles.categories}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
          <div style={styles.categoryGrid}>
            {categories.map((cat, i) => (
              <Link key={i} to={cat.link} style={styles.categoryCard}>
                <img src={cat.image} alt={cat.name} style={styles.categoryImage} />
                <div style={styles.categoryOverlay}>
                  <span style={styles.categoryName}>{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  announcementBar: { background: '${colors.primary}', color: '#fff', padding: '10px 20px', textAlign: 'center', fontSize: '14px' },
  hero: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt}' },
  heroContainer: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' },
  heroImages: { display: 'grid', gap: '16px' },
  heroMainImage: { width: '100%', borderRadius: '${style.borderRadius}', objectFit: 'cover', maxHeight: '400px', filter: '${imageFilter}' },
  heroContent: {},
  heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', color: '${colors.text}', marginBottom: '16px', lineHeight: 1.2 },
  heroSubtitle: { color: '${colors.textMuted}', fontSize: '1.1rem', marginBottom: '24px', lineHeight: 1.6 },
  heroCtas: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${colors.primary}', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none', fontSize: '1rem' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '${colors.primary}', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none', border: '2px solid ${colors.primary}' },
  trustStrip: { display: 'flex', justifyContent: 'center', gap: '32px', padding: '20px', background: '${colors.background}', borderBottom: '1px solid ${colors.borderColor || "#e5e7eb"}', flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: '8px', color: '${colors.textMuted}', fontSize: '14px' },
  featured: { padding: '${style.sectionPadding}' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.75rem', fontWeight: '700', color: '${colors.text}' },
  viewAllLink: { display: 'flex', alignItems: 'center', gap: '4px', color: '${colors.primary}', textDecoration: 'none', fontWeight: '600' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
  productCard: { background: '${colors.cardBg || "#fff"}', borderRadius: '${style.borderRadius}', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  productImageWrap: { position: 'relative' },
  productImage: { width: '100%', height: '200px', objectFit: 'cover', filter: '${imageFilter}' },
  productBadge: { position: 'absolute', top: '12px', left: '12px', background: '${colors.primary}', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  productName: { fontFamily: "${style.fontHeading}", fontWeight: '600', padding: '16px 16px 4px', color: '${colors.text}' },
  productPrice: { padding: '0 16px', color: '${colors.primary}', fontWeight: '700', fontSize: '1.1rem' },
  addToCartBtn: { margin: '16px', width: 'calc(100% - 32px)', background: '${colors.primary}', color: '#fff', border: 'none', padding: '12px', borderRadius: '${style.borderRadius}', fontWeight: '600', cursor: 'pointer' },
  categories: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt}' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  categoryCard: { position: 'relative', borderRadius: '${style.borderRadius}', overflow: 'hidden', aspectRatio: '16/9', textDecoration: 'none' },
  categoryImage: { width: '100%', height: '100%', objectFit: 'cover', filter: '${imageFilter}' },
  categoryOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', padding: '20px' },
  categoryName: { color: '#fff', fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '600' }
};
`;
}

/**
 * Luxury/Premium HomePage
 */
function generateLuxuryHomePage(businessName, tagline, address, phone, colors, style, businessData = {}) {
  const industry = businessData.industry || 'bakery';
  const genericHeroImages = getHeroImages(industry, 'primary');
  // Use fixture hero image if available
  const heroImages = businessData.heroImage
    ? [businessData.heroImage, ...genericHeroImages.slice(1)]
    : genericHeroImages;
  const productImages = getHeroImages(industry, 'products') || heroImages;

  // Extract AI-generated content if available
  const aiContent = businessData.aiContent || null;
  const aiMenu = businessData.aiMenu || null;
  const hasAI = businessData.hasAIContent || false;

  // Extract AI visual strategies
  const aiImagery = businessData.aiImageryGuidance || null;
  const aiTypography = businessData.aiTypographyStrategy || null;
  const aiColors = businessData.aiColorStrategy || null;

  // Determine image filter based on AI imagery guidance
  // moody-dark → grayscale + dark, bright-airy → none, soft-muted → grayscale(10%)
  let imageFilter = 'grayscale(20%)'; // default luxury feel
  if (aiImagery?.style === 'moody-dark') {
    imageFilter = 'grayscale(30%) brightness(0.9)';
  } else if (aiImagery?.style === 'bright-airy') {
    imageFilter = 'brightness(1.05) saturate(1.1)';
  } else if (aiImagery?.style === 'soft-muted') {
    imageFilter = 'grayscale(15%) saturate(0.9)';
  } else if (aiImagery?.style === 'high-contrast') {
    imageFilter = 'contrast(1.1) saturate(1.2)';
  }

  // Priority: fixture data > AI content > defaults
  const heroHeadline = businessData.heroHeadline || aiContent?.hero?.headline || 'The Art of Pastry';
  const heroSubheadline = businessData.heroSubheadline || aiContent?.hero?.subheadline || 'Handcrafted with passion';
  const heroCta = businessData.heroCta || aiContent?.hero?.cta || 'Explore Collection';
  const brandStatement = aiContent?.about?.paragraphs?.[0] || 'Where tradition meets artistry. Each creation is a testament to our unwavering commitment to excellence.';
  const ctaHeadline = aiContent?.ctaSection?.headline || 'Experience Excellence';
  const ctaSubtext = aiContent?.ctaSection?.subtext || 'Visit our atelier or order for delivery';

  // AI-enhanced menu items (fall back to defaults)
  const menuItems = aiMenu?.categories?.[0]?.items || [];
  const product1 = menuItems[0] || { name: 'Signature Item', price: 48, description: '' };
  const product2 = menuItems[1] || { name: 'Popular Choice', price: 52, description: '' };
  const product3 = menuItems[2] || { name: 'Classic', price: 6, description: '' };

  // Log AI visual decisions if present
  if (hasAI) {
    console.log(`      🖼️ AI imagery: ${aiImagery?.style || 'default'} → filter: ${imageFilter}`);
    if (aiTypography) console.log(`      ✍️ AI typography: ${aiTypography.headingStyle} headings, ${aiTypography.mood} mood`);
  }

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: '${heroImages[0]}', title: '${heroHeadline.replace(/'/g, "\\'")}', subtitle: '${heroSubheadline.replace(/'/g, "\\'")}' },
    { image: '${heroImages[1] || heroImages[0]}', title: 'Seasonal Collection', subtitle: 'Discover our latest offerings' },
    { image: '${heroImages[2] || heroImages[0]}', title: 'Made Fresh Daily', subtitle: 'Using the finest ingredients' }
  ];

  const signatureProducts = [
    { name: '${product1.name.replace(/'/g, "\\'")}', image: '${productImages[0] || heroImages[0]}', price: '$${typeof product1.price === 'number' ? product1.price.toFixed(2) : product1.price}' },
    { name: '${product2.name.replace(/'/g, "\\'")}', image: '${productImages[1] || heroImages[0]}', price: '$${typeof product2.price === 'number' ? product2.price.toFixed(2) : product2.price}' },
    { name: '${product3.name.replace(/'/g, "\\'")}', image: '${productImages[2] || heroImages[0]}', price: '$${typeof product3.price === 'number' ? product3.price.toFixed(2) : product3.price}' }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div style={styles.page}>
      {/* Hero Carousel */}
      <section style={styles.hero}>
        <div style={styles.slide}>
          <img src={slides[currentSlide].image} alt="" style={styles.slideImage} />
          <div style={styles.slideOverlay}>
            <div style={styles.slideContent}>
              <span style={styles.slideLabel}>ARTISAN ${industry.toUpperCase()}</span>
              <h1 style={styles.slideTitle}>{slides[currentSlide].title}</h1>
              <p style={styles.slideSubtitle}>{slides[currentSlide].subtitle}</p>
              <Link to="/menu" style={styles.slideBtn}>${heroCta.replace(/'/g, "\\'")} <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
        <button onClick={prevSlide} style={{...styles.navBtn, left: '24px'}}><ChevronLeft size={24} /></button>
        <button onClick={nextSlide} style={{...styles.navBtn, right: '24px'}}><ChevronRight size={24} /></button>
        <div style={styles.dots}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{...styles.dot, opacity: i === currentSlide ? 1 : 0.4}} />
          ))}
        </div>
      </section>

      {/* Brand Statement */}
      <section style={styles.statement}>
        <p style={styles.statementText}>
          ${brandStatement.replace(/'/g, "\\'")}
        </p>
      </section>

      {/* Signature Products */}
      <section style={styles.products}>
        <div style={styles.container}>
          <h2 style={styles.sectionLabel}>SIGNATURE COLLECTION</h2>
          <div style={styles.productGrid}>
            {signatureProducts.map((product, i) => (
              <Link key={i} to="/menu" style={styles.productCard}>
                <div style={styles.productImageWrap}>
                  <img src={product.image} alt={product.name} style={styles.productImage} />
                </div>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>{product.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>${ctaHeadline.replace(/'/g, "\\'")}</h2>
        <p style={styles.ctaText}>${ctaSubtext.replace(/'/g, "\\'")}</p>
        <div style={styles.ctaBtns}>
          <Link to="/menu" style={styles.ctaBtn}>View Menu</Link>
          <Link to="/contact" style={styles.ctaBtnOutline}>Book a Visit</Link>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', color: '${colors.text}' },
  hero: { position: 'relative', height: '85vh', minHeight: '600px' },
  slide: { height: '100%', position: 'relative' },
  slideImage: { width: '100%', height: '100%', objectFit: 'cover' },
  slideOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)', display: 'flex', alignItems: 'center' },
  slideContent: { padding: '0 80px', maxWidth: '600px' },
  slideLabel: { color: '${colors.accent || "#d4af37"}', letterSpacing: '4px', fontSize: '0.85rem', marginBottom: '16px', display: 'block' },
  slideTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '300', marginBottom: '16px', lineHeight: 1.1, color: '#fff' },
  slideSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '32px' },
  slideBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '${colors.accent || "#d4af37"}', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '2px', borderBottom: '1px solid ${colors.accent || "#d4af37"}', paddingBottom: '4px' },
  navBtn: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer' },
  statement: { padding: '100px 24px', textAlign: 'center', background: '${colors.backgroundAlt}' },
  statementText: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '300', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6, color: '${colors.text}' },
  products: { padding: '100px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  sectionLabel: { textAlign: 'center', letterSpacing: '4px', fontSize: '0.85rem', color: '${colors.accent || "#d4af37"}', marginBottom: '48px' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' },
  productCard: { textDecoration: 'none', color: '${colors.text}' },
  productImageWrap: { overflow: 'hidden', marginBottom: '20px' },
  productImage: { width: '100%', aspectRatio: '4/5', objectFit: 'cover', transition: 'transform 0.5s', filter: '${imageFilter}' },
  productName: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '400', marginBottom: '8px' },
  productPrice: { color: '${colors.accent || "#d4af37"}', letterSpacing: '1px' },
  cta: { padding: '120px 24px', textAlign: 'center', background: '${colors.backgroundAlt}' },
  ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '300', marginBottom: '16px' },
  ctaText: { color: '${colors.textMuted}', marginBottom: '32px' },
  ctaBtns: { display: 'flex', gap: '16px', justifyContent: 'center' },
  ctaBtn: { background: '${colors.accent || "#d4af37"}', color: '${colors.background}', padding: '16px 40px', textDecoration: 'none', letterSpacing: '2px', fontSize: '0.85rem' },
  ctaBtnOutline: { background: 'transparent', color: '${colors.text}', padding: '16px 40px', textDecoration: 'none', letterSpacing: '2px', fontSize: '0.85rem', border: '1px solid ${colors.text}' }
};
`;
}

/**
 * Local/Community Focus HomePage
 */
function generateLocalHomePage(businessName, tagline, address, phone, year, colors, style, businessData = {}) {
  const industry = businessData.industry || 'bakery';
  // Use fixture hero image first, fall back to generic industry image
  const genericHeroImage = getHeroImage(industry, 'primary');
  const heroImageUrl = businessData.heroImage || genericHeroImage;

  // Extract AI-generated content if available
  const aiContent = businessData.aiContent || null;
  const aiMenu = businessData.aiMenu || null;
  const hasAI = businessData.hasAIContent || false;

  // Extract AI visual strategies
  const aiImagery = businessData.aiImageryGuidance || null;
  const aiTypography = businessData.aiTypographyStrategy || null;

  // Determine image filter based on AI imagery guidance
  let imageFilter = 'none'; // local archetype default - warm, natural
  if (aiImagery?.style === 'moody-dark') {
    imageFilter = 'brightness(0.95) saturate(1.1)';
  } else if (aiImagery?.style === 'bright-airy') {
    imageFilter = 'brightness(1.08) saturate(1.15)';
  } else if (aiImagery?.style === 'soft-muted') {
    imageFilter = 'saturate(0.9) brightness(1.02)';
  } else if (aiImagery?.style === 'high-contrast') {
    imageFilter = 'contrast(1.1) saturate(1.1)';
  } else if (aiImagery?.style === 'natural-light') {
    imageFilter = 'brightness(1.05)';
  }

  // Log AI visual decisions if present
  if (hasAI && aiImagery) {
    console.log(`      🖼️ AI imagery (local): ${aiImagery.style} → filter: ${imageFilter}`);
  }

  // Priority: fixture data > AI content > defaults
  const heroHeadline = businessData.heroHeadline || aiContent?.hero?.headline || businessName;
  const heroSubtitle = businessData.heroSubheadline || aiContent?.hero?.subheadline || tagline || `Your trusted local ${industry}`;
  const heroCta = businessData.heroCta || aiContent?.hero?.cta || 'View Our Menu';
  const aboutTitle = aiContent?.about?.headline || "Today's Fresh Picks";
  const aboutSubtitle = aiContent?.services?.intro || 'Baked fresh this morning, just for you';

  // AI-enhanced menu items (fall back to defaults)
  const menuItems = aiMenu?.categories?.[0]?.items || [];
  const special1 = menuItems[0] || { name: 'Butter Croissant', description: 'Flaky, golden, fresh from the oven', price: 4.50 };
  const special2 = menuItems[1] || { name: 'Red Velvet Cupcake', description: 'Cream cheese frosting, moist cake', price: 5.00 };
  const special3 = menuItems[2] || { name: 'Sourdough Loaf', description: '24-hour fermented, crusty perfection', price: 8.00 };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Award, Heart, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const specials = [
    { name: '${special1.name.replace(/'/g, "\\'")}', description: '${(special1.description || '').replace(/'/g, "\\'")}', price: '$${typeof special1.price === 'number' ? special1.price.toFixed(2) : special1.price}', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
    { name: '${special2.name.replace(/'/g, "\\'")}', description: '${(special2.description || '').replace(/'/g, "\\'")}', price: '$${typeof special2.price === 'number' ? special2.price.toFixed(2) : special2.price}', image: 'https://images.unsplash.com/photo-1519869325930-281384f3a0d8?w=400' },
    { name: '${special3.name.replace(/'/g, "\\'")}', description: '${(special3.description || '').replace(/'/g, "\\'")}', price: '$${typeof special3.price === 'number' ? special3.price.toFixed(2) : special3.price}', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' }
  ];

  const reviews = [
    { text: "Best bakery in town! The croissants are out of this world.", author: "Sarah M.", stars: 5 },
    { text: "My family has been coming here for years. Always fresh, always delicious.", author: "Mike R.", stars: 5 },
    { text: "The birthday cake they made for my daughter was perfect!", author: "Lisa T.", stars: 5 }
  ];

  return (
    <div style={{ background: '${colors.background}' }}>
      {/* Hero - Warm, Inviting */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.badge}><Heart size={14} /> Family Owned Since ${year}</div>
          <h1 style={styles.heroTitle}>${heroHeadline.replace(/'/g, "\\'")}</h1>
          <p style={styles.heroSubtitle}>${heroSubtitle.replace(/'/g, "\\'")}</p>
          <div style={styles.heroCtas}>
            <Link to="/menu" style={styles.primaryBtn}>${heroCta.replace(/'/g, "\\'")}</Link>
            <a href="tel:${phone}" style={styles.secondaryBtn}><Phone size={18} /> Call Us</a>
          </div>
          <div style={styles.heroInfo}>
            <span><MapPin size={16} /> ${address || 'Visit us today!'}</span>
            <span><Clock size={16} /> Open 7am - 6pm Daily</span>
          </div>
        </div>
      </section>

      {/* Daily Specials */}
      <section style={styles.specials}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>${aboutTitle.replace(/'/g, "\\'")}</h2>
            <p style={styles.sectionSubtitle}>${aboutSubtitle.replace(/'/g, "\\'")}</p>
          </div>
          <div style={styles.specialsGrid}>
            {specials.map((item, i) => (
              <div key={i} style={styles.specialCard}>
                <img src={item.image} alt={item.name} style={styles.specialImage} />
                <div style={styles.specialInfo}>
                  <h3 style={styles.specialName}>{item.name}</h3>
                  <p style={styles.specialDesc}>{item.description}</p>
                  <p style={styles.specialPrice}>{item.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.centerCta}>
            <Link to="/menu" style={styles.outlineBtn}>See Full Menu <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={styles.story}>
        <div style={styles.storyContainer}>
          <img src="${heroImageUrl}" alt="Our story" style={styles.storyImage} />
          <div style={styles.storyContent}>
            <h2 style={styles.storyTitle}>Our Story</h2>
            <p style={styles.storyText}>
              For over ${new Date().getFullYear() - parseInt(year)} years, we've been waking up before dawn to bring you
              the freshest baked goods in the neighborhood. What started as a family recipe
              has grown into a community tradition.
            </p>
            <p style={styles.storyText}>
              We believe in simple ingredients, time-honored techniques, and treating
              every customer like family. Thank you for being part of our journey.
            </p>
            <Link to="/about" style={styles.storyLink}>Learn More About Us <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={styles.reviews}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitleCenter}>What Our Neighbors Say</h2>
          <div style={styles.reviewsGrid}>
            {reviews.map((review, i) => (
              <div key={i} style={styles.reviewCard}>
                <div style={styles.stars}>
                  {[...Array(review.stars)].map((_, j) => <Star key={j} size={16} fill="${colors.primary}" color="${colors.primary}" />)}
                </div>
                <p style={styles.reviewText}>"{review.text}"</p>
                <p style={styles.reviewAuthor}>— {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Bar */}
      <section style={styles.contactBar}>
        <div style={styles.contactContent}>
          <div>
            <h3 style={styles.contactTitle}>Come Visit Us!</h3>
            <p style={styles.contactText}>${address}</p>
          </div>
          <a href="tel:${phone}" style={styles.contactBtn}><Phone size={20} /> ${phone}</a>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { position: 'relative', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(${heroImageUrl})', backgroundSize: 'cover', backgroundPosition: 'center' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))' },
  heroContent: { position: 'relative', textAlign: 'center', padding: '40px 24px', color: '#fff', maxWidth: '700px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '8px 20px', borderRadius: '30px', marginBottom: '24px', fontSize: '0.9rem' },
  heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '700', marginBottom: '16px', textShadow: '0 2px 20px rgba(0,0,0,0.3)' },
  heroSubtitle: { fontSize: '1.25rem', marginBottom: '32px', opacity: 0.95 },
  heroCtas: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' },
  primaryBtn: { background: '${colors.primary}', color: '#fff', padding: '16px 32px', borderRadius: '${style.borderRadius}', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' },
  secondaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', padding: '16px 32px', borderRadius: '${style.borderRadius}', textDecoration: 'none', fontWeight: '600' },
  heroInfo: { display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.95rem', opacity: 0.9 },
  specials: { padding: '${style.sectionPadding}' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  sectionHeader: { textAlign: 'center', marginBottom: '48px' },
  sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '12px' },
  sectionTitleCenter: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', textAlign: 'center', marginBottom: '48px' },
  sectionSubtitle: { color: '${colors.textMuted}', fontSize: '1.1rem' },
  specialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' },
  specialCard: { background: '${colors.cardBg || "#fff"}', borderRadius: '${style.borderRadius}', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  specialImage: { width: '100%', height: '200px', objectFit: 'cover', filter: '${imageFilter}' },
  specialInfo: { padding: '20px' },
  specialName: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${colors.text}', marginBottom: '8px' },
  specialDesc: { color: '${colors.textMuted}', marginBottom: '12px', lineHeight: 1.5 },
  specialPrice: { color: '${colors.primary}', fontWeight: '700', fontSize: '1.2rem' },
  centerCta: { textAlign: 'center', marginTop: '40px' },
  outlineBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '${colors.primary}', border: '2px solid ${colors.primary}', padding: '14px 28px', borderRadius: '${style.borderRadius}', textDecoration: 'none', fontWeight: '600' },
  story: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt}' },
  storyContainer: { maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center', padding: '0 24px' },
  storyImage: { width: '100%', borderRadius: '${style.borderRadius}', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', filter: '${imageFilter}' },
  storyContent: {},
  storyTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '20px' },
  storyText: { color: '${colors.textMuted}', lineHeight: 1.8, marginBottom: '16px', fontSize: '1.05rem' },
  storyLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '${colors.primary}', textDecoration: 'none', fontWeight: '600', marginTop: '8px' },
  reviews: { padding: '${style.sectionPadding}' },
  reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  reviewCard: { background: '${colors.cardBg || "#fff"}', padding: '28px', borderRadius: '${style.borderRadius}', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  stars: { display: 'flex', gap: '4px', marginBottom: '16px' },
  reviewText: { color: '${colors.text}', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' },
  reviewAuthor: { color: '${colors.textMuted}', fontWeight: '500' },
  contactBar: { background: '${colors.primary}', padding: '32px 24px' },
  contactContent: { maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' },
  contactTitle: { color: '#fff', fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' },
  contactText: { color: 'rgba(255,255,255,0.9)' },
  contactBtn: { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', color: '${colors.primary}', padding: '16px 32px', borderRadius: '${style.borderRadius}', textDecoration: 'none', fontWeight: '700', fontSize: '1.1rem' }
};
`;
}

/**
 * Generate MenuPage based on archetype
 */
function generateMenuPage(archetype, businessData, colors, menuData, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';

  let c = { ...style.colors, ...colors };
  const isDark = styleOverrides.isDark || false;
  if (isDark) {
    c = { ...c, background: '#0f172a', text: '#f8fafc', textMuted: '#94a3b8' };
  }

  const themeStyle = {
    ...style,
    fontHeading: styleOverrides.fontHeading || style.fontHeading || "'Inter', sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px'
  };

  if (arch.id === 'ecommerce') {
    return generateEcommerceMenuPage(businessName, menuData, c, themeStyle);
  } else if (arch.id === 'luxury') {
    return generateLuxuryMenuPage(businessName, menuData, c, themeStyle);
  } else {
    return generateLocalMenuPage(businessName, menuData, c, themeStyle);
  }
}

function generateLocalMenuPage(businessName, menuData, colors, style) {
  return `import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'breads', 'pastries', 'cakes', 'drinks'];

  const menuItems = [
    { name: 'Sourdough Loaf', category: 'breads', price: '$8.00', description: 'Our signature 24-hour fermented loaf', popular: true },
    { name: 'Butter Croissant', category: 'pastries', price: '$4.50', description: 'Flaky, buttery perfection', popular: true },
    { name: 'Chocolate Cake', category: 'cakes', price: '$32.00', description: 'Rich chocolate layers with ganache', popular: false },
    { name: 'Cinnamon Roll', category: 'pastries', price: '$5.00', description: 'Warm with cream cheese glaze', popular: true },
    { name: 'Baguette', category: 'breads', price: '$6.00', description: 'Crispy crust, soft interior', popular: false },
    { name: 'Cappuccino', category: 'drinks', price: '$4.50', description: 'Double shot with steamed milk', popular: false }
  ];

  const filtered = menuItems.filter(item =>
    (activeCategory === 'all' || item.category === activeCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Our Menu</h1>
        <p style={styles.subtitle}>Fresh baked daily with love</p>
      </header>

      <div style={styles.controls}>
        <div style={styles.search}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search menu..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{...styles.categoryBtn, ...(activeCategory === cat ? styles.categoryActive : {})}}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.grid}>
          {filtered.map((item, i) => (
            <div key={i} style={styles.card}>
              {item.popular && <span style={styles.badge}><Star size={12} /> Popular</span>}
              <h3 style={styles.itemName}>{item.name}</h3>
              <p style={styles.itemDesc}>{item.description}</p>
              <p style={styles.itemPrice}>{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  title: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '${colors.text}', marginBottom: '12px' },
  subtitle: { color: '${colors.textMuted}', fontSize: '1.1rem' },
  controls: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  search: { position: 'relative', marginBottom: '20px' },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '${colors.textMuted}' },
  searchInput: { width: '100%', padding: '14px 14px 14px 48px', border: '1px solid #e5e7eb', borderRadius: '${style.borderRadius}', fontSize: '1rem' },
  categories: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  categoryBtn: { padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.95rem' },
  categoryActive: { background: '${colors.primary}', color: '#fff', borderColor: '${colors.primary}' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { position: 'relative', background: '#fff', padding: '24px', borderRadius: '${style.borderRadius}', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  badge: { position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px', background: '${colors.primary}', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' },
  itemName: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${colors.text}', marginBottom: '8px' },
  itemDesc: { color: '${colors.textMuted}', marginBottom: '12px', lineHeight: 1.5 },
  itemPrice: { color: '${colors.primary}', fontWeight: '700', fontSize: '1.1rem' }
};
`;
}

function generateLuxuryMenuPage(businessName, menuData, colors, style) {
  return `import React from 'react';

export default function MenuPage() {
  const collections = [
    {
      name: 'Signature Collection',
      items: [
        { name: 'Artisan Croissant', price: '$6', description: 'House-made with imported French butter' },
        { name: 'Dark Chocolate Tart', price: '$12', description: 'Single-origin cacao, caramelized hazelnuts' },
        { name: 'Seasonal Macaron Box', price: '$28', description: 'Twelve pieces, rotating flavors' }
      ]
    },
    {
      name: 'Daily Offerings',
      items: [
        { name: 'Pain de Campagne', price: '$9', description: 'Rustic country loaf, 48-hour ferment' },
        { name: 'Kouign-Amann', price: '$7', description: 'Caramelized Breton pastry' },
        { name: 'Espresso', price: '$4', description: 'House blend, single or double' }
      ]
    }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.label}>THE COLLECTION</span>
        <h1 style={styles.title}>Our Offerings</h1>
      </header>

      <div style={styles.content}>
        {collections.map((collection, ci) => (
          <section key={ci} style={styles.section}>
            <h2 style={styles.collectionName}>{collection.name}</h2>
            <div style={styles.items}>
              {collection.items.map((item, ii) => (
                <div key={ii} style={styles.item}>
                  <div style={styles.itemHeader}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <span style={styles.itemPrice}>{item.price}</span>
                  </div>
                  <p style={styles.itemDesc}>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', color: '${colors.text}', minHeight: '100vh' },
  header: { padding: '100px 24px 60px', textAlign: 'center' },
  label: { color: '${colors.accent || "#d4af37"}', letterSpacing: '4px', fontSize: '0.85rem' },
  title: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '300', marginTop: '16px' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '0 24px 100px' },
  section: { marginBottom: '80px' },
  collectionName: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '400', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid ${colors.accent || "#d4af37"}' },
  items: {},
  item: { padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' },
  itemName: { fontFamily: "${style.fontHeading}", fontSize: '1.1rem', fontWeight: '400' },
  itemPrice: { color: '${colors.accent || "#d4af37"}' },
  itemDesc: { color: '${colors.textMuted}', fontSize: '0.95rem' }
};
`;
}

function generateEcommerceMenuPage(businessName, menuData, colors, style) {
  return `import React, { useState } from 'react';
import { ShoppingCart, Plus, Filter, Grid, List } from 'lucide-react';

export default function MenuPage() {
  const [view, setView] = useState('grid');
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: 'Signature Box', price: 42, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'boxes' },
    { id: 2, name: 'Croissant 6-Pack', price: 24, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', category: 'pastries' },
    { id: 3, name: 'Artisan Bread Loaf', price: 9, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', category: 'breads' },
    { id: 4, name: 'Cupcake Dozen', price: 36, image: 'https://images.unsplash.com/photo-1519869325930-281384f3a0d8?w=400', category: 'cakes' },
    { id: 5, name: 'Cookie Assortment', price: 18, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', category: 'cookies' },
    { id: 6, name: 'Birthday Cake', price: 55, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'cakes' }
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Shop Our Menu</h1>
        <p style={styles.subtitle}>Free shipping on orders over $50</p>
      </header>

      <div style={styles.toolbar}>
        <button style={styles.filterBtn}><Filter size={18} /> Filter</button>
        <div style={styles.viewToggle}>
          <button onClick={() => setView('grid')} style={{...styles.viewBtn, ...(view === 'grid' ? styles.viewActive : {})}}><Grid size={18} /></button>
          <button onClick={() => setView('list')} style={{...styles.viewBtn, ...(view === 'list' ? styles.viewActive : {})}}><List size={18} /></button>
        </div>
        <button style={styles.cartBtn}><ShoppingCart size={18} /> Cart ({cart.length})</button>
      </div>

      <div style={styles.container}>
        <div style={view === 'grid' ? styles.grid : styles.list}>
          {products.map(product => (
            <div key={product.id} style={styles.productCard}>
              <img src={product.image} alt={product.name} style={styles.productImage} />
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>\${product.price}</p>
                <button onClick={() => addToCart(product)} style={styles.addBtn}>
                  <Plus size={16} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  header: { padding: '48px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  title: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}' },
  subtitle: { color: '${colors.textMuted}' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', maxWidth: '1200px', margin: '0 auto' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer' },
  viewToggle: { display: 'flex', gap: '4px' },
  viewBtn: { padding: '10px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', borderRadius: '6px' },
  viewActive: { background: '${colors.primary}', color: '#fff', borderColor: '${colors.primary}' },
  cartBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  productCard: { background: '#fff', borderRadius: '${style.borderRadius}', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  productImage: { width: '100%', height: '180px', objectFit: 'cover' },
  productInfo: { padding: '16px' },
  productName: { fontFamily: "${style.fontHeading}", fontSize: '1rem', fontWeight: '600', color: '${colors.text}', marginBottom: '4px' },
  productPrice: { color: '${colors.primary}', fontWeight: '700', marginBottom: '12px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center', background: '${colors.primary}', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};
`;
}

/**
 * Generate AboutPage based on archetype
 */
function generateAboutPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const tagline = businessData.tagline || 'Your trusted local business';
  const year = businessData.yearFounded || '2020';

  let c = { ...style.colors, ...colors };
  const isDark = styleOverrides.isDark || false;
  const isMedium = styleOverrides.isMedium || false;

  if (isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8', cardBg: '#1e293b', borderColor: '#334155' };
  } else if (isMedium) {
    c = { ...c, background: '#f0f0f0', backgroundAlt: '#e5e5e5', text: '#1f2937', textMuted: '#4b5563', cardBg: '#ffffff', borderColor: '#d1d5db' };
  } else if (styleOverrides.colors) {
    c = { ...c, ...styleOverrides.colors };
  }

  const themeStyle = {
    ...style,
    fontHeading: styleOverrides.fontHeading || style.fontHeading || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || style.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px'
  };

  if (arch.id === 'ecommerce') {
    return generateEcommerceAboutPage(businessName, tagline, year, c, themeStyle, businessData);
  } else if (arch.id === 'luxury') {
    return generateLuxuryAboutPage(businessName, tagline, year, c, themeStyle, businessData);
  } else {
    return generateLocalAboutPage(businessName, tagline, year, c, themeStyle, businessData);
  }
}

function generateLocalAboutPage(businessName, tagline, year, colors, style, businessData = {}) {
  const industry = businessData.industry || 'bakery';
  const heroImageUrl = getHeroImage(industry, 'primary');

  return `import React from 'react';
import { Heart, Award, Users, Clock, Star, MapPin } from 'lucide-react';

export default function AboutPage() {
  const milestones = [
    { year: '${year}', event: 'Founded with a dream and a family recipe' },
    { year: '${parseInt(year) + 2}', event: 'Opened our first storefront' },
    { year: '${parseInt(year) + 5}', event: 'Expanded to serve the whole community' },
    { year: 'Today', event: 'Proudly serving neighbors like you' }
  ];

  const values = [
    { icon: Heart, title: 'Made with Love', desc: 'Every item is crafted with care and passion' },
    { icon: Award, title: 'Quality First', desc: 'We use only the finest ingredients' },
    { icon: Users, title: 'Community', desc: 'Our neighbors are our family' }
  ];

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Our Story</h1>
          <p style={styles.heroSubtitle}>A family tradition since ${year}</p>
        </div>
      </section>

      <section style={styles.story}>
        <div style={styles.container}>
          <div style={styles.storyGrid}>
            <div style={styles.storyImage}>
              <img src="${heroImageUrl}" alt="Our story" style={styles.storyImg} />
            </div>
            <div style={styles.storyContent}>
              <h2 style={styles.sectionTitle}>How It All Started</h2>
              <p style={styles.storyText}>
                ${businessName} began with a simple dream: to share our family recipes with the community.
                What started in a small kitchen has grown into a beloved neighborhood destination.
              </p>
              <p style={styles.storyText}>
                For over ${new Date().getFullYear() - parseInt(year)} years, we've been waking up before dawn
                to bring you the freshest baked goods. Every recipe has been passed down through generations,
                and we take pride in keeping those traditions alive.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.values}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitleCenter}>What We Believe In</h2>
          <div style={styles.valuesGrid}>
            {values.map((value, i) => (
              <div key={i} style={styles.valueCard}>
                <value.icon size={32} color="${colors.primary}" />
                <h3 style={styles.valueTitle}>{value.title}</h3>
                <p style={styles.valueDesc}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.timeline}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitleCenter}>Our Journey</h2>
          <div style={styles.milestones}>
            {milestones.map((m, i) => (
              <div key={i} style={styles.milestone}>
                <div style={styles.milestoneYear}>{m.year}</div>
                <div style={styles.milestoneDot} />
                <div style={styles.milestoneEvent}>{m.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  hero: { position: 'relative', height: '50vh', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(${heroImageUrl})', backgroundSize: 'cover', backgroundPosition: 'center' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))' },
  heroContent: { position: 'relative', textAlign: 'center', color: '#fff' },
  heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', marginBottom: '12px' },
  heroSubtitle: { fontSize: '1.25rem', opacity: 0.9 },
  story: { padding: '${style.sectionPadding}' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  storyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' },
  storyImage: {},
  storyImg: { width: '100%', borderRadius: '${style.borderRadius}', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' },
  storyContent: {},
  sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '20px' },
  sectionTitleCenter: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', textAlign: 'center', marginBottom: '48px' },
  storyText: { color: '${colors.textMuted}', lineHeight: 1.8, marginBottom: '16px', fontSize: '1.05rem' },
  values: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt || "#f8fafc"}' },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' },
  valueCard: { background: '${colors.cardBg || "#fff"}', padding: '32px', borderRadius: '${style.borderRadius}', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  valueTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${colors.text}', margin: '16px 0 8px' },
  valueDesc: { color: '${colors.textMuted}', lineHeight: 1.6 },
  timeline: { padding: '${style.sectionPadding}' },
  milestones: { display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px', margin: '0 auto' },
  milestone: { display: 'grid', gridTemplateColumns: '100px 24px 1fr', alignItems: 'center', gap: '16px' },
  milestoneYear: { fontFamily: "${style.fontHeading}", fontWeight: '700', color: '${colors.primary}', textAlign: 'right' },
  milestoneDot: { width: '12px', height: '12px', borderRadius: '50%', background: '${colors.primary}' },
  milestoneEvent: { color: '${colors.text}' }
};
`;
}

function generateEcommerceAboutPage(businessName, tagline, year, colors, style, businessData = {}) {
  const industry = businessData.industry || 'bakery';
  const heroImageUrl = getHeroImage(industry, 'primary');

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, Award, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { number: '${new Date().getFullYear() - parseInt(year)}+', label: 'Years of Excellence' },
    { number: '50K+', label: 'Happy Customers' },
    { number: '100%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Customer Support' }
  ];

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: Shield, title: 'Secure Checkout', desc: '100% protected payments' },
    { icon: Award, title: 'Quality Guaranteed', desc: 'Fresh or your money back' },
    { icon: Heart, title: 'Made with Care', desc: 'Handcrafted with love' }
  ];

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.badge}>Our Story</span>
          <h1 style={styles.heroTitle}>${businessName}</h1>
          <p style={styles.heroSubtitle}>${tagline}</p>
        </div>
      </section>

      <section style={styles.stats}>
        <div style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.mission}>
        <div style={styles.container}>
          <div style={styles.missionGrid}>
            <img src="${heroImageUrl}" alt="Our mission" style={styles.missionImage} />
            <div style={styles.missionContent}>
              <h2 style={styles.sectionTitle}>Our Mission</h2>
              <p style={styles.missionText}>
                Since ${year}, we've been on a mission to deliver the finest artisan products
                right to your doorstep. What began as a small family operation has grown into
                a nationwide brand, but our commitment to quality remains unchanged.
              </p>
              <p style={styles.missionText}>
                Every item is crafted with care using premium ingredients, then carefully
                packaged to arrive fresh at your door. We believe everyone deserves access
                to exceptional quality, no matter where they live.
              </p>
              <Link to="/menu" style={styles.cta}>Shop Now <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.container}>
          <div style={styles.featuresGrid}>
            {features.map((feature, i) => (
              <div key={i} style={styles.featureCard}>
                <feature.icon size={28} color="${colors.primary}" />
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  hero: { padding: '80px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  heroContent: { maxWidth: '700px', margin: '0 auto' },
  badge: { display: 'inline-block', background: '${colors.primary}', color: '#fff', padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', marginBottom: '20px' },
  heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', color: '${colors.text}', marginBottom: '16px' },
  heroSubtitle: { color: '${colors.textMuted}', fontSize: '1.1rem', lineHeight: 1.6 },
  stats: { padding: '48px 24px', background: '${colors.primary}' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' },
  statCard: { color: '#fff' },
  statNumber: { fontSize: '2.5rem', fontWeight: '700', marginBottom: '4px' },
  statLabel: { opacity: 0.9 },
  mission: { padding: '${style.sectionPadding}' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  missionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' },
  missionImage: { width: '100%', borderRadius: '${style.borderRadius}', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
  missionContent: {},
  sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '20px' },
  missionText: { color: '${colors.textMuted}', lineHeight: 1.8, marginBottom: '16px' },
  cta: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${colors.primary}', color: '#fff', padding: '14px 28px', borderRadius: '${style.borderRadius}', textDecoration: 'none', fontWeight: '600', marginTop: '8px' },
  features: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt || "#f8fafc"}' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' },
  featureCard: { background: '${colors.cardBg || "#fff"}', padding: '28px', borderRadius: '${style.borderRadius}', textAlign: 'center' },
  featureTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.1rem', fontWeight: '600', color: '${colors.text}', margin: '12px 0 8px' },
  featureDesc: { color: '${colors.textMuted}', fontSize: '0.95rem' }
};
`;
}

function generateLuxuryAboutPage(businessName, tagline, year, colors, style, businessData = {}) {
  const industry = businessData.industry || 'bakery';
  const heroImageUrl = getHeroImage(industry, 'primary');

  return `import React from 'react';

export default function AboutPage() {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <span style={styles.label}>OUR STORY</span>
        <h1 style={styles.heroTitle}>A Legacy of Excellence</h1>
        <p style={styles.heroSubtitle}>Since ${year}</p>
      </section>

      <section style={styles.statement}>
        <p style={styles.statementText}>
          At ${businessName}, we believe that exceptional quality is not merely a standard—it is an art form.
          Every creation that leaves our atelier represents generations of expertise, meticulous attention
          to detail, and an unwavering commitment to perfection.
        </p>
      </section>

      <section style={styles.imageSection}>
        <img src="${heroImageUrl}" alt="Our craft" style={styles.fullImage} />
      </section>

      <section style={styles.philosophy}>
        <div style={styles.container}>
          <div style={styles.philGrid}>
            <div style={styles.philItem}>
              <span style={styles.philLabel}>INGREDIENTS</span>
              <h3 style={styles.philTitle}>Only the Finest</h3>
              <p style={styles.philText}>
                We source the world's most exceptional ingredients—from single-origin cacao
                to imported French butter. Every component is selected with the same care
                we would give to our own family.
              </p>
            </div>
            <div style={styles.philItem}>
              <span style={styles.philLabel}>CRAFTSMANSHIP</span>
              <h3 style={styles.philTitle}>Time-Honored Techniques</h3>
              <p style={styles.philText}>
                Our master artisans train for years to perfect their craft. Each creation
                is handmade using techniques passed down through generations, ensuring
                authenticity in every bite.
              </p>
            </div>
            <div style={styles.philItem}>
              <span style={styles.philLabel}>HERITAGE</span>
              <h3 style={styles.philTitle}>A Timeless Tradition</h3>
              <p style={styles.philText}>
                Founded in ${year}, our house has remained dedicated to the same principles
                that guided our founders: excellence, integrity, and the pursuit of perfection.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', color: '${colors.text}', minHeight: '100vh' },
  hero: { padding: '120px 24px 80px', textAlign: 'center' },
  label: { color: '${colors.accent || "#d4af37"}', letterSpacing: '4px', fontSize: '0.85rem' },
  heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '300', marginTop: '16px', marginBottom: '12px' },
  heroSubtitle: { color: '${colors.textMuted}', fontSize: '1.1rem' },
  statement: { padding: '60px 24px', textAlign: 'center', background: '${colors.backgroundAlt}' },
  statementText: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: '300', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 },
  imageSection: { padding: '0 24px' },
  fullImage: { width: '100%', height: '60vh', objectFit: 'cover' },
  philosophy: { padding: '100px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  philGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' },
  philItem: {},
  philLabel: { color: '${colors.accent || "#d4af37"}', letterSpacing: '3px', fontSize: '0.75rem' },
  philTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '400', margin: '16px 0' },
  philText: { color: '${colors.textMuted}', lineHeight: 1.8 }
};
`;
}

/**
 * Generate ContactPage based on archetype
 */
function generateContactPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const address = businessData.address || '123 Main Street';
  const phone = businessData.phone || '(555) 123-4567';
  const email = businessData.email || 'hello@business.com';

  let c = { ...style.colors, ...colors };
  const isDark = styleOverrides.isDark || false;
  const isMedium = styleOverrides.isMedium || false;

  if (isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8', cardBg: '#1e293b', borderColor: '#334155' };
  } else if (isMedium) {
    c = { ...c, background: '#f0f0f0', backgroundAlt: '#e5e5e5', text: '#1f2937', textMuted: '#4b5563', cardBg: '#ffffff', borderColor: '#d1d5db' };
  } else if (styleOverrides.colors) {
    c = { ...c, ...styleOverrides.colors };
  }

  const themeStyle = {
    ...style,
    fontHeading: styleOverrides.fontHeading || style.fontHeading || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || style.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px'
  };

  if (arch.id === 'ecommerce') {
    return generateEcommerceContactPage(businessName, address, phone, email, c, themeStyle, businessData);
  } else if (arch.id === 'luxury') {
    return generateLuxuryContactPage(businessName, address, phone, email, c, themeStyle, businessData);
  } else {
    return generateLocalContactPage(businessName, address, phone, email, c, themeStyle, businessData);
  }
}

function generateLocalContactPage(businessName, address, phone, email, colors, style, businessData = {}) {
  return `import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thanks for reaching out! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const hours = [
    { day: 'Monday - Friday', time: '7:00 AM - 6:00 PM' },
    { day: 'Saturday', time: '8:00 AM - 5:00 PM' },
    { day: 'Sunday', time: '9:00 AM - 3:00 PM' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Get In Touch</h1>
        <p style={styles.subtitle}>We would love to hear from you!</p>
      </header>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.contactInfo}>
              <div style={styles.infoCard}>
                <MapPin size={24} color="${colors.primary}" />
                <div>
                  <h3 style={styles.infoTitle}>Visit Us</h3>
                  <p style={styles.infoText}>${address}</p>
                </div>
              </div>
              <div style={styles.infoCard}>
                <Phone size={24} color="${colors.primary}" />
                <div>
                  <h3 style={styles.infoTitle}>Call Us</h3>
                  <p style={styles.infoText}>${phone}</p>
                </div>
              </div>
              <div style={styles.infoCard}>
                <Mail size={24} color="${colors.primary}" />
                <div>
                  <h3 style={styles.infoTitle}>Email Us</h3>
                  <p style={styles.infoText}>${email}</p>
                </div>
              </div>
              <div style={styles.hoursCard}>
                <Clock size={24} color="${colors.primary}" />
                <div>
                  <h3 style={styles.infoTitle}>Hours</h3>
                  {hours.map((h, i) => (
                    <div key={i} style={styles.hourRow}>
                      <span>{h.day}</span>
                      <span style={styles.hourTime}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <h2 style={styles.formTitle}>Send Us a Message</h2>
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={styles.input}
                required
              />
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                style={styles.textarea}
                rows={5}
                required
              />
              <button type="submit" style={styles.submitBtn}>
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  title: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '${colors.text}', marginBottom: '12px' },
  subtitle: { color: '${colors.textMuted}', fontSize: '1.1rem' },
  content: { padding: '${style.sectionPadding}' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' },
  contactInfo: { display: 'flex', flexDirection: 'column', gap: '24px' },
  infoCard: { display: 'flex', gap: '16px', alignItems: 'flex-start', background: '${colors.cardBg || "#fff"}', padding: '24px', borderRadius: '${style.borderRadius}', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  hoursCard: { display: 'flex', gap: '16px', alignItems: 'flex-start', background: '${colors.cardBg || "#fff"}', padding: '24px', borderRadius: '${style.borderRadius}', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  infoTitle: { fontFamily: "${style.fontHeading}", fontWeight: '600', color: '${colors.text}', marginBottom: '4px' },
  infoText: { color: '${colors.textMuted}' },
  hourRow: { display: 'flex', justifyContent: 'space-between', gap: '24px', color: '${colors.textMuted}', marginTop: '8px' },
  hourTime: { fontWeight: '500', color: '${colors.text}' },
  form: { background: '${colors.cardBg || "#fff"}', padding: '32px', borderRadius: '${style.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  formTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '600', color: '${colors.text}', marginBottom: '24px' },
  input: { width: '100%', padding: '14px 16px', border: '1px solid ${colors.borderColor || "#e5e7eb"}', borderRadius: '${style.borderRadius}', fontSize: '1rem', marginBottom: '16px', background: '${colors.background}', color: '${colors.text}' },
  textarea: { width: '100%', padding: '14px 16px', border: '1px solid ${colors.borderColor || "#e5e7eb"}', borderRadius: '${style.borderRadius}', fontSize: '1rem', marginBottom: '16px', resize: 'vertical', background: '${colors.background}', color: '${colors.text}' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: '${colors.primary}', color: '#fff', border: 'none', padding: '16px', borderRadius: '${style.borderRadius}', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }
};
`;
}

function generateEcommerceContactPage(businessName, address, phone, email, colors, style, businessData = {}) {
  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Package, CreditCard, Truck, ArrowRight, Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', orderNumber: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thanks for contacting us! We will respond within 24 hours.');
    setFormData({ name: '', email: '', orderNumber: '', subject: '', message: '' });
  };

  const supportOptions = [
    { icon: Package, title: 'Order Issues', desc: 'Track, modify, or cancel orders', link: '/orders' },
    { icon: Truck, title: 'Shipping', desc: 'Delivery questions and updates', link: '/shipping' },
    { icon: CreditCard, title: 'Returns', desc: 'Easy 30-day return policy', link: '/returns' },
    { icon: MessageCircle, title: 'General', desc: 'Product questions and more', link: '#form' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>How Can We Help?</h1>
        <p style={styles.subtitle}>Our support team is here for you 24/7</p>
      </header>

      <section style={styles.options}>
        <div style={styles.container}>
          <div style={styles.optionsGrid}>
            {supportOptions.map((opt, i) => (
              <a key={i} href={opt.link} style={styles.optionCard}>
                <opt.icon size={28} color="${colors.primary}" />
                <h3 style={styles.optionTitle}>{opt.title}</h3>
                <p style={styles.optionDesc}>{opt.desc}</p>
                <span style={styles.optionLink}>Learn more <ArrowRight size={14} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="form" style={styles.formSection}>
        <div style={styles.container}>
          <div style={styles.formGrid}>
            <div style={styles.formInfo}>
              <h2 style={styles.formTitle}>Contact Us Directly</h2>
              <p style={styles.formText}>
                Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
              </p>
              <div style={styles.quickContact}>
                <a href="tel:${phone}" style={styles.quickLink}><Phone size={18} /> ${phone}</a>
                <a href="mailto:${email}" style={styles.quickLink}><Mail size={18} /> ${email}</a>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.input} required />
              </div>
              <input type="text" placeholder="Order Number (optional)" value={formData.orderNumber} onChange={(e) => setFormData({...formData, orderNumber: e.target.value})} style={styles.input} />
              <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} style={styles.input} required>
                <option value="">Select a topic</option>
                <option value="order">Order Issue</option>
                <option value="shipping">Shipping Question</option>
                <option value="return">Return Request</option>
                <option value="product">Product Question</option>
                <option value="other">Other</option>
              </select>
              <textarea placeholder="How can we help?" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} style={styles.textarea} rows={4} required />
              <button type="submit" style={styles.submitBtn}>Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  title: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '8px' },
  subtitle: { color: '${colors.textMuted}' },
  options: { padding: '48px 24px' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  optionCard: { background: '${colors.cardBg || "#fff"}', padding: '24px', borderRadius: '${style.borderRadius}', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s', display: 'block' },
  optionTitle: { fontFamily: "${style.fontHeading}", fontWeight: '600', color: '${colors.text}', margin: '12px 0 4px' },
  optionDesc: { color: '${colors.textMuted}', fontSize: '0.9rem', marginBottom: '12px' },
  optionLink: { display: 'flex', alignItems: 'center', gap: '4px', color: '${colors.primary}', fontSize: '0.9rem', fontWeight: '500' },
  formSection: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt || "#f8fafc"}' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'start' },
  formInfo: {},
  formTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.75rem', fontWeight: '700', color: '${colors.text}', marginBottom: '16px' },
  formText: { color: '${colors.textMuted}', lineHeight: 1.6, marginBottom: '24px' },
  quickContact: { display: 'flex', flexDirection: 'column', gap: '12px' },
  quickLink: { display: 'flex', alignItems: 'center', gap: '8px', color: '${colors.primary}', textDecoration: 'none', fontWeight: '500' },
  form: { background: '${colors.cardBg || "#fff"}', padding: '28px', borderRadius: '${style.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { width: '100%', padding: '12px 14px', border: '1px solid ${colors.borderColor || "#e5e7eb"}', borderRadius: '8px', fontSize: '1rem', marginBottom: '12px', background: '${colors.background}', color: '${colors.text}' },
  textarea: { width: '100%', padding: '12px 14px', border: '1px solid ${colors.borderColor || "#e5e7eb"}', borderRadius: '8px', fontSize: '1rem', marginBottom: '12px', resize: 'vertical', background: '${colors.background}', color: '${colors.text}' },
  submitBtn: { width: '100%', background: '${colors.primary}', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }
};
`;
}

function generateLuxuryContactPage(businessName, address, phone, email, colors, style, businessData = {}) {
  return `import React, { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your inquiry. Our concierge team will be in touch shortly.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.label}>CONTACT</span>
        <h1 style={styles.title}>Get in Touch</h1>
        <p style={styles.subtitle}>We would be honored to hear from you</p>
      </header>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.info}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>VISIT</span>
                <p style={styles.infoText}>${address}</p>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>CALL</span>
                <p style={styles.infoText}>${phone}</p>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>EMAIL</span>
                <p style={styles.infoText}>${email}</p>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>HOURS</span>
                <p style={styles.infoText}>Monday - Saturday: 9am - 7pm</p>
                <p style={styles.infoText}>Sunday: By Appointment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <h2 style={styles.formTitle}>Private Inquiry</h2>
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.input} required />
              <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={styles.input} />
              <textarea placeholder="Your message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} style={styles.textarea} rows={5} required />
              <button type="submit" style={styles.submitBtn}>Submit Inquiry</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', color: '${colors.text}', minHeight: '100vh' },
  header: { padding: '100px 24px 60px', textAlign: 'center' },
  label: { color: '${colors.accent || "#d4af37"}', letterSpacing: '4px', fontSize: '0.85rem' },
  title: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '300', marginTop: '16px', marginBottom: '12px' },
  subtitle: { color: '${colors.textMuted}', fontSize: '1.1rem' },
  content: { padding: '60px 24px 100px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' },
  info: { display: 'flex', flexDirection: 'column', gap: '32px' },
  infoItem: {},
  infoLabel: { color: '${colors.accent || "#d4af37"}', letterSpacing: '3px', fontSize: '0.75rem', display: 'block', marginBottom: '8px' },
  infoText: { color: '${colors.textMuted}', lineHeight: 1.6 },
  form: { background: '${colors.backgroundAlt}', padding: '40px', borderRadius: '4px' },
  formTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '300', marginBottom: '32px' },
  input: { width: '100%', padding: '16px', border: 'none', borderBottom: '1px solid ${colors.borderColor || "rgba(255,255,255,0.2)"}', fontSize: '1rem', marginBottom: '20px', background: 'transparent', color: '${colors.text}' },
  textarea: { width: '100%', padding: '16px', border: 'none', borderBottom: '1px solid ${colors.borderColor || "rgba(255,255,255,0.2)"}', fontSize: '1rem', marginBottom: '20px', resize: 'vertical', background: 'transparent', color: '${colors.text}' },
  submitBtn: { width: '100%', background: '${colors.accent || "#d4af37"}', color: '${colors.background}', border: 'none', padding: '16px', fontSize: '0.9rem', letterSpacing: '2px', cursor: 'pointer' }
};
`;
}

/**
 * Generate GalleryPage based on archetype
 */
function generateGalleryPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const industry = businessData.industry || 'bakery';

  let c = { ...style.colors, ...colors };
  const isDark = styleOverrides.isDark || false;
  const isMedium = styleOverrides.isMedium || false;

  if (isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8', cardBg: '#1e293b', borderColor: '#334155' };
  } else if (isMedium) {
    c = { ...c, background: '#f0f0f0', backgroundAlt: '#e5e5e5', text: '#1f2937', textMuted: '#4b5563', cardBg: '#ffffff', borderColor: '#d1d5db' };
  } else if (styleOverrides.colors) {
    c = { ...c, ...styleOverrides.colors };
  }

  const themeStyle = {
    ...style,
    fontHeading: styleOverrides.fontHeading || style.fontHeading || "'Inter', system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px'
  };

  if (arch.id === 'ecommerce') {
    return generateEcommerceGalleryPage(businessName, industry, c, themeStyle);
  } else if (arch.id === 'luxury') {
    return generateLuxuryGalleryPage(businessName, industry, c, themeStyle);
  } else {
    return generateLocalGalleryPage(businessName, industry, c, themeStyle);
  }
}

function generateLocalGalleryPage(businessName, industry, colors, style) {
  const heroImages = getHeroImages(industry, 'primary') || [];

  return `import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    { src: '${heroImages[0] || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"}', alt: 'Fresh baked goods', category: 'Products' },
    { src: '${heroImages[1] || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600"}', alt: 'Our pastries', category: 'Products' },
    { src: '${heroImages[2] || "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600"}', alt: 'Inside our shop', category: 'Shop' },
    { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600', alt: 'Happy customers', category: 'Community' },
    { src: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600', alt: 'Baking process', category: 'Behind the Scenes' },
    { src: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', alt: 'Fresh ingredients', category: 'Behind the Scenes' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Our Gallery</h1>
        <p style={styles.subtitle}>A peek inside ${businessName}</p>
      </header>

      <section style={styles.gallery}>
        <div style={styles.container}>
          <div style={styles.grid}>
            {galleryImages.map((img, i) => (
              <div key={i} style={styles.imageCard} onClick={() => setSelectedImage(img)}>
                <img src={img.src} alt={img.alt} style={styles.image} />
                <div style={styles.imageOverlay}>
                  <span style={styles.imageCategory}>{img.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div style={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <button style={styles.closeBtn} onClick={() => setSelectedImage(null)}><X size={24} /></button>
          <img src={selectedImage.src} alt={selectedImage.alt} style={styles.lightboxImage} />
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  title: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '${colors.text}', marginBottom: '12px' },
  subtitle: { color: '${colors.textMuted}', fontSize: '1.1rem' },
  gallery: { padding: '${style.sectionPadding}' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  imageCard: { position: 'relative', borderRadius: '${style.borderRadius}', overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3' },
  image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', display: 'flex', alignItems: 'flex-end', padding: '16px', opacity: 0, transition: 'opacity 0.3s' },
  imageCategory: { color: '#fff', fontSize: '0.9rem', fontWeight: '500' },
  lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
  closeBtn: { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' },
  lightboxImage: { maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }
};
`;
}

function generateEcommerceGalleryPage(businessName, industry, colors, style) {
  const heroImages = getHeroImages(industry, 'primary') || [];

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filter, setFilter] = useState('all');

  const galleryItems = [
    { src: '${heroImages[0] || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"}', title: 'Signature Collection', category: 'featured', price: '$42', link: '/menu' },
    { src: '${heroImages[1] || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600"}', title: 'Fresh Pastries', category: 'pastries', price: '$24', link: '/menu' },
    { src: '${heroImages[2] || "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600"}', title: 'Artisan Breads', category: 'breads', price: '$9', link: '/menu' },
    { src: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', title: 'Custom Cakes', category: 'cakes', price: 'From $55', link: '/menu' },
    { src: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600', title: 'Cookie Boxes', category: 'cookies', price: '$18', link: '/menu' },
    { src: 'https://images.unsplash.com/photo-1519869325930-281384f3a0d8?w=600', title: 'Cupcake Dozen', category: 'cakes', price: '$36', link: '/menu' }
  ];

  const categories = ['all', 'featured', 'pastries', 'breads', 'cakes', 'cookies'];
  const filtered = filter === 'all' ? galleryItems : galleryItems.filter(item => item.category === filter);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Product Gallery</h1>
        <p style={styles.subtitle}>Browse our delicious offerings</p>
      </header>

      <section style={styles.filters}>
        <div style={styles.filterBtns}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{...styles.filterBtn, ...(filter === cat ? styles.filterActive : {})}}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.gallery}>
        <div style={styles.container}>
          <div style={styles.grid}>
            {filtered.map((item, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.imageWrap} onClick={() => setSelectedIndex(i)}>
                  <img src={item.src} alt={item.title} style={styles.image} />
                </div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardPrice}>{item.price}</p>
                  <Link to={item.link} style={styles.shopBtn}><ShoppingBag size={16} /> Shop Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedIndex !== null && (
        <div style={styles.lightbox} onClick={() => setSelectedIndex(null)}>
          <button style={styles.closeBtn}><X size={24} /></button>
          <button style={styles.navBtn} onClick={(e) => { e.stopPropagation(); setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length); }}><ChevronLeft size={32} /></button>
          <img src={filtered[selectedIndex].src} alt={filtered[selectedIndex].title} style={styles.lightboxImage} />
          <button style={{...styles.navBtn, ...styles.navBtnRight}} onClick={(e) => { e.stopPropagation(); setSelectedIndex((selectedIndex + 1) % filtered.length); }}><ChevronRight size={32} /></button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  header: { padding: '48px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  title: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '8px' },
  subtitle: { color: '${colors.textMuted}' },
  filters: { padding: '24px', borderBottom: '1px solid ${colors.borderColor || "#e5e7eb"}' },
  filterBtns: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
  filterBtn: { padding: '10px 20px', border: '1px solid ${colors.borderColor || "#e5e7eb"}', borderRadius: '20px', background: '${colors.cardBg || "#fff"}', cursor: 'pointer', fontSize: '0.9rem', color: '${colors.text}' },
  filterActive: { background: '${colors.primary}', color: '#fff', borderColor: '${colors.primary}' },
  gallery: { padding: '${style.sectionPadding}' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  card: { background: '${colors.cardBg || "#fff"}', borderRadius: '${style.borderRadius}', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  imageWrap: { cursor: 'pointer', overflow: 'hidden' },
  image: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', transition: 'transform 0.3s' },
  cardInfo: { padding: '16px' },
  cardTitle: { fontFamily: "${style.fontHeading}", fontWeight: '600', color: '${colors.text}', marginBottom: '4px' },
  cardPrice: { color: '${colors.primary}', fontWeight: '700', marginBottom: '12px' },
  shopBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '${colors.primary}', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' },
  lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  closeBtn: { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' },
  navBtn: { position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navBtnRight: { left: 'auto', right: '24px' },
  lightboxImage: { maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain' }
};
`;
}

function generateLuxuryGalleryPage(businessName, industry, colors, style) {
  const heroImages = getHeroImages(industry, 'primary') || [];

  return `import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const galleryItems = [
    { src: '${heroImages[0] || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"}', title: 'The Craft', subtitle: 'Artistry in every detail' },
    { src: '${heroImages[1] || "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800"}', title: 'Seasonal Collection', subtitle: 'Limited edition offerings' },
    { src: '${heroImages[2] || "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800"}', title: 'The Atelier', subtitle: 'Where magic happens' },
    { src: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800', title: 'Ingredients', subtitle: 'Only the finest' },
    { src: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800', title: 'Presentation', subtitle: 'A feast for the eyes' },
    { src: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800', title: 'Heritage', subtitle: 'Timeless traditions' }
  ];

  const navigate = (dir) => {
    setSelectedIndex((prev) => (prev + dir + galleryItems.length) % galleryItems.length);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.label}>GALLERY</span>
        <h1 style={styles.title}>Visual Journey</h1>
      </header>

      <section style={styles.gallery}>
        <div style={styles.grid}>
          {galleryItems.map((item, i) => (
            <div key={i} style={styles.item} onClick={() => setSelectedIndex(i)}>
              <img src={item.src} alt={item.title} style={styles.image} />
              <div style={styles.itemOverlay}>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemSubtitle}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedIndex !== null && (
        <div style={styles.lightbox}>
          <button style={styles.closeBtn} onClick={() => setSelectedIndex(null)}><X size={24} /></button>
          <button style={styles.navBtn} onClick={() => navigate(-1)}><ChevronLeft size={32} /></button>
          <div style={styles.lightboxContent}>
            <img src={galleryItems[selectedIndex].src} alt={galleryItems[selectedIndex].title} style={styles.lightboxImage} />
            <div style={styles.lightboxInfo}>
              <h3 style={styles.lightboxTitle}>{galleryItems[selectedIndex].title}</h3>
              <p style={styles.lightboxSubtitle}>{galleryItems[selectedIndex].subtitle}</p>
            </div>
          </div>
          <button style={{...styles.navBtn, right: '24px', left: 'auto'}} onClick={() => navigate(1)}><ChevronRight size={32} /></button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', color: '${colors.text}', minHeight: '100vh' },
  header: { padding: '100px 24px 60px', textAlign: 'center' },
  label: { color: '${colors.accent || "#d4af37"}', letterSpacing: '4px', fontSize: '0.85rem' },
  title: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '300', marginTop: '16px' },
  gallery: { padding: '0 24px 100px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4px', maxWidth: '1400px', margin: '0 auto' },
  item: { position: 'relative', aspectRatio: '4/3', cursor: 'pointer', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)', transition: 'all 0.5s' },
  itemOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px', opacity: 0, transition: 'opacity 0.3s' },
  itemTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '300', color: '#fff', marginBottom: '4px' },
  itemSubtitle: { color: '${colors.accent || "#d4af37"}', letterSpacing: '2px', fontSize: '0.8rem' },
  lightbox: { position: 'fixed', inset: 0, background: '${colors.background}', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  closeBtn: { position: 'absolute', top: '32px', right: '32px', background: 'none', border: 'none', color: '${colors.text}', cursor: 'pointer' },
  navBtn: { position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: '1px solid ${colors.accent || "#d4af37"}', color: '${colors.accent || "#d4af37"}', width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lightboxContent: { textAlign: 'center' },
  lightboxImage: { maxWidth: '70vw', maxHeight: '70vh', objectFit: 'contain' },
  lightboxInfo: { marginTop: '32px' },
  lightboxTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '300', marginBottom: '8px' },
  lightboxSubtitle: { color: '${colors.accent || "#d4af37"}', letterSpacing: '3px', fontSize: '0.85rem' }
};
`;
}

/**
 * Generate OrderPage based on archetype
 */
function generateOrderPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const phone = businessData.phone || '(555) 123-4567';

  let c = { ...style.colors, ...colors };
  const isDark = styleOverrides.isDark || false;
  const isMedium = styleOverrides.isMedium || false;

  if (isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8', cardBg: '#1e293b', borderColor: '#334155' };
  } else if (isMedium) {
    c = { ...c, background: '#f0f0f0', backgroundAlt: '#e5e5e5', text: '#1f2937', textMuted: '#4b5563', cardBg: '#ffffff', borderColor: '#d1d5db' };
  } else if (styleOverrides.colors) {
    c = { ...c, ...styleOverrides.colors };
  }

  const themeStyle = {
    ...style,
    fontHeading: styleOverrides.fontHeading || style.fontHeading || "'Inter', system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px'
  };

  if (arch.id === 'ecommerce') {
    return generateEcommerceOrderPage(businessName, phone, c, themeStyle, businessData);
  } else if (arch.id === 'luxury') {
    return generateLuxuryOrderPage(businessName, phone, c, themeStyle, businessData);
  } else {
    return generateLocalOrderPage(businessName, phone, c, themeStyle, businessData);
  }
}

function generateLocalOrderPage(businessName, phone, colors, style, businessData = {}) {
  return `import React, { useState } from 'react';
import { Phone, Clock, MapPin, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

export default function OrderPage() {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('pickup');

  const menuItems = [
    { id: 1, name: 'Butter Croissant', price: 4.50, category: 'Pastries' },
    { id: 2, name: 'Sourdough Loaf', price: 8.00, category: 'Breads' },
    { id: 3, name: 'Chocolate Cake Slice', price: 6.00, category: 'Cakes' },
    { id: 4, name: 'Cinnamon Roll', price: 5.00, category: 'Pastries' },
    { id: 5, name: 'Baguette', price: 6.00, category: 'Breads' },
    { id: 6, name: 'Coffee', price: 3.50, category: 'Drinks' }
  ];

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    } else {
      setCart([...cart, {...item, qty: 1}]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(c => c.id === id ? {...c, qty: Math.max(0, c.qty + delta)} : c).filter(c => c.qty > 0));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Order Online</h1>
        <p style={styles.subtitle}>Fresh baked goods ready when you are</p>
      </header>

      <section style={styles.orderOptions}>
        <div style={styles.optionBtns}>
          <button onClick={() => setOrderType('pickup')} style={{...styles.optionBtn, ...(orderType === 'pickup' ? styles.optionActive : {})}}>
            <MapPin size={18} /> Pickup
          </button>
          <button onClick={() => setOrderType('delivery')} style={{...styles.optionBtn, ...(orderType === 'delivery' ? styles.optionActive : {})}}>
            <Clock size={18} /> Delivery
          </button>
        </div>
        <p style={styles.infoText}>
          {orderType === 'pickup' ? 'Ready in 15-20 minutes' : 'Delivered in 30-45 minutes'}
        </p>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.menu}>
              <h2 style={styles.sectionTitle}>Menu</h2>
              <div style={styles.menuGrid}>
                {menuItems.map(item => (
                  <div key={item.id} style={styles.menuCard}>
                    <div style={styles.menuInfo}>
                      <h3 style={styles.menuName}>{item.name}</h3>
                      <p style={styles.menuCategory}>{item.category}</p>
                      <p style={styles.menuPrice}>\${item.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => addToCart(item)} style={styles.addBtn}><Plus size={18} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.cartSection}>
              <h2 style={styles.sectionTitle}>Your Order</h2>
              {cart.length === 0 ? (
                <p style={styles.emptyCart}>Your cart is empty</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} style={styles.cartItem}>
                      <div style={styles.cartInfo}>
                        <span style={styles.cartName}>{item.name}</span>
                        <span style={styles.cartPrice}>\${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div style={styles.cartControls}>
                        <button onClick={() => updateQty(item.id, -1)} style={styles.qtyBtn}><Minus size={14} /></button>
                        <span style={styles.qty}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={styles.qtyBtn}><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <div style={styles.cartTotal}>
                    <span>Total</span>
                    <span style={styles.totalAmount}>\${total.toFixed(2)}</span>
                  </div>
                  <button style={styles.checkoutBtn}><ShoppingBag size={18} /> Checkout</button>
                </>
              )}
              <div style={styles.callOption}>
                <p style={styles.callText}>Prefer to call?</p>
                <a href="tel:${phone}" style={styles.callBtn}><Phone size={16} /> ${phone}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  header: { padding: '48px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  title: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '8px' },
  subtitle: { color: '${colors.textMuted}' },
  orderOptions: { padding: '24px', textAlign: 'center', borderBottom: '1px solid ${colors.borderColor || "#e5e7eb"}' },
  optionBtns: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' },
  optionBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '2px solid ${colors.borderColor || "#e5e7eb"}', borderRadius: '${style.borderRadius}', background: '${colors.cardBg || "#fff"}', cursor: 'pointer', fontWeight: '500', color: '${colors.text}' },
  optionActive: { borderColor: '${colors.primary}', background: '${colors.primary}', color: '#fff' },
  infoText: { color: '${colors.textMuted}', fontSize: '0.9rem' },
  content: { padding: '${style.sectionPadding}' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '48px' },
  menu: {},
  sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '600', color: '${colors.text}', marginBottom: '24px' },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  menuCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '${colors.cardBg || "#fff"}', padding: '16px', borderRadius: '${style.borderRadius}', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  menuInfo: {},
  menuName: { fontFamily: "${style.fontHeading}", fontWeight: '600', color: '${colors.text}', marginBottom: '2px' },
  menuCategory: { color: '${colors.textMuted}', fontSize: '0.85rem', marginBottom: '4px' },
  menuPrice: { color: '${colors.primary}', fontWeight: '700' },
  addBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '${colors.primary}', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cartSection: { background: '${colors.cardBg || "#fff"}', padding: '24px', borderRadius: '${style.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: 'fit-content', position: 'sticky', top: '24px' },
  emptyCart: { color: '${colors.textMuted}', textAlign: 'center', padding: '32px 0' },
  cartItem: { padding: '12px 0', borderBottom: '1px solid ${colors.borderColor || "#e5e7eb"}' },
  cartInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  cartName: { fontWeight: '500', color: '${colors.text}' },
  cartPrice: { color: '${colors.primary}', fontWeight: '600' },
  cartControls: { display: 'flex', alignItems: 'center', gap: '12px' },
  qtyBtn: { width: '28px', height: '28px', borderRadius: '50%', border: '1px solid ${colors.borderColor || "#e5e7eb"}', background: '${colors.background}', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '${colors.text}' },
  qty: { fontWeight: '600', color: '${colors.text}' },
  cartTotal: { display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontWeight: '600', fontSize: '1.1rem', color: '${colors.text}' },
  totalAmount: { color: '${colors.primary}' },
  checkoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: '${colors.primary}', color: '#fff', border: 'none', padding: '16px', borderRadius: '${style.borderRadius}', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  callOption: { marginTop: '24px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid ${colors.borderColor || "#e5e7eb"}' },
  callText: { color: '${colors.textMuted}', marginBottom: '8px', fontSize: '0.9rem' },
  callBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '${colors.primary}', textDecoration: 'none', fontWeight: '600' }
};
`;
}

function generateEcommerceOrderPage(businessName, phone, colors, style, businessData = {}) {
  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, Shield, ArrowRight, Package } from 'lucide-react';

export default function OrderPage() {
  const [step, setStep] = useState(1);

  const orderSteps = [
    { num: 1, title: 'Browse', desc: 'Select your items' },
    { num: 2, title: 'Cart', desc: 'Review your order' },
    { num: 3, title: 'Checkout', desc: 'Complete purchase' },
    { num: 4, title: 'Enjoy', desc: 'Delivered to you' }
  ];

  const benefits = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: Package, title: 'Fresh Guarantee', desc: 'Arrives fresh or free' },
    { icon: Shield, title: 'Secure Payment', desc: '100% protected checkout' },
    { icon: CreditCard, title: 'Easy Returns', desc: '30-day satisfaction guarantee' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Order Online</h1>
        <p style={styles.subtitle}>Fresh baked goods delivered nationwide</p>
      </header>

      <section style={styles.steps}>
        <div style={styles.stepsGrid}>
          {orderSteps.map((s, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{...styles.stepNum, ...(s.num <= step ? styles.stepActive : {})}}>{s.num}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <div style={styles.ctaContent}>
          <ShoppingCart size={48} color="${colors.primary}" />
          <h2 style={styles.ctaTitle}>Ready to Order?</h2>
          <p style={styles.ctaText}>Browse our menu and add your favorites to cart</p>
          <Link to="/menu" style={styles.ctaBtn}>Shop Menu <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section style={styles.benefits}>
        <div style={styles.container}>
          <div style={styles.benefitsGrid}>
            {benefits.map((b, i) => (
              <div key={i} style={styles.benefitCard}>
                <b.icon size={28} color="${colors.primary}" />
                <h3 style={styles.benefitTitle}>{b.title}</h3>
                <p style={styles.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.faq}>
        <div style={styles.container}>
          <h2 style={styles.faqTitle}>Shipping FAQ</h2>
          <div style={styles.faqGrid}>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>How long does shipping take?</h4>
              <p style={styles.faqA}>Standard shipping takes 2-3 business days. Express overnight is available.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>How do you keep items fresh?</h4>
              <p style={styles.faqA}>All items are packed with ice packs in insulated boxes for maximum freshness.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>Do you ship nationwide?</h4>
              <p style={styles.faqA}>Yes! We ship to all 50 states. Some remote areas may have extended delivery times.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '${colors.backgroundAlt || "#f8fafc"}' },
  title: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '8px' },
  subtitle: { color: '${colors.textMuted}' },
  steps: { padding: '48px 24px', borderBottom: '1px solid ${colors.borderColor || "#e5e7eb"}' },
  stepsGrid: { display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' },
  stepItem: { textAlign: 'center' },
  stepNum: { width: '48px', height: '48px', borderRadius: '50%', border: '2px solid ${colors.borderColor || "#e5e7eb"}', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: '700', color: '${colors.textMuted}' },
  stepActive: { background: '${colors.primary}', borderColor: '${colors.primary}', color: '#fff' },
  stepTitle: { fontFamily: "${style.fontHeading}", fontWeight: '600', color: '${colors.text}', marginBottom: '4px' },
  stepDesc: { color: '${colors.textMuted}', fontSize: '0.9rem' },
  cta: { padding: '80px 24px', textAlign: 'center' },
  ctaContent: { maxWidth: '500px', margin: '0 auto' },
  ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', margin: '24px 0 12px' },
  ctaText: { color: '${colors.textMuted}', marginBottom: '24px' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${colors.primary}', color: '#fff', padding: '16px 32px', borderRadius: '${style.borderRadius}', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' },
  benefits: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt || "#f8fafc"}' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  benefitsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' },
  benefitCard: { background: '${colors.cardBg || "#fff"}', padding: '28px', borderRadius: '${style.borderRadius}', textAlign: 'center' },
  benefitTitle: { fontFamily: "${style.fontHeading}", fontWeight: '600', color: '${colors.text}', margin: '12px 0 8px' },
  benefitDesc: { color: '${colors.textMuted}', fontSize: '0.9rem' },
  faq: { padding: '${style.sectionPadding}' },
  faqTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.75rem', fontWeight: '700', color: '${colors.text}', textAlign: 'center', marginBottom: '48px' },
  faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  faqItem: { background: '${colors.cardBg || "#fff"}', padding: '24px', borderRadius: '${style.borderRadius}' },
  faqQ: { fontFamily: "${style.fontHeading}", fontWeight: '600', color: '${colors.text}', marginBottom: '8px' },
  faqA: { color: '${colors.textMuted}', lineHeight: 1.6 }
};
`;
}

function generateLuxuryOrderPage(businessName, phone, colors, style, businessData = {}) {
  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Phone, ArrowRight } from 'lucide-react';

export default function OrderPage() {
  const [orderType, setOrderType] = useState('collection');

  const services = [
    { type: 'collection', title: 'Atelier Collection', desc: 'Visit our atelier to select your pieces in person', time: 'Available daily, 9am - 7pm' },
    { type: 'delivery', title: 'White Glove Delivery', desc: 'Complimentary same-day delivery within the city', time: 'Order by 2pm for same-day' },
    { type: 'custom', title: 'Bespoke Orders', desc: 'Commission a custom creation for your special occasion', time: '48-72 hour lead time' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.label}>ORDERING</span>
        <h1 style={styles.title}>Acquire Our Creations</h1>
        <p style={styles.subtitle}>Experience the art of acquisition</p>
      </header>

      <section style={styles.services}>
        <div style={styles.container}>
          <div style={styles.serviceGrid}>
            {services.map((service, i) => (
              <div
                key={i}
                onClick={() => setOrderType(service.type)}
                style={{...styles.serviceCard, ...(orderType === service.type ? styles.serviceActive : {})}}
              >
                <h3 style={styles.serviceTitle}>{service.title}</h3>
                <p style={styles.serviceDesc}>{service.desc}</p>
                <p style={styles.serviceTime}><Clock size={14} /> {service.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.action}>
        <div style={styles.actionContent}>
          {orderType === 'collection' && (
            <>
              <h2 style={styles.actionTitle}>Visit Our Atelier</h2>
              <p style={styles.actionText}>Experience our collection in person. Our artisans will guide you through our offerings.</p>
              <Link to="/contact" style={styles.actionBtn}>Schedule Visit <ArrowRight size={16} /></Link>
            </>
          )}
          {orderType === 'delivery' && (
            <>
              <h2 style={styles.actionTitle}>Delivered to You</h2>
              <p style={styles.actionText}>Browse our collection online and have your selection delivered with care.</p>
              <Link to="/menu" style={styles.actionBtn}>View Collection <ArrowRight size={16} /></Link>
            </>
          )}
          {orderType === 'custom' && (
            <>
              <h2 style={styles.actionTitle}>Bespoke Creations</h2>
              <p style={styles.actionText}>Commission a unique piece for your celebration. Our artisans await your vision.</p>
              <a href="tel:${phone}" style={styles.actionBtn}><Phone size={16} /> ${phone}</a>
            </>
          )}
        </div>
      </section>

      <section style={styles.note}>
        <p style={styles.noteText}>
          For corporate orders, events, or inquiries regarding our seasonal collections,
          please contact our concierge team directly.
        </p>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${colors.background}', color: '${colors.text}', minHeight: '100vh' },
  header: { padding: '100px 24px 60px', textAlign: 'center' },
  label: { color: '${colors.accent || "#d4af37"}', letterSpacing: '4px', fontSize: '0.85rem' },
  title: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '300', marginTop: '16px', marginBottom: '12px' },
  subtitle: { color: '${colors.textMuted}', fontSize: '1.1rem' },
  services: { padding: '60px 24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  serviceCard: { background: '${colors.backgroundAlt}', padding: '32px', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid transparent' },
  serviceActive: { borderColor: '${colors.accent || "#d4af37"}' },
  serviceTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '400', marginBottom: '12px' },
  serviceDesc: { color: '${colors.textMuted}', lineHeight: 1.6, marginBottom: '16px' },
  serviceTime: { display: 'flex', alignItems: 'center', gap: '8px', color: '${colors.accent || "#d4af37"}', fontSize: '0.9rem' },
  action: { padding: '80px 24px', textAlign: 'center', background: '${colors.backgroundAlt}' },
  actionContent: { maxWidth: '500px', margin: '0 auto' },
  actionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '300', marginBottom: '16px' },
  actionText: { color: '${colors.textMuted}', lineHeight: 1.6, marginBottom: '32px' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '${colors.accent || "#d4af37"}', textDecoration: 'none', letterSpacing: '2px', fontSize: '0.9rem', borderBottom: '1px solid ${colors.accent || "#d4af37"}', paddingBottom: '4px' },
  note: { padding: '60px 24px', textAlign: 'center' },
  noteText: { color: '${colors.textMuted}', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, fontStyle: 'italic' }
};
`;
}

// ============================================
// RESEARCH-AWARE SECTION GENERATION
// Functions that leverage design research for intelligent section ordering
// ============================================

/**
 * Section template mapping - maps section keys to template/component names
 */
const SECTION_TEMPLATES = {
  // Hero variations
  'hero-video': 'HeroVideo',
  'hero-image': 'HeroImage',
  'hero-split': 'HeroSplit',
  'hero-fullscreen': 'HeroFullscreen',
  'hero-carousel': 'HeroCarousel',
  'hero-with-search': 'HeroWithSearch',
  'hero-with-form': 'HeroWithForm',

  // Food & Beverage
  'featured-drinks': 'FeaturedDrinks',
  'menu-preview': 'MenuPreview',
  'menu-grid': 'MenuGrid',
  'menu-categories': 'MenuCategories',
  'daily-specials': 'DailySpecials',
  'signature-dishes': 'SignatureDishes',
  'signature-pizzas': 'SignaturePizzas',
  'signature-cuts': 'SignatureCuts',
  'order-now-banner': 'OrderNowBanner',
  'order-online-cta': 'OrderOnlineCTA',
  'reservation-widget': 'ReservationWidget',
  'tap-list': 'TapList',
  'delivery-info': 'DeliveryInfo',

  // About & Story
  'about-preview': 'AboutPreview',
  'about': 'About',
  'our-story': 'OurStory',
  'chef-story': 'ChefStory',
  'our-tradition': 'OurTradition',
  'our-heritage': 'OurHeritage',
  'our-process': 'OurProcess',
  'sourcing': 'Sourcing',
  'farm-partners': 'FarmPartners',
  'aging-process': 'AgingProcess',
  'philosophy': 'Philosophy',

  // Team & Profiles
  'team-carousel': 'TeamCarousel',
  'team': 'Team',
  'barber-profiles': 'BarberProfiles',
  'stylists': 'Stylists',
  'trainers': 'Trainers',
  'instructors': 'Instructors',
  'providers': 'Providers',
  'agents': 'Agents',
  'attorneys': 'Attorneys',

  // Galleries
  'gallery': 'Gallery',
  'gallery-masonry': 'GalleryMasonry',
  'atmosphere-gallery': 'AtmosphereGallery',
  'before-after-gallery': 'BeforeAfterGallery',
  'work-gallery': 'WorkGallery',
  'smile-gallery': 'SmileGallery',

  // Testimonials & Reviews
  'reviews': 'Reviews',
  'testimonials': 'Testimonials',
  'transformation-stories': 'TransformationStories',
  'success-stories': 'SuccessStories',

  // Booking & CTAs
  'book-now-widget': 'BookNowWidget',
  'book-appointment': 'BookAppointment',
  'book-escape': 'BookEscape',
  'schedule-appointment': 'ScheduleAppointment',
  'free-trial-cta': 'FreeTrialCTA',
  'free-consultation': 'FreeConsultation',
  'consultation-form': 'ConsultationForm',
  'instant-quote': 'InstantQuote',
  'get-quote': 'GetQuote',

  // Locations & Contact
  'locations': 'Locations',
  'location': 'Location',
  'visit-us': 'VisitUs',
  'contact': 'Contact',
  'service-area': 'ServiceArea',
  'emergency-banner': 'EmergencyBanner',

  // Services
  'services': 'Services',
  'services-grid': 'ServicesGrid',
  'services-pricing': 'ServicesPricing',
  'treatment-categories': 'TreatmentCategories',
  'signature-treatments': 'SignatureTreatments',
  'spa-menu': 'SpaMenu',
  'practice-areas': 'PracticeAreas',
  'common-services': 'CommonServices',
  'full-services': 'FullServices',

  // Pricing & Membership
  'pricing': 'Pricing',
  'membership': 'Membership',
  'membership-tiers': 'MembershipTiers',
  'packages': 'Packages',
  'maintenance-plans': 'MaintenancePlans',
  'financing': 'Financing',

  // Schedule & Classes
  'class-schedule': 'ClassSchedule',
  'todays-classes': 'TodaysClasses',
  'class-types': 'ClassTypes',
  'schedule': 'Schedule',
  'events-calendar': 'EventsCalendar',

  // Trust & Social Proof
  'trust-badges': 'TrustBadges',
  'credentials': 'Credentials',
  'insurance': 'Insurance',
  'certifications': 'Certifications',
  'social-proof': 'SocialProof',
  'results': 'Results',
  'track-record': 'TrackRecord',
  'case-studies': 'CaseStudies',
  'awards': 'Awards',
  'press-awards': 'PressAwards',

  // Loyalty & Programs
  'loyalty-cta': 'LoyaltyCTA',
  'rewards': 'Rewards',
  'new-student-offer': 'NewStudentOffer',

  // Healthcare Specific
  'patient-portal-cta': 'PatientPortalCTA',
  'patient-forms': 'PatientForms',
  'telehealth': 'Telehealth',
  'pet-portal': 'PetPortal',
  'urgent-care': 'UrgentCare',

  // Real Estate
  'featured-listings': 'FeaturedListings',
  'property-search': 'PropertySearch',
  'market-stats': 'MarketStats',
  'home-valuation': 'HomeValuation',

  // Ecommerce
  'featured-products': 'FeaturedProducts',
  'bestsellers': 'Bestsellers',
  'categories': 'Categories',
  'collections': 'Collections',
  'promo-bar': 'PromoBanner',
  'newsletter': 'Newsletter',

  // SaaS
  'features': 'Features',
  'how-it-works': 'HowItWorks',
  'integrations': 'Integrations',
  'demo-cta': 'DemoCTA',

  // Private Events & Special
  'private-events': 'PrivateEvents',
  'private-dining': 'PrivateDining',
  'catering': 'Catering',
  'custom-orders': 'CustomOrders',
  'gift-cards': 'GiftCards',
  'products': 'Products',
  'merchandise': 'Merchandise',
  'wine-program': 'WineProgram',
  'virtual-tour': 'VirtualTour',
  'facility-tour': 'FacilityTour',
  'community': 'Community',
  'community-events': 'CommunityEvents',

  // Education
  'programs': 'Programs',
  'campus-life': 'CampusLife',
  'outcomes': 'Outcomes',
  'apply-now': 'ApplyNow',
  'visit-campus': 'VisitCampus'
};

/**
 * Get section template name from section key
 * @param {string} sectionKey - Section key from layout
 * @returns {string} Template/component name
 */
function getSectionTemplate(sectionKey) {
  return SECTION_TEMPLATES[sectionKey] || sectionKey;
}

/**
 * Get research-informed sections for a page
 * @param {string} industry - Industry key (e.g., 'coffee-shop', 'dental')
 * @param {string} layoutVariant - Layout variant ('A', 'B', or 'C')
 * @returns {Array} Array of section objects with key, template, and features
 */
function getResearchSections(industry, layoutVariant = 'A') {
  const layout = getResearchLayout(industry, layoutVariant);
  if (!layout) {
    console.warn(`No research layout found for industry: ${industry}, variant: ${layoutVariant}`);
    return [];
  }

  return layout.sectionOrder.map(sectionKey => ({
    key: sectionKey,
    template: getSectionTemplate(sectionKey),
    features: layout.features || []
  }));
}

/**
 * Get winning elements applicable to an industry with their templates
 * @param {string} industry - Industry key
 * @returns {Array} Array of winning element objects
 */
function getIndustryWinningElements(industry) {
  return getWinningElementsForIndustry(industry);
}

/**
 * Get high-priority winning elements for an industry
 * @param {string} industry - Industry key
 * @returns {Array} Array of high-priority winning elements
 */
function getIndustryHighPriorityElements(industry) {
  return getHighPriorityElements(industry);
}

/**
 * Build a complete page structure using research layouts
 * @param {string} industry - Industry key
 * @param {string} layoutVariant - Layout variant ('A', 'B', or 'C')
 * @param {object} businessData - Business data from fixture
 * @returns {object} Complete page structure with sections and metadata
 */
function buildResearchInformedPage(industry, layoutVariant = 'A', businessData = {}) {
  const layout = getResearchLayout(industry, layoutVariant);
  const winningElements = getWinningElementsForIndustry(industry);
  const highPriorityElements = getHighPriorityElements(industry);

  if (!layout) {
    return {
      success: false,
      error: `No research layout found for ${industry}`,
      fallback: {
        sections: ['hero-image', 'services', 'about', 'testimonials', 'contact'],
        features: []
      }
    };
  }

  return {
    success: true,
    industry,
    layoutVariant,
    layoutName: layout.name,
    heroType: layout.heroType,
    sections: layout.sectionOrder.map(sectionKey => ({
      key: sectionKey,
      template: getSectionTemplate(sectionKey),
      order: layout.sectionOrder.indexOf(sectionKey)
    })),
    features: layout.features,
    winningElements: winningElements.map(el => ({
      key: el.elementKey,
      template: el.template,
      placement: el.placement,
      priority: el.priority
    })),
    highPriorityElements: highPriorityElements.map(el => el.elementKey),
    metadata: {
      businessName: businessData.name || 'Business',
      industry: businessData.industry || industry,
      totalSections: layout.sectionOrder.length,
      totalWinningElements: winningElements.length
    }
  };
}

/**
 * Get all available layout variants for an industry
 * @param {string} industry - Industry key
 * @returns {object} Object with layout variants or null
 */
function getAvailableLayoutVariants(industry) {
  return getResearchLayoutVariants(industry);
}

/**
 * Compare layout variants for an industry
 * @param {string} industry - Industry key
 * @returns {Array} Array of layout summaries for comparison
 */
function compareLayoutVariants(industry) {
  const variants = getResearchLayoutVariants(industry);
  if (!variants) return [];

  return ['A', 'B', 'C'].map(variant => {
    const layout = variants[`layout${variant}`];
    if (!layout) return null;

    return {
      variant,
      name: layout.name,
      heroType: layout.heroType,
      sectionCount: layout.sectionOrder.length,
      sections: layout.sectionOrder,
      features: layout.features,
      primaryFocus: layout.sectionOrder[1] || layout.sectionOrder[0] // First non-hero section
    };
  }).filter(Boolean);
}

/**
 * Recommend best layout variant based on business goals
 * @param {string} industry - Industry key
 * @param {string} primaryGoal - Primary business goal (e.g., 'conversion', 'branding', 'trust')
 * @returns {object} Recommended layout with reasoning
 */
function recommendLayoutVariant(industry, primaryGoal = 'conversion') {
  const variants = compareLayoutVariants(industry);
  if (!variants.length) return null;

  // Goal-based layout recommendations
  const goalMapping = {
    'conversion': 'A', // Layout A typically focuses on primary actions
    'branding': 'C',   // Layout C typically focuses on story/brand
    'trust': 'B',      // Layout B often includes trust elements
    'booking': 'A',    // Layout A for service businesses
    'portfolio': 'B',  // Layout B for visual-heavy businesses
    'story': 'C',      // Layout C for story-driven businesses
    'order': 'A',      // Layout A for order-focused businesses
    'experience': 'C'  // Layout C for experience-focused businesses
  };

  const recommendedVariant = goalMapping[primaryGoal] || 'A';
  const recommended = variants.find(v => v.variant === recommendedVariant) || variants[0];

  return {
    recommended,
    reasoning: `Layout ${recommended.variant} (${recommended.name}) is recommended for "${primaryGoal}" goal`,
    allVariants: variants
  };
}

module.exports = {
  generateHomePage,
  generateMenuPage,
  generateAboutPage,
  generateContactPage,
  generateGalleryPage,
  generateOrderPage,
  generateEcommerceHomePage,
  generateLuxuryHomePage,
  generateLocalHomePage,
  generateLocalMenuPage,
  generateLuxuryMenuPage,
  generateEcommerceMenuPage,
  generateLocalAboutPage,
  generateEcommerceAboutPage,
  generateLuxuryAboutPage,
  generateLocalContactPage,
  generateEcommerceContactPage,
  generateLuxuryContactPage,
  generateLocalGalleryPage,
  generateEcommerceGalleryPage,
  generateLuxuryGalleryPage,
  generateLocalOrderPage,
  generateEcommerceOrderPage,
  generateLuxuryOrderPage,
  // Research-aware exports
  getResearchSections,
  getSectionTemplate,
  getIndustryWinningElements,
  getIndustryHighPriorityElements,
  buildResearchInformedPage,
  getAvailableLayoutVariants,
  compareLayoutVariants,
  recommendLayoutVariant,
  SECTION_TEMPLATES
};
