/**
 * HomePage - Test Pizza Co
 * Industry: pizza
 * Generated: 2026-01-23T21:02:13.483Z
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, MapPin, Phone, Star, ChevronRight, Calendar,
  Utensils, Coffee, Wine, Users, Award, Heart
} from 'lucide-react';

const COLORS = {
  "primary": "#E63946",
  "secondary": "#F4A261",
  "accent": "#2A9D8F",
  "background": "#1D3557",
  "text": "#F1FAEE"
};

const BUSINESS = {
  "name": "Test Pizza Co",
  "tagline": "Artisan pizzas crafted with passion",
  "phone": "(555) 123-4567",
  "address": "123 Main Street, Austin, TX 78701",
  "established": "2018"
};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background }}>
      <HeroSection />
      <SpecialsSection />
      <MenuPreviewSection />
      <StorySection />
      <ReviewsSection />
      <HoursLocationSection />
      <CtaSection />
    </div>
  );
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  return (
    <section style={{
      minHeight: '90vh',
      background: `linear-gradient(135deg, ${COLORS.primary}ee, ${COLORS.secondary || COLORS.primary}dd)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '80px 20px',
      position: 'relative'
    }}>
      {/* Decorative overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '900px', color: 'white', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: '10px 24px',
          borderRadius: '50px',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <Award size={20} />
          <span style={{ fontWeight: '500' }}>Award-Winning Cuisine</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: '700',
          lineHeight: 1.1,
          marginBottom: '24px',
          textShadow: '0 2px 20px rgba(0,0,0,0.2)'
        }}>
          Artisan Pizzas, Made Fresh Daily
        </h1>

        <p style={{
          fontSize: 'clamp(18px, 2.5vw, 24px)',
          opacity: 0.9,
          marginBottom: '48px',
          maxWidth: '700px',
          margin: '0 auto 48px',
          lineHeight: 1.6
        }}>
          Experience the authentic taste of Naples in every bite
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/reservations" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'white',
            color: COLORS.primary,
            padding: '18px 36px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s'
          }}>
            <Calendar size={22} />
            Reserve a Table
          </Link>

          <Link to="/menu" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'transparent',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            <Utensils size={22} />
            View Menu
          </Link>
        </div>

        {/* Quick info bar */}
        <div style={{
          display: 'flex',
          gap: '40px',
          justifyContent: 'center',
          marginTop: '60px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
            <Clock size={18} />
            <span>Open Today: 11am - 10pm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
            <MapPin size={18} />
            <span>123 Main Street</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
            <Phone size={18} />
            <span>(555) 123-4567</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SPECIALS SECTION
// ============================================
function SpecialsSection() {
  const specials = [
  {
    "name": "Chef's Special",
    "description": "Daily rotating creation from our kitchen",
    "price": "Market Price",
    "tag": "Popular"
  },
  {
    "name": "Happy Hour",
    "description": "Half-price appetizers and $5 drinks",
    "price": "4pm-6pm",
    "tag": "Daily"
  },
  {
    "name": "Weekend Brunch",
    "description": "Bottomless mimosas with any entree",
    "price": "$35",
    "tag": "Sat & Sun"
  }
];

  return (
    <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{
            color: COLORS.primary,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '14px'
          }}>
            Don't Miss
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '700',
            marginTop: '12px',
            color: COLORS.text
          }}>
            Today's Specials
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px'
        }}>
          {specials.map((special, idx) => (
            <div key={idx} style={{
              padding: '32px',
              backgroundColor: COLORS.background,
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {special.tag && (
                <span style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: COLORS.primary,
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {special.tag}
                </span>
              )}
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: COLORS.text }}>
                {special.name}
              </h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>
                {special.description}
              </p>
              <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.primary }}>
                {special.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// MENU PREVIEW SECTION
// ============================================
function MenuPreviewSection() {
  const categories = [
  {
    "name": "Appetizers",
    "icon": "Utensils",
    "count": 12,
    "description": "Start your meal right"
  },
  {
    "name": "Mains",
    "icon": "Utensils",
    "count": 18,
    "description": "Signature entrees"
  },
  {
    "name": "Desserts",
    "icon": "Coffee",
    "count": 8,
    "description": "Sweet endings"
  },
  {
    "name": "Drinks",
    "icon": "Wine",
    "count": 24,
    "description": "Craft cocktails & wines"
  }
];

  const iconMap = { Utensils, Coffee, Wine };

  return (
    <section style={{
      padding: '100px 20px',
      background: `linear-gradient(180deg, ${COLORS.background} 0%, white 100%)`
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{
            color: COLORS.primary,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '14px'
          }}>
            Our Menu
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '700',
            marginTop: '12px',
            color: COLORS.text
          }}>
            Explore Our Offerings
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {categories.map((cat, idx) => (
            <Link key={idx} to="/menu" style={{
              padding: '40px 32px',
              backgroundColor: 'white',
              borderRadius: '16px',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'block',
              textAlign: 'center'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                backgroundColor: `${COLORS.primary}15`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <Utensils size={32} color={COLORS.primary} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>{cat.name}</h3>
              <p style={{ opacity: 0.6, marginBottom: '12px' }}>{cat.description}</p>
              <span style={{ color: COLORS.primary, fontWeight: '600' }}>{cat.count} items</span>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/menu" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: COLORS.primary,
            color: 'white',
            padding: '16px 32px',
            borderRadius: '50px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            View Full Menu
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// STORY SECTION
// ============================================
function StorySection() {
  return (
    <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '60px',
        alignItems: 'center'
      }}>
        <div>
          <span style={{
            color: COLORS.primary,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '14px'
          }}>
            Our Story
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: '700',
            marginTop: '12px',
            marginBottom: '24px',
            color: COLORS.text
          }}>
            A Passion for Great Food
          </h2>
          <p style={{
            fontSize: '18px',
            lineHeight: 1.8,
            opacity: 0.8,
            marginBottom: '24px'
          }}>
            Founded with a simple belief: great food brings people together. Every dish we serve is crafted with care, using the finest ingredients sourced from local farmers and producers.
          </p>
          <p style={{
            fontSize: '18px',
            lineHeight: 1.8,
            opacity: 0.8,
            marginBottom: '32px'
          }}>
            Since 2018, we have been serving our community with dedication and love.
          </p>
          <Link to="/about" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: COLORS.primary,
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Learn More About Us
            <ChevronRight size={20} />
          </Link>
        </div>

        <div style={{
          height: '450px',
          backgroundColor: `${COLORS.primary}15`,
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Utensils size={100} color={COLORS.primary} style={{ opacity: 0.3 }} />
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            right: '24px',
            backgroundColor: 'white',
            padding: '20px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: `${COLORS.primary}15`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={24} color={COLORS.primary} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '18px' }}>Best Restaurant 2026</div>
              <div style={{ opacity: 0.6, fontSize: '14px' }}>Local Dining Awards</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// REVIEWS SECTION
// ============================================
function ReviewsSection() {
  const reviews = [
  {
    "name": "Sarah M.",
    "text": "Absolutely incredible! The food was amazing and the service was impeccable. Will definitely be back!",
    "rating": 5
  },
  {
    "name": "Michael R.",
    "text": "Best dining experience in the city. The atmosphere is perfect for date night.",
    "rating": 5
  },
  {
    "name": "Emily T.",
    "text": "Fresh ingredients, creative dishes, and a wonderful staff. Highly recommend!",
    "rating": 5
  }
];

  return (
    <section style={{
      padding: '100px 20px',
      backgroundColor: COLORS.background
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{
            color: COLORS.primary,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '14px'
          }}>
            What People Say
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '700',
            marginTop: '12px',
            color: COLORS.text
          }}>
            Guest Reviews
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px'
        }}>
          {reviews.map((review, idx) => (
            <div key={idx} style={{
              padding: '32px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                {[...Array(review.rating || 5)].map((_, i) => (
                  <Star key={i} size={20} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{
                fontSize: '18px',
                fontStyle: 'italic',
                lineHeight: 1.7,
                marginBottom: '24px',
                opacity: 0.9
              }}>
                "{review.text}"
              </p>
              <div style={{ fontWeight: '600' }}>{review.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOURS & LOCATION SECTION
// ============================================
function HoursLocationSection() {
  const hours = {
  "monday": "11:00 AM - 10:00 PM",
  "tuesday": "11:00 AM - 10:00 PM",
  "wednesday": "11:00 AM - 10:00 PM",
  "thursday": "11:00 AM - 10:00 PM",
  "friday": "11:00 AM - 11:00 PM",
  "saturday": "11:00 AM - 11:00 PM",
  "sunday": "12:00 PM - 9:00 PM"
};

  return (
    <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '60px'
        }}>
          {/* Hours */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: `${COLORS.primary}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={24} color={COLORS.primary} />
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '700' }}>Hours</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {hours.map((h, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <span style={{ fontWeight: '500' }}>{h.days}</span>
                  <span style={{ opacity: 0.7 }}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: `${COLORS.primary}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin size={24} color={COLORS.primary} />
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '700' }}>Location</h3>
            </div>
            <div style={{
              height: '250px',
              backgroundColor: `${COLORS.primary}10`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <MapPin size={48} color={COLORS.primary} style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
              123 Main Street, Austin, TX 78701
            </p>
            <p style={{ opacity: 0.7 }}>Free parking available in rear lot</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA SECTION
// ============================================
function CtaSection() {
  return (
    <section style={{
      padding: '100px 20px',
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary || COLORS.primary})`,
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px'
        }}>
          Ready for a Great Meal?
        </h2>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '40px'
        }}>
          Reserve your table today and experience the difference
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/reservations" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'white',
            color: COLORS.primary,
            padding: '18px 36px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Calendar size={22} />
            Make a Reservation
          </Link>
          <a href="tel:(555) 123-4567" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Phone size={22} />
            Call Us
          </a>
        </div>
      </div>
    </section>
  );
}
