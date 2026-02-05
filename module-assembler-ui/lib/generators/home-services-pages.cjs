/**
 * Home Services Page Generators
 *
 * Generates pages based on the 3 home services archetypes:
 * - emergency: Urgent, 24/7, action-focused (plumbers, HVAC, locksmiths)
 * - professional: Corporate, credentials-focused (contractors, commercial)
 * - neighborhood: Friendly, local, family-owned (landscaping, cleaning, handyman)
 */

const { getHomeServicesArchetype, detectHomeServicesArchetype } = require('../config/layout-archetypes.cjs');

// Unsplash image collections for home services
const IMAGES = {
  plumbing: {
    hero: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1920',  // Plumber working
    worker: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',  // Plumber with tools
    van: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',        // Service van
    tools: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',   // Plumbing tools
    bathroom: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',   // Modern bathroom
    kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',    // Kitchen sink
    pipe: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',    // Pipe work
    emergency: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800' // Water leak
  },
  electrical: {
    hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1920',
    worker: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
    panel: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
  },
  hvac: {
    hero: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1920',
    unit: 'https://images.unsplash.com/photo-1631545806609-23a8e8eb4c2a?w=800',
    worker: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800'
  },
  general: {
    hero: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920',   // Tools
    team: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',    // Workers team
    handshake: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',  // Business handshake
    house: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',   // Nice house
    beforeAfter: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
  }
};

/**
 * Generate HomePage based on home services archetype
 */
function generateHomePage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getHomeServicesArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const address = businessData.address || '';
  const phone = businessData.phone || '(555) 123-4567';
  const industry = businessData.industry || 'home services';

  // Merge colors
  let c = { ...style.colors, ...colors };

  // Apply dark/medium theme if specified
  const isDark = styleOverrides.isDark || false;
  if (isDark) {
    c = {
      ...c,
      background: '#0f172a',
      backgroundAlt: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8'
    };
  }

  // Build theme style from overrides
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

  // Select generator based on archetype
  if (arch.id === 'emergency') {
    return generateEmergencyHomePage(businessName, address, phone, industry, c, themeStyle, businessData);
  } else if (arch.id === 'professional') {
    return generateProfessionalHomePage(businessName, address, phone, industry, c, themeStyle, businessData);
  } else {
    return generateNeighborhoodHomePage(businessName, address, phone, industry, c, themeStyle, businessData);
  }
}

/**
 * Emergency/Urgent HomePage - Big phone number, 24/7, urgent CTAs
 */
function generateEmergencyHomePage(businessName, address, phone, industry, colors, style, businessData = {}) {
  // Use fixture hero image if available, fall back to IMAGES
  const heroImage = businessData.heroImage || IMAGES.plumbing.hero;
  const heroHeadline = businessData.heroHeadline || `Fast, Reliable ${industry} Service`;
  const heroSubheadline = businessData.heroSubheadline || "When emergencies strike, we're there. Professional service you can trust, 24 hours a day, 7 days a week.";

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, Shield, Award, CheckCircle, MapPin, Star, ArrowRight, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const services = [
    { name: 'Emergency Repairs', description: '24/7 emergency service when you need it most', icon: AlertCircle, image: '${IMAGES.plumbing.emergency}' },
    { name: 'Drain Cleaning', description: 'Fast, effective drain clearing and maintenance', icon: CheckCircle, image: '${IMAGES.plumbing.pipe}' },
    { name: 'Water Heaters', description: 'Installation, repair, and replacement services', icon: CheckCircle, image: '${IMAGES.plumbing.bathroom}' },
    { name: 'Leak Detection', description: 'Advanced technology to find and fix leaks fast', icon: CheckCircle, image: '${IMAGES.plumbing.tools}' }
  ];

  const stats = [
    { number: '24/7', label: 'Emergency Service' },
    { number: '30min', label: 'Response Time' },
    { number: '15+', label: 'Years Experience' },
    { number: '5000+', label: 'Jobs Completed' }
  ];

  const reviews = [
    { text: "They came within 30 minutes at 2am when our pipe burst. Lifesavers!", author: "Mike R.", rating: 5 },
    { text: "Professional, fast, and fair pricing. Highly recommend!", author: "Sarah T.", rating: 5 },
    { text: "Best plumber in town. They fixed what others couldn't.", author: "John D.", rating: 5 }
  ];

  return (
    <div style={{ background: '${colors.background}' }}>
      {/* Emergency Banner */}
      <div style={styles.emergencyBanner}>
        <AlertCircle size={20} />
        <span>24/7 EMERGENCY SERVICE AVAILABLE</span>
        <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.bannerPhone}>${phone}</a>
      </div>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <Shield size={16} /> Licensed & Insured
            </div>
            <h1 style={styles.heroTitle}>${heroHeadline.replace(/'/g, "\\'")}</h1>
            <p style={styles.heroSubtitle}>${heroSubheadline.replace(/'/g, "\\'")}</p>
            <div style={styles.heroPhone}>
              <Phone size={28} />
              <div>
                <span style={styles.phoneLabel}>Call Now - We Answer 24/7</span>
                <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.phoneNumber}>${phone}</a>
              </div>
            </div>
            <div style={styles.heroCtas}>
              <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.primaryBtn}>
                <Phone size={18} /> Call Now
              </a>
              <Link to="/contact" style={styles.secondaryBtn}>
                Get Free Estimate <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section style={styles.statsStrip}>
        {stats.map((stat, i) => (
          <div key={i} style={styles.statItem}>
            <span style={styles.statNumber}>{stat.number}</span>
            <span style={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Trust Badges */}
      <section style={styles.trustSection}>
        <div style={styles.container}>
          <div style={styles.trustGrid}>
            <div style={styles.trustBadge}>
              <Shield size={32} color="${colors.primary}" />
              <span>Licensed & Insured</span>
            </div>
            <div style={styles.trustBadge}>
              <Award size={32} color="${colors.primary}" />
              <span>A+ BBB Rating</span>
            </div>
            <div style={styles.trustBadge}>
              <Clock size={32} color="${colors.primary}" />
              <span>Same Day Service</span>
            </div>
            <div style={styles.trustBadge}>
              <CheckCircle size={32} color="${colors.primary}" />
              <span>Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={styles.services}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Our Services</h2>
          <p style={styles.sectionSubtitle}>Professional solutions for all your ${industry} needs</p>
          <div style={styles.servicesGrid}>
            {services.map((service, i) => (
              <div key={i} style={styles.serviceCard}>
                <img src={service.image} alt={service.name} style={styles.serviceImage} />
                <div style={styles.serviceContent}>
                  <h3 style={styles.serviceName}>{service.name}</h3>
                  <p style={styles.serviceDesc}>{service.description}</p>
                  <Link to="/services" style={styles.serviceLink}>Learn More <ArrowRight size={14} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={styles.whyUs}>
        <div style={styles.container}>
          <div style={styles.whyUsGrid}>
            <div style={styles.whyUsContent}>
              <h2 style={styles.sectionTitle}>Why Choose ${businessName}?</h2>
              <ul style={styles.benefitsList}>
                <li style={styles.benefitItem}><CheckCircle size={20} color="${colors.secondary}" /> <span>Upfront, honest pricing - no surprises</span></li>
                <li style={styles.benefitItem}><CheckCircle size={20} color="${colors.secondary}" /> <span>Background-checked, certified technicians</span></li>
                <li style={styles.benefitItem}><CheckCircle size={20} color="${colors.secondary}" /> <span>Fully stocked trucks for first-visit fixes</span></li>
                <li style={styles.benefitItem}><CheckCircle size={20} color="${colors.secondary}" /> <span>100% satisfaction guarantee on all work</span></li>
                <li style={styles.benefitItem}><CheckCircle size={20} color="${colors.secondary}" /> <span>Free estimates for major projects</span></li>
              </ul>
              <Link to="/about" style={styles.primaryBtn}>About Our Team</Link>
            </div>
            <div style={styles.whyUsImage}>
              <img src="${IMAGES.plumbing.worker}" alt="Professional Technician" style={styles.featureImage} />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={styles.reviews}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
          <div style={styles.reviewsGrid}>
            {reviews.map((review, i) => (
              <div key={i} style={styles.reviewCard}>
                <div style={styles.reviewStars}>
                  {[...Array(review.rating)].map((_, j) => <Star key={j} size={18} fill="${colors.accent}" color="${colors.accent}" />)}
                </div>
                <p style={styles.reviewText}>"{review.text}"</p>
                <p style={styles.reviewAuthor}>— {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Need Help Now?</h2>
          <p style={styles.ctaText}>Our team is standing by 24/7 to help with any emergency</p>
          <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.ctaBtn}>
            <Phone size={24} /> Call ${phone}
          </a>
        </div>
      </section>

      {/* Service Area */}
      <section style={styles.serviceArea}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Service Area</h2>
          <p style={styles.serviceAreaText}>
            <MapPin size={18} /> Proudly serving ${address ? address.split(',').slice(-2).join(',') : 'the greater metro area'} and surrounding communities
          </p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  emergencyBanner: { background: '${colors.primary}', color: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', fontWeight: '600' },
  bannerPhone: { color: '#fff', textDecoration: 'none', fontWeight: '700', marginLeft: '8px' },
  hero: { minHeight: '80vh', backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${heroImage})', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' },
  heroOverlay: { width: '100%', padding: '${style.sectionPadding}' },
  heroContent: { maxWidth: '700px', margin: '0 auto', textAlign: 'center', color: '#fff' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '30px', fontSize: '14px', marginBottom: '24px', backdropFilter: 'blur(4px)' },
  heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '800', marginBottom: '16px', textTransform: '${style.headlineStyle}', lineHeight: 1.1 },
  heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.25rem', opacity: 0.9, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' },
  heroPhone: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'rgba(255,255,255,0.1)', padding: '20px 32px', borderRadius: '${style.borderRadius}', marginBottom: '32px', backdropFilter: 'blur(4px)' },
  phoneLabel: { display: 'block', fontSize: '14px', opacity: 0.9 },
  phoneNumber: { fontSize: '2rem', fontWeight: '800', color: '#fff', textDecoration: 'none' },
  heroCtas: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${colors.primary}', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '700', fontSize: '16px', textDecoration: 'none', border: 'none', cursor: 'pointer' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', fontSize: '16px', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)' },
  statsStrip: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', background: '${colors.secondary}', padding: '24px', gap: '48px' },
  statItem: { textAlign: 'center', color: '#fff' },
  statNumber: { display: 'block', fontSize: '2rem', fontWeight: '800' },
  statLabel: { fontSize: '14px', opacity: 0.9 },
  trustSection: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt}' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  trustGrid: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '${style.gap}' },
  trustBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 32px', background: '${colors.background}', borderRadius: '${style.borderRadius}', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontWeight: '600', color: '${colors.text}' },
  services: { padding: '${style.sectionPadding}', background: '${colors.background}' },
  sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', textAlign: 'center', marginBottom: '12px', textTransform: '${style.headlineStyle}' },
  sectionSubtitle: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', textAlign: 'center', marginBottom: '48px', fontSize: '1.1rem' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${style.gap}' },
  serviceCard: { background: '${colors.backgroundAlt}', borderRadius: '${style.borderRadius}', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  serviceImage: { width: '100%', height: '200px', objectFit: 'cover' },
  serviceContent: { padding: '${style.cardPadding}' },
  serviceName: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '700', color: '${colors.text}', marginBottom: '8px' },
  serviceDesc: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', marginBottom: '16px', lineHeight: 1.6 },
  serviceLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '${colors.primary}', fontWeight: '600', textDecoration: 'none' },
  whyUs: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt}' },
  whyUsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
  whyUsContent: { },
  benefitsList: { listStyle: 'none', padding: 0, margin: '32px 0' },
  benefitItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontFamily: "${style.fontBody}", color: '${colors.text}', fontSize: '1.05rem' },
  whyUsImage: { },
  featureImage: { width: '100%', borderRadius: '${style.borderRadius}', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  reviews: { padding: '${style.sectionPadding}', background: '${colors.background}' },
  reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${style.gap}' },
  reviewCard: { background: '${colors.backgroundAlt}', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  reviewStars: { display: 'flex', gap: '4px', marginBottom: '16px' },
  reviewText: { fontFamily: "${style.fontBody}", color: '${colors.text}', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '16px' },
  reviewAuthor: { color: '${colors.textMuted}', fontWeight: '600' },
  ctaSection: { padding: '${style.sectionPadding}', background: '${colors.primary}', textAlign: 'center' },
  ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '12px' },
  ctaText: { color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: '32px' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#fff', color: '${colors.primary}', padding: '20px 40px', borderRadius: '${style.borderRadius}', fontWeight: '800', fontSize: '1.25rem', textDecoration: 'none' },
  serviceArea: { padding: '60px 24px', background: '${colors.backgroundAlt}', textAlign: 'center' },
  serviceAreaText: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '${colors.text}', fontSize: '1.1rem' }
};
`;
}

/**
 * Professional/Corporate HomePage - Clean, credentials-focused
 */
function generateProfessionalHomePage(businessName, address, phone, industry, colors, style, businessData = {}) {
  // Use fixture data if available
  const heroImage = businessData.heroImage || IMAGES.general.team;
  const heroHeadline = businessData.heroHeadline || `Professional ${industry} Services You Can Trust`;
  const heroSubheadline = businessData.heroSubheadline || `Delivering excellence in residential and commercial ${industry} solutions. Licensed, insured, and committed to your satisfaction.`;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Shield, Award, CheckCircle, MapPin, Star, ArrowRight, Users, Building, Clock, Wrench } from 'lucide-react';

export default function HomePage() {
  const services = [
    { name: 'Residential Services', description: 'Complete home solutions for every need', icon: Building },
    { name: 'Commercial Projects', description: 'Scalable solutions for businesses of all sizes', icon: Building },
    { name: 'Emergency Response', description: '24/7 availability for urgent situations', icon: Clock },
    { name: 'Maintenance Plans', description: 'Preventive care to avoid costly repairs', icon: Wrench }
  ];

  const credentials = [
    { icon: Shield, title: 'Fully Licensed', desc: 'State certified professionals' },
    { icon: Award, title: 'Insured & Bonded', desc: '\$2M liability coverage' },
    { icon: Users, title: '50+ Employees', desc: 'Experienced team' },
    { icon: CheckCircle, title: '15+ Years', desc: 'Serving the community' }
  ];

  return (
    <div style={{ background: '${colors.background}' }}>
      {/* Hero - Professional Split Layout */}
      <section style={styles.hero}>
        <div style={styles.heroGrid}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>Trusted Since 2009</div>
            <h1 style={styles.heroTitle}>${heroHeadline.replace(/'/g, "\\'")}</h1>
            <p style={styles.heroSubtitle}>${heroSubheadline.replace(/'/g, "\\'")}</p>
            <div style={styles.heroCtas}>
              <Link to="/contact" style={styles.primaryBtn}>Get Free Quote</Link>
              <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.secondaryBtn}>
                <Phone size={18} /> ${phone}
              </a>
            </div>
          </div>
          <div style={styles.heroImage}>
            <img src="${heroImage}" alt="${businessName} Team" style={styles.heroImg} />
          </div>
        </div>
      </section>

      {/* Credentials Bar */}
      <section style={styles.credentials}>
        <div style={styles.container}>
          <div style={styles.credentialsGrid}>
            {credentials.map((cred, i) => (
              <div key={i} style={styles.credentialItem}>
                <cred.icon size={28} color="${colors.primary}" />
                <div>
                  <h4 style={styles.credTitle}>{cred.title}</h4>
                  <p style={styles.credDesc}>{cred.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={styles.services}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Our Services</h2>
          <p style={styles.sectionSubtitle}>Comprehensive ${industry} solutions for every project</p>
          <div style={styles.servicesGrid}>
            {services.map((service, i) => (
              <div key={i} style={styles.serviceCard}>
                <div style={styles.serviceIcon}>
                  <service.icon size={32} color="${colors.primary}" />
                </div>
                <h3 style={styles.serviceName}>{service.name}</h3>
                <p style={styles.serviceDesc}>{service.description}</p>
                <Link to="/services" style={styles.serviceLink}>Learn More <ArrowRight size={14} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={styles.about}>
        <div style={styles.container}>
          <div style={styles.aboutGrid}>
            <div style={styles.aboutImage}>
              <img src="${IMAGES.general.handshake}" alt="Professional Service" style={styles.aboutImg} />
            </div>
            <div style={styles.aboutContent}>
              <h2 style={styles.sectionTitle}>Why ${businessName}?</h2>
              <p style={styles.aboutText}>With over 15 years of experience, ${businessName} has built a reputation for quality workmanship, reliable service, and fair pricing. We treat every project with the same attention to detail, whether it's a small repair or a major installation.</p>
              <ul style={styles.aboutList}>
                <li><CheckCircle size={18} color="${colors.secondary}" /> Transparent pricing - no hidden fees</li>
                <li><CheckCircle size={18} color="${colors.secondary}" /> Written warranties on all work</li>
                <li><CheckCircle size={18} color="${colors.secondary}" /> Clean, respectful technicians</li>
                <li><CheckCircle size={18} color="${colors.secondary}" /> On-time arrival guaranteed</li>
              </ul>
              <Link to="/about" style={styles.primaryBtn}>About Our Company</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
          <p style={styles.ctaText}>Contact us today for a free, no-obligation estimate</p>
          <div style={styles.ctaButtons}>
            <Link to="/contact" style={styles.ctaBtn}>Request Quote</Link>
            <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.ctaBtnSecondary}>
              <Phone size={20} /> ${phone}
            </a>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section style={styles.serviceArea}>
        <div style={styles.container}>
          <MapPin size={24} color="${colors.primary}" />
          <p style={styles.serviceAreaText}>Serving ${address ? address.split(',').slice(-2).join(',') : 'the greater metro area'} and surrounding areas</p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt}' },
  heroGrid: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
  heroContent: { },
  heroBadge: { display: 'inline-block', background: '${colors.primary}15', color: '${colors.primary}', padding: '8px 16px', borderRadius: '30px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' },
  heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', color: '${colors.text}', marginBottom: '16px', lineHeight: 1.2, textTransform: '${style.headlineStyle}' },
  heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.15rem', color: '${colors.textMuted}', marginBottom: '32px', lineHeight: 1.7 },
  heroCtas: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${colors.primary}', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', fontSize: '15px', textDecoration: 'none' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '${colors.primary}', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', fontSize: '15px', textDecoration: 'none', border: '2px solid ${colors.primary}' },
  heroImage: { },
  heroImg: { width: '100%', borderRadius: '${style.borderRadius}', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  credentials: { padding: '40px 24px', background: '${colors.background}', borderBottom: '1px solid ${colors.primary}15' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  credentialsGrid: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '48px' },
  credentialItem: { display: 'flex', alignItems: 'center', gap: '16px' },
  credTitle: { fontFamily: "${style.fontHeading}", fontWeight: '700', color: '${colors.text}', marginBottom: '2px' },
  credDesc: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', fontSize: '14px' },
  services: { padding: '${style.sectionPadding}', background: '${colors.background}' },
  sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', textAlign: 'center', marginBottom: '12px', textTransform: '${style.headlineStyle}' },
  sectionSubtitle: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', textAlign: 'center', marginBottom: '48px' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '${style.gap}' },
  serviceCard: { background: '${colors.backgroundAlt}', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  serviceIcon: { width: '70px', height: '70px', background: '${colors.primary}10', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  serviceName: { fontFamily: "${style.fontHeading}", fontSize: '1.2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '12px' },
  serviceDesc: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', marginBottom: '16px', lineHeight: 1.6 },
  serviceLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '${colors.primary}', fontWeight: '600', textDecoration: 'none' },
  about: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt}' },
  aboutGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
  aboutImage: { },
  aboutImg: { width: '100%', borderRadius: '${style.borderRadius}' },
  aboutContent: { },
  aboutText: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', lineHeight: 1.8, marginBottom: '24px' },
  aboutList: { listStyle: 'none', padding: 0, margin: '0 0 32px' },
  cta: { padding: '${style.sectionPadding}', background: '${colors.primary}', textAlign: 'center' },
  ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '12px' },
  ctaText: { color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontSize: '1.1rem' },
  ctaButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtn: { background: '#fff', color: '${colors.primary}', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '700', textDecoration: 'none' },
  ctaBtnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.5)' },
  serviceArea: { padding: '40px 24px', background: '${colors.background}', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' },
  serviceAreaText: { fontFamily: "${style.fontBody}", color: '${colors.text}', fontSize: '1.1rem' }
};
`;
}

/**
 * Neighborhood/Local HomePage - Warm, family-owned feel
 */
function generateNeighborhoodHomePage(businessName, address, phone, industry, colors, style, businessData = {}) {
  // Use fixture data if available
  const heroImage = businessData.heroImage || IMAGES.general.house;
  const heroHeadline = businessData.heroHeadline || `Your Neighborhood ${industry} Experts`;
  const heroSubheadline = businessData.heroSubheadline || 'Serving our community with honest, reliable service for over 20 years. We treat every home like our own.';

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Heart, Award, CheckCircle, MapPin, Star, ArrowRight, Users, Clock, Leaf, Home } from 'lucide-react';

export default function HomePage() {
  const services = [
    { name: 'Regular Maintenance', description: 'Keep your home running smoothly year-round', image: '${IMAGES.general.house}' },
    { name: 'Repairs & Fixes', description: 'Quick, reliable fixes for any issue', image: '${IMAGES.plumbing.tools}' },
    { name: 'Installations', description: 'Professional installation services', image: '${IMAGES.plumbing.bathroom}' }
  ];

  const values = [
    { icon: Heart, title: 'Family Owned', desc: 'Three generations of service' },
    { icon: Users, title: 'Local Team', desc: 'Your neighbors serving you' },
    { icon: Award, title: 'Quality Work', desc: 'Pride in every project' },
    { icon: Clock, title: 'Reliable', desc: 'On time, every time' }
  ];

  const reviews = [
    { text: "They've been taking care of our home for 10 years. Wouldn't call anyone else!", author: "The Johnson Family", rating: 5 },
    { text: "Honest, friendly, and always do great work. True professionals.", author: "Maria S.", rating: 5 },
    { text: "Finally found a company I can trust. They treat my home like their own.", author: "Robert K.", rating: 5 }
  ];

  return (
    <div style={{ background: '${colors.background}' }}>
      {/* Hero - Warm & Welcoming */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <Heart size={16} /> Family Owned & Operated
            </div>
            <h1 style={styles.heroTitle}>${heroHeadline.replace(/'/g, "\\'")}</h1>
            <p style={styles.heroSubtitle}>${heroSubheadline.replace(/'/g, "\\'")}</p>
            <div style={styles.heroCtas}>
              <Link to="/contact" style={styles.primaryBtn}>
                Get Free Estimate
              </Link>
              <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.secondaryBtn}>
                <Phone size={18} /> Call Us Today
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={styles.values}>
        <div style={styles.container}>
          <div style={styles.valuesGrid}>
            {values.map((value, i) => (
              <div key={i} style={styles.valueCard}>
                <div style={styles.valueIcon}>
                  <value.icon size={28} color="${colors.primary}" />
                </div>
                <h3 style={styles.valueTitle}>{value.title}</h3>
                <p style={styles.valueDesc}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section style={styles.about}>
        <div style={styles.container}>
          <div style={styles.aboutGrid}>
            <div style={styles.aboutContent}>
              <h2 style={styles.sectionTitle}>Meet Your Neighbors</h2>
              <p style={styles.aboutText}>Hi, we're the ${businessName} family! For over 20 years, we've been helping our neighbors with all their ${industry} needs. What started in dad's garage has grown into a team of dedicated professionals who share the same values: honest work, fair prices, and treating every customer like family.</p>
              <p style={styles.aboutText}>When you call us, you're not getting a faceless corporation – you're getting neighbors who care about our community and take pride in the work we do.</p>
              <Link to="/about" style={styles.aboutLink}>Our Story <ArrowRight size={16} /></Link>
            </div>
            <div style={styles.aboutImage}>
              <img src="${IMAGES.general.team}" alt="${businessName} Team" style={styles.aboutImg} />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={styles.services}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>How We Can Help</h2>
          <div style={styles.servicesGrid}>
            {services.map((service, i) => (
              <div key={i} style={styles.serviceCard}>
                <img src={service.image} alt={service.name} style={styles.serviceImage} />
                <div style={styles.serviceContent}>
                  <h3 style={styles.serviceName}>{service.name}</h3>
                  <p style={styles.serviceDesc}>{service.description}</p>
                  <Link to="/services" style={styles.serviceLink}>Learn More <ArrowRight size={14} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={styles.reviews}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>What Our Neighbors Say</h2>
          <div style={styles.reviewsGrid}>
            {reviews.map((review, i) => (
              <div key={i} style={styles.reviewCard}>
                <div style={styles.reviewStars}>
                  {[...Array(review.rating)].map((_, j) => <Star key={j} size={18} fill="${colors.accent}" color="${colors.accent}" />)}
                </div>
                <p style={styles.reviewText}>"{review.text}"</p>
                <p style={styles.reviewAuthor}>— {review.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <Home size={48} style={{ marginBottom: '16px', opacity: 0.9 }} />
          <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
          <p style={styles.ctaText}>Give us a call or send a message – we'd love to help!</p>
          <div style={styles.ctaButtons}>
            <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.ctaBtn}>
              <Phone size={20} /> ${phone}
            </a>
            <Link to="/contact" style={styles.ctaBtnSecondary}>Send Message</Link>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section style={styles.serviceArea}>
        <div style={styles.container}>
          <MapPin size={20} color="${colors.primary}" />
          <span style={styles.serviceAreaText}>Proudly serving ${address ? address.split(',').slice(-2).join(',') : 'our local community'} and surrounding neighborhoods</span>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { minHeight: '75vh', backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${heroImage})', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' },
  heroOverlay: { width: '100%', padding: '${style.sectionPadding}' },
  heroContent: { maxWidth: '700px', color: '#fff' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '30px', fontSize: '14px', marginBottom: '24px', backdropFilter: 'blur(4px)' },
  heroTitle: { fontFamily: "${style.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '700', marginBottom: '16px', textTransform: '${style.headlineStyle}', lineHeight: 1.2 },
  heroSubtitle: { fontFamily: "${style.fontBody}", fontSize: '1.2rem', opacity: 0.95, marginBottom: '32px', lineHeight: 1.7, maxWidth: '550px' },
  heroCtas: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${colors.primary}', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', fontSize: '16px', textDecoration: 'none' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', fontSize: '16px', textDecoration: 'none', backdropFilter: 'blur(4px)' },
  values: { padding: '60px 24px', background: '${colors.backgroundAlt}' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '${style.gap}' },
  valueCard: { textAlign: 'center', padding: '24px' },
  valueIcon: { width: '64px', height: '64px', background: '${colors.primary}15', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  valueTitle: { fontFamily: "${style.fontHeading}", fontSize: '1.1rem', fontWeight: '700', color: '${colors.text}', marginBottom: '8px' },
  valueDesc: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', fontSize: '14px' },
  about: { padding: '${style.sectionPadding}', background: '${colors.background}' },
  aboutGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
  aboutContent: { },
  sectionTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${colors.text}', marginBottom: '20px', textTransform: '${style.headlineStyle}' },
  aboutText: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', lineHeight: 1.8, marginBottom: '16px' },
  aboutLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '${colors.primary}', fontWeight: '600', textDecoration: 'none', marginTop: '16px' },
  aboutImage: { },
  aboutImg: { width: '100%', borderRadius: '${style.borderRadius}', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' },
  services: { padding: '${style.sectionPadding}', background: '${colors.backgroundAlt}' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${style.gap}' },
  serviceCard: { background: '${colors.background}', borderRadius: '${style.borderRadius}', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  serviceImage: { width: '100%', height: '200px', objectFit: 'cover' },
  serviceContent: { padding: '${style.cardPadding}' },
  serviceName: { fontFamily: "${style.fontHeading}", fontSize: '1.25rem', fontWeight: '700', color: '${colors.text}', marginBottom: '12px' },
  serviceDesc: { fontFamily: "${style.fontBody}", color: '${colors.textMuted}', marginBottom: '16px', lineHeight: 1.6 },
  serviceLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '${colors.primary}', fontWeight: '600', textDecoration: 'none' },
  reviews: { padding: '${style.sectionPadding}', background: '${colors.background}' },
  reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${style.gap}' },
  reviewCard: { background: '${colors.backgroundAlt}', padding: '${style.cardPadding}', borderRadius: '${style.borderRadius}' },
  reviewStars: { display: 'flex', gap: '4px', marginBottom: '16px' },
  reviewText: { fontFamily: "${style.fontBody}", color: '${colors.text}', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '16px' },
  reviewAuthor: { color: '${colors.textMuted}', fontWeight: '600' },
  cta: { padding: '${style.sectionPadding}', background: '${colors.primary}', textAlign: 'center', color: '#fff' },
  ctaTitle: { fontFamily: "${style.fontHeading}", fontSize: '2rem', fontWeight: '700', marginBottom: '12px' },
  ctaText: { opacity: 0.9, marginBottom: '32px', fontSize: '1.1rem' },
  ctaButtons: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '${colors.primary}', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '700', textDecoration: 'none' },
  ctaBtnSecondary: { background: 'transparent', color: '#fff', padding: '${style.buttonPadding}', borderRadius: '${style.borderRadius}', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.5)' },
  serviceArea: { padding: '40px 24px', background: '${colors.backgroundAlt}', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  serviceAreaText: { fontFamily: "${style.fontBody}", color: '${colors.text}' }
};
`;
}

/**
 * Generate Services Page for home services
 */
function generateServicesPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getHomeServicesArchetype(archetype) : archetype;
  const businessName = businessData.name || 'Business';
  const industry = businessData.industry || 'home services';
  const phone = businessData.phone || '(555) 123-4567';

  const style = arch.style;
  let c = { ...style.colors, ...colors };

  const themeStyle = {
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || style.typography?.bodyFont || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '32px',
    headlineStyle: styleOverrides.headlineStyle || 'none',
    buttonPadding: styleOverrides.buttonStyle?.padding || '16px 32px'
  };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, CheckCircle, ArrowRight, Clock, Shield, Award } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      name: 'Emergency Repairs',
      description: 'Fast response when you need it most. Our team is available 24/7 for urgent issues.',
      features: ['24/7 availability', 'Fast response time', 'Fully equipped trucks'],
      image: '${IMAGES.plumbing.emergency}'
    },
    {
      name: 'Installations',
      description: 'Professional installation of new systems and equipment with warranty coverage.',
      features: ['Expert installation', 'Quality materials', 'Written warranty'],
      image: '${IMAGES.plumbing.bathroom}'
    },
    {
      name: 'Maintenance',
      description: 'Regular maintenance to keep your systems running efficiently and prevent costly repairs.',
      features: ['Scheduled service', 'Preventive care', 'Priority scheduling'],
      image: '${IMAGES.plumbing.tools}'
    },
    {
      name: 'Diagnostics',
      description: 'Advanced diagnostic services to identify issues quickly and accurately.',
      features: ['Modern equipment', 'Accurate diagnosis', 'Upfront pricing'],
      image: '${IMAGES.general.team}'
    }
  ];

  return (
    <div style={{ background: '${c.background}' }}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.heroTitle}>Our Services</h1>
          <p style={styles.heroSubtitle}>Professional ${industry} solutions for every need</p>
        </div>
      </section>

      {/* Services List */}
      <section style={styles.services}>
        <div style={styles.container}>
          {services.map((service, i) => (
            <div key={i} style={{ ...styles.serviceRow, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
              <div style={styles.serviceImage}>
                <img src={service.image} alt={service.name} style={styles.serviceImg} />
              </div>
              <div style={styles.serviceContent}>
                <h2 style={styles.serviceName}>{service.name}</h2>
                <p style={styles.serviceDesc}>{service.description}</p>
                <ul style={styles.featureList}>
                  {service.features.map((feature, j) => (
                    <li key={j} style={styles.featureItem}>
                      <CheckCircle size={18} color="${c.secondary}" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" style={styles.serviceBtn}>Get Quote <ArrowRight size={16} /></Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Need Help Deciding?</h2>
          <p style={styles.ctaText}>Contact us for a free consultation and estimate</p>
          <a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.ctaBtn}>
            <Phone size={20} /> Call ${phone}
          </a>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { padding: '${themeStyle.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '3rem', fontWeight: '700', color: '#fff', marginBottom: '16px', textTransform: '${themeStyle.headlineStyle}' },
  heroSubtitle: { fontFamily: "${themeStyle.fontBody}", color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem' },
  services: { padding: '${themeStyle.sectionPadding}' },
  serviceRow: { display: 'flex', gap: '60px', alignItems: 'center', marginBottom: '80px' },
  serviceImage: { flex: 1 },
  serviceImg: { width: '100%', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' },
  serviceContent: { flex: 1 },
  serviceName: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${c.text}', marginBottom: '16px' },
  serviceDesc: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', lineHeight: 1.7, marginBottom: '24px' },
  featureList: { listStyle: 'none', padding: 0, margin: '0 0 24px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '${c.text}' },
  serviceBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${c.primary}', color: '#fff', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' },
  cta: { padding: '${themeStyle.sectionPadding}', background: '${c.backgroundAlt}', textAlign: 'center' },
  ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '${c.text}', marginBottom: '12px' },
  ctaText: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', marginBottom: '24px' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${c.primary}', color: '#fff', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' }
};
`;
}

module.exports = {
  generateHomePage,
  generateServicesPage,
  generateEmergencyHomePage,
  generateProfessionalHomePage,
  generateNeighborhoodHomePage,
  IMAGES
};
