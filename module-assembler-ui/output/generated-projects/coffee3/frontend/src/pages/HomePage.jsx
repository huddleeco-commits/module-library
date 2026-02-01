/**
 * coffee3 - Home Page
 * Generated with Unified Business Generator
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Welcome to coffee3</h1>
          <p style={styles.heroSubtext}>Your trusted cafe in Lewisville, TX</p>
          <div style={styles.heroCtas}>
            <Link to="/contact" style={styles.primaryCta}>Order</Link>
            <Link to="/about" style={styles.secondaryCta}>Learn More</Link>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section style={styles.quickInfo}>
        <div style={styles.infoItem}><MapPin size={20} /> <span>Lewisville, TX</span></div>
        <div style={styles.infoItem}><Phone size={20} /> <span>(555) 123-4567</span></div>
      </section>

      {/* About Preview */}
      <section style={styles.aboutPreview}>
        <h2 style={styles.sectionTitle}>About coffee3</h2>
        <p style={styles.aboutText}>For 5 years, coffee3 has been serving our community with dedication and excellence.</p>
        <Link to="/about" style={styles.link}>Read our story <ArrowRight size={16} /></Link>
      </section>

      {/* Testimonials */}
      
      <section style={styles.testimonials}>
        <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
        <div style={styles.testimonialGrid}>
          
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"[Customer testimonial]"</p>
            <p style={styles.testimonialAuthor}>- Happy Customer, Local Resident</p>
          </div>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"[Customer testimonial]"</p>
            <p style={styles.testimonialAuthor}>- Valued Client, Regular Customer</p>
          </div>
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"[Customer testimonial]"</p>
            <p style={styles.testimonialAuthor}>- Satisfied Guest, First-Time Visitor</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <Link to="/contact" style={styles.primaryCta}>Order</Link>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  hero: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #6366f122 0%, #06b6d422 100%)',
    padding: '54px 24px'
  },
  heroContent: { textAlign: 'center', maxWidth: '800px' },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: '600',
    fontFamily: 'Poppins, sans-serif',
    color: '#1a1a2e',
    marginBottom: '24px',
    lineHeight: 1.2,
    letterSpacing: 'normal'
  },
  heroSubtext: { fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#1a1a2e', opacity: 0.8, marginBottom: '32px' },
  heroCtas: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryCta: {
    background: '#6366f1',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  secondaryCta: {
    background: 'transparent',
    color: '#6366f1',
    padding: '14px 32px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: '2px solid #6366f1',
    transition: 'all 0.25s ease'
  },
  quickInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '24px',
    background: '#6366f1',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  infoItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  aboutPreview: { padding: '54px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    fontFamily: 'Poppins, sans-serif',
    color: '#1a1a2e',
    marginBottom: '24px',
    letterSpacing: 'normal'
  },
  aboutText: { fontSize: '1.1rem', color: '#1a1a2e', opacity: 0.8, lineHeight: 1.7, marginBottom: '16px' },
  link: { color: '#6366f1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' },
  testimonials: { padding: '54px 24px', background: '#f8fafc' },
  testimonialGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  testimonialCard: { background: '#ffffff', padding: '22px', borderRadius: '7px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  testimonialQuote: { fontSize: '1rem', color: '#1a1a2e', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.6 },
  testimonialAuthor: { color: '#6366f1', fontWeight: '600' },
  ctaSection: { padding: '54px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)' },
  ctaTitle: { fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }
};
