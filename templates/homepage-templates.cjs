/**
 * Homepage Templates
 * 
 * Save to: C:\Users\huddl\OneDrive\Desktop\module-library\templates\homepage-templates.cjs
 * 
 * These are ACTUAL JSX templates - AI only fills in the CONTENT object.
 * This guarantees visual variety and proper structure.
 */

const HOMEPAGE_TEMPLATES = {
  // ============================================
  // MINIMAL PROFESSIONAL
  // Best for: Law, Accounting, Consulting, Financial
  // ============================================
  'minimal-professional': {
    name: 'Minimal Professional',
    industries: ['law-firm', 'accounting', 'consulting', 'financial'],
    description: 'Clean white hero, elegant typography, no background images',
    
    getTemplate: (CONTENT, THEME) => `import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Scale, FileText, Building, Briefcase, Shield, Award, Quote } from 'lucide-react';

const HomePage = () => {
  const THEME = ${JSON.stringify(THEME, null, 2)};
  const CONTENT = ${JSON.stringify(CONTENT, null, 2)};

  const icons = { Scale, FileText, Building, Briefcase, Shield, Award };

  return (
    <div>
      {/* HERO - Minimal, white background */}
      <section style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: THEME.background,
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '300',
            color: THEME.primary,
            fontFamily: THEME.headingFont,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-1px'
          }}>
            {CONTENT.hero.headline}
          </h1>
          <p style={{
            fontSize: '20px',
            color: THEME.textMuted,
            lineHeight: 1.7,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            {CONTENT.hero.subheadline}
          </p>
          <Link to={CONTENT.hero.ctaLink || '/contact'} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '18px 48px',
            background: THEME.primary,
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            {CONTENT.hero.cta}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* INTRO SECTION */}
      <section style={{
        padding: '100px 20px',
        background: THEME.surface,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <span style={{
            color: THEME.accent,
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            display: 'block'
          }}>
            {CONTENT.intro.label}
          </span>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '400',
            color: THEME.primary,
            fontFamily: THEME.headingFont,
            marginBottom: '24px'
          }}>
            {CONTENT.intro.title}
          </h2>
          <p style={{
            fontSize: '18px',
            color: THEME.textMuted,
            lineHeight: 1.8
          }}>
            {CONTENT.intro.text}
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section style={{
        padding: '100px 20px',
        background: THEME.background
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {CONTENT.services.map((service, index) => {
              const IconComponent = icons[service.icon] || Briefcase;
              return (
                <div key={index} style={{
                  padding: '40px 32px',
                  background: THEME.background,
                  border: '1px solid ' + THEME.surface,
                  borderTop: '3px solid ' + THEME.accent,
                  textAlign: 'center'
                }}>
                  <IconComponent size={36} color={THEME.accent} style={{ marginBottom: '20px' }} />
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: THEME.primary,
                    marginBottom: '12px'
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: THEME.textMuted,
                    lineHeight: 1.6
                  }}>
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <section style={{
        padding: '80px 20px',
        background: THEME.primary,
        color: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '40px',
          textAlign: 'center'
        }}>
          {CONTENT.stats.map((stat, index) => (
            <div key={index}>
              <div style={{
                fontSize: '48px',
                fontWeight: '300',
                fontFamily: THEME.headingFont,
                color: THEME.accent,
                marginBottom: '8px'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.8,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{
        padding: '100px 20px',
        background: THEME.surface,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Quote size={48} color={THEME.accent} style={{ marginBottom: '24px', opacity: 0.5 }} />
          <blockquote style={{
            fontSize: '24px',
            fontStyle: 'italic',
            color: THEME.text,
            lineHeight: 1.6,
            marginBottom: '32px',
            fontFamily: THEME.headingFont
          }}>
            "{CONTENT.testimonial.quote}"
          </blockquote>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: THEME.primary }}>
              {CONTENT.testimonial.author}
            </div>
            <div style={{ fontSize: '14px', color: THEME.textMuted }}>
              {CONTENT.testimonial.title}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: '100px 20px',
        background: THEME.primary,
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '400',
            fontFamily: THEME.headingFont,
            marginBottom: '16px'
          }}>
            {CONTENT.cta.headline}
          </h2>
          <p style={{
            fontSize: '18px',
            opacity: 0.85,
            marginBottom: '32px'
          }}>
            {CONTENT.cta.subheadline}
          </p>
          <Link to="/contact" style={{
            display: 'inline-block',
            padding: '18px 48px',
            background: THEME.accent,
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            {CONTENT.cta.button}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;`
  },

  // ============================================
  // SPLIT HERO SAAS
  // Best for: SaaS, Tech, Startups, Apps
  // ============================================
  'split-hero-saas': {
    name: 'Split Hero SaaS',
    industries: ['saas', 'tech', 'startup', 'app'],
    description: 'Text left, product image right, gradient accents',
    
    getTemplate: (CONTENT, THEME) => `import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Zap, Shield, BarChart, Globe, Users, Clock, Star, Play } from 'lucide-react';

const HomePage = () => {
  const THEME = ${JSON.stringify(THEME, null, 2)};
  const CONTENT = ${JSON.stringify(CONTENT, null, 2)};

  const icons = { BarChart, Zap, Shield, Globe, Users, Clock, Star };

  return (
    <div>
      {/* HERO - Split Layout */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: THEME.background,
        padding: '60px 5%'
      }}>
        <div style={{
          display: 'flex',
          maxWidth: '1400px',
          margin: '0 auto',
          gap: '80px',
          alignItems: 'center',
          width: '100%',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '400px' }}>
            <span style={{
              color: THEME.accent,
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '16px',
              display: 'block'
            }}>
              {CONTENT.hero.eyebrow}
            </span>
            <h1 style={{
              fontSize: '56px',
              fontWeight: '700',
              color: THEME.primary,
              fontFamily: THEME.headingFont,
              lineHeight: 1.1,
              marginBottom: '24px'
            }}>
              {CONTENT.hero.headline}{' '}
              <span style={{
                background: THEME.accentGradient || 'linear-gradient(135deg, ' + THEME.accent + ', #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {CONTENT.hero.headlineAccent}
              </span>
            </h1>
            <p style={{
              fontSize: '18px',
              color: THEME.textMuted,
              lineHeight: 1.7,
              marginBottom: '32px',
              maxWidth: '500px'
            }}>
              {CONTENT.hero.subheadline}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/signup" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: THEME.accent,
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '15px'
              }}>
                {CONTENT.hero.primaryCta}
                <ArrowRight size={18} />
              </Link>
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'transparent',
                color: THEME.primary,
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '15px',
                cursor: 'pointer'
              }}>
                <Play size={18} />
                {CONTENT.hero.secondaryCta}
              </button>
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '400px' }}>
            <img
              src={CONTENT.hero.image}
              alt="Product"
              style={{
                width: '100%',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'
              }}
            />
          </div>
        </div>
      </section>

      {/* LOGO CLOUD */}
      <section style={{
        padding: '60px 20px',
        background: THEME.surface,
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '12px',
          color: THEME.textMuted,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '24px'
        }}>
          {CONTENT.logoCloud.label}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '48px',
          flexWrap: 'wrap'
        }}>
          {CONTENT.logoCloud.logos.map((logo, index) => (
            <span key={index} style={{
              fontSize: '18px',
              fontWeight: '600',
              color: THEME.textMuted,
              opacity: 0.6
            }}>
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{
        padding: '100px 20px',
        background: THEME.background
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: THEME.primary,
              marginBottom: '16px'
            }}>
              {CONTENT.features.title || 'Everything you need to scale'}
            </h2>
            <p style={{
              fontSize: '18px',
              color: THEME.textMuted,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {CONTENT.features.subtitle || 'Powerful features for modern teams'}
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {CONTENT.features.items.map((feature, index) => {
              const IconComponent = icons[feature.icon] || Zap;
              return (
                <div key={index} style={{
                  padding: '32px',
                  background: THEME.surface,
                  borderRadius: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: THEME.accent + '15',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <IconComponent size={24} color={THEME.accent} />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: THEME.primary,
                    marginBottom: '12px'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: THEME.textMuted,
                    lineHeight: 1.6
                  }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        padding: '100px 20px',
        background: THEME.surface
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: THEME.primary
            }}>
              How it works
            </h2>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '40px',
            flexWrap: 'wrap'
          }}>
            {CONTENT.howItWorks.map((step, index) => (
              <div key={index} style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: THEME.accentGradient || THEME.accent,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: '700'
                }}>
                  {step.step}
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: THEME.primary,
                  marginBottom: '8px'
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: THEME.textMuted
                }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        padding: '80px 20px',
        background: THEME.primary
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '40px',
          textAlign: 'center'
        }}>
          {CONTENT.stats.map((stat, index) => (
            <div key={index}>
              <div style={{
                fontSize: '42px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '8px'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 20px',
        background: THEME.accentGradient || THEME.accent,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '16px'
          }}>
            {CONTENT.cta.headline}
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '32px'
          }}>
            {CONTENT.cta.subheadline}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              padding: '16px 32px',
              background: '#ffffff',
              color: THEME.accent,
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}>
              {CONTENT.cta.primaryButton}
            </Link>
            <Link to="/contact" style={{
              padding: '16px 32px',
              background: 'transparent',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              {CONTENT.cta.secondaryButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;`
  },

  // ============================================
  // FULL IMAGE HOSPITALITY
  // Best for: Restaurants, Hotels, Real Estate
  // ============================================
  'full-image-hospitality': {
    name: 'Full Image Hospitality',
    industries: ['restaurant', 'hotel', 'real-estate', 'event-venue'],
    description: 'Full-viewport background image, elegant overlay',
    
    getTemplate: (CONTENT, THEME) => `import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Clock, Star, Quote, ChevronRight } from 'lucide-react';

const HomePage = () => {
  const THEME = ${JSON.stringify(THEME, null, 2)};
  const CONTENT = ${JSON.stringify(CONTENT, null, 2)};

  return (
    <div>
      {/* HERO - Full Image */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url("' + CONTENT.hero.backgroundImage + '")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <div style={{ maxWidth: '900px' }}>
          <span style={{
            color: THEME.accent,
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '24px',
            display: 'block'
          }}>
            {CONTENT.hero.label}
          </span>
          <div style={{
            width: '60px',
            height: '2px',
            background: THEME.accent,
            margin: '0 auto 32px'
          }} />
          <h1 style={{
            fontSize: '64px',
            fontWeight: '400',
            color: '#ffffff',
            fontFamily: THEME.headingFont,
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            {CONTENT.hero.headline}
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.7,
            marginBottom: '40px',
            maxWidth: '700px',
            margin: '0 auto 40px'
          }}>
            {CONTENT.hero.subheadline}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/reservations" style={{
              padding: '18px 40px',
              background: THEME.accent,
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              {CONTENT.hero.primaryCta}
            </Link>
            <Link to="/menu" style={{
              padding: '18px 40px',
              background: 'transparent',
              color: '#ffffff',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.4)',
              fontSize: '14px',
              fontWeight: '500',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              {CONTENT.hero.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section style={{
        padding: '120px 20px',
        background: THEME.cream || '#fdfbf7',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <span style={{
            color: THEME.accent,
            fontSize: '12px',
            fontWeight: '500',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '20px',
            display: 'block'
          }}>
            {CONTENT.intro.label}
          </span>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '400',
            color: THEME.primary,
            fontFamily: THEME.headingFont,
            marginBottom: '24px',
            lineHeight: 1.2
          }}>
            {CONTENT.intro.title}
          </h2>
          <p style={{
            fontSize: '18px',
            color: THEME.textMuted,
            lineHeight: 1.8,
            marginBottom: '32px'
          }}>
            {CONTENT.intro.text}
          </p>
          <Link to="/about" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: THEME.accent,
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '1px'
          }}>
            {CONTENT.intro.linkText || 'Learn More'}
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* FEATURED ITEMS */}
      <section style={{
        padding: '120px 20px',
        background: THEME.background
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: '400',
              color: THEME.primary,
              fontFamily: THEME.headingFont,
              marginBottom: '12px'
            }}>
              {CONTENT.featured.title}
            </h2>
            <p style={{
              fontSize: '16px',
              color: THEME.textMuted,
              fontStyle: 'italic'
            }}>
              {CONTENT.featured.subtitle}
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {CONTENT.featured.items.map((item, index) => (
              <div key={index} style={{ background: THEME.background }}>
                <div style={{ height: '280px', overflow: 'hidden' }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{ padding: '24px 0' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '400',
                      color: THEME.primary,
                      fontFamily: THEME.headingFont
                    }}>
                      {item.name}
                    </h3>
                    <span style={{
                      fontSize: '18px',
                      color: THEME.accent,
                      fontWeight: '500'
                    }}>
                      {item.price}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: THEME.textMuted
                  }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/menu" style={{
              display: 'inline-block',
              padding: '16px 48px',
              border: '1px solid ' + THEME.primary,
              color: THEME.primary,
              textDecoration: 'none',
              fontSize: '14px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '500'
            }}>
              {CONTENT.featured.buttonText || 'View Full Menu'}
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{
        padding: '100px 20px',
        background: THEME.primary,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            {[...Array(CONTENT.testimonial.rating || 5)].map((_, i) => (
              <Star key={i} size={20} fill={THEME.accent} color={THEME.accent} />
            ))}
          </div>
          <Quote size={40} color={THEME.accent} style={{ marginBottom: '24px', opacity: 0.6 }} />
          <blockquote style={{
            fontSize: '28px',
            fontStyle: 'italic',
            color: '#ffffff',
            lineHeight: 1.5,
            marginBottom: '24px',
            fontFamily: THEME.headingFont,
            fontWeight: '400'
          }}>
            "{CONTENT.testimonial.quote}"
          </blockquote>
          <cite style={{
            fontSize: '14px',
            color: THEME.accent,
            fontStyle: 'normal',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            — {CONTENT.testimonial.author}
          </cite>
        </div>
      </section>

      {/* INFO BAR */}
      <section style={{
        padding: '60px 20px',
        background: THEME.surface
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '32px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={24} color={THEME.accent} />
            <span style={{ fontSize: '15px', color: THEME.text }}>
              {CONTENT.info.address}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Phone size={24} color={THEME.accent} />
            <span style={{ fontSize: '15px', color: THEME.text }}>
              {CONTENT.info.phone}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={24} color={THEME.accent} />
            <span style={{ fontSize: '15px', color: THEME.text }}>
              {CONTENT.info.hours}
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '120px 20px',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("' + (CONTENT.cta.backgroundImage || CONTENT.hero.backgroundImage) + '")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '400',
            color: '#ffffff',
            fontFamily: THEME.headingFont,
            marginBottom: '16px'
          }}>
            {CONTENT.cta.headline}
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '32px'
          }}>
            {CONTENT.cta.subheadline}
          </p>
          <Link to="/reservations" style={{
            display: 'inline-block',
            padding: '18px 56px',
            background: THEME.accent,
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {CONTENT.cta.button}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;`
  }
};

// ============================================
// TEMPLATE SELECTOR
// ============================================

function getTemplateForIndustry(industryKey) {
  const mapping = {
    'law-firm': 'minimal-professional',
    'accounting': 'minimal-professional',
    'consulting': 'minimal-professional',
    'financial': 'minimal-professional',
    'saas': 'split-hero-saas',
    'tech': 'split-hero-saas',
    'startup': 'split-hero-saas',
    'app': 'split-hero-saas',
    'ecommerce': 'split-hero-saas',
    'restaurant': 'full-image-hospitality',
    'hotel': 'full-image-hospitality',
    'real-estate': 'full-image-hospitality',
    'event-venue': 'full-image-hospitality',
    'healthcare': 'minimal-professional',
    'collectibles': 'split-hero-saas',
    'sports': 'split-hero-saas',
    'family': 'split-hero-saas'
  };
  
  return mapping[industryKey] || 'split-hero-saas';
}

// ============================================
// CONTENT GENERATOR PROMPT
// ============================================

function getContentPromptForTemplate(templateKey, businessDescription, industryName) {
  const prompts = {
    'minimal-professional': `Generate content for a professional services website.

Business: ${businessDescription}
Industry: ${industryName}

Return ONLY valid JSON with this EXACT structure:
{
  "hero": {
    "headline": "Main headline (6-10 words, elegant, professional)",
    "subheadline": "Supporting text (1-2 sentences describing value)",
    "cta": "Button text (2-3 words)",
    "ctaLink": "/contact"
  },
  "intro": {
    "label": "SHORT LABEL (2-3 words uppercase)",
    "title": "Section title (5-8 words)",
    "text": "2-3 sentences about the company's history/value"
  },
  "services": [
    { "icon": "Scale", "title": "Service Name", "description": "Brief description (1 sentence)" },
    { "icon": "FileText", "title": "Service 2", "description": "Description" },
    { "icon": "Building", "title": "Service 3", "description": "Description" },
    { "icon": "Briefcase", "title": "Service 4", "description": "Description" }
  ],
  "stats": [
    { "number": "50+", "label": "Years Experience" },
    { "number": "500+", "label": "Clients Served" },
    { "number": "$1B+", "label": "Transactions" },
    { "number": "98%", "label": "Success Rate" }
  ],
  "testimonial": {
    "quote": "A compelling testimonial quote (1-2 sentences)",
    "author": "Client Name",
    "title": "Position, Company"
  },
  "cta": {
    "headline": "Call to action headline",
    "subheadline": "Supporting text",
    "button": "Button text"
  }
}

Icons available: Scale, FileText, Building, Briefcase, Shield, Award`,

    'split-hero-saas': `Generate content for a SaaS/tech website.

Business: ${businessDescription}
Industry: ${industryName}

Return ONLY valid JSON with this EXACT structure:
{
  "hero": {
    "eyebrow": "SHORT LABEL (2-4 words uppercase)",
    "headline": "Main headline part 1",
    "headlineAccent": "Gradient highlighted word(s)",
    "subheadline": "Value proposition (2 sentences)",
    "primaryCta": "Primary button (2-3 words)",
    "secondaryCta": "Secondary button (2-3 words)",
    "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800"
  },
  "logoCloud": {
    "label": "TRUSTED BY LEADING COMPANIES",
    "logos": ["Company1", "Company2", "Company3", "Company4", "Company5"]
  },
  "features": {
    "title": "Section title",
    "subtitle": "Section subtitle",
    "items": [
      { "icon": "BarChart", "title": "Feature 1", "description": "Description (1-2 sentences)" },
      { "icon": "Zap", "title": "Feature 2", "description": "Description" },
      { "icon": "Shield", "title": "Feature 3", "description": "Description" }
    ]
  },
  "howItWorks": [
    { "step": "01", "title": "Step 1", "description": "Brief description" },
    { "step": "02", "title": "Step 2", "description": "Brief description" },
    { "step": "03", "title": "Step 3", "description": "Brief description" }
  ],
  "stats": [
    { "number": "10M+", "label": "Metric 1" },
    { "number": "500+", "label": "Metric 2" },
    { "number": "99.9%", "label": "Metric 3" },
    { "number": "<50ms", "label": "Metric 4" }
  ],
  "cta": {
    "headline": "CTA headline",
    "subheadline": "Supporting text",
    "primaryButton": "Primary CTA",
    "secondaryButton": "Secondary CTA"
  }
}

Icons available: BarChart, Zap, Shield, Globe, Users, Clock, Star`,

    'full-image-hospitality': `Generate content for a restaurant/hospitality website.

Business: ${businessDescription}
Industry: ${industryName}

Return ONLY valid JSON with this EXACT structure:
{
  "hero": {
    "label": "LOCATION OR TAGLINE (uppercase)",
    "headline": "Main headline (elegant, 4-7 words)",
    "subheadline": "Description (2-3 sentences about the experience)",
    "primaryCta": "Primary button (2-3 words)",
    "secondaryCta": "Secondary button (2-3 words)",
    "backgroundImage": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920"
  },
  "intro": {
    "label": "OUR STORY",
    "title": "Section title (5-8 words)",
    "text": "2-3 sentences about history/philosophy",
    "linkText": "Read Our Story"
  },
  "featured": {
    "title": "Featured section title",
    "subtitle": "Elegant subtitle",
    "items": [
      { "name": "Item 1", "description": "Brief description", "price": "$XX", "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400" },
      { "name": "Item 2", "description": "Brief description", "price": "$XX", "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400" },
      { "name": "Item 3", "description": "Brief description", "price": "$XX", "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" }
    ],
    "buttonText": "View Full Menu"
  },
  "testimonial": {
    "quote": "A compelling review quote",
    "author": "Reviewer/Publication",
    "rating": 5
  },
  "info": {
    "address": "Full address",
    "phone": "(XXX) XXX-XXXX",
    "hours": "Hours of operation"
  },
  "cta": {
    "headline": "CTA headline",
    "subheadline": "Supporting text",
    "button": "Button text"
  }
}`
  };

  return prompts[templateKey] || prompts['split-hero-saas'];
}

module.exports = {
  HOMEPAGE_TEMPLATES,
  getTemplateForIndustry,
  getContentPromptForTemplate
};
