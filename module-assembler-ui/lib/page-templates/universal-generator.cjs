/**
 * Universal Industry Generator
 *
 * Generates complete business sites for ANY industry using:
 * 1. Fixture Data (business info, services, team, etc.)
 * 2. Industry Layout Configuration (3 variants per industry)
 * 3. Modular Section Components
 *
 * ZERO AI COST - Uses templates + data
 * AI Visual Freedom can customize sections later (PAID tier)
 */

const { getIndustryLayouts, getIndustryLayout, getAvailableIndustryLayouts, normalizeIndustry } = require('./layouts/industry-layouts.cjs');

/**
 * Generate a complete site for any industry
 */
function generateSite(fixture, layoutId = null) {
  const industry = normalizeIndustry(fixture.business?.industry);
  const industryConfig = getIndustryLayouts(industry);
  const layout = layoutId
    ? getIndustryLayout(industry, layoutId)
    : getIndustryLayout(industry, industryConfig.defaultLayout);

  const selectedLayoutId = layoutId || industryConfig.defaultLayout;

  console.log(`\n🏢 Generating ${fixture.business.name}`);
  console.log(`   Industry: ${industry}`);
  console.log(`   Layout: ${layout.name} (${selectedLayoutId})`);
  console.log(`   Style: ${layout.style.heroStyle} hero, ${layout.style.cardStyle} cards`);

  const { business, theme, pages } = fixture;
  const colors = theme?.colors || industryConfig.colorPalettes[selectedLayoutId];

  // Generate all pages
  const generatedPages = {};

  // Home Page (always generated)
  generatedPages.HomePage = generateHomePage(fixture, layout, colors);

  // Standard pages based on what exists in fixture
  if (pages?.services) {
    generatedPages.ServicesPage = generateServicesPage(fixture, layout, colors);
  }
  if (pages?.about) {
    generatedPages.AboutPage = generateAboutPage(fixture, layout, colors);
  }
  if (pages?.contact) {
    generatedPages.ContactPage = generateContactPage(fixture, layout, colors);
  }

  // Industry-specific pages
  const industryPages = getIndustrySpecificPages(industry, fixture, layout, colors);
  Object.assign(generatedPages, industryPages);

  return {
    business,
    industry,
    layout: { id: selectedLayoutId, ...layout },
    colors,
    pages: generatedPages,
    routes: generateRoutes(Object.keys(generatedPages))
  };
}

/**
 * Generate Home Page with industry-aware layout
 */
function generateHomePage(fixture, layout, colors) {
  const { business, pages } = fixture;
  const homeData = pages?.home || {};

  const heroSection = generateHeroSection(business, homeData.hero || {}, colors, layout);
  const servicesSection = generateServicesPreview(business, fixture.services || homeData.services || [], colors, layout);
  const statsSection = generateStatsSection(homeData.stats || business.stats || [], colors, layout);
  const testimonialsSection = generateTestimonialsSection(homeData.testimonials || fixture.testimonials || [], colors, layout);
  const ctaSection = generateCtaSection(business, colors, layout);

  return `/**
 * HomePage - ${layout.name} Layout
 * Business: ${business.name}
 * Industry: ${business.industry}
 * Generated: ${new Date().toISOString()}
 *
 * MODULAR STRUCTURE - Each section can be customized by AI Visual Freedom
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Calendar, User, Clock, Award, Heart, Shield, Users,
  Star, MapPin, ChevronRight, Activity, CheckCircle, ArrowRight,
  Mail, Building, Briefcase, Settings, Coffee, Scissors, Car,
  Home as HomeIcon, Scale, Dumbbell, BookOpen, ShoppingBag
} from 'lucide-react';

// Theme colors - AI Visual Freedom can override
const COLORS = ${JSON.stringify(colors, null, 2)};

// Layout configuration
const LAYOUT = ${JSON.stringify(layout.style, null, 2)};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background || '#FAFAFA', color: COLORS.text || '#1F2937' }}>
      <HeroSection />
      <ServicesPreviewSection />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}

${heroSection}

${servicesSection}

${statsSection}

${testimonialsSection}

${ctaSection}
`;
}

/**
 * Generate Hero Section based on layout style
 */
function generateHeroSection(business, heroData, colors, layout) {
  const style = layout.style.heroStyle;

  if (style === 'centered' || style === 'fullscreen') {
    return `
function HeroSection() {
  return (
    <section style={{
      minHeight: '${style === 'fullscreen' ? '100vh' : '85vh'}',
      background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 20px',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '800px', color: 'white' }}>
        ${heroData.badge ? `
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: '10px 20px',
          borderRadius: '50px',
          marginBottom: '32px'
        }}>
          <Award size={20} />
          <span style={{ fontWeight: '500' }}>${heroData.badge}</span>
        </div>` : ''}

        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: '700',
          lineHeight: 1.1,
          marginBottom: '24px'
        }}>
          ${heroData.headline || business.tagline || 'Welcome to ' + business.name}
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 22px)',
          opacity: 0.9,
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          ${heroData.subheadline || business.description || 'Quality service you can trust'}
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="${heroData.ctaLink || '/contact'}" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'white',
            color: '${colors.primary}',
            padding: '18px 36px',
            borderRadius: '${layout.style.borderRadius}',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <Calendar size={22} />
            ${heroData.cta || 'Get Started'}
          </Link>

          ${heroData.secondaryCta ? `
          <Link to="${heroData.secondaryCtaLink || '/about'}" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'transparent',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '${layout.style.borderRadius}',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            ${heroData.secondaryCta}
          </Link>` : ''}
        </div>
      </div>
    </section>
  );
}`;
  }

  if (style === 'split') {
    return `
function HeroSection() {
  return (
    <section style={{
      minHeight: '80vh',
      backgroundColor: '${colors.background || '#FAFAFA'}',
      display: 'flex',
      alignItems: 'center',
      padding: '80px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '60px',
        alignItems: 'center'
      }}>
        {/* Left: Content */}
        <div>
          <div style={{
            display: 'inline-block',
            backgroundColor: '${colors.primary}15',
            color: '${colors.primary}',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            ${business.industry || 'Professional Services'}
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: '700',
            lineHeight: 1.15,
            marginBottom: '24px',
            color: '${colors.text || '#1F2937'}'
          }}>
            ${heroData.headline || business.tagline || business.name}
          </h1>

          <p style={{
            fontSize: '18px',
            color: '${colors.text || '#1F2937'}',
            opacity: 0.7,
            marginBottom: '32px',
            lineHeight: 1.7
          }}>
            ${heroData.subheadline || business.description || 'Quality service you can trust'}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <Link to="${heroData.ctaLink || '/contact'}" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '${colors.primary}',
              color: 'white',
              padding: '16px 28px',
              borderRadius: '${layout.style.borderRadius}',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              <Calendar size={20} />
              ${heroData.cta || 'Get Started'}
            </Link>
            <a href="tel:${business.phone || ''}" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: '${colors.text || '#1F2937'}',
              padding: '16px 28px',
              borderRadius: '${layout.style.borderRadius}',
              fontWeight: '600',
              textDecoration: 'none',
              border: '2px solid rgba(0,0,0,0.1)'
            }}>
              <Phone size={20} />
              Call Us
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '${colors.primary}' }}>${business.established ? new Date().getFullYear() - business.established + '+' : '10+'}</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Years Experience</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '${colors.primary}' }}>${business.customerCount || '1000'}+</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Happy Customers</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '${colors.primary}' }}>${business.rating || '4.9'}</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Customer Rating</div>
            </div>
          </div>
        </div>

        {/* Right: Visual */}
        <div style={{
          height: '450px',
          backgroundColor: '${colors.primary}10',
          borderRadius: '${layout.style.borderRadius}',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#059669" />
              <span style={{ fontWeight: '600' }}>Verified Business</span>
            </div>
          </div>
          <Building size={100} color="${colors.primary}" style={{ opacity: 0.2 }} />
        </div>
      </div>
    </section>
  );
}`;
  }

  // Minimal hero
  return `
function HeroSection() {
  return (
    <section style={{
      backgroundColor: '${colors.primary}',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            ${heroData.headline || 'Welcome to ' + business.name}
          </h1>
          <p style={{ opacity: 0.9 }}>${heroData.subheadline || business.tagline || 'Quality service you can trust'}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'white',
            color: '${colors.primary}',
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Phone size={18} />
            Contact Us
          </Link>
          <Link to="/menu" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <ArrowRight size={18} />
            View Menu
          </Link>
        </div>
      </div>
    </section>
  );
}`;
}

/**
 * Generate Services Preview Section
 */
function generateServicesPreview(business, services, colors, layout) {
  const defaultServices = [
    { name: 'Service 1', description: 'Quality service for your needs' },
    { name: 'Service 2', description: 'Expert solutions you can trust' },
    { name: 'Service 3', description: 'Professional results every time' },
    { name: 'Service 4', description: 'Dedicated to your satisfaction' }
  ];

  const displayServices = services.length > 0 ? services.slice(0, 6) : defaultServices;

  return `
function ServicesPreviewSection() {
  const services = ${JSON.stringify(displayServices, null, 2)};

  return (
    <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 36px)',
            fontWeight: '700',
            marginBottom: '16px'
          }}>Our Services</h2>
          <p style={{ fontSize: '18px', opacity: 0.7, maxWidth: '600px', margin: '0 auto' }}>
            Discover what we can do for you
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '${layout.style.spacing === 'comfortable' ? '32px' : layout.style.spacing === 'structured' ? '24px' : '16px'}'
        }}>
          {services.map((service, idx) => (
            <div key={idx} style={{
              padding: '${layout.style.spacing === 'comfortable' ? '32px' : '24px'}',
              backgroundColor: '${colors.background || '#FAFAFA'}',
              borderRadius: '${layout.style.cardStyle === 'rounded' ? '16px' : layout.style.cardStyle === 'bordered' ? '8px' : '4px'}',
              border: '${layout.style.cardStyle === 'bordered' ? '1px solid rgba(0,0,0,0.08)' : 'none'}',
              boxShadow: '${layout.style.shadows === 'soft' ? '0 4px 20px rgba(0,0,0,0.06)' : layout.style.shadows === 'minimal' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'}',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{service.name}</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>{service.description}</p>
              <Link to="/contact" style={{
                color: '${colors.primary}',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Learn more <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '${colors.primary}',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '${layout.style.borderRadius}',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Get Started
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}`;
}

/**
 * Generate Stats Section
 */
function generateStatsSection(stats, colors, layout) {
  const defaultStats = [
    { value: '10+', label: 'Years Experience' },
    { value: '1000+', label: 'Happy Customers' },
    { value: '50+', label: 'Services' },
    { value: '4.9', label: 'Rating' }
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return `
function StatsSection() {
  const stats = ${JSON.stringify(displayStats, null, 2)};

  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '40px',
        textAlign: 'center'
      }}>
        {stats.map((stat, idx) => (
          <div key={idx}>
            <div style={{
              fontSize: 'clamp(36px, 4vw, 48px)',
              fontWeight: '700',
              color: 'white'
            }}>{stat.value}</div>
            <div style={{
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '14px',
              marginTop: '8px'
            }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}`;
}

/**
 * Generate Testimonials Section
 */
function generateTestimonialsSection(testimonials, colors, layout) {
  const defaultTestimonials = [
    { name: 'John D.', text: 'Excellent service and friendly staff. Highly recommend!', rating: 5 },
    { name: 'Sarah M.', text: 'Professional, reliable, and great value. Will use again.', rating: 5 }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials.slice(0, 3) : defaultTestimonials;

  return `
function TestimonialsSection() {
  const testimonials = ${JSON.stringify(displayTestimonials, null, 2)};

  return (
    <section style={{ padding: '100px 20px', backgroundColor: '${colors.background || '#FAFAFA'}' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(28px, 3vw, 36px)',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          What Our Customers Say
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {testimonials.map((t, idx) => (
            <div key={idx} style={{
              padding: '32px',
              backgroundColor: 'white',
              borderRadius: '${layout.style.borderRadius}',
              boxShadow: '${layout.style.shadows === 'soft' ? '0 4px 20px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.04)'}'
            }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.7 }}>"{t.text}"</p>
              <p style={{ fontWeight: '600' }}>{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;
}

/**
 * Generate CTA Section
 */
function generateCtaSection(business, colors, layout) {
  return `
function CtaSection() {
  return (
    <section style={{
      padding: '100px 20px',
      background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px'
        }}>
          Ready to Get Started?
        </h2>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '32px'
        }}>
          Contact us today to learn more about our services
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'white',
            color: '${colors.primary}',
            padding: '18px 36px',
            borderRadius: '${layout.style.borderRadius}',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Mail size={22} />
            Contact Us
          </Link>
          <a href="tel:${business.phone || ''}" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '${layout.style.borderRadius}',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Phone size={22} />
            ${business.phone || 'Call Now'}
          </a>
        </div>
      </div>
    </section>
  );
}`;
}

/**
 * Generate Services Page
 */
function generateServicesPage(fixture, layout, colors) {
  return `/**
 * ServicesPage - ${layout.name} Layout
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Check, ArrowRight } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function ServicesPage() {
  const services = ${JSON.stringify(fixture.services || [], null, 2)};

  return (
    <div style={{ backgroundColor: COLORS.background || '#FAFAFA' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '${colors.primary}',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>Our Services</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Discover what we can do for you</p>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {services.map((service, idx) => (
              <div key={idx} style={{
                padding: '32px',
                backgroundColor: 'white',
                borderRadius: '${layout.style.borderRadius}',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>{service.name}</h3>
                <p style={{ opacity: 0.7, marginBottom: '24px', lineHeight: 1.7 }}>{service.description}</p>
                {service.features && (
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                    {service.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Check size={16} color="${colors.primary}" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {service.price && (
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '${colors.primary}' }}>{service.price}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '${colors.primary}',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
          Ready to get started?
        </h2>
        <Link to="/contact" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'white',
          color: '${colors.primary}',
          padding: '16px 32px',
          borderRadius: '${layout.style.borderRadius}',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          Contact Us <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
`;
}

/**
 * Generate About Page
 */
function generateAboutPage(fixture, layout, colors) {
  const { business, team } = fixture;

  return `/**
 * AboutPage - ${layout.name} Layout
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, Star, Award } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function AboutPage() {
  const team = ${JSON.stringify(team || [], null, 2)};

  return (
    <div style={{ backgroundColor: COLORS.background || '#FAFAFA' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '${colors.primary}',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>About Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${business.tagline || 'Our story and mission'}</p>
      </section>

      {/* Our Story */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Our Story</h2>
          <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.8 }}>
            ${business.description || 'Founded with a commitment to excellence, we have been serving our community with dedication and passion.'}
          </p>
          ${business.established ? `<p style={{ marginTop: '24px', fontSize: '16px', opacity: 0.7 }}>Proudly serving since ${business.established}</p>` : ''}
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Our Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {[
              { icon: 'Heart', title: 'Customer First', desc: 'Your satisfaction is our priority' },
              { icon: 'Shield', title: 'Trust & Integrity', desc: 'Honest and transparent service' },
              { icon: 'Star', title: 'Excellence', desc: 'Committed to the highest standards' },
              { icon: 'Users', title: 'Community', desc: 'Proud to serve our neighbors' }
            ].map((v, idx) => (
              <div key={idx} style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '${colors.primary}15',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  {v.icon === 'Heart' && <Heart size={28} color="${colors.primary}" />}
                  {v.icon === 'Shield' && <Shield size={28} color="${colors.primary}" />}
                  {v.icon === 'Star' && <Star size={28} color="${colors.primary}" />}
                  {v.icon === 'Users' && <Users size={28} color="${colors.primary}" />}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{v.title}</h3>
                <p style={{ opacity: 0.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Meet Our Team</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {team.map((member, idx) => (
                <div key={idx} style={{
                  textAlign: 'center',
                  padding: '32px',
                  backgroundColor: 'white',
                  borderRadius: '${layout.style.borderRadius}',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '${colors.primary}20',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px'
                  }}>
                    {member.name?.charAt(0) || '?'}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{member.name}</h3>
                  <p style={{ color: '${colors.primary}', fontWeight: '500', marginBottom: '12px' }}>{member.role || member.title}</p>
                  {member.bio && <p style={{ opacity: 0.7, fontSize: '14px' }}>{member.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
`;
}

/**
 * Generate Contact Page
 */
function generateContactPage(fixture, layout, colors) {
  const { business } = fixture;

  return `/**
 * ContactPage - ${layout.name} Layout
 */
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: COLORS.background || '#FAFAFA' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '${colors.primary}',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>Contact Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>We would love to hear from you</p>
      </section>

      {/* Contact Content */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '60px'
        }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Get in Touch</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              ${business.phone ? `
              <a href="tel:${business.phone}" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '${layout.style.borderRadius}',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '${colors.primary}15',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Phone size={24} color="${colors.primary}" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Phone</div>
                  <div style={{ opacity: 0.7 }}>${business.phone}</div>
                </div>
              </a>` : ''}

              ${business.email ? `
              <a href="mailto:${business.email}" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '${layout.style.borderRadius}',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '${colors.primary}15',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={24} color="${colors.primary}" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Email</div>
                  <div style={{ opacity: 0.7 }}>${business.email}</div>
                </div>
              </a>` : ''}

              ${business.address ? `
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '${layout.style.borderRadius}',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '${colors.primary}15',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={24} color="${colors.primary}" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Address</div>
                  <div style={{ opacity: 0.7 }}>${business.address}</div>
                </div>
              </div>` : ''}
            </div>
          </div>

          {/* Contact Form */}
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '${layout.style.borderRadius}',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#05966920',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <Send size={28} color="#059669" />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ opacity: 0.7 }}>We will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Send us a message</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px'
                    }}
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    required
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                  <button type="submit" style={{
                    backgroundColor: '${colors.primary}',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '${layout.style.borderRadius}',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
`;
}

/**
 * Get industry-specific pages
 */
function getIndustrySpecificPages(industry, fixture, layout, colors) {
  const pages = {};

  // Healthcare-specific pages
  if (['healthcare', 'dental', 'clinic'].includes(industry)) {
    pages.ProvidersPage = generateGenericListPage(fixture, layout, colors, 'Our Providers', fixture.team || [], 'provider');
  }

  // Restaurant-specific pages
  if (['pizza-restaurant', 'steakhouse', 'coffee-cafe', 'restaurant', 'bakery'].includes(industry)) {
    pages.MenuPage = generateMenuPage(fixture, layout, colors);
  }

  // Salon/Spa specific pages
  if (['salon-spa', 'barbershop'].includes(industry)) {
    pages.TeamPage = generateGenericListPage(fixture, layout, colors, 'Our Team', fixture.team || [], 'stylist');
    pages.GalleryPage = generateGalleryPage(fixture, layout, colors);
  }

  // Fitness specific pages
  if (['fitness-gym', 'yoga'].includes(industry)) {
    pages.ClassesPage = generateClassesPage(fixture, layout, colors);
    pages.MembershipPage = generateMembershipPage(fixture, layout, colors);
  }

  // Real estate specific pages
  if (industry === 'real-estate') {
    pages.ListingsPage = generateListingsPage(fixture, layout, colors);
  }

  // SaaS specific pages
  if (industry === 'saas') {
    pages.PricingPage = generatePricingPage(fixture, layout, colors);
    pages.FeaturesPage = generateFeaturesPage(fixture, layout, colors);
  }

  // E-commerce specific pages
  if (industry === 'ecommerce') {
    pages.ShopPage = generateShopPage(fixture, layout, colors);
  }

  return pages;
}

// Placeholder generators for industry-specific pages
function generateGenericListPage(fixture, layout, colors, title, items, type) {
  return `// ${title} page - ${layout.name} layout`;
}

function generateMenuPage(fixture, layout, colors) {
  return `// Menu page - ${layout.name} layout`;
}

function generateGalleryPage(fixture, layout, colors) {
  return `// Gallery page - ${layout.name} layout`;
}

function generateClassesPage(fixture, layout, colors) {
  return `// Classes page - ${layout.name} layout`;
}

function generateMembershipPage(fixture, layout, colors) {
  return `// Membership page - ${layout.name} layout`;
}

function generateListingsPage(fixture, layout, colors) {
  return `// Listings page - ${layout.name} layout`;
}

function generatePricingPage(fixture, layout, colors) {
  return `// Pricing page - ${layout.name} layout`;
}

function generateFeaturesPage(fixture, layout, colors) {
  return `// Features page - ${layout.name} layout`;
}

function generateShopPage(fixture, layout, colors) {
  return `// Shop page - ${layout.name} layout`;
}

/**
 * Generate routes configuration
 */
function generateRoutes(pageNames) {
  const routeMap = {
    'HomePage': '/home',
    'ServicesPage': '/services',
    'AboutPage': '/about',
    'ContactPage': '/contact',
    'ProvidersPage': '/providers',
    'TeamPage': '/team',
    'MenuPage': '/menu',
    'GalleryPage': '/gallery',
    'ClassesPage': '/classes',
    'MembershipPage': '/membership',
    'ListingsPage': '/listings',
    'PricingPage': '/pricing',
    'FeaturesPage': '/features',
    'ShopPage': '/shop'
  };

  return pageNames.map(name => ({
    path: routeMap[name] || `/${name.toLowerCase().replace('page', '')}`,
    component: name
  }));
}

/**
 * Generate App.jsx with all routes
 */
function generateAppJsx(fixture, layout, colors, routes) {
  const imports = routes.map(r => `import ${r.component} from './pages/${r.component}';`).join('\n');
  const routeElements = routes.map(r => `          <Route path="${r.path}" element={<${r.component} />} />`).join('\n');

  return `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
${imports}

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background || '#FAFAFA' }}>
        {/* Navigation */}
        <header style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link to="/home" style={{
              fontWeight: '700',
              fontSize: '20px',
              color: COLORS.primary,
              textDecoration: 'none'
            }}>
              ${fixture.business.name}
            </Link>

            <nav style={{ display: 'flex', gap: '24px' }}>
              ${routes.filter(r => ['/', '/services', '/about', '/contact'].includes(r.path)).map(r =>
                `<Link to="${r.path}" style={{ color: COLORS.text || '#1F2937', textDecoration: 'none', fontWeight: '500' }}>
                ${r.path === '/' ? 'Home' : r.component.replace('Page', '')}
              </Link>`
              ).join('\n              ')}
            </nav>
          </div>
        </header>

        {/* Routes */}
        <Routes>
${routeElements}
        </Routes>

        {/* Footer */}
        <footer style={{
          backgroundColor: COLORS.text || '#1F2937',
          color: 'white',
          padding: '60px 20px 40px',
          marginTop: 'auto'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>${fixture.business.name}</h3>
            <p style={{ opacity: 0.7, marginBottom: '24px' }}>${fixture.business.tagline || ''}</p>
            <p style={{ fontSize: '14px', opacity: 0.5 }}>
              © ${new Date().getFullYear()} ${fixture.business.name}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
`;
}

module.exports = {
  generateSite,
  generateHomePage,
  generateServicesPage,
  generateAboutPage,
  generateContactPage,
  generateAppJsx,
  getAvailableIndustryLayouts
};
