/**
 * Professional Services Page Generators
 *
 * Generates pages for law firms, accounting, consulting, real estate, insurance, finance
 * Archetypes: trust-authority, boutique-personal, corporate-modern
 */

const IMAGES = {
  law: {
    hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    team: 'https://images.unsplash.com/photo-1556157382-97edd2f9e3a0?w=800',
    meeting: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800'
  },
  accounting: {
    hero: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1920',
    office: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    work: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800'
  },
  consulting: {
    hero: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920',
    strategy: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'
  },
  realestate: {
    hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920',
    house: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    interior: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
  },
  finance: {
    hero: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920',
    charts: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800'
  }
};

const PROFESSIONAL_ARCHETYPES = {
  'trust-authority': {
    id: 'trust-authority',
    name: 'Trust & Authority',
    description: 'Established, credible, trustworthy. Perfect for law firms and financial services.',
    bestFor: ['law firm', 'attorney', 'financial advisor', 'insurance', 'wealth management'],
    style: {
      colors: { primary: '#1e3a5f', secondary: '#c9a227', accent: '#2563eb' },
      typography: { headingFont: "'Playfair Display', serif", headingWeight: '700' },
      borderRadius: '4px'
    }
  },
  'boutique-personal': {
    id: 'boutique-personal',
    name: 'Boutique & Personal',
    description: 'Personal, approachable, relationship-focused. Great for small practices.',
    bestFor: ['small firm', 'solo practice', 'personal service', 'boutique consulting'],
    style: {
      colors: { primary: '#059669', secondary: '#10b981', accent: '#f59e0b' },
      typography: { headingFont: "'Inter', sans-serif", headingWeight: '600' },
      borderRadius: '12px'
    }
  },
  'corporate-modern': {
    id: 'corporate-modern',
    name: 'Corporate Modern',
    description: 'Sleek, professional, enterprise-grade. Ideal for consulting and corporate services.',
    bestFor: ['consulting', 'enterprise', 'corporate', 'B2B services'],
    style: {
      colors: { primary: '#0f172a', secondary: '#3b82f6', accent: '#8b5cf6' },
      typography: { headingFont: "'Inter', sans-serif", headingWeight: '600' },
      borderRadius: '8px'
    }
  }
};

const PROFESSIONAL_INDUSTRIES = ['law', 'attorney', 'lawyer', 'legal', 'accounting', 'accountant', 'cpa', 'tax',
  'consulting', 'consultant', 'advisory', 'real estate', 'realtor', 'realty', 'insurance', 'finance', 'financial',
  'wealth', 'investment', 'advisor'];

function isProfessionalIndustry(industry) {
  if (!industry) return false;
  const lower = industry.toLowerCase();
  return PROFESSIONAL_INDUSTRIES.some(ind => lower.includes(ind));
}

function detectProfessionalArchetype(businessData) {
  const combined = `${businessData.name || ''} ${businessData.description || ''} ${businessData.industry || ''}`.toLowerCase();

  if (combined.includes('law') || combined.includes('attorney') || combined.includes('legal') ||
      combined.includes('insurance') || combined.includes('wealth') || combined.includes('established')) {
    return PROFESSIONAL_ARCHETYPES['trust-authority'];
  }

  if (combined.includes('consulting') || combined.includes('enterprise') || combined.includes('corporate') ||
      combined.includes('strategy') || combined.includes('solutions')) {
    return PROFESSIONAL_ARCHETYPES['corporate-modern'];
  }

  return PROFESSIONAL_ARCHETYPES['boutique-personal'];
}

function getProfessionalArchetype(id) {
  return PROFESSIONAL_ARCHETYPES[id] || PROFESSIONAL_ARCHETYPES['boutique-personal'];
}

function generateHomePage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getProfessionalArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Business';
  const phone = businessData.phone || '(555) 123-4567';
  const industry = (businessData.industry || 'professional').toLowerCase();

  // Use fixture hero text if available
  const heroHeadline = businessData.heroHeadline || businessName;
  const heroSubheadline = businessData.heroSubheadline || "Trusted legal counsel for individuals and businesses. We're committed to protecting your interests and achieving the best possible outcomes.";

  const defaultImages = industry.includes('law') || industry.includes('attorney') ? IMAGES.law :
                 industry.includes('account') || industry.includes('cpa') || industry.includes('tax') ? IMAGES.accounting :
                 industry.includes('consult') ? IMAGES.consulting :
                 industry.includes('real') || industry.includes('estate') || industry.includes('realtor') ? IMAGES.realestate :
                 IMAGES.finance;

  // Use fixture hero image if available
  const images = {
    ...defaultImages,
    hero: businessData.heroImage || defaultImages.hero
  };

  let c = { ...style.colors, ...colors };
  const isDark = styleOverrides.isDark || false;
  if (isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8' };
  }

  const themeStyle = {
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '8px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '32px',
    buttonPadding: styleOverrides.buttonStyle?.padding || '16px 32px'
  };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Users, Clock, Phone, ChevronRight, CheckCircle, Scale, Briefcase } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '85vh', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.primary}ee 50%, ${c.secondary}33 100%)', display: 'flex', alignItems: 'center', padding: '${themeStyle.sectionPadding}' },
    heroInner: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
    heroContent: { },
    heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '700', color: '#fff', marginBottom: '24px', lineHeight: 1.2 },
    heroSubtitle: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', lineHeight: 1.6 },
    heroButtons: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    btnPrimary: { background: '${c.secondary}', color: '${c.primary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: 'transparent', border: '2px solid #fff', color: '#fff', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' },
    heroImage: { borderRadius: '${themeStyle.borderRadius}', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' },
    heroImg: { width: '100%', height: '450px', objectFit: 'cover' },
    section: { padding: '${themeStyle.sectionPadding}', background: '${c.background}' },
    sectionAlt: { padding: '${themeStyle.sectionPadding}', background: '${c.backgroundAlt || "#f8fafc"}' },
    sectionTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2.25rem', fontWeight: '700', color: '${c.text}', textAlign: 'center', marginBottom: '16px' },
    sectionSubtitle: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' },
    practiceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${themeStyle.gap}', maxWidth: '1100px', margin: '0 auto' },
    practiceCard: { background: '${isDark ? c.backgroundAlt : "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: '4px solid ${c.secondary}' },
    practiceIcon: { width: '48px', height: '48px', background: '${c.secondary}15', borderRadius: '${themeStyle.borderRadius}', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '${c.secondary}' },
    practiceTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${c.text}', marginBottom: '12px' },
    practiceDesc: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', fontSize: '0.95rem', lineHeight: 1.6 },
    statsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' },
    statValue: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '${c.secondary}', marginBottom: '8px' },
    statLabel: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', fontSize: '0.9rem' },
    cta: { padding: '${themeStyle.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    ctaText: { fontFamily: "${themeStyle.fontBody}", color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontSize: '1.1rem' }
  };

  const practiceAreas = [
    { icon: Scale, title: 'Business Law', description: 'Contracts, formations, and corporate transactions' },
    { icon: Shield, title: 'Estate Planning', description: 'Wills, trusts, and asset protection' },
    { icon: Briefcase, title: 'Real Estate', description: 'Commercial and residential transactions' },
    { icon: Users, title: 'Family Law', description: 'Divorce, custody, and family matters' }
  ];

  const stats = [
    { value: '25+', label: 'Years Experience' },
    { value: '5,000+', label: 'Clients Served' },
    { value: '98%', label: 'Success Rate' },
    { value: '24/7', label: 'Client Support' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>${heroHeadline.replace(/'/g, "\\'")}</h1>
            <p style={styles.heroSubtitle}>${heroSubheadline.replace(/'/g, "\\'")}</p>
            <div style={styles.heroButtons}>
              <Link to="/contact" style={styles.btnPrimary}>Free Consultation <ChevronRight size={18} /></Link>
              <a href="tel:${phone}" style={styles.btnSecondary}><Phone size={18} /> ${phone}</a>
            </div>
          </div>
          <div style={styles.heroImage}>
            <img src="${images.hero}" alt="${businessName}" style={styles.heroImg} />
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.statsBar}>
          {stats.map((stat, i) => (
            <div key={i}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Practice Areas</h2>
        <p style={styles.sectionSubtitle}>Comprehensive legal services tailored to your needs</p>
        <div style={styles.practiceGrid}>
          {practiceAreas.map((area, i) => (
            <div key={i} style={styles.practiceCard}>
              <div style={styles.practiceIcon}><area.icon size={24} /></div>
              <h3 style={styles.practiceTitle}>{area.title}</h3>
              <p style={styles.practiceDesc}>{area.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Discuss Your Case?</h2>
        <p style={styles.ctaText}>Schedule a free consultation with our experienced team</p>
        <Link to="/contact" style={styles.btnPrimary}>Get Started <ChevronRight size={18} /></Link>
      </section>
    </div>
  );
}
`;
}

function generateServicesPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getProfessionalArchetype(archetype) : archetype;
  const style = arch.style;
  let c = { ...style.colors, ...colors };
  if (styleOverrides.isDark) {
    c = { ...c, background: '#0f172a', backgroundAlt: '#1e293b', text: '#f8fafc', textMuted: '#94a3b8' };
  }
  const themeStyle = {
    fontHeading: styleOverrides.fontHeading || style.typography?.headingFont || "'Inter', system-ui, sans-serif",
    fontBody: styleOverrides.fontBody || "system-ui, sans-serif",
    borderRadius: styleOverrides.borderRadius || style.borderRadius || '8px',
    sectionPadding: styleOverrides.sectionPadding || '80px 24px',
    cardPadding: styleOverrides.cardPadding || '32px',
    gap: styleOverrides.gap || '24px',
    buttonPadding: styleOverrides.buttonStyle?.padding || '14px 28px'
  };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const styles = {
    hero: { padding: '120px 24px 60px', background: '${c.primary}', textAlign: 'center' },
    heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '3rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    heroSubtitle: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' },
    section: { padding: '${themeStyle.sectionPadding}', background: '${c.background}' },
    servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '${themeStyle.gap}', maxWidth: '1100px', margin: '0 auto' },
    serviceCard: { background: '${c.backgroundAlt || "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    serviceTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.5rem', fontWeight: '600', color: '${c.text}', marginBottom: '16px' },
    serviceDesc: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', marginBottom: '20px', lineHeight: 1.6 },
    featureList: { listStyle: 'none', padding: 0, margin: 0 },
    featureItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontFamily: "${themeStyle.fontBody}", color: '${c.text}' },
    cta: { padding: '${themeStyle.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
    ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${c.secondary}', color: '${c.primary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' }
  };

  const services = [
    { title: 'Business Law', description: 'Comprehensive legal services for businesses of all sizes.', features: ['Contract drafting & review', 'Business formation', 'Mergers & acquisitions', 'Compliance guidance'] },
    { title: 'Estate Planning', description: 'Protect your assets and provide for your loved ones.', features: ['Wills & trusts', 'Asset protection', 'Probate administration', 'Healthcare directives'] },
    { title: 'Real Estate', description: 'Expert guidance for all real estate transactions.', features: ['Purchase & sale agreements', 'Title review', 'Commercial leases', 'Zoning & land use'] },
    { title: 'Litigation', description: 'Strong advocacy when disputes arise.', features: ['Civil litigation', 'Contract disputes', 'Business torts', 'Alternative dispute resolution'] }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Services</h1>
        <p style={styles.heroSubtitle}>Comprehensive legal solutions for your needs</p>
      </section>

      <section style={styles.section}>
        <div style={styles.servicesGrid}>
          {services.map((service, i) => (
            <div key={i} style={styles.serviceCard}>
              <h2 style={styles.serviceTitle}>{service.title}</h2>
              <p style={styles.serviceDesc}>{service.description}</p>
              <ul style={styles.featureList}>
                {service.features.map((feature, j) => (
                  <li key={j} style={styles.featureItem}>
                    <CheckCircle size={18} color="${c.secondary}" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Schedule a Consultation</h2>
        <Link to="/contact" style={styles.ctaBtn}>Contact Us <ArrowRight size={18} /></Link>
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
  PROFESSIONAL_ARCHETYPES,
  PROFESSIONAL_INDUSTRIES,
  isProfessionalIndustry,
  detectProfessionalArchetype,
  getProfessionalArchetype
};
