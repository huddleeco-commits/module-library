/**
 * Grooming/Beauty Page Generators
 *
 * Generates pages for barbershops, salons, and beauty services
 * Archetypes: vintage-classic, modern-sleek, neighborhood-friendly
 */

// Unsplash images for grooming industries
const IMAGES = {
  barbershop: {
    hero: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920',
    chairs: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    shave: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800',
    tools: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800',
    interior: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800',
    barber: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800'
  },
  salon: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920',
    styling: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    interior: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800',
    products: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800'
  },
  spa: {
    hero: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920',
    massage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800',
    facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    interior: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
  }
};

const GROOMING_ARCHETYPES = {
  'vintage-classic': {
    id: 'vintage-classic',
    name: 'Vintage Classic',
    description: 'Traditional, masculine, heritage feel. Perfect for classic barbershops.',
    bestFor: ['barbershop', 'traditional salon', 'mens grooming'],
    style: {
      colors: { primary: '#1A1A2E', secondary: '#C9A227', accent: '#E43F5A' },
      typography: { headingFont: "'Bebas Neue', sans-serif", headingWeight: '700', headingStyle: 'uppercase' },
      borderRadius: '4px'
    }
  },
  'modern-sleek': {
    id: 'modern-sleek',
    name: 'Modern Sleek',
    description: 'Clean, contemporary, minimalist. Great for upscale salons.',
    bestFor: ['modern salon', 'spa', 'beauty bar', 'upscale grooming'],
    style: {
      colors: { primary: '#18181B', secondary: '#A855F7', accent: '#F472B6' },
      typography: { headingFont: "'Inter', sans-serif", headingWeight: '600', headingStyle: 'none' },
      borderRadius: '12px'
    }
  },
  'neighborhood-friendly': {
    id: 'neighborhood-friendly',
    name: 'Neighborhood Friendly',
    description: 'Warm, welcoming, community-focused. Ideal for family salons.',
    bestFor: ['family salon', 'neighborhood barbershop', 'community beauty'],
    style: {
      colors: { primary: '#059669', secondary: '#34D399', accent: '#FCD34D' },
      typography: { headingFont: "'Poppins', sans-serif", headingWeight: '600', headingStyle: 'none' },
      borderRadius: '16px'
    }
  }
};

const GROOMING_INDUSTRIES = ['barbershop', 'barber', 'salon', 'hair salon', 'beauty salon', 'spa', 'nail salon', 'beauty', 'mens grooming'];

function isGroomingIndustry(industry) {
  if (!industry) return false;
  const lower = industry.toLowerCase();
  return GROOMING_INDUSTRIES.some(ind => lower.includes(ind));
}

function detectGroomingArchetype(businessData) {
  const combined = `${businessData.name || ''} ${businessData.description || ''} ${businessData.tagline || ''} ${businessData.industry || ''}`.toLowerCase();

  // Vintage/classic indicators
  if (combined.includes('classic') || combined.includes('traditional') || combined.includes('vintage') ||
      combined.includes('heritage') || combined.includes('old school') || combined.includes('1920') ||
      combined.includes('gentleman') || combined.includes('barber')) {
    return GROOMING_ARCHETYPES['vintage-classic'];
  }

  // Modern/upscale indicators
  if (combined.includes('modern') || combined.includes('sleek') || combined.includes('luxury') ||
      combined.includes('upscale') || combined.includes('premium') || combined.includes('spa') ||
      combined.includes('boutique') || combined.includes('studio')) {
    return GROOMING_ARCHETYPES['modern-sleek'];
  }

  // Default to neighborhood friendly
  return GROOMING_ARCHETYPES['neighborhood-friendly'];
}

function getGroomingArchetype(id) {
  return GROOMING_ARCHETYPES[id] || GROOMING_ARCHETYPES['neighborhood-friendly'];
}

/**
 * Generate HomePage based on grooming archetype
 * Now supports research data from Scout/Yelp enrichment
 */
function generateHomePage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getGroomingArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const address = businessData.address || '';
  const phone = businessData.phone || '(555) 123-4567';
  const industry = (businessData.industry || 'barbershop').toLowerCase();

  // Select images based on industry type
  // Use research photos if available, otherwise fall back to Unsplash defaults
  let images = industry.includes('spa') ? IMAGES.spa :
               industry.includes('salon') && !industry.includes('barber') ? IMAGES.salon :
               IMAGES.barbershop;

  // Override with real photos from Yelp/Google if available
  if (businessData.photos && businessData.photos.length > 0) {
    images = {
      ...images,
      hero: businessData.heroImage || businessData.photos[0],
      interior: businessData.photos[1] || images.interior,
      styling: businessData.photos[2] || images.styling
    };
  }

  // Merge colors
  let c = { ...style.colors, ...colors };

  // Apply dark/medium theme
  const isDark = styleOverrides.isDark || false;
  if (isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8' };
  }

  const themeStyle = {
    ...style,
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || style.typography?.bodyFont || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '32px',
    headlineStyle: styleOverrides.headlineStyle || style.typography?.headingStyle || 'none',
    buttonPadding: styleOverrides.buttonStyle?.padding || '16px 32px'
  };

  // Pass full businessData to sub-generators for research data access
  if (arch.id === 'vintage-classic') {
    return generateVintageHomePage(businessName, address, phone, industry, images, c, themeStyle, businessData);
  } else if (arch.id === 'modern-sleek') {
    return generateModernHomePage(businessName, address, phone, industry, images, c, themeStyle, businessData);
  } else {
    return generateNeighborhoodHomePage(businessName, address, phone, industry, images, c, themeStyle, businessData);
  }
}

function generateVintageHomePage(businessName, address, phone, industry, images, colors, style, businessData = {}) {
  const c = colors;
  // Extract research data for personalization
  const rating = businessData.rating || null;
  const reviewCount = businessData.reviewCount || 0;
  const reviewHighlights = businessData.reviewHighlights || [];
  const categories = businessData.categories || [];
  const priceLevel = businessData.priceLevel || '';
  const yelpUrl = businessData.yelpUrl || null;

  // Generate rating badge code if we have rating data
  const ratingBadgeCode = rating ? `
          <div style={styles.ratingBadge}>
            <Star size={18} fill="#FFD700" color="#FFD700" />
            <span style={styles.ratingText}>${rating}</span>
            <span style={styles.reviewCount}>(${reviewCount} reviews)</span>
          </div>` : '';

  // Generate testimonials section from real reviews
  const hasRealReviews = reviewHighlights && reviewHighlights.length > 0;
  const testimonialsSectionCode = hasRealReviews ? `
      <section style={styles.testimonials}>
        <h2 style={{...styles.sectionTitle, color: '#fff'}}>What Our Customers Say</h2>
        <div style={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <div key={i} style={styles.testimonialCard}>
              <div style={styles.testimonialStars}>
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#FFD700" color="#FFD700" />)}
              </div>
              <p style={styles.testimonialText}>{t.text}</p>
              <p style={styles.testimonialSource}>— Verified Customer</p>
            </div>
          ))}
        </div>
        ${yelpUrl ? `<a href="${yelpUrl}" target="_blank" rel="noopener noreferrer" style={styles.yelpLink}>See all reviews on Yelp →</a>` : ''}
      </section>` : '';

  // Generate testimonials data from real reviews
  const testimonialsDataCode = hasRealReviews ? `
  const testimonials = [
    ${reviewHighlights.slice(0, 3).map(r => `{ rating: ${r.rating || 5}, text: "${(r.text || '').replace(/"/g, '\\"').substring(0, 150)}${(r.text || '').length > 150 ? '...' : ''}" }`).join(',\n    ')}
  ];` : '';

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Clock, Star, Users, Phone, MapPin, Calendar } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '90vh', background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url("${images.hero}") center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '${style.sectionPadding}' },
    heroContent: { maxWidth: '800px' },
    heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '700', color: '${c.secondary}', marginBottom: '16px', textTransform: '${style.headlineStyle}', letterSpacing: '0.05em' },
    heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.25rem', color: '#fff', marginBottom: '24px', opacity: 0.9 },
    ratingBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '8px', marginBottom: '24px' },
    ratingText: { color: '#FFD700', fontWeight: '700', fontSize: '1.1rem' },
    reviewCount: { color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' },
    heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    btnPrimary: { background: '${c.secondary}', color: '${c.primary}', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '700', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' },
    btnSecondary: { background: 'transparent', border: '2px solid ${c.secondary}', color: '${c.secondary}', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '700', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' },
    section: { padding: '${style.sectionPadding}', background: '${c.background}' },
    sectionAlt: { padding: '${style.sectionPadding}', background: '${c.backgroundAlt || c.primary}' },
    sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '${c.text || "#fff"}', textAlign: 'center', marginBottom: '48px', textTransform: '${style.headlineStyle}', letterSpacing: '0.05em' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${style.gap}', maxWidth: '1200px', margin: '0 auto' },
    serviceCard: { background: '${c.backgroundAlt || "#1a1a2e"}', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}', textAlign: 'center', border: '1px solid ${c.secondary}22' },
    serviceName: { fontFamily: "${style.fontHeading}", fontSize: '1.5rem', fontWeight: '700', color: '${c.secondary}', marginBottom: '8px' },
    servicePrice: { fontFamily: "${style.fontBody}", fontSize: '1.25rem', color: '${c.text || "#fff"}', marginBottom: '12px' },
    serviceDesc: { fontFamily: "${style.fontBody}", color: '${c.textMuted || "#999"}', fontSize: '0.95rem' },
    features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' },
    featureItem: { textAlign: 'center' },
    featureIcon: { width: '60px', height: '60px', background: '${c.secondary}', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '${c.primary}' },
    featureTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '700', color: '${c.text || "#fff"}', marginBottom: '8px' },
    featureText: { fontFamily: "${style.fontBody}", color: '${c.textMuted || "#999"}' },
    testimonials: { padding: '${style.sectionPadding}', background: '${c.primary}' },
    testimonialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
    testimonialCard: { background: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '${style.borderRadius}', borderLeft: '4px solid ${c.secondary}' },
    testimonialStars: { display: 'flex', gap: '4px', marginBottom: '12px' },
    testimonialText: { fontFamily: "${style.fontBody}", color: '#fff', fontStyle: 'italic', marginBottom: '12px', lineHeight: 1.6 },
    testimonialSource: { fontFamily: "${style.fontBody}", color: '${c.secondary}', fontSize: '0.9rem' },
    yelpLink: { display: 'block', textAlign: 'center', marginTop: '32px', color: '${c.secondary}', textDecoration: 'none', fontWeight: '600' },
    cta: { padding: '${style.sectionPadding}', background: '${c.backgroundAlt || c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '${c.secondary}', marginBottom: '16px', textTransform: 'uppercase' },
    ctaText: { fontFamily: "${style.fontBody}", color: '#fff', marginBottom: '24px', fontSize: '1.1rem' }
  };

  const services = [
    { name: 'Classic Haircut', price: '$35', description: 'Precision cut with hot towel finish' },
    { name: 'Beard Trim', price: '$20', description: 'Shape and trim with straight razor edge' },
    { name: 'Hot Towel Shave', price: '$40', description: 'Traditional straight razor experience' },
    { name: 'The Works', price: '$65', description: 'Haircut + beard + hot towel treatment' }
  ];
${testimonialsDataCode}

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>${businessName}</h1>
          <p style={styles.heroSubtitle}>Where Style Meets Tradition. Premium cuts and classic shaves since day one.</p>${ratingBadgeCode}
          <div style={styles.heroButtons}>
            <Link to="/contact" style={styles.btnPrimary}>Book Now</Link>
            <Link to="/services" style={styles.btnSecondary}>View Services</Link>
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <h2 style={{...styles.sectionTitle, color: '#fff'}}>Our Services</h2>
        <div style={styles.servicesGrid}>
          {services.map((service, i) => (
            <div key={i} style={styles.serviceCard}>
              <h3 style={styles.serviceName}>{service.name}</h3>
              <p style={styles.servicePrice}>{service.price}</p>
              <p style={styles.serviceDesc}>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={{...styles.sectionTitle, color: '${c.primary}'}}>The Experience</h2>
        <div style={styles.features}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Scissors size={28} /></div>
            <h3 style={{...styles.featureTitle, color: '${c.primary}'}}>Expert Barbers</h3>
            <p style={{...styles.featureText, color: '${c.primary}99'}}>Skilled craftsmen with years of experience</p>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Clock size={28} /></div>
            <h3 style={{...styles.featureTitle, color: '${c.primary}'}}>Walk-Ins Welcome</h3>
            <p style={{...styles.featureText, color: '${c.primary}99'}}>No appointment? No problem.</p>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Star size={28} /></div>
            <h3 style={{...styles.featureTitle, color: '${c.primary}'}}>Premium Quality</h3>
            <p style={{...styles.featureText, color: '${c.primary}99'}}>Only the best products and techniques</p>
          </div>
        </div>
      </section>
${testimonialsSectionCode}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready for a Fresh Cut?</h2>
        <p style={styles.ctaText}>Walk in or book your appointment today</p>
        <Link to="/contact" style={styles.btnPrimary}>Book Appointment</Link>
      </section>
    </div>
  );
}
`;
}

function generateModernHomePage(businessName, address, phone, industry, images, colors, style, businessData = {}) {
  const c = colors;
  // Research data available: businessData.rating, businessData.reviewCount, businessData.reviewHighlights, etc.
  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Shield, Heart, Phone, MapPin, Calendar } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '100vh', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary}33 100%)', display: 'flex', alignItems: 'center', padding: '${style.sectionPadding}' },
    heroInner: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', maxWidth: '1400px', margin: '0 auto', alignItems: 'center' },
    heroContent: { },
    heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '600', color: '#fff', marginBottom: '24px', lineHeight: 1.1 },
    heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '32px', lineHeight: 1.6 },
    heroButtons: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    btnPrimary: { background: '#fff', color: '${c.primary}', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: 'transparent', border: '2px solid #fff', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none' },
    heroImage: { borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' },
    heroImg: { width: '100%', height: '500px', objectFit: 'cover' },
    section: { padding: '${style.sectionPadding}', background: '${c.background}' },
    sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '600', color: '${c.text}', textAlign: 'center', marginBottom: '16px' },
    sectionSubtitle: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${style.gap}', maxWidth: '1200px', margin: '0 auto' },
    serviceCard: { background: '${c.backgroundAlt || "#fff"}', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s' },
    serviceName: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${c.text}', marginBottom: '8px' },
    servicePrice: { fontFamily: "${style.fontBody}", fontSize: '1.5rem', fontWeight: '700', color: '${c.secondary}', marginBottom: '12px' },
    serviceDesc: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', fontSize: '0.95rem' },
    cta: { padding: '${style.sectionPadding}', background: 'linear-gradient(135deg, ${c.secondary} 0%, ${c.accent || c.primary} 100%)', textAlign: 'center' },
    ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '600', color: '#fff', marginBottom: '16px' },
    ctaText: { fontFamily: "${style.fontBody}", color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontSize: '1.1rem' }
  };

  const services = [
    { name: 'Signature Cut', price: '$55', description: 'Consultation, precision cut, styling, and finish' },
    { name: 'Color Service', price: 'From $85', description: 'Full color, highlights, or balayage' },
    { name: 'Blowout & Style', price: '$45', description: 'Wash, blow dry, and professional styling' },
    { name: 'Spa Treatment', price: '$75', description: 'Scalp massage, deep conditioning, styling' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>${businessName}</h1>
            <p style={styles.heroSubtitle}>Elevate your look with our expert stylists. Modern techniques, premium products, stunning results.</p>
            <div style={styles.heroButtons}>
              <Link to="/contact" style={styles.btnPrimary}><Calendar size={20} /> Book Now</Link>
              <Link to="/services" style={styles.btnSecondary}>View Services</Link>
            </div>
          </div>
          <div style={styles.heroImage}>
            <img src="${images.hero}" alt="${businessName}" style={styles.heroImg} />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Services</h2>
        <p style={styles.sectionSubtitle}>Expert care tailored to your unique style</p>
        <div style={styles.servicesGrid}>
          {services.map((service, i) => (
            <div key={i} style={styles.serviceCard}>
              <h3 style={styles.serviceName}>{service.name}</h3>
              <p style={styles.servicePrice}>{service.price}</p>
              <p style={styles.serviceDesc}>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Transform?</h2>
        <p style={styles.ctaText}>Book your appointment and experience the difference</p>
        <Link to="/contact" style={{...styles.btnPrimary, background: '#fff', color: '${c.secondary}'}}>Book Appointment</Link>
      </section>
    </div>
  );
}
`;
}

function generateNeighborhoodHomePage(businessName, address, phone, industry, images, colors, style, businessData = {}) {
  const c = colors;
  // Research data available: businessData.rating, businessData.reviewCount, businessData.reviewHighlights, etc.
  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Heart, Users, Clock, Phone, MapPin, Star } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '80vh', background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url("${images.hero}") center/cover', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '${style.sectionPadding}' },
    heroContent: { maxWidth: '700px' },
    heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '600', color: '#fff', marginBottom: '16px' },
    heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.25rem', color: '#fff', marginBottom: '32px', opacity: 0.95 },
    heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
    btnPrimary: { background: '${c.primary}', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: 'transparent', border: '2px solid #fff', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none' },
    section: { padding: '${style.sectionPadding}', background: '${c.background}' },
    sectionAlt: { padding: '${style.sectionPadding}', background: '${c.backgroundAlt || "#f8fafb"}' },
    sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.25rem', fontWeight: '600', color: '${c.text}', textAlign: 'center', marginBottom: '16px' },
    sectionSubtitle: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', textAlign: 'center', marginBottom: '48px' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' },
    serviceCard: { background: '#fff', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' },
    serviceName: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${c.text}', marginBottom: '8px' },
    servicePrice: { fontFamily: "${style.fontBody}", fontSize: '1.5rem', fontWeight: '700', color: '${c.primary}', marginBottom: '12px' },
    serviceDesc: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', fontSize: '0.95rem' },
    features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' },
    featureItem: { textAlign: 'center' },
    featureIcon: { width: '64px', height: '64px', background: '${c.primary}15', borderRadius: '${style.borderRadius}', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '${c.primary}' },
    featureTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.1rem', fontWeight: '600', color: '${c.text}', marginBottom: '8px' },
    featureText: { fontFamily: "${style.fontBody}", color: '${c.textMuted}', fontSize: '0.9rem' },
    cta: { padding: '${style.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '600', color: '#fff', marginBottom: '12px' },
    ctaText: { fontFamily: "${style.fontBody}", color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }
  };

  const services = [
    { name: 'Haircut', price: '$30', description: 'Expert cut for any style' },
    { name: 'Kids Cut', price: '$20', description: 'Gentle care for little ones' },
    { name: 'Beard Trim', price: '$15', description: 'Shape and trim' },
    { name: 'Full Service', price: '$50', description: 'Cut + beard + style' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>${businessName}</h1>
          <p style={styles.heroSubtitle}>Your neighborhood spot for great haircuts. Friendly service, fair prices, walk-ins always welcome!</p>
          <div style={styles.heroButtons}>
            <Link to="/contact" style={styles.btnPrimary}><Phone size={18} /> ${phone}</Link>
            <Link to="/services" style={styles.btnSecondary}>View Services</Link>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Services</h2>
        <p style={styles.sectionSubtitle}>Quality cuts at friendly prices</p>
        <div style={styles.servicesGrid}>
          {services.map((service, i) => (
            <div key={i} style={styles.serviceCard}>
              <h3 style={styles.serviceName}>{service.name}</h3>
              <p style={styles.servicePrice}>{service.price}</p>
              <p style={styles.serviceDesc}>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>Why Choose Us</h2>
        <div style={styles.features}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Heart size={28} /></div>
            <h3 style={styles.featureTitle}>Family Friendly</h3>
            <p style={styles.featureText}>Great for kids and adults alike</p>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Clock size={28} /></div>
            <h3 style={styles.featureTitle}>Walk-Ins Welcome</h3>
            <p style={styles.featureText}>No appointment needed</p>
          </div>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}><Star size={28} /></div>
            <h3 style={styles.featureTitle}>5-Star Reviews</h3>
            <p style={styles.featureText}>Loved by the community</p>
          </div>
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Come Visit Us!</h2>
        <p style={styles.ctaText}>${address || 'Stop by for a fresh cut'}</p>
        <Link to="/contact" style={{...styles.btnPrimary, background: '#fff', color: '${c.primary}'}}>Get Directions</Link>
      </section>
    </div>
  );
}
`;
}

/**
 * Generate Services page
 */
function generateServicesPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getGroomingArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const industry = (businessData.industry || 'barbershop').toLowerCase();

  const images = industry.includes('spa') ? IMAGES.spa :
                 industry.includes('salon') && !industry.includes('barber') ? IMAGES.salon :
                 IMAGES.barbershop;

  let c = { ...style.colors, ...colors };
  const isDark = styleOverrides.isDark || false;
  if (isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8' };
  }

  const themeStyle = {
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || style.typography?.bodyFont || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '24px',
    buttonPadding: styleOverrides.buttonStyle?.padding || '14px 28px'
  };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Star } from 'lucide-react';

export default function ServicesPage() {
  const styles = {
    hero: { padding: '120px 24px 60px', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary || c.primary}88 100%)', textAlign: 'center' },
    heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '3rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    heroSubtitle: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' },
    section: { padding: '${themeStyle.sectionPadding}', background: '${c.background}' },
    categoryTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.75rem', fontWeight: '600', color: '${c.text}', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid ${c.primary}' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '${themeStyle.gap}', marginBottom: '48px' },
    serviceCard: { background: '${c.backgroundAlt || "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    serviceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
    serviceName: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${c.text}' },
    servicePrice: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.25rem', fontWeight: '700', color: '${c.primary}' },
    serviceDesc: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', marginBottom: '12px', fontSize: '0.95rem' },
    serviceMeta: { display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '${c.textMuted}' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '4px' },
    cta: { padding: '${themeStyle.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '600', color: '#fff', marginBottom: '16px' },
    ctaBtn: { display: 'inline-block', background: '#fff', color: '${c.primary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' }
  };

  const categories = [
    {
      name: 'Haircuts',
      services: [
        { name: 'Classic Haircut', price: '$35', duration: '30 min', description: 'Precision cut with hot towel finish' },
        { name: 'Fade', price: '$40', duration: '45 min', description: 'Skin, mid, or low fade with detailed blending' },
        { name: 'Kids Cut (12 & under)', price: '$25', duration: '20 min', description: 'Gentle haircut for young ones' }
      ]
    },
    {
      name: 'Beard & Shave',
      services: [
        { name: 'Beard Trim', price: '$20', duration: '20 min', description: 'Shape, trim, and straight razor edge' },
        { name: 'Hot Towel Shave', price: '$40', duration: '45 min', description: 'Traditional straight razor shave with hot towels' },
        { name: 'Beard Design', price: '$30', duration: '30 min', description: 'Custom beard styling and shaping' }
      ]
    },
    {
      name: 'Packages',
      services: [
        { name: 'The Works', price: '$65', duration: '75 min', description: 'Haircut + beard trim + hot towel treatment' },
        { name: 'Father & Son', price: '$55', duration: '50 min', description: 'One adult cut + one kids cut' }
      ]
    }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Services & Pricing</h1>
        <p style={styles.heroSubtitle}>Premium grooming services tailored to you</p>
      </section>

      <section style={styles.section}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {categories.map((category, i) => (
            <div key={i}>
              <h2 style={styles.categoryTitle}>{category.name}</h2>
              <div style={styles.servicesGrid}>
                {category.services.map((service, j) => (
                  <div key={j} style={styles.serviceCard}>
                    <div style={styles.serviceHeader}>
                      <h3 style={styles.serviceName}>{service.name}</h3>
                      <span style={styles.servicePrice}>{service.price}</span>
                    </div>
                    <p style={styles.serviceDesc}>{service.description}</p>
                    <div style={styles.serviceMeta}>
                      <span style={styles.metaItem}><Clock size={14} /> {service.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Book?</h2>
        <Link to="/contact" style={styles.ctaBtn}>Book Appointment</Link>
      </section>
    </div>
  );
}
`;
}

module.exports = {
  generateHomePage,
  generateServicesPage,
  generateVintageHomePage,
  generateModernHomePage,
  generateNeighborhoodHomePage,
  IMAGES,
  GROOMING_ARCHETYPES,
  GROOMING_INDUSTRIES,
  isGroomingIndustry,
  detectGroomingArchetype,
  getGroomingArchetype
};
