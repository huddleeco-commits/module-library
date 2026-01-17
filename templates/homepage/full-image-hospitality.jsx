/**
 * FULL IMAGE HERO HOMEPAGE (with VideoBackground support)
 * Best for: Restaurants, Hotels, Real Estate, Event Venues
 *
 * Features:
 * - VideoBackground hero with fallback image (for supported industries)
 * - Full-viewport background image with overlay (fallback)
 * - Elegant centered typography
 * - Signature offerings section
 * - Story/About preview
 * - Reservation CTA
 *
 * VideoBackground: Automatically plays video on desktop, falls back to image on mobile
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Clock, Star, Quote, ChevronRight } from 'lucide-react';
import { VideoBackground, ScrollReveal, AnimatedCounter } from '../effects';

const HomePage = () => {
  // ===== CONTENT - Replace with AI-generated content =====
  const CONTENT = {
    hero: {
      label: "FINE DINING IN DOWNTOWN DALLAS",
      headline: "Where Tradition Meets Innovation",
      subheadline: "Experience authentic Italian cuisine crafted from family recipes passed down through generations. Wood-fired pizzas, handmade pasta, and an extensive wine selection.",
      primaryCta: "Make a Reservation",
      secondaryCta: "View Menu",
      backgroundImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920",
      // Video URL for supported industries (restaurant, fitness, spa, barbershop, tattoo, pizza)
      backgroundVideo: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4"
    },
    intro: {
      label: "OUR STORY",
      title: "A Culinary Journey Since 1985",
      text: "For nearly four decades, we've been serving Dallas with the flavors of Italy. Our commitment to authentic recipes, fresh ingredients, and warm hospitality has made us a beloved neighborhood institution.",
      linkText: "Read Our Story"
    },
    featured: {
      title: "Signature Dishes",
      subtitle: "Crafted with passion, served with love",
      items: [
        { name: "Osso Buco", description: "Braised veal shank with saffron risotto", price: "$48", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400" },
        { name: "Truffle Pasta", description: "Handmade tagliatelle with black truffle", price: "$36", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400" },
        { name: "Wood-Fired Pizza", description: "San Marzano tomatoes, fresh mozzarella", price: "$24", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" }
      ]
    },
    testimonial: {
      quote: "The most authentic Italian experience outside of Rome. Every dish tells a story, and the atmosphere transports you straight to the heart of Tuscany.",
      author: "Dallas Morning News",
      rating: 5
    },
    info: {
      address: "1234 Main Street, Dallas, TX 75201",
      phone: "(214) 555-0123",
      hours: "Tue-Sun: 5PM - 11PM"
    },
    cta: {
      headline: "Reserve Your Table",
      subheadline: "Join us for an unforgettable dining experience",
      button: "Book Now"
    }
  };

  // ===== THEME =====
  const THEME = {
    primary: '#1a1a1a',
    accent: '#c9a962',
    text: '#2d2d2d',
    textMuted: '#6b6b6b',
    background: '#ffffff',
    surface: '#f9f7f4',
    cream: '#fdfbf7',
    headingFont: "'Playfair Display', Georgia, serif",
    bodyFont: "'Lato', system-ui, sans-serif"
  };

  // Hero content component (reused for both video and static versions)
  const HeroContent = () => (
    <div style={{ maxWidth: '900px', textAlign: 'center', padding: '0 20px' }}>
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
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
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
  );

  return (
    <div>
      {/* HERO - VideoBackground for supported industries, falls back to static image on mobile */}
      {CONTENT.hero.backgroundVideo ? (
        <VideoBackground
          videoSrc={CONTENT.hero.backgroundVideo}
          posterImage={CONTENT.hero.backgroundImage}
          overlay="linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6))"
          height="100vh"
        >
          <HeroContent />
        </VideoBackground>
      ) : (
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url("${CONTENT.hero.backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <HeroContent />
        </section>
      )}

      {/* INTRO with ScrollReveal */}
      <ScrollReveal>
        <section style={{
          padding: '120px 20px',
          background: THEME.cream,
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

            {/* Stats with AnimatedCounter */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '60px',
              marginBottom: '32px',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '300', color: THEME.primary, fontFamily: THEME.headingFont }}>
                  <AnimatedCounter end={38} suffix="+" duration={2} />
                </div>
                <div style={{ fontSize: '14px', color: THEME.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Years of Excellence
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '300', color: THEME.primary, fontFamily: THEME.headingFont }}>
                  <AnimatedCounter end={50000} suffix="+" duration={2.5} />
                </div>
                <div style={{ fontSize: '14px', color: THEME.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Happy Guests
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '300', color: THEME.primary, fontFamily: THEME.headingFont }}>
                  <AnimatedCounter end={98} suffix="%" duration={2} />
                </div>
                <div style={{ fontSize: '14px', color: THEME.textMuted, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  5-Star Reviews
                </div>
              </div>
            </div>

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
            {CONTENT.intro.linkText}
            <ChevronRight size={18} />
          </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* FEATURED DISHES */}
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
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px'
          }}>
            {CONTENT.featured.items.map((item, index) => (
              <div key={index} style={{
                background: THEME.background,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '280px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
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
              border: `1px solid ${THEME.primary}`,
              color: THEME.primary,
              textDecoration: 'none',
              fontSize: '14px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '500'
            }}>
              View Full Menu
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
            {[...Array(CONTENT.testimonial.rating)].map((_, i) => (
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
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920")`,
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

export default HomePage;