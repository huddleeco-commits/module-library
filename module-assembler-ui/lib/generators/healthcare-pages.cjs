/**
 * Healthcare Page Generators
 *
 * Generates pages for dental, medical, chiropractic, and wellness practices
 * Archetypes: modern-clinical, warm-caring, professional-trust
 */

const IMAGES = {
  dental: {
    hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920',
    office: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800',
    team: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800',
    smile: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=800'
  },
  medical: {
    hero: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920',
    doctor: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800',
    office: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'
  },
  chiropractic: {
    hero: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920',
    adjustment: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
    wellness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
  }
};

const HEALTHCARE_ARCHETYPES = {
  'modern-clinical': {
    id: 'modern-clinical',
    name: 'Modern Clinical',
    description: 'Clean, professional, technology-forward. Great for modern practices.',
    bestFor: ['dental', 'medical clinic', 'specialist', 'surgery center'],
    style: {
      colors: { primary: '#0891b2', secondary: '#06b6d4', accent: '#22d3ee' },
      typography: { headingFont: "'Inter', sans-serif", headingWeight: '600' },
      borderRadius: '12px'
    }
  },
  'warm-caring': {
    id: 'warm-caring',
    name: 'Warm & Caring',
    description: 'Friendly, approachable, patient-focused. Ideal for family practices.',
    bestFor: ['family practice', 'pediatrics', 'wellness center', 'holistic'],
    style: {
      colors: { primary: '#059669', secondary: '#34d399', accent: '#fbbf24' },
      typography: { headingFont: "'Nunito', sans-serif", headingWeight: '600' },
      borderRadius: '16px'
    }
  },
  'professional-trust': {
    id: 'professional-trust',
    name: 'Professional Trust',
    description: 'Established, credible, expertise-focused. Perfect for specialists.',
    bestFor: ['specialist', 'surgical', 'orthopedic', 'cardiology'],
    style: {
      colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
      typography: { headingFont: "'Playfair Display', serif", headingWeight: '700' },
      borderRadius: '8px'
    }
  }
};

const HEALTHCARE_INDUSTRIES = ['dental', 'dentist', 'orthodont', 'medical', 'doctor', 'physician', 'clinic',
  'healthcare', 'health care', 'chiropractic', 'chiropractor', 'physical therapy', 'pt', 'dermatology',
  'optometry', 'eye doctor', 'pediatric', 'family medicine', 'urgent care', 'wellness'];

function isHealthcareIndustry(industry) {
  if (!industry) return false;
  const lower = industry.toLowerCase();
  return HEALTHCARE_INDUSTRIES.some(ind => lower.includes(ind));
}

function detectHealthcareArchetype(businessData) {
  const combined = `${businessData.name || ''} ${businessData.description || ''} ${businessData.industry || ''}`.toLowerCase();

  if (combined.includes('modern') || combined.includes('advanced') || combined.includes('cosmetic') ||
      combined.includes('laser') || combined.includes('technology')) {
    return HEALTHCARE_ARCHETYPES['modern-clinical'];
  }

  if (combined.includes('specialist') || combined.includes('surgical') || combined.includes('center') ||
      combined.includes('institute') || combined.includes('associates')) {
    return HEALTHCARE_ARCHETYPES['professional-trust'];
  }

  return HEALTHCARE_ARCHETYPES['warm-caring'];
}

function getHealthcareArchetype(id) {
  return HEALTHCARE_ARCHETYPES[id] || HEALTHCARE_ARCHETYPES['warm-caring'];
}

function generateHomePage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getHealthcareArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Practice';
  const phone = businessData.phone || '(555) 123-4567';
  const industry = (businessData.industry || 'healthcare').toLowerCase();

  const images = industry.includes('dental') || industry.includes('dentist') ? IMAGES.dental :
                 industry.includes('chiro') ? IMAGES.chiropractic : IMAGES.medical;

  let c = { ...style.colors, ...colors };
  if (styleOverrides.isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8' };
  }

  const themeStyle = {
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '32px',
    buttonPadding: styleOverrides.buttonStyle?.padding || '16px 32px'
  };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Clock, Users, Phone, Calendar, Star, CheckCircle, Smile } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '85vh', background: 'linear-gradient(135deg, ${c.primary}f0 0%, ${c.secondary}88 100%)', display: 'flex', alignItems: 'center', padding: '${themeStyle.sectionPadding}' },
    heroInner: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
    heroContent: { },
    heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '700', color: '#fff', marginBottom: '24px', lineHeight: 1.2 },
    heroSubtitle: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.2rem', color: 'rgba(255,255,255,0.95)', marginBottom: '32px', lineHeight: 1.7 },
    heroButtons: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    btnPrimary: { background: '#fff', color: '${c.primary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: 'transparent', border: '2px solid #fff', color: '#fff', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    heroImage: { borderRadius: '${themeStyle.borderRadius}', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' },
    heroImg: { width: '100%', height: '450px', objectFit: 'cover' },
    section: { padding: '${themeStyle.sectionPadding}', background: '${c.background}' },
    sectionAlt: { padding: '${themeStyle.sectionPadding}', background: '${c.backgroundAlt || "#f0fdfa"}' },
    sectionTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2.25rem', fontWeight: '700', color: '${c.text}', textAlign: 'center', marginBottom: '16px' },
    sectionSubtitle: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${themeStyle.gap}', maxWidth: '1100px', margin: '0 auto' },
    serviceCard: { background: '${styleOverrides.isDark ? c.backgroundAlt : "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center' },
    serviceIcon: { width: '64px', height: '64px', background: '${c.primary}15', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '${c.primary}' },
    serviceTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${c.text}', marginBottom: '12px' },
    serviceDesc: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', fontSize: '0.95rem' },
    features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' },
    featureItem: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    featureIcon: { width: '48px', height: '48px', background: '${c.primary}', borderRadius: '${themeStyle.borderRadius}', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 },
    featureTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.1rem', fontWeight: '600', color: '${c.text}', marginBottom: '4px' },
    featureText: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', fontSize: '0.9rem' },
    cta: { padding: '${themeStyle.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    ctaText: { fontFamily: "${themeStyle.fontBody}", color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontSize: '1.1rem' }
  };

  const services = [
    { icon: Smile, title: 'General Dentistry', description: 'Cleanings, exams, and preventive care' },
    { icon: Star, title: 'Cosmetic Dentistry', description: 'Whitening, veneers, and smile makeovers' },
    { icon: Shield, title: 'Restorative Care', description: 'Fillings, crowns, and implants' },
    { icon: Heart, title: 'Emergency Care', description: 'Same-day appointments available' }
  ];

  const features = [
    { icon: Clock, title: 'Convenient Hours', description: 'Early morning and evening appointments' },
    { icon: Users, title: 'Caring Team', description: 'Friendly staff dedicated to your comfort' },
    { icon: Shield, title: 'Modern Technology', description: 'Digital X-rays and advanced equipment' },
    { icon: CheckCircle, title: 'Insurance Accepted', description: 'We work with most insurance plans' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>${businessName}</h1>
            <p style={styles.heroSubtitle}>Gentle, compassionate care for the whole family. We're committed to helping you achieve optimal health in a comfortable, modern environment.</p>
            <div style={styles.heroButtons}>
              <Link to="/contact" style={styles.btnPrimary}><Calendar size={20} /> Book Appointment</Link>
              <a href="tel:${phone}" style={styles.btnSecondary}><Phone size={18} /> ${phone}</a>
            </div>
          </div>
          <div style={styles.heroImage}>
            <img src="${images.hero}" alt="${businessName}" style={styles.heroImg} />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Services</h2>
        <p style={styles.sectionSubtitle}>Comprehensive care for your health needs</p>
        <div style={styles.servicesGrid}>
          {services.map((service, i) => (
            <div key={i} style={styles.serviceCard}>
              <div style={styles.serviceIcon}><service.icon size={28} /></div>
              <h3 style={styles.serviceTitle}>{service.title}</h3>
              <p style={styles.serviceDesc}>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>Why Choose Us</h2>
        <div style={styles.features}>
          {features.map((feature, i) => (
            <div key={i} style={styles.featureItem}>
              <div style={styles.featureIcon}><feature.icon size={24} /></div>
              <div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureText}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>New Patients Welcome!</h2>
        <p style={styles.ctaText}>Schedule your first appointment today</p>
        <Link to="/contact" style={styles.btnPrimary}><Calendar size={20} /> Request Appointment</Link>
      </section>
    </div>
  );
}
`;
}

function generateServicesPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getHealthcareArchetype(archetype) : archetype;
  const style = arch.style;
  let c = { ...style.colors, ...colors };
  if (styleOverrides.isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8' };
  }
  const themeStyle = {
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '12px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '24px',
    buttonPadding: styleOverrides.buttonStyle?.padding || '14px 28px'
  };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar } from 'lucide-react';

export default function ServicesPage() {
  const styles = {
    hero: { padding: '120px 24px 60px', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary}88 100%)', textAlign: 'center' },
    heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '3rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    heroSubtitle: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' },
    section: { padding: '${themeStyle.sectionPadding}', background: '${c.background}' },
    categoryTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.75rem', fontWeight: '600', color: '${c.text}', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid ${c.primary}' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${themeStyle.gap}', marginBottom: '48px' },
    serviceCard: { background: '${c.backgroundAlt || "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    serviceTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${c.text}', marginBottom: '8px' },
    serviceDesc: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', marginBottom: '16px', lineHeight: 1.6 },
    serviceFeatures: { listStyle: 'none', padding: 0, margin: 0 },
    featureItem: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontFamily: "${themeStyle.fontBody}", color: '${c.text}', fontSize: '0.9rem' },
    cta: { padding: '${themeStyle.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '${c.primary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' }
  };

  const categories = [
    {
      name: 'Preventive Care',
      services: [
        { title: 'Dental Exam & Cleaning', description: 'Comprehensive examination and professional cleaning', features: ['Digital X-rays', 'Oral cancer screening', 'Personalized care plan'] },
        { title: 'Fluoride Treatment', description: 'Strengthen enamel and prevent decay', features: ['Quick application', 'Safe for all ages', 'Cavity prevention'] }
      ]
    },
    {
      name: 'Restorative Dentistry',
      services: [
        { title: 'Dental Fillings', description: 'Tooth-colored composite fillings', features: ['Natural appearance', 'Durable materials', 'Same-day treatment'] },
        { title: 'Crowns & Bridges', description: 'Restore damaged or missing teeth', features: ['Custom fit', 'Natural look', 'Long-lasting'] }
      ]
    },
    {
      name: 'Cosmetic Dentistry',
      services: [
        { title: 'Teeth Whitening', description: 'Professional whitening for a brighter smile', features: ['In-office treatment', 'Take-home options', 'Dramatic results'] },
        { title: 'Veneers', description: 'Transform your smile with custom veneers', features: ['Porcelain quality', 'Stain resistant', 'Natural appearance'] }
      ]
    }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Services</h1>
        <p style={styles.heroSubtitle}>Comprehensive care for your dental health</p>
      </section>

      <section style={styles.section}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {categories.map((category, i) => (
            <div key={i}>
              <h2 style={styles.categoryTitle}>{category.name}</h2>
              <div style={styles.servicesGrid}>
                {category.services.map((service, j) => (
                  <div key={j} style={styles.serviceCard}>
                    <h3 style={styles.serviceTitle}>{service.title}</h3>
                    <p style={styles.serviceDesc}>{service.description}</p>
                    <ul style={styles.serviceFeatures}>
                      {service.features.map((feature, k) => (
                        <li key={k} style={styles.featureItem}>
                          <CheckCircle size={16} color="${c.primary}" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Schedule?</h2>
        <Link to="/contact" style={styles.ctaBtn}><Calendar size={18} /> Book Appointment</Link>
      </section>
    </div>
  );
}
`;
}

module.exports = {
  generateHomePage,
  generateServicesPage,
  IMAGES,
  HEALTHCARE_ARCHETYPES,
  HEALTHCARE_INDUSTRIES,
  isHealthcareIndustry,
  detectHealthcareArchetype,
  getHealthcareArchetype
};
