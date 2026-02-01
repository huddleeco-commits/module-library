/**
 * ServicesPage - Healthcare Business
 * Business: Wellness Medical Center
 * Generated: 2026-01-23T20:33:57.158Z
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Heart, Baby, Activity, Brain, Bone, Eye, Pill,
  Calendar, Clock, CheckCircle, ChevronRight, Phone, ArrowRight
} from 'lucide-react';

const COLORS = {
  "primary": "#0284C7",
  "secondary": "#38BDF8",
  "accent": "#22D3EE",
  "background": "#F0F9FF",
  "text": "#0C4A6E"
};

const SERVICE_CATEGORIES = [
  {
    "name": "Primary Care",
    "items": [
      {
        "name": "Annual Physical Exam",
        "description": "Comprehensive health assessment and preventive screening"
      },
      {
        "name": "Chronic Disease Management",
        "description": "Diabetes, hypertension, heart disease, and more"
      },
      {
        "name": "Preventive Care",
        "description": "Immunizations, cancer screenings, health coaching"
      },
      {
        "name": "Acute Illness Visits",
        "description": "Same-day appointments for sudden illness"
      }
    ]
  },
  {
    "name": "Pediatrics",
    "items": [
      {
        "name": "Well-Child Visits",
        "description": "Growth monitoring, developmental assessments"
      },
      {
        "name": "Immunizations",
        "description": "All childhood vaccines per CDC schedule"
      },
      {
        "name": "School & Sports Physicals",
        "description": "Required exams for activities"
      },
      {
        "name": "Behavioral Health",
        "description": "ADHD, anxiety, and developmental concerns"
      }
    ]
  },
  {
    "name": "Women's Health",
    "items": [
      {
        "name": "Annual GYN Exam",
        "description": "Pap smear, breast exam, reproductive health"
      },
      {
        "name": "Prenatal Care",
        "description": "Complete pregnancy care from conception to delivery"
      },
      {
        "name": "Family Planning",
        "description": "Contraception counseling and services"
      },
      {
        "name": "Menopause Management",
        "description": "Hormone therapy and symptom management"
      }
    ]
  },
  {
    "name": "Specialty Services",
    "items": [
      {
        "name": "Dermatology",
        "description": "Skin conditions, mole checks, cosmetic treatments"
      },
      {
        "name": "Mental Health",
        "description": "Counseling, medication management, therapy"
      },
      {
        "name": "Nutrition Counseling",
        "description": "Weight management, dietary planning"
      },
      {
        "name": "Physical Therapy",
        "description": "Rehabilitation and pain management"
      }
    ]
  }
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState(SERVICE_CATEGORIES[0]?.name || '');

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        padding: '100px 0 60px',
        background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
            Medical Services
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Comprehensive healthcare for every stage of life
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section style={{ padding: '40px 0', backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={styles.container}>
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {SERVICE_CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat.name)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeCategory === cat.name ? '#0284C7' : 'transparent',
                  color: activeCategory === cat.name ? 'white' : COLORS.text,
                  border: activeCategory === cat.name ? 'none' : '2px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 0' }}>
        <div style={styles.container}>
          {SERVICE_CATEGORIES.filter(cat => cat.name === activeCategory).map((category, catIdx) => (
            <div key={catIdx}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                {category.items.map((service, idx) => (
                  <ServiceCard key={idx} service={service} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '48px' }}>How to Get Started</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            {[
              { step: 1, title: 'Book Online', description: 'Schedule your appointment through our online portal or call us' },
              { step: 2, title: 'Complete Forms', description: 'Fill out patient forms online before your visit' },
              { step: 3, title: 'Visit Us', description: 'Come to your appointment - we\'ll take great care of you' },
              { step: 4, title: 'Follow Up', description: 'Access your records and schedule follow-ups online' }
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C7',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 auto 16px'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ opacity: 0.7 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
            Ready to Schedule?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
            Book your appointment online or give us a call
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/appointments" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'white',
              color: '#0284C7',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
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
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.5)'
            }}>
              <Phone size={20} />
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '28px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: COLORS.text }}>
        {service.name}
      </h3>
      <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>
        {service.description}
      </p>

      {service.features && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
          {service.features?.slice(0, 3).map((feature, idx) => (
            <li key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              <CheckCircle size={16} color="#0284C7" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <Link to="/appointments" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: '#0284C7',
        fontWeight: '600',
        textDecoration: 'none',
        fontSize: '14px'
      }}>
        Schedule Appointment <ArrowRight size={16} />
      </Link>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.text
  }
};
