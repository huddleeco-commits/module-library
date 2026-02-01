/**
 * HomePage - Bold Energy Layout
 * Business: Test FitZone
 * Industry: fitness
 * Generated: 2026-01-23T20:54:26.836Z
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
const COLORS = {
  "primary": "#00B4D8",
  "secondary": "#90E0EF",
  "accent": "#023E8A",
  "background": "#0A0A0A",
  "text": "#FFFFFF"
};

// Layout configuration
const LAYOUT = {
  "heroStyle": "fullscreen",
  "cardStyle": "angular",
  "borderRadius": "4px",
  "shadows": "dramatic",
  "spacing": "structured"
};

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


function HeroSection() {
  return (
    <section style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00B4D8, #90E0EF)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 20px',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '800px', color: 'white' }}>
        

        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: '700',
          lineHeight: 1.1,
          marginBottom: '24px'
        }}>
          Transform Your Limits
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 22px)',
          opacity: 0.9,
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          State-of-the-art equipment, expert trainers, and a community that pushes you to be your best
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'white',
            color: '#00B4D8',
            padding: '18px 36px',
            borderRadius: '4px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <Calendar size={22} />
            Start Your Journey
          </Link>

          
        </div>
      </div>
    </section>
  );
}


function ServicesPreviewSection() {
  const services = [
  {
    "name": "Service 1",
    "description": "Quality service for your needs"
  },
  {
    "name": "Service 2",
    "description": "Expert solutions you can trust"
  },
  {
    "name": "Service 3",
    "description": "Professional results every time"
  },
  {
    "name": "Service 4",
    "description": "Dedicated to your satisfaction"
  }
];

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
          gap: '24px'
        }}>
          {services.map((service, idx) => (
            <div key={idx} style={{
              padding: '24px',
              backgroundColor: '#0A0A0A',
              borderRadius: '4px',
              border: 'none',
              boxShadow: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{service.name}</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>{service.description}</p>
              <Link to="/services" style={{
                color: '#00B4D8',
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
          <Link to="/services" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#00B4D8',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '4px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            View All Services
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}


function StatsSection() {
  const stats = [
  {
    "value": "10+",
    "label": "Years Experience"
  },
  {
    "value": "1000+",
    "label": "Happy Customers"
  },
  {
    "value": "50+",
    "label": "Services"
  },
  {
    "value": "4.9",
    "label": "Rating"
  }
];

  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #00B4D8, #90E0EF)'
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
}


function TestimonialsSection() {
  const testimonials = [
  {
    "name": "John D.",
    "text": "Excellent service and friendly staff. Highly recommend!",
    "rating": 5
  },
  {
    "name": "Sarah M.",
    "text": "Professional, reliable, and great value. Will use again.",
    "rating": 5
  }
];

  return (
    <section style={{ padding: '100px 20px', backgroundColor: '#0A0A0A' }}>
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
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
}


function CtaSection() {
  return (
    <section style={{
      padding: '100px 20px',
      background: 'linear-gradient(135deg, #00B4D8, #90E0EF)',
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
            color: '#00B4D8',
            padding: '18px 36px',
            borderRadius: '4px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Mail size={22} />
            Contact Us
          </Link>
          <a href="tel:(512) 555-4567" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '4px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Phone size={22} />
            (512) 555-4567
          </a>
        </div>
      </div>
    </section>
  );
}
