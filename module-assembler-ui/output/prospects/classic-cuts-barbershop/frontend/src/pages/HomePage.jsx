import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Star, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Welcome to Classic Cuts Barbershop</h1>
          <p style={styles.heroSubtitle}>Your trusted local general in the community</p>
          <p style={styles.heroLocation}><MapPin size={18} /> 2145 Main St, Lewisville TX 75067</p>
          <div style={styles.heroCtas}>
            <Link to="/contact" style={styles.primaryBtn}>Get in Touch</Link>
            <Link to="/services" style={styles.secondaryBtn}>Our Services <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Choose Us</h2>
          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <Star size={32} color="#1A1A2E" />
              <h3 style={styles.featureTitle}>Quality Service</h3>
              <p style={styles.featureText}>We pride ourselves on delivering exceptional quality every time.</p>
            </div>
            <div style={styles.featureCard}>
              <Clock size={32} color="#1A1A2E" />
              <h3 style={styles.featureTitle}>Reliable & On Time</h3>
              <p style={styles.featureText}>Count on us to be there when you need us most.</p>
            </div>
            <div style={styles.featureCard}>
              <MapPin size={32} color="#1A1A2E" />
              <h3 style={styles.featureTitle}>Locally Owned</h3>
              <p style={styles.featureText}>Proudly serving our neighbors in the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Ready to get started?</h2>
          <p style={styles.ctaText}>Contact us today and let us help you.</p>
          <a href="tel:9725551001" style={styles.primaryBtn}><Phone size={18} /> Call 972-555-1001</a>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: 'linear-gradient(135deg, #1A1A2E11 0%, #1A1A2E22 100%)', padding: '80px 24px', textAlign: 'center' },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '700', color: '#1A1A2E', marginBottom: '16px' },
  heroSubtitle: { fontSize: '1.25rem', color: '#1A1A2E', opacity: 0.8, marginBottom: '12px' },
  heroLocation: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1A1A2E', opacity: 0.7, marginBottom: '32px' },
  heroCtas: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1A1A2E', color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '15px' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#1A1A2E', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', border: '2px solid #1A1A2E' },
  features: { padding: '80px 24px', background: '#fff' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: { fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '48px', color: '#1A1A2E' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' },
  featureCard: { textAlign: 'center', padding: '32px', borderRadius: '12px', background: '#f9fafb' },
  featureTitle: { fontSize: '1.25rem', fontWeight: '600', margin: '16px 0 8px', color: '#1A1A2E' },
  featureText: { color: '#1A1A2E', opacity: 0.7, lineHeight: 1.6 },
  cta: { padding: '80px 24px', background: '#1A1A2E', textAlign: 'center' },
  ctaTitle: { fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  ctaText: { color: '#fff', opacity: 0.9, marginBottom: '32px', fontSize: '1.1rem' }
};
