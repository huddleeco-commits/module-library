/**
 * SPLIT HERO HOMEPAGE
 * Best for: SaaS, Tech Startups, Apps, Software
 * 
 * Features:
 * - Text left, product image right
 * - Light/white background
 * - Gradient accent text
 * - Logo cloud social proof
 * - Feature cards with icons
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Zap, Shield, BarChart, Globe, Users, Clock, Star, Play } from 'lucide-react';

const HomePage = () => {
  // ===== CONTENT - Replace with AI-generated content =====
  const CONTENT = {
    hero: {
      eyebrow: "AI-POWERED ANALYTICS",
      headline: "Transform Your Data Into",
      headlineAccent: "Actionable Insights",
      subheadline: "Real-time dashboards, predictive analytics, and seamless integrations. Make data-driven decisions faster than ever.",
      primaryCta: "Start Free Trial",
      secondaryCta: "Watch Demo",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800"
    },
    logoCloud: {
      label: "TRUSTED BY LEADING COMPANIES",
      logos: ["Microsoft", "Google", "Amazon", "Salesforce", "IBM", "Oracle"]
    },
    features: [
      { icon: "BarChart", title: "Real-Time Analytics", description: "Monitor your metrics in real-time with customizable dashboards and instant alerts." },
      { icon: "Zap", title: "Lightning Fast", description: "Query billions of data points in milliseconds with our optimized engine." },
      { icon: "Shield", title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption and role-based access controls." }
    ],
    howItWorks: [
      { step: "01", title: "Connect", description: "Integrate with your existing tools in minutes." },
      { step: "02", title: "Analyze", description: "AI automatically surfaces key insights." },
      { step: "03", title: "Act", description: "Make data-driven decisions with confidence." }
    ],
    stats: [
      { number: "10M+", label: "Data Points Processed" },
      { number: "500+", label: "Enterprise Clients" },
      { number: "99.9%", label: "Uptime SLA" },
      { number: "< 50ms", label: "Query Response" }
    ],
    testimonials: [
      { quote: "This platform transformed how we understand our customers. The insights are incredible.", author: "Sarah Chen", title: "VP of Product, TechCorp", avatar: "SC" },
      { quote: "Implementation was seamless. We saw ROI within the first month.", author: "Marcus Johnson", title: "CTO, ScaleUp Inc", avatar: "MJ" }
    ],
    cta: {
      headline: "Ready to unlock your data's potential?",
      subheadline: "Start your free 14-day trial. No credit card required.",
      primaryButton: "Get Started Free",
      secondaryButton: "Talk to Sales"
    }
  };

  // ===== THEME =====
  const THEME = {
    primary: '#0f172a',
    accent: '#6366f1',
    accentGradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    text: '#1e293b',
    textMuted: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    headingFont: "'Inter', system-ui, sans-serif",
    bodyFont: "system-ui, -apple-system, sans-serif"
  };

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
          width: '100%'
        }}>
          {/* Left - Content */}
          <div style={{ flex: '1' }}>
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
                background: THEME.accentGradient,
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
            <div style={{ display: 'flex', gap: '16px' }}>
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
                border: `1px solid #e2e8f0`,
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
          
          {/* Right - Image */}
          <div style={{ flex: '1' }}>
            <img
              src={CONTENT.hero.image}
              alt="Product dashboard"
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
              Everything you need to scale
            </h2>
            <p style={{
              fontSize: '18px',
              color: THEME.textMuted,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Powerful features designed for modern data teams
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px'
          }}>
            {CONTENT.features.map((feature, index) => {
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
                    background: `${THEME.accent}15`,
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
              color: THEME.primary,
              marginBottom: '16px'
            }}>
              How it works
            </h2>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '40px'
          }}>
            {CONTENT.howItWorks.map((step, index) => (
              <div key={index} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: THEME.accentGradient,
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

      {/* TESTIMONIALS */}
      <section style={{
        padding: '100px 20px',
        background: THEME.background
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px'
          }}>
            {CONTENT.testimonials.map((testimonial, index) => (
              <div key={index} style={{
                padding: '32px',
                background: THEME.surface,
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', marginBottom: '16px' }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} fill={THEME.accent} color={THEME.accent} />
                  ))}
                </div>
                <p style={{
                  fontSize: '16px',
                  color: THEME.text,
                  lineHeight: 1.6,
                  marginBottom: '20px'
                }}>
                  "{testimonial.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: THEME.accentGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: THEME.primary }}>
                      {testimonial.author}
                    </div>
                    <div style={{ fontSize: '14px', color: THEME.textMuted }}>
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 20px',
        background: THEME.accentGradient,
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
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
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

export default HomePage;