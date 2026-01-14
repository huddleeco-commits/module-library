/**
 * MINIMAL PROFESSIONAL HOMEPAGE
 * Best for: Law firms, Consulting, Accounting, Financial advisors
 * 
 * Features:
 * - Clean white hero with NO background image
 * - Large elegant typography
 * - Subtle service cards
 * - Professional credibility section
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Scale, FileText, Building, Briefcase, Shield, Award, Quote } from 'lucide-react';

const HomePage = () => {
  // ===== CONTENT - Replace with AI-generated content =====
  const CONTENT = {
    hero: {
      headline: "Premier Corporate Legal Excellence",
      subheadline: "Five decades of trusted counsel for Fortune 500 companies. Leading Manhattan's corporate law landscape with unmatched expertise.",
      cta: "Schedule Consultation",
      ctaLink: "/contact"
    },
    intro: {
      label: "TRUSTED SINCE 1974",
      title: "A Legacy of Legal Excellence",
      text: "For over 50 years, we have represented the world's most influential corporations in their most critical matters. Our attorneys combine deep industry knowledge with strategic insight to deliver exceptional outcomes."
    },
    services: [
      { icon: "Scale", title: "Mergers & Acquisitions", description: "Strategic guidance through complex transactions, from due diligence to closing." },
      { icon: "FileText", title: "Corporate Litigation", description: "Aggressive representation in high-stakes commercial disputes and class actions." },
      { icon: "Building", title: "Securities & Compliance", description: "Navigating regulatory requirements and SEC matters with precision." },
      { icon: "Briefcase", title: "Private Equity", description: "Comprehensive support for fund formation, investments, and exits." }
    ],
    stats: [
      { number: "50+", label: "Years of Excellence" },
      { number: "500+", label: "Cases Won" },
      { number: "$12B", label: "Client Recoveries" },
      { number: "98%", label: "Success Rate" }
    ],
    testimonial: {
      quote: "Their strategic counsel was instrumental in navigating our most complex acquisition. The team's expertise and dedication exceeded all expectations.",
      author: "Robert Chen",
      title: "CEO, Fortune 500 Company"
    },
    cta: {
      headline: "Ready to Discuss Your Legal Matters?",
      subheadline: "Schedule a confidential consultation with our senior partners.",
      button: "Contact Us Today"
    }
  };

  // ===== THEME - From industry config =====
  const THEME = {
    primary: '#1e3a5f',
    accent: '#c9a962',
    text: '#1a1a2e',
    textMuted: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    headingFont: "Georgia, 'Times New Roman', serif",
    bodyFont: "system-ui, -apple-system, sans-serif"
  };

  const icons = { Scale, FileText, Building, Briefcase, Shield, Award };

  return (
    <div>
      {/* HERO - Minimal, white background, elegant typography */}
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
          <Link to={CONTENT.hero.ctaLink} style={{
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
            textTransform: 'uppercase',
            transition: 'transform 0.2s, box-shadow 0.2s'
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
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }}>
            {CONTENT.services.map((service, index) => {
              const IconComponent = icons[service.icon] || Briefcase;
              return (
                <div key={index} style={{
                  padding: '40px 32px',
                  background: THEME.background,
                  border: `1px solid ${THEME.surface}`,
                  borderTop: `3px solid ${THEME.accent}`,
                  textAlign: 'center'
                }}>
                  <IconComponent 
                    size={36} 
                    color={THEME.accent}
                    style={{ marginBottom: '20px' }}
                  />
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
          <Quote 
            size={48} 
            color={THEME.accent}
            style={{ marginBottom: '24px', opacity: 0.5 }}
          />
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
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: THEME.primary
            }}>
              {CONTENT.testimonial.author}
            </div>
            <div style={{
              fontSize: '14px',
              color: THEME.textMuted
            }}>
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

export default HomePage;