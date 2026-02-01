/**
 * Technology Page Generators
 *
 * Generates pages for SaaS, startups, agencies, and tech companies
 * Archetypes: minimal-clean, bold-dynamic, enterprise-corporate
 */

const IMAGES = {
  saas: {
    hero: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920',
    dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'
  },
  startup: {
    hero: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    collaboration: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800'
  },
  agency: {
    hero: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920',
    creative: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
    work: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800'
  }
};

const TECHNOLOGY_ARCHETYPES = {
  'minimal-clean': {
    id: 'minimal-clean',
    name: 'Minimal & Clean',
    description: 'Simple, elegant, modern. Perfect for SaaS products.',
    bestFor: ['saas', 'software', 'app', 'platform', 'tool'],
    style: {
      colors: { primary: '#0f172a', secondary: '#3b82f6', accent: '#06b6d4' },
      typography: { headingFont: "'Inter', sans-serif", headingWeight: '600' },
      borderRadius: '12px'
    }
  },
  'bold-dynamic': {
    id: 'bold-dynamic',
    name: 'Bold & Dynamic',
    description: 'Vibrant, energetic, disruptive. Great for startups.',
    bestFor: ['startup', 'disruptor', 'innovative', 'new'],
    style: {
      colors: { primary: '#7c3aed', secondary: '#ec4899', accent: '#f97316' },
      typography: { headingFont: "'Space Grotesk', sans-serif", headingWeight: '700' },
      borderRadius: '16px'
    }
  },
  'enterprise-corporate': {
    id: 'enterprise-corporate',
    name: 'Enterprise Corporate',
    description: 'Professional, trustworthy, established. Ideal for B2B.',
    bestFor: ['enterprise', 'b2b', 'consulting', 'agency', 'corporate'],
    style: {
      colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#10b981' },
      typography: { headingFont: "'Inter', sans-serif", headingWeight: '600' },
      borderRadius: '8px'
    }
  }
};

const TECHNOLOGY_INDUSTRIES = ['saas', 'software', 'tech', 'technology', 'startup', 'app', 'platform',
  'agency', 'digital', 'web', 'development', 'it', 'cloud', 'ai', 'data', 'analytics'];

function isTechnologyIndustry(industry) {
  if (!industry) return false;
  const lower = industry.toLowerCase();
  return TECHNOLOGY_INDUSTRIES.some(ind => lower.includes(ind));
}

function detectTechnologyArchetype(businessData) {
  const combined = `${businessData.name || ''} ${businessData.description || ''} ${businessData.industry || ''}`.toLowerCase();

  if (combined.includes('enterprise') || combined.includes('b2b') || combined.includes('consulting') ||
      combined.includes('agency') || combined.includes('solutions') || combined.includes('services')) {
    return TECHNOLOGY_ARCHETYPES['enterprise-corporate'];
  }

  if (combined.includes('startup') || combined.includes('disrupt') || combined.includes('innovative') ||
      combined.includes('bold') || combined.includes('new')) {
    return TECHNOLOGY_ARCHETYPES['bold-dynamic'];
  }

  return TECHNOLOGY_ARCHETYPES['minimal-clean'];
}

function getTechnologyArchetype(id) {
  return TECHNOLOGY_ARCHETYPES[id] || TECHNOLOGY_ARCHETYPES['minimal-clean'];
}

function generateHomePage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getTechnologyArchetype(archetype) : archetype;
  const style = arch.style;
  const businessName = businessData.name || 'Company';
  const phone = businessData.phone || '';
  const industry = (businessData.industry || 'technology').toLowerCase();

  const images = industry.includes('agency') ? IMAGES.agency :
                 industry.includes('startup') ? IMAGES.startup : IMAGES.saas;

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
    buttonPadding: styleOverrides.buttonStyle?.padding || '14px 28px'
  };

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, BarChart3, Users, ArrowRight, Check, Star, Globe, Layers, Code } from 'lucide-react';

export default function HomePage() {
  const styles = {
    hero: { minHeight: '90vh', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary}33 100%)', display: 'flex', alignItems: 'center', padding: '${themeStyle.sectionPadding}' },
    heroInner: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' },
    heroContent: { },
    heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '100px', marginBottom: '24px', color: '#fff', fontSize: '0.9rem' },
    heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '600', color: '#fff', marginBottom: '24px', lineHeight: 1.2 },
    heroSubtitle: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', lineHeight: 1.7 },
    heroButtons: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    btnPrimary: { background: '#fff', color: '${c.primary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    btnSecondary: { background: 'transparent', border: '2px solid rgba(255,255,255,0.5)', color: '#fff', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' },
    heroImage: { borderRadius: '${themeStyle.borderRadius}', overflow: 'hidden', boxShadow: '0 25px 80px -12px rgba(0,0,0,0.4)' },
    heroImg: { width: '100%', height: 'auto' },
    section: { padding: '${themeStyle.sectionPadding}', background: '${c.background}' },
    sectionAlt: { padding: '${themeStyle.sectionPadding}', background: '${c.backgroundAlt || "#f8fafc"}' },
    sectionTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2.5rem', fontWeight: '600', color: '${c.text}', textAlign: 'center', marginBottom: '16px' },
    sectionSubtitle: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.6 },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${themeStyle.gap}', maxWidth: '1100px', margin: '0 auto' },
    featureCard: { background: '${styleOverrides.isDark ? c.backgroundAlt : "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    featureIcon: { width: '48px', height: '48px', background: '${c.secondary}15', borderRadius: '${themeStyle.borderRadius}', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '${c.secondary}' },
    featureTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.25rem', fontWeight: '600', color: '${c.text}', marginBottom: '12px' },
    featureDesc: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', lineHeight: 1.6 },
    statsBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' },
    statValue: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2.5rem', fontWeight: '700', color: '${c.secondary}', marginBottom: '8px' },
    statLabel: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', fontSize: '0.9rem' },
    cta: { padding: '${themeStyle.sectionPadding}', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%)', textAlign: 'center' },
    ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2.5rem', fontWeight: '600', color: '#fff', marginBottom: '16px' },
    ctaText: { fontFamily: "${themeStyle.fontBody}", color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontSize: '1.1rem' }
  };

  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Built for speed with optimized performance at every level' },
    { icon: Shield, title: 'Enterprise Security', description: 'Bank-level encryption and compliance built in' },
    { icon: BarChart3, title: 'Powerful Analytics', description: 'Real-time insights to drive better decisions' },
    { icon: Layers, title: 'Seamless Integration', description: 'Connect with 100+ tools you already use' },
    { icon: Globe, title: 'Global Scale', description: 'Infrastructure that grows with your business' },
    { icon: Users, title: 'Team Collaboration', description: 'Work together effortlessly from anywhere' }
  ];

  const stats = [
    { value: '10K+', label: 'Companies' },
    { value: '99.9%', label: 'Uptime' },
    { value: '50M+', label: 'Users' },
    { value: '150+', label: 'Countries' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}><Star size={16} /> Trusted by 10,000+ teams</div>
            <h1 style={styles.heroTitle}>Build better products, faster</h1>
            <p style={styles.heroSubtitle}>The all-in-one platform that helps teams ship quality software with confidence. From idea to production in record time.</p>
            <div style={styles.heroButtons}>
              <Link to="/contact" style={styles.btnPrimary}>Start Free Trial <ArrowRight size={18} /></Link>
              <Link to="/services" style={styles.btnSecondary}>See How It Works</Link>
            </div>
          </div>
          <div style={styles.heroImage}>
            <img src="${images.dashboard}" alt="Dashboard" style={styles.heroImg} />
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
        <h2 style={styles.sectionTitle}>Everything you need to succeed</h2>
        <p style={styles.sectionSubtitle}>Powerful features designed to help your team move faster and build better</p>
        <div style={styles.featuresGrid}>
          {features.map((feature, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}><feature.icon size={24} /></div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <p style={styles.ctaText}>Join thousands of teams already using our platform</p>
        <Link to="/contact" style={styles.btnPrimary}>Start Your Free Trial <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
`;
}

function generateServicesPage(archetype, businessData, colors, styleOverrides = {}) {
  const arch = typeof archetype === 'string' ? getTechnologyArchetype(archetype) : archetype;
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
import { Check, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const styles = {
    hero: { padding: '120px 24px 60px', background: 'linear-gradient(135deg, ${c.primary} 0%, ${c.secondary}66 100%)', textAlign: 'center' },
    heroTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '3rem', fontWeight: '600', color: '#fff', marginBottom: '16px' },
    heroSubtitle: { fontFamily: "${themeStyle.fontBody}", fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' },
    section: { padding: '${themeStyle.sectionPadding}', background: '${c.background}' },
    pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${themeStyle.gap}', maxWidth: '1000px', margin: '0 auto' },
    pricingCard: { background: '${c.backgroundAlt || "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', border: '2px solid transparent' },
    pricingCardPopular: { background: '${c.backgroundAlt || "#fff"}', padding: '${themeStyle.cardPadding}', borderRadius: '${themeStyle.borderRadius}', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', textAlign: 'center', border: '2px solid ${c.secondary}', position: 'relative' },
    popularBadge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '${c.secondary}', color: '#fff', padding: '4px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600' },
    planName: { fontFamily: "${themeStyle.fontHeading}", fontSize: '1.5rem', fontWeight: '600', color: '${c.text}', marginBottom: '8px' },
    planPrice: { fontFamily: "${themeStyle.fontBody}", fontSize: '3rem', fontWeight: '700', color: '${c.text}', marginBottom: '4px' },
    planPeriod: { fontFamily: "${themeStyle.fontBody}", color: '${c.textMuted}', marginBottom: '24px' },
    featureList: { listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' },
    featureItem: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontFamily: "${themeStyle.fontBody}", color: '${c.text}' },
    planBtn: { display: 'block', background: '${c.secondary}', color: '#fff', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' },
    planBtnOutline: { display: 'block', background: 'transparent', border: '2px solid ${c.secondary}', color: '${c.secondary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' },
    cta: { padding: '${themeStyle.sectionPadding}', background: '${c.primary}', textAlign: 'center' },
    ctaTitle: { fontFamily: "${themeStyle.fontHeading}", fontSize: '2rem', fontWeight: '600', color: '#fff', marginBottom: '16px' },
    ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: '${c.primary}', padding: '${themeStyle.buttonPadding}', borderRadius: '${themeStyle.borderRadius}', fontWeight: '600', textDecoration: 'none' }
  };

  const plans = [
    { name: 'Starter', price: '$29', period: '/month', features: ['Up to 5 users', '10GB storage', 'Basic analytics', 'Email support'], popular: false },
    { name: 'Professional', price: '$79', period: '/month', features: ['Up to 20 users', '100GB storage', 'Advanced analytics', 'Priority support', 'API access'], popular: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited users', 'Unlimited storage', 'Custom integrations', 'Dedicated support', 'SLA guarantee'], popular: false }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Simple, Transparent Pricing</h1>
        <p style={styles.heroSubtitle}>Start free, scale as you grow</p>
      </section>

      <section style={styles.section}>
        <div style={styles.pricingGrid}>
          {plans.map((plan, i) => (
            <div key={i} style={plan.popular ? styles.pricingCardPopular : styles.pricingCard}>
              {plan.popular && <div style={styles.popularBadge}>Most Popular</div>}
              <h2 style={styles.planName}>{plan.name}</h2>
              <div style={styles.planPrice}>{plan.price}</div>
              <div style={styles.planPeriod}>{plan.period}</div>
              <ul style={styles.featureList}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={styles.featureItem}>
                    <Check size={18} color="${c.secondary}" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/contact" style={plan.popular ? styles.planBtn : styles.planBtnOutline}>
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Questions? Let's talk.</h2>
        <Link to="/contact" style={styles.ctaBtn}>Contact Sales <ArrowRight size={18} /></Link>
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
  TECHNOLOGY_ARCHETYPES,
  TECHNOLOGY_INDUSTRIES,
  isTechnologyIndustry,
  detectTechnologyArchetype,
  getTechnologyArchetype
};
