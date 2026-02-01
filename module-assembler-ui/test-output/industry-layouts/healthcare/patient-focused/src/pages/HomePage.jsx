/**
 * HomePage - Patient Focused Layout
 * Business: Wellness Medical Center
 * Industry: healthcare
 * Generated: 2026-01-23T20:54:26.813Z
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
  "primary": "#0284C7",
  "secondary": "#38BDF8",
  "accent": "#22D3EE",
  "background": "#F0F9FF",
  "text": "#0C4A6E"
};

// Layout configuration
const LAYOUT = {
  "heroStyle": "centered",
  "cardStyle": "rounded",
  "borderRadius": "16px",
  "shadows": "soft",
  "spacing": "comfortable"
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
      minHeight: '85vh',
      background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
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
          Comprehensive Care for Your Whole Family
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 22px)',
          opacity: 0.9,
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          From routine checkups to specialized care, our team of physicians is here for you at every stage of life.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'white',
            color: '#0284C7',
            padding: '18px 36px',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <Calendar size={22} />
            Book Appointment
          </Link>

          
          <Link to="/about" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'transparent',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            Patient Portal
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
          gap: '32px'
        }}>
          {services.map((service, idx) => (
            <div key={idx} style={{
              padding: '32px',
              backgroundColor: '#F0F9FF',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{service.name}</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>{service.description}</p>
              <Link to="/services" style={{
                color: '#0284C7',
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
            backgroundColor: '#0284C7',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '16px',
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
      background: 'linear-gradient(135deg, #0284C7, #38BDF8)'
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
    <section style={{ padding: '100px 20px', backgroundColor: '#F0F9FF' }}>
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
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
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
      background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
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
            color: '#0284C7',
            padding: '18px 36px',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Mail size={22} />
            Contact Us
          </Link>
          <a href="tel:(555) 789-CARE" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Phone size={22} />
            (555) 789-CARE
          </a>
        </div>
      </div>
    </section>
  );
}
