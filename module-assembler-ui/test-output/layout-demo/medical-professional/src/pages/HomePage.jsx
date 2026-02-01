/**
 * HomePage - Medical Professional Layout
 * Business: Wellness Medical Center
 * Layout Style: split hero, bordered cards
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Calendar, User, Clock, Award, Heart, Shield, Users,
  Star, MapPin, ChevronRight, Activity, Stethoscope, FileText,
  CreditCard, AlertCircle, CheckCircle
} from 'lucide-react';

const COLORS = {
  "primary": "#0284C7",
  "secondary": "#38BDF8",
  "accent": "#22D3EE",
  "background": "#F0F9FF",
  "text": "#0C4A6E"
};
const LAYOUT = {
  "borderRadius": "8px",
  "shadows": "minimal",
  "spacing": "structured",
  "heroStyle": "split",
  "cardStyle": "bordered"
};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.text }}>
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
      minHeight: '80vh',
      backgroundColor: '#F0F9FF',
      display: 'flex',
      alignItems: 'center',
      padding: '80px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'center'
      }}>
        {/* Left: Content */}
        <div>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#0284C715',
            color: '#0284C7',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            healthcare
          </div>

          <h1 style={{
            fontSize: '52px',
            fontWeight: '700',
            lineHeight: 1.15,
            marginBottom: '24px',
            color: '#0C4A6E'
          }}>
            Comprehensive Care for Your Whole Family
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#0C4A6E',
            opacity: 0.7,
            marginBottom: '32px',
            lineHeight: 1.7
          }}>
            From routine checkups to specialized care, our team of physicians is here for you at every stage of life.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <Link to="/appointments" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0284C7',
              color: 'white',
              padding: '16px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              <Calendar size={20} />
              Book Appointment
            </Link>
            <a href="tel:(555) 789-CARE" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: '#0C4A6E',
              padding: '16px 28px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              border: '2px solid rgba(0,0,0,0.1)'
            }}>
              <Phone size={20} />
              Call Us
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#0284C7' }}>20+</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Years Experience</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#0284C7' }}>50k+</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Patients Served</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#0284C7' }}>4.9</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>Patient Rating</div>
            </div>
          </div>
        </div>

        {/* Right: Image/Graphic */}
        <div style={{
          height: '500px',
          backgroundColor: '#0284C710',
          borderRadius: '16px',
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
              <span style={{ fontWeight: '600' }}>Board Certified</span>
            </div>
          </div>
          <Stethoscope size={120} color="#0284C7" style={{ opacity: 0.2 }} />
        </div>
      </div>
    </section>
  );
}

function ServicesPreviewSection() {
  const services = [
  {
    "name": "Primary Care",
    "description": "Annual exams, preventive care, chronic disease management"
  },
  {
    "name": "Pediatrics",
    "description": "Well-child visits, immunizations, developmental screenings"
  },
  {
    "name": "Women's Health",
    "description": "OB/GYN services, prenatal care, family planning"
  },
  {
    "name": "Urgent Care",
    "description": "Walk-in care for non-emergency illness and injury"
  }
];

  return (
    <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '48px'
        }}>Our Services</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {services.map((service, idx) => (
            <div key={idx} style={{
              padding: '24px',
              backgroundColor: COLORS.background,
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{service.name}</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
  {
    "value": "50,000+",
    "label": "Patients Served"
  },
  {
    "value": "15+",
    "label": "Physicians"
  },
  {
    "value": "18",
    "label": "Years of Service"
  },
  {
    "value": "4.8★",
    "label": "Patient Rating"
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
            <div style={{ fontSize: '48px', fontWeight: '700', color: 'white' }}>{stat.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
  {
    "name": "Michelle T.",
    "text": "Dr. Patel has been our family doctor for 10 years. She knows us, listens to us, and always takes time to explain everything.",
    "rating": 5
  },
  {
    "name": "James R.",
    "text": "The telehealth option is a lifesaver for busy parents. Quality care without the waiting room.",
    "rating": 5
  },
  {
    "name": "Linda C.",
    "text": "After a cancer scare, the team here was with me every step of the way. Compassionate, thorough care.",
    "rating": 5
  }
];

  return (
    <section style={{ padding: '100px 20px', backgroundColor: COLORS.background }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>
          Patient Stories
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px'
        }}>
          {testimonials.map((t, idx) => (
            <div key={idx} style={{
              padding: '32px',
              backgroundColor: 'white',
              borderRadius: LAYOUT.borderRadius,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(t.rating)].map((_, i) => (
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
        <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
          Ready to Get Started?
        </h2>
        <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
          Book your appointment today
        </p>
        <Link to="/appointments" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'white',
          color: '#0284C7',
          padding: '18px 36px',
          borderRadius: LAYOUT.borderRadius,
          fontSize: '18px',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          <Calendar size={22} />
          Book Appointment
        </Link>
      </div>
    </section>
  );
}
